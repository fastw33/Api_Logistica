const fs = require('fs')
const path = require('path')
const { sequelize } = require('../../config/db')
const { createAuditLog } = require('../../utils/audit')
const Shipment = require('../shipments/shipment.model')
const ShipmentDocument = require('./shipmentDocument.model')

function resolveLocalUploadPath(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) return null
  const relativePath = fileUrl.replace('/uploads/', '')
  return path.join(__dirname, '..', '..', 'uploads', relativePath)
}

async function createShipmentDocument(shipmentId, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const shipment = await Shipment.findByPk(shipmentId, { transaction })
    if (!shipment) {
      const error = new Error('Shipment no encontrado')
      error.status = 404
      throw error
    }

    const document = await ShipmentDocument.create(
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
      entity_type: 'shipment_document',
      entity_id: document.id,
      action: 'CARGA_DOCUMENTO',
      new_values: document.toJSON(),
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return document
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function deleteShipmentDocument(id, userId) {
  const transaction = await sequelize.transaction()

  try {
    const document = await ShipmentDocument.findByPk(id, { transaction })
    if (!document) {
      const error = new Error('Documento no encontrado')
      error.status = 404
      throw error
    }

    const snapshot = document.toJSON()

    await document.destroy({ transaction })

    await createAuditLog({
      shipment_id: document.shipment_id,
      entity_type: 'shipment_document',
      entity_id: document.id,
      action: 'ELIMINACION_DOCUMENTO',
      old_values: snapshot,
      user_id: userId,
      transaction,
    })

    await transaction.commit()

    const localPath = resolveLocalUploadPath(document.file_url)
    if (localPath && fs.existsSync(localPath)) {
      fs.unlinkSync(localPath)
    }

    return snapshot
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

module.exports = {
  createShipmentDocument,
  deleteShipmentDocument,
}
