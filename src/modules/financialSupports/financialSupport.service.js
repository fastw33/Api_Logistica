const { sequelize } = require('../../config/db')
const { createAuditLog } = require('../../utils/audit')
const Shipment = require('../shipments/shipment.model')
const FinancialSupport = require('./financialSupport.model')

async function createFinancialSupport(shipmentId, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const shipment = await Shipment.findByPk(shipmentId, { transaction })
    if (!shipment) {
      const error = new Error('Shipment no encontrado')
      error.status = 404
      throw error
    }

    const support = await FinancialSupport.create(
      {
        ...data,
        shipment_id: shipmentId,
        uploaded_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    )

    await createAuditLog({
      shipment_id: shipmentId,
      entity_type: 'financial_support',
      entity_id: support.id,
      action: 'CARGA_SOPORTE_FINANCIERO',
      new_values: support.toJSON(),
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return support
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function deleteFinancialSupport(id, userId) {
  const transaction = await sequelize.transaction()

  try {
    const support = await FinancialSupport.findByPk(id, { transaction })
    if (!support) {
      const error = new Error('Soporte financiero no encontrado')
      error.status = 404
      throw error
    }

    const before = support.toJSON()

    await support.destroy({ transaction })

    await createAuditLog({
      shipment_id: support.shipment_id,
      entity_type: 'financial_support',
      entity_id: support.id,
      action: 'ELIMINACION_SOPORTE_FINANCIERO',
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
  createFinancialSupport,
  deleteFinancialSupport,
}
