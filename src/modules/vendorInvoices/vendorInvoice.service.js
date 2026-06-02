const { sequelize } = require('../../config/db')
const { createAuditLog } = require('../../utils/audit')
const Shipment = require('../shipments/shipment.model')
const ShipmentCost = require('../shipmentCosts/shipmentCost.model')
const VendorInvoice = require('./vendorInvoice.model')

async function syncInvoiceCosts(invoiceId, costIds, transaction) {
  if (!Array.isArray(costIds)) return

  await ShipmentCost.update(
    { vendor_invoice_id: null, updated_at: new Date() },
    { where: { vendor_invoice_id: invoiceId }, transaction }
  )

  if (!costIds.length) return

  await ShipmentCost.update(
    {
      vendor_invoice_id: invoiceId,
      status: 'FACTURADO',
      updated_at: new Date(),
    },
    { where: { id: costIds }, transaction }
  )
}

async function createVendorInvoice(shipmentId, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const shipment = await Shipment.findByPk(shipmentId, { transaction })
    if (!shipment) {
      const error = new Error('Shipment no encontrado')
      error.status = 404
      throw error
    }

    const invoice = await VendorInvoice.create(
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

    await syncInvoiceCosts(invoice.id, data.cost_ids, transaction)

    await shipment.update(
      {
        financial_status: 'PENDIENTE_PAGOS',
        updated_by: userId,
        updated_at: new Date(),
      },
      { transaction }
    )

    await createAuditLog({
      shipment_id: shipmentId,
      entity_type: 'vendor_invoice',
      entity_id: invoice.id,
      action: 'CREACION_FACTURA_PROVEEDOR',
      new_values: invoice.toJSON(),
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return invoice
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function updateVendorInvoice(id, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const invoice = await VendorInvoice.findByPk(id, { transaction })
    if (!invoice) {
      const error = new Error('Factura proveedor no encontrada')
      error.status = 404
      throw error
    }

    const before = invoice.toJSON()

    await invoice.update(
      {
        ...data,
        updated_by: userId,
        updated_at: new Date(),
      },
      { transaction }
    )

    await syncInvoiceCosts(invoice.id, data.cost_ids, transaction)

    await createAuditLog({
      shipment_id: invoice.shipment_id,
      entity_type: 'vendor_invoice',
      entity_id: invoice.id,
      action: 'ACTUALIZACION_FACTURA_PROVEEDOR',
      old_values: before,
      new_values: invoice.toJSON(),
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return invoice
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

module.exports = {
  createVendorInvoice,
  updateVendorInvoice,
}
