const { sequelize } = require('../../config/db')
const { createAuditLog } = require('../../utils/audit')
const Shipment = require('../shipments/shipment.model')
const ShipmentTask = require('./shipmentTask.model')

async function createShipmentTask(shipmentId, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const shipment = await Shipment.findByPk(shipmentId, { transaction })
    if (!shipment) {
      const error = new Error('Shipment no encontrado')
      error.status = 404
      throw error
    }

    const task = await ShipmentTask.create(
      {
        ...data,
        shipment_id: shipmentId,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    )

    await createAuditLog({
      shipment_id: shipmentId,
      entity_type: 'shipment_task',
      entity_id: task.id,
      action: 'CREACION_TAREA',
      new_values: task.toJSON(),
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return task
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function updateShipmentTask(id, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const task = await ShipmentTask.findByPk(id, { transaction })
    if (!task) {
      const error = new Error('Tarea no encontrada')
      error.status = 404
      throw error
    }

    const before = task.toJSON()
    const payload = {
      ...data,
      updated_by: userId,
      updated_at: new Date(),
    }

    if (payload.status === 'COMPLETADA' && !payload.completed_at) {
      payload.completed_at = new Date()
    }

    await task.update(payload, { transaction })

    await createAuditLog({
      shipment_id: task.shipment_id,
      entity_type: 'shipment_task',
      entity_id: task.id,
      action: 'ACTUALIZACION_TAREA',
      old_values: before,
      new_values: task.toJSON(),
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return task
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

module.exports = {
  createShipmentTask,
  updateShipmentTask,
}
