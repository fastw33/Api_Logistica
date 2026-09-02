const { sequelize } = require('../../config/db')
const { Op } = require('sequelize')
const { createAuditLog } = require('../../utils/audit')
const { buildFlatInvoicePayload } = require('../../utils/financialValues')
const Shipment = require('../shipments/shipment.model')
const ShipmentSale = require('../shipmentSales/shipmentSale.model')
const CustomerInvoice = require('./customerInvoice.model')
const { syncShipmentFinancialState } = require('../shipments/shipmentFinancialState.service')

function resolveSaleStatus(paymentStatus) {
  return String(paymentStatus || '').trim().toUpperCase() === 'PAGADA'
    ? 'PAGADO'
    : 'FACTURADO'
}

function buildDuplicateInvoiceNumberError(invoiceNumber) {
  const error = new Error(
    `Ya existe una factura cliente con el numero ${invoiceNumber}.`
  )
  error.status = 409
  error.code = 'DUPLICATE_INVOICE_NUMBER'
  error.field = 'invoice_number'
  error.value = invoiceNumber
  return error
}

async function rollbackSafely(transaction) {
  if (!transaction.finished) {
    try {
      await transaction.rollback()
    } catch (rollbackError) {
      console.error('No se pudo revertir la transaccion:', rollbackError)
    }
  }
}

async function assertInvoiceNumberAvailable(invoiceNumber, transaction, currentId) {
  const normalizedInvoiceNumber = String(invoiceNumber || '').trim()
  if (!normalizedInvoiceNumber) return

  const where = { invoice_number: normalizedInvoiceNumber }
  if (currentId) {
    where.id = { [Op.ne]: currentId }
  }

  const existingInvoice = await CustomerInvoice.findOne({
    where,
    attributes: ['id'],
    transaction,
  })

  if (existingInvoice) {
    throw buildDuplicateInvoiceNumberError(normalizedInvoiceNumber)
  }
}

async function syncInvoiceSales(invoiceId, saleIds, paymentStatus, transaction) {
  if (!Array.isArray(saleIds)) return

  await ShipmentSale.update(
    { customer_invoice_id: null, updated_at: new Date() },
    { where: { customer_invoice_id: invoiceId }, transaction }
  )

  if (!saleIds.length) return

  await ShipmentSale.update(
    {
      customer_invoice_id: invoiceId,
      status: resolveSaleStatus(paymentStatus),
      updated_at: new Date(),
    },
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

    await assertInvoiceNumberAvailable(data.invoice_number, transaction)

    const normalizedAmounts = buildFlatInvoicePayload(data, {
      defaultCurrency: shipment.currency || 'COP',
    })

    const invoice = await CustomerInvoice.create(
      {
        ...data,
        ...normalizedAmounts,
        shipment_id: shipmentId,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    )

    await syncInvoiceSales(
      invoice.id,
      data.sale_ids,
      data.payment_status,
      transaction
    )

    await shipment.update(
      {
        updated_by: userId,
        updated_at: new Date(),
      },
      { transaction }
    )

    await syncShipmentFinancialState(shipmentId, transaction)

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
    await rollbackSafely(transaction)
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
    const shipment = await Shipment.findByPk(invoice.shipment_id, { transaction })

    await assertInvoiceNumberAvailable(data.invoice_number, transaction, id)

    const normalizedAmounts = buildFlatInvoicePayload(
      { ...invoice.toJSON(), ...data },
      {
        defaultCurrency: shipment?.currency || invoice.currency || 'COP',
      }
    )

    await invoice.update(
      {
        ...data,
        ...normalizedAmounts,
        updated_by: userId,
        updated_at: new Date(),
      },
      { transaction }
    )

    await syncInvoiceSales(
      invoice.id,
      data.sale_ids,
      data.payment_status || invoice.payment_status,
      transaction
    )

    await syncShipmentFinancialState(invoice.shipment_id, transaction)

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
    await rollbackSafely(transaction)
    throw error
  }
}

module.exports = {
  createCustomerInvoice,
  updateCustomerInvoice,
}
