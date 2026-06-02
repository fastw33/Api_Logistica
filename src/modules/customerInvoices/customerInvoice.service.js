const { sequelize } = require('../../config/db')
const { createAuditLog } = require('../../utils/audit')
const Shipment = require('../shipments/shipment.model')
const ShipmentSale = require('../shipmentSales/shipmentSale.model')
const CustomerInvoice = require('./customerInvoice.model')

async function syncInvoiceSales(invoiceId, saleIds, transaction) {
  if (!Array.isArray(saleIds)) return

  await ShipmentSale.update(
    { customer_invoice_id: null, updated_at: new Date() },
    { where: { customer_invoice_id: invoiceId }, transaction }
  )

  if (!saleIds.length) return

  await ShipmentSale.update(
    { customer_invoice_id: invoiceId, status: 'FACTURADO', updated_at: new Date() },
    { where: { id: saleIds }, transaction }
  )
}

async function createCustomerInvoice(shipmentId, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const shipment = await Shipment.findByPk(shipmentId, { transaction })
    if (!shipment) {
      const error = new Error('Shipment no encontrado')
      error.status = 404
      throw error
    }

    const invoice = await CustomerInvoice.create(
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

    await syncInvoiceSales(invoice.id, data.sale_ids, transaction)

    await shipment.update(
      {
        financial_status: 'FACTURADA_CLIENTE',
        updated_by: userId,
        updated_at: new Date(),
      },
      { transaction }
    )

    await createAuditLog({
      shipment_id: shipmentId,
      entity_type: 'customer_invoice',
      entity_id: invoice.id,
      action: 'CREACION_FACTURA_CLIENTE',
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

async function updateCustomerInvoice(id, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const invoice = await CustomerInvoice.findByPk(id, { transaction })
    if (!invoice) {
      const error = new Error('Factura cliente no encontrada')
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

    await syncInvoiceSales(invoice.id, data.sale_ids, transaction)

    await createAuditLog({
      shipment_id: invoice.shipment_id,
      entity_type: 'customer_invoice',
      entity_id: invoice.id,
      action: 'ACTUALIZACION_FACTURA_CLIENTE',
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
  createCustomerInvoice,
  updateCustomerInvoice,
}
