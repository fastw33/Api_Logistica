const { sequelize } = require('../../config/db')
const { createAuditLog } = require('../../utils/audit')
const Shipment = require('../shipments/shipment.model')
const ShipmentTrace = require('./shipmentTrace.model')

async function createShipmentTrace(shipmentId, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const shipment = await Shipment.findByPk(shipmentId, { transaction })
    if (!shipment) {
      const error = new Error('Shipment no encontrado')
      error.status = 404
      throw error
    }

    const trace = await ShipmentTrace.create(
      {
        shipment_id: shipmentId,
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
      shipment_id: shipmentId,
      entity_type: 'shipment_trace',
      entity_id: trace.id,
      action: 'TRAZABILIDAD_DO',
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
  createShipmentTrace,
}
