const { sequelize } = require('../../config/db')
const { createAuditLog } = require('../../utils/audit')
const Quotation = require('../quotations/quotation.model')
const QuotationSale = require('./quotationSale.model')

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

async function createQuotationSale(quotationId, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const quotation = await Quotation.findByPk(quotationId, { transaction })
    if (!quotation) {
      const error = new Error('Cotización no encontrada')
      error.status = 404
      throw error
    }

    ensureQuotationEditable(quotation)

    const sale = await QuotationSale.create(
      {
        quotation_id: quotationId,
        customer_id: data.customer_id,
        concept: data.concept,
        currency: data.currency || 'COP',
        quantity: data.quantity || 1,
        unit_value: data.unit_value,
        subtotal: data.subtotal,
        tax: data.tax || 0,
        total: data.total,
        notes: data.notes || null,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    )

    await createAuditLog({
      entity_type: 'quotation_sale',
      entity_id: sale.id,
      action: 'VENTA_CT',
      new_values: sale.toJSON(),
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return sale
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function updateQuotationSale(id, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const sale = await QuotationSale.findByPk(id, { transaction })
    if (!sale) {
      const error = new Error('Venta de CT no encontrada')
      error.status = 404
      throw error
    }

    const quotation = await Quotation.findByPk(sale.quotation_id, { transaction })
    ensureQuotationEditable(quotation)

    const before = sale.toJSON()

    await sale.update(
      {
        ...data,
        updated_by: userId,
        updated_at: new Date(),
      },
      { transaction }
    )

    await createAuditLog({
      entity_type: 'quotation_sale',
      entity_id: sale.id,
      action: 'ACTUALIZACION_VENTA_CT',
      old_values: before,
      new_values: sale.toJSON(),
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return sale
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function deleteQuotationSale(id, userId) {
  const transaction = await sequelize.transaction()

  try {
    const sale = await QuotationSale.findByPk(id, { transaction })
    if (!sale) {
      const error = new Error('Venta de CT no encontrada')
      error.status = 404
      throw error
    }

    const quotation = await Quotation.findByPk(sale.quotation_id, { transaction })
    ensureQuotationEditable(quotation)

    const before = sale.toJSON()
    await sale.destroy({ transaction })

    await createAuditLog({
      entity_type: 'quotation_sale',
      entity_id: sale.id,
      action: 'ELIMINACION_VENTA_CT',
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

module.exports = {
  createQuotationSale,
  updateQuotationSale,
  deleteQuotationSale,
}
