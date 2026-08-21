const { sequelize } = require('../../config/db')
const { Op } = require('sequelize')
const { buildPagination } = require('../../utils/pagination')
const { generateShipmentNumbers } = require('../../utils/shipmentNumbers')
const { createAuditLog } = require('../../utils/audit')
const {
  calculateShipmentProfitability,
  recalculateShipmentProfitability,
} = require('../../utils/profitability')
const Quotation = require('../quotations/quotation.model')
const QuotationService = require('../quotationServices/quotationService.model')
const QuotationDocument = require('../quotationDocuments/quotationDocument.model')
const QuotationProviderQuote = require('../quotationProviderQuotes/quotationProviderQuote.model')
const QuotationSale = require('../quotationSales/quotationSale.model')
const QuotationDimension = require('../quotationDimensions/quotationDimension.model')
const Shipment = require('./shipment.model')
const ShipmentDocument = require('../shipmentDocuments/shipmentDocument.model')
const ShipmentTrace = require('../shipmentTraces/shipmentTrace.model')
const ShipmentProvider = require('../shipmentProviders/shipmentProvider.model')
const ShipmentTask = require('../shipmentTasks/shipmentTask.model')
const ShipmentDimension = require('../shipmentDimensions/shipmentDimension.model')
const ShipmentCost = require('../shipmentCosts/shipmentCost.model')
const ShipmentSale = require('../shipmentSales/shipmentSale.model')
const CustomerInvoice = require('../customerInvoices/customerInvoice.model')
const VendorInvoice = require('../vendorInvoices/vendorInvoice.model')
const ShipmentAuditLog = require('../shipmentAuditLogs/shipmentAuditLog.model')
const {
  assertClientHasRequiredDocuments,
  assertQuotationThirdPartiesReady,
} = require('../../utils/wmsDocumentRequirements')

const SHIPMENT_LIST_ATTRIBUTES = [
  'id',
  'quotation_id',
  'lead_external_id',
  'customer_id',
  'project_name',
  'line_key',
  'do_number',
  'subject',
  'transport_mode',
  'modality',
  'business_type',
  'service_scope',
  'operational_status',
  'financial_status',
  'closure_status',
  'origin_country',
  'origin_city',
  'origin_port',
  'destination_country',
  'destination_city',
  'destination_port',
  'customer_invoiced',
  'vendor_invoiced',
  'etd',
  'eta',
  'transit_days',
  'created_at',
  'updated_at',
]

const SHIPMENT_DETAIL_ATTRIBUTES = [
  'id',
  'quotation_id',
  'lead_external_id',
  'customer_id',
  'project_external_id',
  'project_name',
  'line_key',
  'do_number',
  'file_number',
  'subject',
  'transport_mode',
  'modality',
  'business_type',
  'service_scope',
  'material_class',
  'operational_status',
  'financial_status',
  'closure_status',
  'incoterm',
  'origin_country',
  'origin_city',
  'origin_port',
  'origin_address',
  'destination_country',
  'destination_city',
  'destination_port',
  'destination_address',
  'declared_value',
  'cif_value',
  'currency',
  'trm',
  'estimated_profit',
  'real_profit',
  'customer_invoiced',
  'vendor_invoiced',
  'cargo_description',
  'etd',
  'eta',
  'release_date',
  'transit_days',
  'commercial_id',
  'operator_id',
  'created_at',
  'updated_at',
]

const SHIPMENT_RELATED_QUOTATION_ATTRIBUTES = ['id', 'quotation_number', 'currency']
const SHIPMENT_DOCUMENT_ATTRIBUTES = [
  'id',
  'quotation_id',
  'document_type',
  'document_name',
  'package_name',
  'file_url',
  'file_size',
  'mime_type',
  'created_at',
]
const SHIPMENT_TRACE_ATTRIBUTES = [
  'id',
  'trace_type',
  'title',
  'note',
  'event_at',
  'created_by',
  'created_at',
]
const SHIPMENT_PROVIDER_ATTRIBUTES = [
  'id',
  'provider_id',
  'provider_name',
  'provider_type',
  'service_code',
  'contact_name',
  'contact_email',
  'notes',
]
const SHIPMENT_TASK_ATTRIBUTES = [
  'id',
  'title',
  'description',
  'assigned_to',
  'status',
  'priority',
  'due_date',
  'completed_at',
]
const SHIPMENT_DIMENSION_ATTRIBUTES = [
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
]
const SHIPMENT_COST_ATTRIBUTES = [
  'id',
  'vendor_id',
  'concept',
  'cost_type',
  'currency',
  'quantity',
  'unit_value',
  'subtotal',
  'tax',
  'total',
  'is_estimated',
  'is_final',
  'vendor_invoice_id',
  'status',
  'notes',
]
const SHIPMENT_SALE_ATTRIBUTES = [
  'id',
  'customer_id',
  'concept',
  'currency',
  'quantity',
  'unit_value',
  'subtotal',
  'tax',
  'total',
  'customer_invoice_id',
  'status',
  'notes',
]
const CUSTOMER_INVOICE_ATTRIBUTES = [
  'id',
  'invoice_number',
  'customer_id',
  'currency',
  'subtotal',
  'taxes',
  'total',
  'paid_amount',
  'balance',
  'payment_status',
  'payment_date',
  'invoice_date',
  'due_date',
  'pdf_url',
  'xml_url',
  'support_file_url',
]
const VENDOR_INVOICE_ATTRIBUTES = [
  'id',
  'invoice_number',
  'vendor_id',
  'currency',
  'subtotal',
  'taxes',
  'total',
  'paid_amount',
  'balance',
  'payment_status',
  'payment_date',
  'invoice_date',
  'due_date',
  'pdf_url',
  'xml_url',
  'support_file_url',
]
const SHIPMENT_AUDIT_ATTRIBUTES = [
  'id',
  'action',
  'old_values',
  'new_values',
  'user_id',
  'created_at',
]
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
  'notes',
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
]

const DIMENSION_COMPARE_FIELDS = [
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
]

function hasInvoiceAttachment(invoice) {
  return Boolean(invoice?.support_file_url || invoice?.pdf_url || invoice?.xml_url)
}

function deriveFinancialStatus(currentStatus, customerInvoiced, vendorInvoiced) {
  if (['CIERRE_FINANCIERO', 'CERRADA'].includes(String(currentStatus || '').trim().toUpperCase())) {
    return currentStatus
  }

  if (customerInvoiced && vendorInvoiced) return 'RENTABILIDAD_CALCULADA'
  if (customerInvoiced) return 'PENDIENTE_FACTURAS_PROVEEDOR'
  if (vendorInvoiced) return 'PENDIENTE_FACTURACION'
  return 'PENDIENTE_FACTURACION'
}

function deriveClosureStatusFromOperationalStatus(operationalStatus) {
  return ['FINALIZADA_OPERATIVAMENTE', 'CANCELADA'].includes(
    String(operationalStatus || '').trim().toUpperCase()
  )
    ? 'CERRADO'
    : 'ABIERTO'
}

function normalizeDimensionDecimal(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return ''
  }

  const amount = Number(String(value).replace(',', '.'))
  return Number.isFinite(amount) ? amount.toFixed(3) : String(value).trim()
}

function normalizeDimensionText(value) {
  return String(value || '').trim().toLowerCase()
}

function buildDimensionComparisonRecord(item = {}) {
  return DIMENSION_COMPARE_FIELDS.reduce((record, field) => {
    if (
      [
        'quantity',
        'gross_weight',
        'volumetric_weight',
        'volume_cbm',
        'length',
        'width',
        'height',
      ].includes(field)
    ) {
      record[field] = normalizeDimensionDecimal(item[field])
      return record
    }

    if (field === 'dimension_unit') {
      record[field] =
        String(item[field] || '').trim().toLowerCase() === 'm' ? 'm' : 'cm'
      return record
    }

    record[field] = normalizeDimensionText(item[field])
    return record
  }, {})
}

function buildDimensionSignature(dimensions = []) {
  return (Array.isArray(dimensions) ? dimensions : [])
    .map(buildDimensionComparisonRecord)
    .filter(record =>
      Object.entries(record).some(([field, value]) => {
        if (field === 'dimension_unit') return false
        return value !== ''
      })
    )
    .map(record => JSON.stringify(record))
    .sort()
}

function dimensionsMatch(sourceDimensions = [], targetDimensions = []) {
  const sourceSignature = buildDimensionSignature(sourceDimensions)
  const targetSignature = buildDimensionSignature(targetDimensions)

  if (sourceSignature.length !== targetSignature.length) return false
  return sourceSignature.every((value, index) => value === targetSignature[index])
}

function attachShipmentDimensionComparison(shipment) {
  if (!shipment) return shipment

  const shipmentDimensions = Array.isArray(shipment.dimensions)
    ? shipment.dimensions
    : []
  const quotationDimensions = Array.isArray(shipment.quotation?.dimensions)
    ? shipment.quotation.dimensions
    : []
  const hasReferenceDimensions = quotationDimensions.length > 0
  const matchesQuotation =
    !hasReferenceDimensions ||
    dimensionsMatch(shipmentDimensions, quotationDimensions)

  shipment.setDataValue('dimensions_match_quotation', matchesQuotation)
  shipment.setDataValue(
    'dimensions_mismatch_message',
    matchesQuotation
      ? null
      : 'Las dimensiones del DO fueron ajustadas en operación y difieren de las registradas en la CT. Este cambio no modifica la cotización original.'
  )

  return shipment
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

function sanitizeShipmentPayload(data = {}) {
  const shouldNormalizeServiceScope = Object.prototype.hasOwnProperty.call(
    data,
    'service_scope'
  )

  return {
    ...data,
    ...(shouldNormalizeServiceScope
      ? {
          service_scope: normalizeServiceScope(data.service_scope),
        }
      : {}),
  }
}

function sanitizeShipmentDimensionItems(dimensions = []) {
  return (Array.isArray(dimensions) ? dimensions : [])
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
}

function mapServiceCodeToCostType(serviceCode) {
  switch (serviceCode) {
    case 'FLETE_INTERNACIONAL':
      return 'FLETE'
    case 'FLETE_NACIONAL':
    case 'PICKUP':
    case 'OTM':
    case 'DTA':
    case 'URBANO':
      return 'TRANSPORTE'
    case 'SEGURO':
      return 'SEGURO'
    case 'BODEGA_ZF':
      return 'BODEGAJE'
    case 'NACIONALIZACION':
    case 'ADUANA_EXTERIOR':
      return 'ADUANA'
    case 'LIBERACION_BL_GUIA':
    case 'ETIQUETADO':
    case 'SERVICIOS_EXTERIOR':
      return 'DOCUMENTACION'
    default:
      return 'OTROS'
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

function attachShipmentDerivedNumbers(shipment) {
  if (!shipment) return shipment

  const quotationNumber =
    shipment?.quotation?.quotation_number ||
    shipment?.quotation_number ||
    null

  if (typeof shipment.setDataValue === 'function') {
    shipment.setDataValue('quotation_number', quotationNumber)
  } else {
    shipment.quotation_number = quotationNumber
  }

  if (shipment?.quotation && typeof shipment.quotation.setDataValue === 'function') {
    shipment.quotation.setDataValue('quotation_number', quotationNumber)
  } else if (shipment?.quotation) {
    shipment.quotation = {
      ...shipment.quotation,
      quotation_number: quotationNumber,
    }
  }

  return shipment
}

async function seedShipmentCommercialBase(shipment, quotation, userId, transaction) {
  const providerQuotes = Array.isArray(quotation?.provider_quotes)
    ? quotation.provider_quotes
    : await QuotationProviderQuote.findAll({
        where: { quotation_id: quotation.id },
        transaction,
      })

  const quotationSales = Array.isArray(quotation?.sales)
    ? quotation.sales
    : await QuotationSale.findAll({
        where: { quotation_id: quotation.id },
        transaction,
      })

  if (providerQuotes.length) {
    const providerRows = providerQuotes
      .filter(item => item.provider_id || item.provider_name)
      .map(item => ({
        shipment_id: shipment.id,
        provider_id: item.provider_id || item.provider_name || 'SIN_PROVEEDOR',
        provider_name: item.provider_name || item.provider_id || 'Proveedor CT',
        provider_type: 'CT',
        service_code: item.service_code || null,
        contact_name: null,
        contact_email: null,
        notes: item.notes || null,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      }))
      .filter((item, index, list) => {
        const key = `${item.provider_id}::${item.service_code || ''}`
        return list.findIndex(row => `${row.provider_id}::${row.service_code || ''}` === key) === index
      })

    if (providerRows.length) {
      await ShipmentProvider.bulkCreate(providerRows, { transaction })
    }

    await ShipmentCost.bulkCreate(
      providerQuotes.map(item => ({
        shipment_id: shipment.id,
        vendor_id: item.provider_id || null,
        concept: item.service_code || item.provider_name || 'Costo estimado CT',
        cost_type: mapServiceCodeToCostType(item.service_code),
        currency: item.currency || quotation.currency || 'COP',
        quantity: 1,
        unit_value: item.quoted_value || 0,
        subtotal: item.quoted_value || 0,
        tax: 0,
        total: item.quoted_value || 0,
        is_estimated: true,
        is_final: false,
        status: 'ESTIMADO',
        notes: item.notes || null,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      })),
      { transaction }
    )
  }

  if (quotationSales.length) {
    await ShipmentSale.bulkCreate(
      quotationSales.map(item => ({
        shipment_id: shipment.id,
        customer_id: item.customer_id || quotation.customer_id,
        concept: item.concept,
        currency: item.currency || quotation.currency || 'COP',
        quantity: item.quantity || 1,
        unit_value: item.unit_value || 0,
        subtotal: item.subtotal || 0,
        tax: item.tax || 0,
        total: item.total || 0,
        status: 'PENDIENTE',
        notes: item.notes || null,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      })),
      { transaction }
    )
  }

  if (providerQuotes.length || quotationSales.length) {
    await recalculateShipmentProfitability(shipment.id, transaction)
  }
}

async function seedShipmentDimensionsFromQuotation(
  shipment,
  quotation,
  transaction
) {
  const quotationDimensions = Array.isArray(quotation?.dimensions)
    ? quotation.dimensions
    : await QuotationDimension.findAll({
        where: { quotation_id: quotation.id },
        transaction,
      })

  const sanitizedDimensions = sanitizeShipmentDimensionItems(quotationDimensions)

  if (!sanitizedDimensions.length) return

  await ShipmentDimension.bulkCreate(
    sanitizedDimensions.map(item => ({
      shipment_id: shipment.id,
      ...item,
      created_at: new Date(),
      updated_at: new Date(),
    })),
    { transaction }
  )
}

function shipmentListIncludes() {
  return [
    {
      model: Quotation,
      as: 'quotation',
      attributes: ['id', 'quotation_number'],
      required: false,
    },
  ]
}

function shipmentDetailIncludes() {
  return [
    {
      model: Quotation,
      as: 'quotation',
      attributes: SHIPMENT_RELATED_QUOTATION_ATTRIBUTES,
      include: [
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
          model: QuotationDimension,
          as: 'dimensions',
          attributes: QUOTATION_DIMENSION_ATTRIBUTES,
          separate: true,
        },
      ],
    },
    {
      model: ShipmentDocument,
      as: 'documents',
      attributes: SHIPMENT_DOCUMENT_ATTRIBUTES,
      separate: true,
    },
    {
      model: ShipmentTrace,
      as: 'traces',
      attributes: SHIPMENT_TRACE_ATTRIBUTES,
      separate: true,
    },
    {
      model: ShipmentProvider,
      as: 'providers',
      attributes: SHIPMENT_PROVIDER_ATTRIBUTES,
      separate: true,
    },
    {
      model: ShipmentTask,
      as: 'tasks',
      attributes: SHIPMENT_TASK_ATTRIBUTES,
      separate: true,
    },
    {
      model: ShipmentDimension,
      as: 'dimensions',
      attributes: SHIPMENT_DIMENSION_ATTRIBUTES,
      separate: true,
    },
    {
      model: ShipmentCost,
      as: 'costs',
      attributes: SHIPMENT_COST_ATTRIBUTES,
      separate: true,
    },
    {
      model: ShipmentSale,
      as: 'sales',
      attributes: SHIPMENT_SALE_ATTRIBUTES,
      separate: true,
    },
    {
      model: CustomerInvoice,
      as: 'customer_invoices',
      attributes: CUSTOMER_INVOICE_ATTRIBUTES,
      separate: true,
    },
    {
      model: VendorInvoice,
      as: 'vendor_invoices',
      attributes: VENDOR_INVOICE_ATTRIBUTES,
      separate: true,
    },
    {
      model: ShipmentAuditLog,
      as: 'audit_logs',
      attributes: SHIPMENT_AUDIT_ATTRIBUTES,
      separate: true,
    },
  ]
}

function shipmentFinancialIncludes() {
  return [
    {
      model: Quotation,
      as: 'quotation',
      attributes: ['id', 'quotation_number', 'currency'],
      include: [
        {
          model: QuotationProviderQuote,
          as: 'provider_quotes',
          separate: true,
          attributes: [
            'id',
            'provider_id',
            'provider_name',
            'service_code',
            'currency',
            'quoted_value',
            'notes',
          ],
        },
        {
          model: QuotationSale,
          as: 'sales',
          separate: true,
          attributes: [
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
          ],
        },
      ],
    },
    {
      model: ShipmentCost,
      as: 'costs',
      separate: true,
      attributes: [
        'id',
        'vendor_id',
        'concept',
        'cost_type',
        'currency',
        'quantity',
        'unit_value',
        'subtotal',
        'tax',
        'total',
        'status',
        'is_estimated',
        'is_final',
        'notes',
        'vendor_invoice_id',
      ],
    },
    {
      model: ShipmentSale,
      as: 'sales',
      separate: true,
      attributes: [
        'id',
        'customer_id',
        'concept',
        'currency',
        'quantity',
        'unit_value',
        'subtotal',
        'tax',
        'total',
        'status',
        'notes',
        'customer_invoice_id',
      ],
    },
    {
      model: CustomerInvoice,
      as: 'customer_invoices',
      separate: true,
      attributes: CUSTOMER_INVOICE_ATTRIBUTES,
    },
    {
      model: VendorInvoice,
      as: 'vendor_invoices',
      separate: true,
      attributes: VENDOR_INVOICE_ATTRIBUTES,
    },
  ]
}

async function createShipmentFromQuotation(quotation, userId, transaction) {
  const existing = await Shipment.findOne({
    where: { quotation_id: quotation.id },
    transaction,
  })

  const quotationServiceScope = normalizeServiceScope(quotation.service_scope)

  if (existing) {
    if (normalizeServiceScope(existing.service_scope) !== quotationServiceScope) {
      await existing.update(
        {
          service_scope: quotationServiceScope,
          updated_by: userId,
          updated_at: new Date(),
        },
        { transaction }
      )
    }

    return existing
  }

  const numbers = await generateShipmentNumbers(transaction)

  const shipment = await Shipment.create(
    {
      quotation_id: quotation.id,
      lead_external_id: quotation.lead_external_id,
      customer_id: quotation.customer_id,
      project_external_id: quotation.project_external_id,
      project_name: quotation.project_name,
      line_key: quotation.line_key || 'fastway',
      subject: quotation.subject,
      transport_mode: quotation.transport_mode,
      modality: quotation.modality,
      business_type: quotation.business_type,
      service_scope: quotationServiceScope,
      material_class: quotation.material_class,
      incoterm: quotation.incoterm,
      origin_country: quotation.origin_country,
      origin_city: quotation.origin_city,
      origin_port: quotation.origin_port,
      origin_address: quotation.origin_address,
      destination_country: quotation.destination_country,
      destination_city: quotation.destination_city,
      destination_port: quotation.destination_port,
      destination_address: quotation.destination_address,
      declared_value: quotation.declared_value,
      cif_value: quotation.cif_value,
      currency: quotation.currency,
      trm: quotation.trm,
      cargo_description: quotation.cargo_description,
      commercial_id: quotation.commercial_id,
      do_number: numbers.do_number,
      file_number: numbers.file_number,
      created_by: userId,
      updated_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    },
    { transaction }
  )
  await seedShipmentCommercialBase(shipment, quotation, userId, transaction)
  await seedShipmentDimensionsFromQuotation(shipment, quotation, transaction)

  await createAuditLog({
    shipment_id: shipment.id,
    entity_type: 'quotation',
    entity_id: quotation.id,
    action: 'CONVERSION_A_DO',
    old_values: { status: quotation.status },
    new_values: {
      shipment_id: shipment.id,
      do_number: shipment.do_number,
      file_number: shipment.file_number,
    },
    user_id: userId,
    transaction,
  })

  return shipment
}

async function listShipments(query) {
  const { page, limit, offset } = buildPagination(query.page, query.limit)
  const where = {}
  const includeDetails = ['1', 'true', 'si', 'yes'].includes(
    String(query.include_details || '').trim().toLowerCase()
  )
  const includeTerminal = ['1', 'true', 'si', 'yes'].includes(
    String(query.include_terminal || '').trim().toLowerCase()
  )
  const onlyTerminal = ['1', 'true', 'si', 'yes'].includes(
    String(query.only_terminal || '').trim().toLowerCase()
  )
  const terminalStatuses = ['FINALIZADA_OPERATIVAMENTE', 'CANCELADA']

  if (query.operational_status) {
    where.operational_status = query.operational_status
  } else if (onlyTerminal) {
    where.operational_status = { [Op.in]: terminalStatuses }
  } else if (!includeTerminal) {
    where.operational_status = { [Op.notIn]: terminalStatuses }
  }
  if (query.financial_status) where.financial_status = query.financial_status
  if (query.customer_id) where.customer_id = query.customer_id
  if (query.service_scope) where.service_scope = query.service_scope
  if (query.quotation_id) where.quotation_id = query.quotation_id
  if (query.lead_external_id) where.lead_external_id = query.lead_external_id
  if (query.project_external_id) where.project_external_id = query.project_external_id
  const createdAtWhere = buildCreatedAtWhere(query)
  if (createdAtWhere) where.created_at = createdAtWhere

  const queryOptions = {
    where,
    attributes: SHIPMENT_LIST_ATTRIBUTES,
    include: shipmentListIncludes(),
    distinct: true,
    order: [['created_at', 'DESC']],
    limit,
    offset,
  }

  if (includeDetails) {
    queryOptions.include = shipmentDetailIncludes()
  }

  const { count, rows } = await Shipment.findAndCountAll(queryOptions)

  return {
    total: count,
    page,
    limit,
    data: rows.map(attachShipmentDerivedNumbers),
  }
}

async function getShipmentById(id, query = {}) {
  const detailMode = String(query.detail_mode || '').trim().toLowerCase()
  const shipment = await Shipment.findByPk(id, {
    attributes: SHIPMENT_DETAIL_ATTRIBUTES,
    include:
      detailMode === 'financial'
        ? shipmentFinancialIncludes()
        : shipmentDetailIncludes(),
  })
  if (!shipment) return null

  const customerInvoices = Array.isArray(shipment.customer_invoices)
    ? shipment.customer_invoices
    : []
  const vendorInvoices = Array.isArray(shipment.vendor_invoices)
    ? shipment.vendor_invoices
    : []
  const customerInvoiced = customerInvoices.length
    ? customerInvoices.some(hasInvoiceAttachment)
    : Boolean(shipment.customer_invoiced)
  const vendorInvoiced = vendorInvoices.length
    ? vendorInvoices.some(hasInvoiceAttachment)
    : Boolean(shipment.vendor_invoiced)

  shipment.setDataValue('customer_invoiced', customerInvoiced)
  shipment.setDataValue('vendor_invoiced', vendorInvoiced)
  shipment.setDataValue(
    'financial_status',
    deriveFinancialStatus(shipment.financial_status, customerInvoiced, vendorInvoiced)
  )

  attachShipmentDimensionComparison(shipment)

  return attachShipmentDerivedNumbers(shipment)
}

async function syncShipmentDimensions(shipmentId, dimensions, userId) {
  const transaction = await sequelize.transaction()

  try {
    const shipment = await Shipment.findByPk(shipmentId, { transaction })
    if (!shipment) {
      const error = new Error('Shipment no encontrado')
      error.status = 404
      throw error
    }

    const before = await ShipmentDimension.findAll({
      where: { shipment_id: shipmentId },
      attributes: SHIPMENT_DIMENSION_ATTRIBUTES,
      transaction,
    })
    const sanitizedDimensions = sanitizeShipmentDimensionItems(dimensions)

    await ShipmentDimension.destroy({
      where: { shipment_id: shipmentId },
      transaction,
    })

    if (sanitizedDimensions.length) {
      await ShipmentDimension.bulkCreate(
        sanitizedDimensions.map(item => ({
          shipment_id: shipmentId,
          ...item,
          created_at: new Date(),
          updated_at: new Date(),
        })),
        { transaction }
      )
    }

    const after = await ShipmentDimension.findAll({
      where: { shipment_id: shipmentId },
      attributes: SHIPMENT_DIMENSION_ATTRIBUTES,
      transaction,
    })

    await createAuditLog({
      shipment_id: shipmentId,
      entity_type: 'shipment_dimension',
      entity_id: shipmentId,
      action: 'ACTUALIZACION_DIMENSIONES_DO',
      old_values: before.map(item => item.toJSON()),
      new_values: after.map(item => item.toJSON()),
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return getShipmentById(shipmentId)
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function createShipment(data, userId) {
  await assertClientHasRequiredDocuments(data.customer_id)
  const sanitizedData = sanitizeShipmentPayload(data)

  const transaction = await sequelize.transaction()

  try {
    const numbers = await generateShipmentNumbers(transaction)

    const shipment = await Shipment.create(
      {
        ...sanitizedData,
        do_number: numbers.do_number,
        file_number: numbers.file_number,
        closure_status: deriveClosureStatusFromOperationalStatus(
          sanitizedData.operational_status || 'CREADA'
        ),
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    )

    await createAuditLog({
      shipment_id: shipment.id,
      entity_type: 'shipment',
      entity_id: shipment.id,
      action: 'CREACION_DO',
      new_values: shipment.toJSON(),
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return getShipmentById(shipment.id)
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function updateShipment(id, data, userId) {
  const sanitizedData = sanitizeShipmentPayload(data)
  const transaction = await sequelize.transaction()

  try {
    const shipment = await Shipment.findByPk(id, { transaction })
    if (!shipment) {
      const error = new Error('Shipment no encontrado')
      error.status = 404
      throw error
    }

    const before = shipment.toJSON()

    if (
      sanitizedData.financial_status === 'CERRADA' &&
      shipment.operational_status !== 'FINALIZADA_OPERATIVAMENTE'
    ) {
      const error = new Error(
        'No se puede cerrar el DO sin finalizar operativamente'
      )
      error.status = 400
      throw error
    }

    await shipment.update(
      {
        ...sanitizedData,
        closure_status: deriveClosureStatusFromOperationalStatus(
          sanitizedData.operational_status || shipment.operational_status
        ),
        updated_by: userId,
        updated_at: new Date(),
      },
      { transaction }
    )

    if (
      sanitizedData.operational_status &&
      sanitizedData.operational_status !== before.operational_status
    ) {
      await createAuditLog({
        shipment_id: shipment.id,
        entity_type: 'shipment',
        entity_id: shipment.id,
        action: 'CAMBIO_ESTADO_OPERACIONAL',
        old_values: { operational_status: before.operational_status },
        new_values: { operational_status: sanitizedData.operational_status },
        user_id: userId,
        transaction,
      })
    }

    if (
      sanitizedData.financial_status &&
      sanitizedData.financial_status !== before.financial_status
    ) {
      await createAuditLog({
        shipment_id: shipment.id,
        entity_type: 'shipment',
        entity_id: shipment.id,
        action: 'CAMBIO_ESTADO_FINANCIERO',
        old_values: { financial_status: before.financial_status },
        new_values: { financial_status: sanitizedData.financial_status },
        user_id: userId,
        transaction,
      })
    }

    await createAuditLog({
      shipment_id: shipment.id,
      entity_type: 'shipment',
      entity_id: shipment.id,
      action: 'ACTUALIZACION_DO',
      old_values: before,
      new_values: shipment.toJSON(),
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return getShipmentById(id)
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function convertQuotationToShipment(quotationId, userId) {
  const quotationForValidation = await Quotation.findByPk(quotationId, {
    include: [
      { model: QuotationService, as: 'services' },
      { model: QuotationProviderQuote, as: 'provider_quotes' },
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
    const quotation = await Quotation.findByPk(quotationId, {
      include: [
        { model: QuotationService, as: 'services' },
        { model: QuotationProviderQuote, as: 'provider_quotes' },
        { model: QuotationDimension, as: 'dimensions' },
      ],
      transaction,
    })

    if (!quotation) {
      const error = new Error('Cotización no encontrada')
      error.status = 404
      throw error
    }

    if (!['APROBADA', 'CONVERTIDA'].includes(quotation.status)) {
      const error = new Error(
        'La cotización debe estar aprobada antes de convertirse a DO'
      )
      error.status = 400
      throw error
    }

    const shipment = await createShipmentFromQuotation(quotation, userId, transaction)

    await quotation.update(
      {
        status: 'CONVERTIDA',
        updated_by: userId,
        updated_at: new Date(),
      },
      { transaction }
    )

    await transaction.commit()
    return getShipmentById(shipment.id)
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function closeFinancialShipment(id, userId) {
  const transaction = await sequelize.transaction()

  try {
    const shipment = await Shipment.findByPk(id, { transaction })
    if (!shipment) {
      const error = new Error('Shipment no encontrado')
      error.status = 404
      throw error
    }

    const customerInvoices = await CustomerInvoice.findAll({
      where: { shipment_id: id },
      transaction,
    })
    const vendorInvoices = await VendorInvoice.findAll({
      where: { shipment_id: id },
      transaction,
    })

    const customerInvoiced =
      customerInvoices.length > 0 && customerInvoices.some(hasInvoiceAttachment)
    const vendorInvoiced =
      vendorInvoices.length > 0 && vendorInvoices.some(hasInvoiceAttachment)

    if (!customerInvoiced || !vendorInvoiced) {
      const error = new Error(
        'El cierre financiero requiere factura cliente y factura proveedor con archivo cargado'
      )
      error.status = 400
      throw error
    }

    const profitability = await recalculateShipmentProfitability(id, transaction)

    await shipment.update(
      {
        financial_status: 'CIERRE_FINANCIERO',
        updated_by: userId,
        updated_at: new Date(),
      },
      { transaction }
    )

    await createAuditLog({
      shipment_id: shipment.id,
      entity_type: 'shipment',
      entity_id: shipment.id,
      action: 'CIERRE_FINANCIERO',
      new_values: profitability,
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return getShipmentById(id)
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function closeShipment(id, userId) {
  const transaction = await sequelize.transaction()

  try {
    const shipment = await Shipment.findByPk(id, { transaction })
    if (!shipment) {
      const error = new Error('Shipment no encontrado')
      error.status = 404
      throw error
    }

    if (shipment.operational_status !== 'FINALIZADA_OPERATIVAMENTE') {
      const error = new Error(
        'El DO solo puede cerrarse cuando operational_status = FINALIZADA_OPERATIVAMENTE'
      )
      error.status = 400
      throw error
    }

    if (shipment.financial_status !== 'CIERRE_FINANCIERO') {
      const error = new Error(
        'El DO solo puede cerrarse cuando financial_status = CIERRE_FINANCIERO'
      )
      error.status = 400
      throw error
    }

    await shipment.update(
      {
        financial_status: 'CERRADA',
        updated_by: userId,
        updated_at: new Date(),
      },
      { transaction }
    )

    await createAuditLog({
      shipment_id: shipment.id,
      entity_type: 'shipment',
      entity_id: shipment.id,
      action: 'CIERRE_DO',
      old_values: {
        operational_status: shipment.operational_status,
        financial_status: 'CIERRE_FINANCIERO',
      },
      new_values: {
        operational_status: shipment.operational_status,
        financial_status: 'CERRADA',
      },
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return getShipmentById(id)
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

module.exports = {
  shipmentDetailIncludes,
  createShipmentFromQuotation,
  listShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  syncShipmentDimensions,
  convertQuotationToShipment,
  closeFinancialShipment,
  closeShipment,
  calculateShipmentProfitability,
}
