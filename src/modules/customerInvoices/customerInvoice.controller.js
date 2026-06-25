const { updateCustomerInvoice } = require('./customerInvoice.service')
const { createFinancialSupport } = require('../financialSupports/financialSupport.service')

function buildUploadedFileUrl(invoiceId, file) {
  return `/uploads/customer-invoices/customer-invoice-${invoiceId}/${file.filename}`
}

function buildPaymentSupportFileUrl(invoiceId, file) {
  return `/uploads/customer-invoices/customer-invoice-${invoiceId}/${file.filename}`
}

exports.updateCustomerInvoice = async (req, res, next) => {
  try {
    const invoiceFile = Array.isArray(req.files?.invoice_file)
      ? req.files.invoice_file[0]
      : null
    const paymentFile = Array.isArray(req.files?.payment_file)
      ? req.files.payment_file[0]
      : null

    const invoice = await updateCustomerInvoice(
      req.params.id,
      {
        ...req.body,
        support_file_url: invoiceFile
          ? buildUploadedFileUrl(req.params.id, invoiceFile)
          : req.body.support_file_url || undefined,
      },
      req.usuario?.id_usuario || null
    )

    if (paymentFile) {
      await createFinancialSupport(
        invoice.shipment_id,
        {
          support_type: 'SOPORTE_PAGO',
          reference_type: 'customer_invoice',
          reference_id: invoice.id,
          file_url: buildPaymentSupportFileUrl(req.params.id, paymentFile),
          notes:
            req.body.payment_support_notes ||
            `Comprobante de pago relacionado a ${invoice.invoice_number}`,
        },
        req.usuario?.id_usuario || null
      )
    }

    res.json({
      message: 'Factura de cliente actualizada correctamente',
      data: invoice,
    })
  } catch (error) {
    next(error)
  }
}
