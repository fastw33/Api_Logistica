const { sequelize } = require('../../config/db')
const { createAuditLog } = require('../../utils/audit')
const Quotation = require('../quotations/quotation.model')
const QuotationTrace = require('./quotationTrace.model')

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

async function createQuotationTrace(quotationId, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const quotation = await Quotation.findByPk(quotationId, { transaction })
    if (!quotation) {
      const error = new Error('Cotización no encontrada')
      error.status = 404
      throw error
    }

    ensureQuotationEditable(quotation)

    const trace = await QuotationTrace.create(
      {
        quotation_id: quotationId,
        trace_type: data.trace_type || 'NOTA',
        title: data.title || null,
        note: data.note,
        event_at: data.event_at || new Date(),
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    )

    await createAuditLog({
      entity_type: 'quotation_trace',
      entity_id: trace.id,
      action: 'TRAZABILIDAD_CT',
      new_values: trace.toJSON(),
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return trace
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

module.exports = {
  createQuotationTrace,
}
