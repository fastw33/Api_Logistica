const Shipment = require('./shipment.model')
const CustomerInvoice = require('../customerInvoices/customerInvoice.model')
const VendorInvoice = require('../vendorInvoices/vendorInvoice.model')

function hasInvoiceFile(invoice) {
  return Boolean(
    invoice?.support_file_url || invoice?.pdf_url || invoice?.xml_url
  )
}

function resolveFinancialStatus(shipment, summary) {
  if (['CIERRE_FINANCIERO', 'CERRADA'].includes(shipment?.financial_status)) {
    return shipment.financial_status
  }

  if (summary.customerInvoiced && summary.vendorInvoiced) return 'RENTABILIDAD_CALCULADA'
  if (summary.customerInvoiced) return 'PENDIENTE_FACTURAS_PROVEEDOR'
  if (summary.vendorInvoiced) return 'PENDIENTE_FACTURACION'

  return 'PENDIENTE_FACTURACION'
}

async function syncShipmentFinancialState(shipmentId, transaction) {
  const shipment = await Shipment.findByPk(shipmentId, { transaction })
  if (!shipment) return null

  const [customerInvoices, vendorInvoices] = await Promise.all([
    CustomerInvoice.findAll({
      where: { shipment_id: shipmentId },
      transaction,
    }),
    VendorInvoice.findAll({
      where: { shipment_id: shipmentId },
      transaction,
    }),
  ])

  const customerInvoiced =
    customerInvoices.length > 0 && customerInvoices.some(hasInvoiceFile)
  const vendorInvoiced =
    vendorInvoices.length > 0 && vendorInvoices.some(hasInvoiceFile)
  const customerPaid = customerInvoiced
  const vendorPaid = vendorInvoiced

  await shipment.update(
    {
      customer_invoiced: customerInvoiced,
      customer_paid: customerPaid,
      vendor_invoiced: vendorInvoiced,
      vendor_paid: vendorPaid,
      financial_status: resolveFinancialStatus(shipment, {
        customerInvoiced,
        customerPaid,
        vendorInvoiced,
        vendorPaid,
      }),
      updated_at: new Date(),
    },
    { transaction }
  )

  return shipment
}

module.exports = {
  syncShipmentFinancialState,
}
