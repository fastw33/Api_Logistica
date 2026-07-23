const { sequelize } = require('../../config/db')
const { Op } = require('sequelize')
const { buildPagination } = require('../../utils/pagination')
const { createAuditLog } = require('../../utils/audit')
const { generateQuotationNumber } = require('../../utils/shipmentNumbers')
const Quotation = require('./quotation.model')
const QuotationService = require('../quotationServices/quotationService.model')
const QuotationDocument = require('../quotationDocuments/quotationDocument.model')
const QuotationProviderQuote = require('../quotationProviderQuotes/quotationProviderQuote.model')
const QuotationSale = require('../quotationSales/quotationSale.model')
const QuotationTrace = require('../quotationTraces/quotationTrace.model')
const QuotationDimension = require('../quotationDimensions/quotationDimension.model')
const Shipment = require('../shipments/shipment.model')
const {
  createShipmentFromQuotation,
  getShipmentById,
} = require('../shipments/shipment.service')
const {
  assertQuotationThirdPartiesReady,
} = require('../../utils/wmsDocumentRequirements')

const QUOTATION_LIST_ATTRIBUTES = [
  'id',
  'quotation_number',
  'lead_external_id',
  'customer_id',
  'project_external_id',
  'project_name',
  'line_key',
  'subject',
  'transport_mode',
  'modality',
  'business_type',
  'service_scope',
  'material_class',
  'status',
  'closure_status',
  'commercial_id',
  'created_at',
  'updated_at',
]

const QUOTATION_DETAIL_ATTRIBUTES = [
  'id',
  'quotation_number',
  'lead_external_id',
  'customer_id',
  'project_external_id',
  'project_name',
  'line_key',
  'subject',
  'transport_mode',
  'modality',
  'business_type',
  'service_scope',
  'material_class',
  'declared_value',
  'cif_value',
  'currency',
  'trm',
  'origin_country',
  'origin_city',
  'origin_port',
  'origin_address',
  'destination_country',
  'destination_city',
  'destination_port',
  'destination_address',
  'incoterm',
  'commercial_id',
  'status',
  'closure_status',
  'next_review_date',
  'cargo_description',
  'notes',
  'created_at',
  'updated_at',
]

const SHIPMENT_REFERENCE_ATTRIBUTES = [
  'id',
  'quotation_id',
  'do_number',
  'operational_status',
  'closure_status',
  'created_at',
]

const QUOTATION_SERVICE_ATTRIBUTES = ['id', 'service_code', 'enabled']
const QUOTATION_DOCUMENT_ATTRIBUTES = [
  'id',
  'document_type',
  'document_name',
  'package_name',
  'file_url',
  'file_size',
  'mime_type',
  'created_at',
]
const QUOTATION_PROVIDER_QUOTE_ATTRIBUTES = [
  'id',
  'provider_id',
  'provider_name',
  'service_code',
  'currency',
  'quoted_value',
  'quoted_trm',
  'validity_date',
  'notes',
  'created_at',
]
const QUOTATION_SALE_ATTRIBUTES = [
  'id',
  'customer_id',
  'concept',
  'currency',
  'quantity',
  'unit_value',
  'subtotal',
  'tax',
  'total',
  'notes',
  'created_at',
]
const QUOTATION_TRACE_ATTRIBUTES = [
  'id',
  'trace_type',
  'title',
  'note',
  'event_at',
  'created_by',
  'created_at',
]
const QUOTATION_DIMENSION_ATTRIBUTES = [
  'id',
  'quantity',
  'package_type',
  'gross_weight',
  'volumetric_weight',
  'volume_cbm',
  'length',
  'width',
  'height',
  'dimension_unit',
  'notes',
  'created_at',
]

function quotationListIncludes() {
  return [
    {
      model: Shipment,
      as: 'shipments',
      attributes: SHIPMENT_REFERENCE_ATTRIBUTES,
      separate: true,
    },
  ]
}

function quotationDetailIncludes() {
  return [
    {
      model: QuotationService,
      as: 'services',
      attributes: QUOTATION_SERVICE_ATTRIBUTES,
      separate: true,
    },
    {
      model: QuotationDocument,
      as: 'documents',
      attributes: QUOTATION_DOCUMENT_ATTRIBUTES,
      separate: true,
    },
    {
      model: QuotationProviderQuote,
      as: 'provider_quotes',
      attributes: QUOTATION_PROVIDER_QUOTE_ATTRIBUTES,
      separate: true,
    },
    {
      model: QuotationSale,
      as: 'sales',
      attributes: QUOTATION_SALE_ATTRIBUTES,
      separate: true,
    },
    {
      model: QuotationTrace,
      as: 'traces',
      attributes: QUOTATION_TRACE_ATTRIBUTES,
      separate: true,
    },
    {
      model: QuotationDimension,
      as: 'dimensions',
      attributes: QUOTATION_DIMENSION_ATTRIBUTES,
      separate: true,
    },
  ]
}

function normalizeNullableDecimal(value) {
  if (value === undefined || value === null) return null
  if (typeof value === 'string' && value.trim() === '') return null
  return value
}

function normalizeLineKey(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()

  return ['fastway', 'harvest', 'greenway'].includes(normalized)
    ? normalized
    : undefined
}

function normalizeServiceScope(value) {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()

  return [
    'IMPORTACION',
    'EXPORTACION',
    'ALMACENAMIENTO',
    'TERRESTRE',
    'LOGISTICA_CIRCULAR',
    'ASESORIA',
  ].includes(normalized)
    ? normalized
    : null
}

function sanitizeQuotationPayload(data = {}) {
  const normalizedLineKey = normalizeLineKey(data.line_key)
  const shouldNormalizeServiceScope = Object.prototype.hasOwnProperty.call(
    data,
    'service_scope'
  )

  return {
    ...data,
    ...(normalizedLineKey ? { line_key: normalizedLineKey } : {}),
    ...(shouldNormalizeServiceScope
      ? {
          service_scope: normalizeServiceScope(data.service_scope),
        }
      : {}),
    declared_value: normalizeNullableDecimal(data.declared_value),
    cif_value: normalizeNullableDecimal(data.cif_value),
    trm: normalizeNullableDecimal(data.trm),
  }
}

async function syncQuotationServices(quotationId, services, transaction) {
  if (!Array.isArray(services)) return

  await QuotationService.destroy({
    where: { quotation_id: quotationId },
    transaction,
  })

  if (!services.length) return

  await QuotationService.bulkCreate(
    services.map(service => ({
      quotation_id: quotationId,
      service_code: service.service_code,
      enabled: service.enabled !== undefined ? service.enabled : true,
      created_at: new Date(),
      updated_at: new Date(),
    })),
    { transaction }
  )
}

async function syncQuotationDimensions(quotationId, dimensions, transaction) {
  if (!Array.isArray(dimensions)) return

  await QuotationDimension.destroy({
    where: { quotation_id: quotationId },
    transaction,
  })

  const sanitizedDimensions = dimensions
    .map(item => ({
      quantity: item?.quantity,
      package_type: item?.package_type || null,
      gross_weight: item?.gross_weight || null,
      volumetric_weight: item?.volumetric_weight || null,
      volume_cbm: item?.volume_cbm || null,
      length: item?.length || null,
      width: item?.width || null,
      height: item?.height || null,
      dimension_unit:
        String(item?.dimension_unit || '').trim().toLowerCase() === 'm'
          ? 'm'
          : 'cm',
      notes: item?.notes || null,
    }))
    .filter(
      item =>
        item.quantity !== undefined &&
        item.quantity !== null &&
        String(item.quantity).trim() !== ''
    )

  if (!sanitizedDimensions.length) return

  await QuotationDimension.bulkCreate(
    sanitizedDimensions.map(item => ({
      quotation_id: quotationId,
      ...item,
      created_at: new Date(),
      updated_at: new Date(),
    })),
    { transaction }
  )
}

function ensureQuotationEditable(quotation) {
  if (quotation?.status === 'CONVERTIDA') {
    const error = new Error('La CT convertida a DO ya no puede modificarse')
    error.status = 400
    throw error
  }

  if (quotation?.closure_status === 'CIERRE_NO_EXITOSO') {
    const error = new Error('La CT cerrada como no exitosa ya no puede modificarse')
    error.status = 400
    throw error
  }
}

function buildCreatedAtWhere(query = {}) {
  const from = String(query.date_from || query.from || '').trim()
  const to = String(query.date_to || query.to || '').trim()
  if (!from && !to) return null

  const createdAt = {}

  if (from) {
    const startDate = new Date(`${from}T00:00:00.000Z`)
    if (!Number.isNaN(startDate.getTime())) {
      createdAt[Op.gte] = startDate
    }
  }

  if (to) {
    const endDate = new Date(`${to}T23:59:59.999Z`)
    if (!Number.isNaN(endDate.getTime())) {
      createdAt[Op.lte] = endDate
    }
  }

  return Reflect.ownKeys(createdAt).length ? createdAt : null
}

async function listQuotations(query) {
  const { page, limit, offset } = buildPagination(query.page, query.limit)
  const where = {}
  const includeUnsuccessful = ['1', 'true', 'si', 'yes'].includes(
    String(query.include_unsuccessful || '').trim().toLowerCase()
  )
  const onlyUnsuccessful = ['1', 'true', 'si', 'yes'].includes(
    String(query.only_unsuccessful || '').trim().toLowerCase()
  )

  if (query.status) where.status = query.status
  if (query.customer_id) where.customer_id = query.customer_id
  if (query.transport_mode) where.transport_mode = query.transport_mode
  if (query.service_scope) where.service_scope = query.service_scope
  if (query.lead_external_id) where.lead_external_id = query.lead_external_id
  if (query.project_external_id) where.project_external_id = query.project_external_id
  if (query.closure_status) {
    where.closure_status = query.closure_status
  } else if (onlyUnsuccessful) {
    where.closure_status = 'CIERRE_NO_EXITOSO'
  } else if (!includeUnsuccessful) {
    where.closure_status = { [Op.ne]: 'CIERRE_NO_EXITOSO' }
  }
  const createdAtWhere = buildCreatedAtWhere(query)
  if (createdAtWhere) where.created_at = createdAtWhere

  const { count, rows } = await Quotation.findAndCountAll({
    where,
    attributes: QUOTATION_LIST_ATTRIBUTES,
    include: quotationListIncludes(),
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  })

  return {
    total: count,
    page,
    limit,
    data: rows,
  }
}

async function getQuotationById(id) {
  return Quotation.findByPk(id, {
    attributes: QUOTATION_DETAIL_ATTRIBUTES,
    include: quotationDetailIncludes(),
  })
}

async function createQuotation(data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const sanitizedData = sanitizeQuotationPayload(data)
    const quotationNumber = await generateQuotationNumber(transaction)

    const quotation = await Quotation.create(
      {
        ...sanitizedData,
        quotation_number: quotationNumber,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    )

    await syncQuotationServices(quotation.id, sanitizedData.services || [], transaction)
    await syncQuotationDimensions(
      quotation.id,
      sanitizedData.dimensions || [],
      transaction
    )

    await createAuditLog({
      entity_type: 'quotation',
      entity_id: quotation.id,
      action: 'CREACION_CT',
      new_values: {
        ...quotation.toJSON(),
        services: sanitizedData.services || [],
        dimensions: sanitizedData.dimensions || [],
      },
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return getQuotationById(quotation.id)
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function updateQuotation(id, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const sanitizedData = sanitizeQuotationPayload(data)
    const quotation = await Quotation.findByPk(id, { transaction })
    if (!quotation) {
      const error = new Error('Cotización no encontrada')
      error.status = 404
      throw error
    }

    ensureQuotationEditable(quotation)

    const before = quotation.toJSON()

    await quotation.update(
      {
        ...sanitizedData,
        updated_by: userId,
        updated_at: new Date(),
      },
      { transaction }
    )

    if (Array.isArray(sanitizedData.services)) {
      await syncQuotationServices(id, sanitizedData.services, transaction)
    }

    if (Array.isArray(sanitizedData.dimensions)) {
      await syncQuotationDimensions(id, sanitizedData.dimensions, transaction)
    }

    await createAuditLog({
      entity_type: 'quotation',
      entity_id: quotation.id,
      action: 'ACTUALIZACION_CT',
      old_values: before,
      new_values: {
        ...quotation.toJSON(),
        services: sanitizedData.services,
        dimensions: sanitizedData.dimensions,
      },
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return getQuotationById(id)
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function approveQuotation(id, userId) {
  const quotationForValidation = await Quotation.findByPk(id, {
    include: [
      { model: QuotationService, as: 'services' },
      { model: QuotationProviderQuote, as: 'provider_quotes' },
      { model: QuotationSale, as: 'sales' },
      { model: QuotationDimension, as: 'dimensions' },
    ],
  })

  if (!quotationForValidation) {
    const error = new Error('Cotización no encontrada')
    error.status = 404
    throw error
  }

  await assertQuotationThirdPartiesReady(quotationForValidation)

  const transaction = await sequelize.transaction()

  try {
    const quotation = await Quotation.findByPk(id, {
      include: [
        { model: QuotationService, as: 'services' },
        { model: QuotationProviderQuote, as: 'provider_quotes' },
        { model: QuotationSale, as: 'sales' },
        { model: QuotationDimension, as: 'dimensions' },
      ],
      transaction,
    })

    if (!quotation) {
      const error = new Error('Cotización no encontrada')
      error.status = 404
      throw error
    }

    const oldStatus = quotation.status

    await quotation.update(
      {
        status: 'APROBADA',
        updated_by: userId,
        updated_at: new Date(),
      },
      { transaction }
    )

    await createAuditLog({
      entity_type: 'quotation',
      entity_id: quotation.id,
      action: 'APROBACION_CT',
      old_values: { status: oldStatus },
      new_values: { status: 'APROBADA' },
      user_id: userId,
      transaction,
    })

    const shipment = await createShipmentFromQuotation(quotation, userId, transaction)

    await quotation.update(
      {
        status: 'CONVERTIDA',
        closure_status: 'CIERRE_EXITOSO',
        updated_by: userId,
        updated_at: new Date(),
      },
      { transaction }
    )

    await transaction.commit()

    return {
      quotation: await getQuotationById(id),
      shipment: await getShipmentById(shipment.id),
    }
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function closeQuotationUnsuccessful(id, userId) {
  const transaction = await sequelize.transaction()

  try {
    const quotation = await Quotation.findByPk(id, { transaction })
    if (!quotation) {
      const error = new Error('Cotización no encontrada')
      error.status = 404
      throw error
    }

    if (quotation.status === 'CONVERTIDA') {
      const error = new Error('La CT convertida a DO no puede cerrarse como no exitosa')
      error.status = 400
      throw error
    }

    ensureQuotationEditable(quotation)

    const before = quotation.toJSON()

    await quotation.update(
      {
        closure_status: 'CIERRE_NO_EXITOSO',
        updated_by: userId,
        updated_at: new Date(),
      },
      { transaction }
    )

    await createAuditLog({
      entity_type: 'quotation',
      entity_id: quotation.id,
      action: 'CIERRE_CT_NO_EXITOSO',
      old_values: before,
      new_values: quotation.toJSON(),
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return getQuotationById(id)
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

module.exports = {
  listQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  approveQuotation,
  closeQuotationUnsuccessful,
}
