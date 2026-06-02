const { sequelize } = require('../../config/db')
const { createAuditLog } = require('../../utils/audit')
const Quotation = require('../quotations/quotation.model')
const QuotationProviderQuote = require('./quotationProviderQuote.model')
const QuotationTrace = require('../quotationTraces/quotationTrace.model')

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

async function createQuotationProviderQuote(quotationId, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const quotation = await Quotation.findByPk(quotationId, { transaction })
    if (!quotation) {
      const error = new Error('Cotización no encontrada')
      error.status = 404
      throw error
    }

    ensureQuotationEditable(quotation)

    const quote = await QuotationProviderQuote.create(
      {
        quotation_id: quotationId,
        provider_id: data.provider_id,
        provider_name: data.provider_name,
        service_code: data.service_code || null,
        currency: data.currency || 'USD',
        quoted_value: data.quoted_value,
        quoted_trm: data.quoted_trm || null,
        validity_date: data.validity_date || null,
        notes: data.notes || null,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    )

    await QuotationTrace.create(
      {
        quotation_id: quotationId,
        trace_type: 'SEGUIMIENTO',
        title: 'Costo proveedor CT',
        note: `${quote.provider_name} · ${quote.service_code || 'General'} · ${quote.currency} ${quote.quoted_value}`,
        event_at: new Date(),
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    )

    await createAuditLog({
      entity_type: 'quotation_provider_quote',
      entity_id: quote.id,
      action: 'PROVEEDOR_CT',
      new_values: quote.toJSON(),
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return quote
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function deleteQuotationProviderQuote(id, userId) {
  const transaction = await sequelize.transaction()

  try {
    const quote = await QuotationProviderQuote.findByPk(id, { transaction })
    if (!quote) {
      const error = new Error('Cotización de proveedor no encontrada')
      error.status = 404
      throw error
    }

    const quotation = await Quotation.findByPk(quote.quotation_id, { transaction })
    ensureQuotationEditable(quotation)

    const previous = quote.toJSON()

    await QuotationTrace.create(
      {
        quotation_id: quote.quotation_id,
        trace_type: 'NOVEDAD',
        title: 'Eliminación costo proveedor CT',
        note: `${quote.provider_name} · ${quote.service_code || 'General'} · ${quote.currency} ${quote.quoted_value}`,
        event_at: new Date(),
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    )

    await quote.destroy({ transaction })

    await createAuditLog({
      entity_type: 'quotation_provider_quote',
      entity_id: id,
      action: 'ELIMINACION_PROVEEDOR_CT',
      old_values: previous,
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return previous
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

module.exports = {
  createQuotationProviderQuote,
  deleteQuotationProviderQuote,
}
