const { sequelize } = require('../../config/db')
const { Op } = require('sequelize')
const { createAuditLog } = require('../../utils/audit')
const { buildFlatInvoicePayload } = require('../../utils/financialValues')
const Shipment = require('../shipments/shipment.model')
const ShipmentCost = require('../shipmentCosts/shipmentCost.model')
const VendorInvoice = require('./vendorInvoice.model')
const { syncShipmentFinancialState } = require('../shipments/shipmentFinancialState.service')

function resolveCostStatus(paymentStatus) {
  return String(paymentStatus || '').trim().toUpperCase() === 'PAGADA'
    ? 'PAGADO'
    : 'FACTURADO'
}

function buildDuplicateInvoiceNumberError(invoiceNumber) {
  const error = new Error(
    `Ya existe una factura proveedor con el numero ${invoiceNumber}.`
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

  const existingInvoice = await VendorInvoice.findOne({
    where,
    attributes: ['id'],
    transaction,
  })

  if (existingInvoice) {
    throw buildDuplicateInvoiceNumberError(normalizedInvoiceNumber)
  }
}

async function syncInvoiceCosts(invoiceId, costIds, paymentStatus, transaction) {
  if (!Array.isArray(costIds)) return

  await ShipmentCost.update(
    { vendor_invoice_id: null, updated_at: new Date() },
    { where: { vendor_invoice_id: invoiceId }, transaction }
  )

  if (!costIds.length) return

  await ShipmentCost.update(
    {
      vendor_invoice_id: invoiceId,
      status: resolveCostStatus(paymentStatus),
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

    await assertInvoiceNumberAvailable(data.invoice_number, transaction)

    const normalizedAmounts = buildFlatInvoicePayload(data, {
      defaultCurrency: shipment.currency || 'COP',
    })

    const invoice = await VendorInvoice.create(
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

    await syncInvoiceCosts(
      invoice.id,
      data.cost_ids,
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
    await rollbackSafely(transaction)
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

    await syncInvoiceCosts(
      invoice.id,
      data.cost_ids,
      data.payment_status || invoice.payment_status,
      transaction
    )

    await syncShipmentFinancialState(invoice.shipment_id, transaction)

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
    await rollbackSafely(transaction)
    throw error
  }
}

module.exports = {
  createVendorInvoice,
  updateVendorInvoice,
}
