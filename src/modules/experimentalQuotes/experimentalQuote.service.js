const { sequelize } = require('../../config/db')
const ExperimentalQuote = require('./experimentalQuote.model')
const ExperimentalQuoteItem = require('../experimentalQuoteItems/experimentalQuoteItem.model')
const ExperimentalQuoteTrace = require('../experimentalQuoteTraces/experimentalQuoteTrace.model')
const Quotation = require('../quotations/quotation.model')
const QuotationProviderQuote = require('../quotationProviderQuotes/quotationProviderQuote.model')
const QuotationSale = require('../quotationSales/quotationSale.model')
const { buildPagination } = require('../../utils/pagination')
const { createAuditLog } = require('../../utils/audit')
const { BusinessValidationError } = require('./experimentalQuote.errors')
const { buildExperimentalQuoteNumber, roundCurrency } = require('./experimentalQuote.helpers')
const { selectInternalService } = require('./experimentalQuote.selector')
const { validateExperimentalQuotePayload } = require('./experimentalQuote.validation')
const { calculateExperimentalQuote } = require('./experimentalQuote.calculator')
const {
  formatCommercialQuote,
  formatInternalTable,
  formatMathReport,
} = require('./experimentalQuote.formatter')
const { serializeExperimentalQuote } = require('./experimentalQuote.serializer')

function ensureQuotationEditable(quotation) {
  if (quotation?.status === 'CONVERTIDA') {
    const error = new Error('La CT convertida a DO ya no puede modificarse')
    error.status = 400
    throw error
  }
}

function mapPayloadToQuoteFields(payload, calculation = null, selection = null, validation = null) {
  const air = calculation?.airWeight || null

  return {
    quotation_id: payload.quotation_id || null,
    cliente: payload.cliente,
    source_customer_id: payload.source_customer_id || null,
    tipo_servicio_solicitado: payload.tipo_servicio,
    modalidad: payload.modalidad || null,
    service_variant: payload.service_variant || null,
    servicio_interno_aplicado: selection?.serviceCode || null,
    incoterm: payload.incoterm,
    origen: payload.origen,
    destino: payload.destino,
    puerto_origen: payload.puerto_origen || null,
    puerto_destino: payload.puerto_destino || null,
    aeropuerto_origen: payload.aeropuerto_origen || null,
    aeropuerto_destino: payload.aeropuerto_destino || null,
    mercancia: payload.mercancia,
    mercancia_peligrosa: Boolean(payload.mercancia_peligrosa),
    numero_piezas: Number(payload.numero_piezas || 0),
    volumen: payload.volumen || null,
    peso_real: payload.peso_real || null,
    peso_volumetrico: air?.peso_volumetrico || null,
    peso_cobrable: air?.peso_cobrable || null,
    valor_comercial: payload.valor_comercial || null,
    numero_guias: payload.numero_guias || null,
    numero_shippers: payload.numero_shippers || null,
    numero_contenedores: payload.numero_contenedores || null,
    container_size: payload.container_size || null,
    moneda: payload.moneda || 'USD',
    provider_pricing_mode: payload.provider_pricing_mode || 'NONE',
    provider_quote_reference: payload.provider_quote_reference || null,
    provider_quote_valid_until: payload.provider_quote_valid_until || null,
    total_proveedor: calculation?.totals?.total_proveedor || 0,
    total_fast_way: calculation?.totals?.total_fast_way || 0,
    total_cliente: calculation?.totals?.total_cliente || 0,
    estado: selection?.requiresManualValidation
      ? 'REQUIERE_VALIDACION_MANUAL'
      : calculation
        ? 'CALCULADA'
        : validation?.isValid === false
          ? 'ERROR_VALIDACION'
          : 'BORRADOR',
    requiere_validacion_manual: Boolean(selection?.requiresManualValidation),
    motivo_validacion_manual: selection?.reason || null,
    observaciones: payload.observaciones || null,
    no_incluidos: calculation?.noIncluidos || payload.extra_not_included || [],
    tarifario_snapshot: calculation?.tariffSnapshot || null,
    detalle_calculo_json: calculation
      ? {
          provider_items: calculation.providerItems,
          fast_way_items: calculation.fastWayItems,
          not_included_items: calculation.notIncludedItems,
          air_weight_calculation: calculation.airWeight,
        }
      : null,
    validation_result_json: validation,
    commercial_quote_json: calculation ? formatCommercialQuote({
      ...payload,
      tipo_servicio_solicitado: payload.tipo_servicio,
      provider_items: calculation.providerItems,
      fast_way_items: calculation.fastWayItems,
      no_incluidos: calculation.noIncluidos,
      total_proveedor: calculation.totals.total_proveedor,
      total_fast_way: calculation.totals.total_fast_way,
      total_cliente: calculation.totals.total_cliente,
      moneda: payload.moneda || 'USD',
      air_weight_calculation: calculation.airWeight,
    }) : null,
    internal_table_json: calculation ? formatInternalTable({
      provider_items: calculation.providerItems,
      fast_way_items: calculation.fastWayItems,
      total_proveedor: calculation.totals.total_proveedor,
      total_fast_way: calculation.totals.total_fast_way,
      total_cliente: calculation.totals.total_cliente,
    }) : null,
    math_report_json: calculation ? formatMathReport({
      provider_items: calculation.providerItems,
      fast_way_items: calculation.fastWayItems,
      air_weight_calculation: calculation.airWeight,
    }) : null,
    request_payload_json: payload,
  }
}

async function syncItems(quoteId, items, transaction) {
  await ExperimentalQuoteItem.destroy({
    where: { experimental_quote_id: quoteId },
    transaction,
  })

  if (!items.length) return

  await ExperimentalQuoteItem.bulkCreate(
    items.map(item => ({
      experimental_quote_id: quoteId,
      role: item.role,
      concept: item.concept,
      category: item.category || null,
      charge_type: item.charge_type || null,
      base_type: item.base_type || null,
      base_value: item.base_value != null ? roundCurrency(item.base_value) : null,
      quantity: item.quantity != null ? roundCurrency(item.quantity) : null,
      rate_value: item.rate_value != null ? item.rate_value : null,
      minimum_value: item.minimum_value != null ? item.minimum_value : null,
      total_value: item.total_value != null ? item.total_value : null,
      included_in_total: Boolean(item.included_in_total),
      confirmed: Boolean(item.confirmed),
      currency: item.currency || 'USD',
      operation_text: item.operation_text || null,
      notes: item.notes || null,
      metadata_json: item.metadata_json || null,
      created_at: new Date(),
      updated_at: new Date(),
    })),
    { transaction }
  )
}

async function registerTrace(quoteId, eventType, message, detail, userId, transaction) {
  return ExperimentalQuoteTrace.create(
    {
      experimental_quote_id: quoteId,
      event_type: eventType,
      message,
      detail_json: detail || null,
      user_id: userId,
      created_at: new Date(),
    },
    { transaction }
  )
}

async function getExperimentalQuoteById(id) {
  const quote = await ExperimentalQuote.findByPk(id)
  if (!quote) return null

  const [items, traces] = await Promise.all([
    ExperimentalQuoteItem.findAll({
      where: { experimental_quote_id: id },
      order: [['id', 'ASC']],
    }),
    ExperimentalQuoteTrace.findAll({
      where: { experimental_quote_id: id },
      order: [['created_at', 'DESC']],
    }),
  ])

  return serializeExperimentalQuote(quote, items, traces)
}

async function listExperimentalQuotes(query) {
  const { page, limit, offset } = buildPagination(query.page, query.limit)
  const where = {}

  if (query.estado) where.estado = query.estado
  if (query.tipo_servicio_solicitado) where.tipo_servicio_solicitado = query.tipo_servicio_solicitado
  if (query.cliente) where.cliente = query.cliente
  if (query.quotation_id) where.quotation_id = query.quotation_id

  const { count, rows } = await ExperimentalQuote.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
  })

  return {
    total: count,
    page,
    limit,
    data: rows,
  }
}

async function createExperimentalQuote(payload, userId) {
  const transaction = await sequelize.transaction()

  try {
    const quote = await ExperimentalQuote.create(
      {
        ...mapPayloadToQuoteFields(payload),
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    )

    await quote.update(
      {
        quote_number: buildExperimentalQuoteNumber(quote.id),
      },
      { transaction }
    )

    await registerTrace(
      quote.id,
      'CREACION_BORRADOR',
      'Cotización experimental creada en borrador',
      { payload },
      userId,
      transaction
    )

    await createAuditLog({
      entity_type: 'experimental_quote',
      entity_id: quote.id,
      action: 'CREACION_COTIZACION_EXPERIMENTAL',
      new_values: quote.toJSON(),
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return getExperimentalQuoteById(quote.id)
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function persistCalculatedQuote(existingQuote, payload, selection, validation, calculation, userId, transaction) {
  const quoteFields = mapPayloadToQuoteFields(payload, calculation, selection, validation)

  let quote = existingQuote

  if (!quote) {
    quote = await ExperimentalQuote.create(
      {
        ...quoteFields,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    )

    await quote.update(
      {
        quote_number: buildExperimentalQuoteNumber(quote.id),
      },
      { transaction }
    )
  } else {
    await quote.update(
      {
        ...quoteFields,
        updated_by: userId,
        updated_at: new Date(),
      },
      { transaction }
    )
  }

  const items = [
    ...(calculation.providerItems || []),
    ...(calculation.fastWayItems || []),
    ...(calculation.notIncludedItems || []),
  ]

  await syncItems(quote.id, items, transaction)

  await registerTrace(
    quote.id,
    selection.requiresManualValidation ? 'VALIDACION_MANUAL' : 'CALCULO',
    selection.requiresManualValidation
      ? 'Cotización marcada para validación manual'
      : 'Cotización calculada correctamente',
    {
      selection,
      validation,
      totals: calculation.totals,
    },
    userId,
    transaction
  )

  await createAuditLog({
    entity_type: 'experimental_quote',
    entity_id: quote.id,
    action: existingQuote
      ? 'ACTUALIZACION_COTIZACION_EXPERIMENTAL'
      : 'CALCULO_COTIZACION_EXPERIMENTAL',
    new_values: quote.toJSON(),
    user_id: userId,
    transaction,
  })

  return quote
}

async function calculateExperimentalQuotePreview(payload) {
  const selection = selectInternalService(payload)
  const validation = validateExperimentalQuotePayload(payload, selection)

  if (!validation.isValid) {
    throw new BusinessValidationError(
      'No se puede calcular la cotización porque faltan datos obligatorios',
      validation.errors
    )
  }

  if (selection.requiresManualValidation) {
    return {
      selection,
      validation,
      calculation: {
        providerItems: [],
        fastWayItems: [],
        notIncludedItems: [],
        noIncluidos: payload.extra_not_included || [],
        totals: {
          total_proveedor: 0,
          total_fast_way: 0,
          total_cliente: 0,
        },
        tariffSnapshot: null,
        airWeight: null,
      },
    }
  }

  return {
    selection,
    validation,
    calculation: calculateExperimentalQuote(payload, selection),
  }
}

async function calculateAndPersistExperimentalQuote(payload, userId, options = {}) {
  const { existingQuoteId = null, persist = true } = options
  const preview = await calculateExperimentalQuotePreview(payload)

  if (!persist) {
    return {
      preview: true,
      selection: preview.selection,
      validation: preview.validation,
      calculation: preview.calculation,
      outputs: mapPayloadToQuoteFields(
        payload,
        preview.calculation,
        preview.selection,
        preview.validation
      ),
    }
  }

  const transaction = await sequelize.transaction()

  try {
    const existingQuote = existingQuoteId
      ? await ExperimentalQuote.findByPk(existingQuoteId, { transaction })
      : null

    const quote = await persistCalculatedQuote(
      existingQuote,
      payload,
      preview.selection,
      preview.validation,
      preview.calculation,
      userId,
      transaction
    )

    await transaction.commit()
    return getExperimentalQuoteById(quote.id)
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function updateExperimentalQuote(id, payload, userId) {
  const transaction = await sequelize.transaction()

  try {
    const quote = await ExperimentalQuote.findByPk(id, { transaction })
    if (!quote) {
      const error = new Error('Cotización experimental no encontrada')
      error.status = 404
      throw error
    }

    const nextPayload = {
      ...(quote.request_payload_json || {}),
      ...payload,
    }

    await quote.update(
      {
        ...mapPayloadToQuoteFields(nextPayload, null, null, null),
        request_payload_json: nextPayload,
        estado: 'BORRADOR',
        updated_by: userId,
        updated_at: new Date(),
      },
      { transaction }
    )

    await registerTrace(
      quote.id,
      'ACTUALIZACION_BORRADOR',
      'Cotización experimental actualizada',
      { payload: nextPayload },
      userId,
      transaction
    )

    await createAuditLog({
      entity_type: 'experimental_quote',
      entity_id: quote.id,
      action: 'ACTUALIZACION_BORRADOR_COTIZACION_EXPERIMENTAL',
      new_values: quote.toJSON(),
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return getExperimentalQuoteById(quote.id)
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function deleteExperimentalQuote(id, userId) {
  const transaction = await sequelize.transaction()

  try {
    const quote = await ExperimentalQuote.findByPk(id, { transaction })
    if (!quote) {
      const error = new Error('Cotización experimental no encontrada')
      error.status = 404
      throw error
    }

    const before = quote.toJSON()

    await ExperimentalQuoteItem.destroy({
      where: { experimental_quote_id: id },
      transaction,
    })
    await ExperimentalQuoteTrace.destroy({
      where: { experimental_quote_id: id },
      transaction,
    })
    await quote.destroy({ transaction })

    await createAuditLog({
      entity_type: 'experimental_quote',
      entity_id: id,
      action: 'ELIMINACION_COTIZACION_EXPERIMENTAL',
      old_values: before,
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return before
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function applyExperimentalQuoteToQuotation(experimentalQuoteId, quotationId, userId, options = {}) {
  const transaction = await sequelize.transaction()

  try {
    const quote = await ExperimentalQuote.findByPk(experimentalQuoteId, { transaction })
    const quotation = await Quotation.findByPk(quotationId, { transaction })

    if (!quote) {
      const error = new Error('Cotización experimental no encontrada')
      error.status = 404
      throw error
    }

    if (!quotation) {
      const error = new Error('CT destino no encontrada')
      error.status = 404
      throw error
    }

    ensureQuotationEditable(quotation)

    const items = await ExperimentalQuoteItem.findAll({
      where: { experimental_quote_id: experimentalQuoteId },
      order: [['id', 'ASC']],
      transaction,
    })

    const providerItems = items.filter(item => item.role === 'PROVIDER' && item.included_in_total)
    const fastWayItems = items.filter(item => item.role === 'FAST_WAY' && item.included_in_total)

    const replaceExisting = options.replace_existing !== false
    if (replaceExisting) {
      await QuotationProviderQuote.destroy({
        where: { quotation_id: quotationId },
        transaction,
      })
      await QuotationSale.destroy({
        where: { quotation_id: quotationId },
        transaction,
      })
    }

    if (providerItems.length) {
      await QuotationProviderQuote.bulkCreate(
        providerItems.map(item => ({
          quotation_id: quotationId,
          provider_id:
            quote.request_payload_json?.provider_application_id ||
            quote.request_payload_json?.source_provider_id ||
            'EXPERIMENTAL',
          provider_name:
            quote.request_payload_json?.provider_application_name ||
            quote.request_payload_json?.provider_name ||
            'Proveedor experimental',
          service_code: item.metadata_json?.service_code || null,
          currency: item.currency || quote.moneda || 'USD',
          quoted_value: item.total_value || 0,
          quoted_trm: null,
          validity_date: quote.provider_quote_valid_until || null,
          notes: item.notes || item.concept,
          created_by: userId,
          updated_by: userId,
          created_at: new Date(),
          updated_at: new Date(),
        })),
        { transaction }
      )
    }

    if (providerItems.length || fastWayItems.length) {
      const salesToCreate = [
        ...providerItems.map(item => ({
          quotation_id: quotationId,
          customer_id: quotation.customer_id,
          concept: `Proveedor - ${item.concept}`,
          currency: item.currency || quote.moneda || 'USD',
          quantity: item.quantity || 1,
          unit_value: item.total_value || 0,
          subtotal: item.total_value || 0,
          tax: 0,
          total: item.total_value || 0,
          notes: 'Generado desde cotización experimental',
          created_by: userId,
          updated_by: userId,
          created_at: new Date(),
          updated_at: new Date(),
        })),
        ...fastWayItems.map(item => ({
          quotation_id: quotationId,
          customer_id: quotation.customer_id,
          concept: `Fast Way - ${item.concept}`,
          currency: item.currency || quote.moneda || 'USD',
          quantity: item.quantity || 1,
          unit_value: item.total_value || 0,
          subtotal: item.total_value || 0,
          tax: 0,
          total: item.total_value || 0,
          notes: 'Generado desde cotización experimental',
          created_by: userId,
          updated_by: userId,
          created_at: new Date(),
          updated_at: new Date(),
        })),
      ]

      await QuotationSale.bulkCreate(salesToCreate, { transaction })
    }

    await registerTrace(
      quote.id,
      'APLICADA_A_CT',
      'Cotización experimental aplicada a CT',
      { quotation_id: quotationId, replaceExisting },
      userId,
      transaction
    )

    await createAuditLog({
      entity_type: 'experimental_quote',
      entity_id: quote.id,
      action: 'APLICACION_COTIZACION_EXPERIMENTAL_A_CT',
      new_values: {
        quotation_id: quotationId,
        replace_existing: replaceExisting,
      },
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return {
      experimental_quote_id: quote.id,
      quotation_id: quotationId,
      provider_items_applied: providerItems.length,
      sales_items_applied: providerItems.length + fastWayItems.length,
    }
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

module.exports = {
  listExperimentalQuotes,
  getExperimentalQuoteById,
  createExperimentalQuote,
  calculateExperimentalQuotePreview,
  calculateAndPersistExperimentalQuote,
  updateExperimentalQuote,
  deleteExperimentalQuote,
  applyExperimentalQuoteToQuotation,
}
