const { sequelize } = require('../../config/db')
const { createAuditLog } = require('../../utils/audit')
const Shipment = require('../shipments/shipment.model')
const ShipmentProvider = require('./shipmentProvider.model')

async function createShipmentProvider(shipmentId, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const shipment = await Shipment.findByPk(shipmentId, { transaction })
    if (!shipment) {
      const error = new Error('Shipment no encontrado')
      error.status = 404
      throw error
    }

    const provider = await ShipmentProvider.create(
      {
        shipment_id: shipmentId,
        provider_id: data.provider_id,
        provider_name: data.provider_name,
        provider_type: data.provider_type || null,
        service_code: data.service_code || null,
        contact_name: data.contact_name || null,
        contact_email: data.contact_email || null,
        notes: data.notes || null,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    )

    await createAuditLog({
      shipment_id: shipmentId,
      entity_type: 'shipment_provider',
      entity_id: provider.id,
      action: 'PROVEEDOR_DO',
      new_values: provider.toJSON(),
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return provider
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function deleteShipmentProvider(id, userId) {
  const transaction = await sequelize.transaction()

  try {
    const provider = await ShipmentProvider.findByPk(id, { transaction })
    if (!provider) {
      const error = new Error('Proveedor del DO no encontrado')
      error.status = 404
      throw error
    }

    const previous = provider.toJSON()

    await provider.destroy({ transaction })

    await createAuditLog({
      shipment_id: provider.shipment_id,
      entity_type: 'shipment_provider',
      entity_id: id,
      action: 'ELIMINACION_PROVEEDOR_DO',
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
  createShipmentProvider,
  deleteShipmentProvider,
}
