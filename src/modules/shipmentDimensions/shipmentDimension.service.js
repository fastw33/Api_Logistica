const { sequelize } = require('../../config/db')
const { createAuditLog } = require('../../utils/audit')
const Shipment = require('../shipments/shipment.model')
const ShipmentDimension = require('./shipmentDimension.model')

async function createShipmentDimension(shipmentId, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const shipment = await Shipment.findByPk(shipmentId, { transaction })
    if (!shipment) {
      const error = new Error('Shipment no encontrado')
      error.status = 404
      throw error
    }

    const dimension = await ShipmentDimension.create(
      {
        ...data,
        shipment_id: shipmentId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    )

    await createAuditLog({
      shipment_id: shipmentId,
      entity_type: 'shipment_dimension',
      entity_id: dimension.id,
      action: 'CREACION_DIMENSION',
      new_values: dimension.toJSON(),
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return dimension
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function updateShipmentDimension(id, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const dimension = await ShipmentDimension.findByPk(id, { transaction })
    if (!dimension) {
      const error = new Error('Dimensión no encontrada')
      error.status = 404
      throw error
    }

    const before = dimension.toJSON()

    await dimension.update(
      {
        ...data,
        updated_at: new Date(),
      },
      { transaction }
    )

    await createAuditLog({
      shipment_id: dimension.shipment_id,
      entity_type: 'shipment_dimension',
      entity_id: dimension.id,
      action: 'ACTUALIZACION_DIMENSION',
      old_values: before,
      new_values: dimension.toJSON(),
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return dimension
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

module.exports = {
  createShipmentDimension,
  updateShipmentDimension,
}
