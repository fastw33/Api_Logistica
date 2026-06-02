const ShipmentAuditLog = require('../modules/shipmentAuditLogs/shipmentAuditLog.model')

async function createAuditLog({
  shipment_id = null,
  entity_type,
  entity_id = null,
  action,
  old_values = null,
  new_values = null,
  user_id = null,
  transaction,
}) {
  return ShipmentAuditLog.create(
    {
      shipment_id,
      entity_type,
      entity_id,
      action,
      old_values,
      new_values,
      user_id,
      created_at: new Date(),
    },
    { transaction }
  )
}

module.exports = {
  createAuditLog,
}
