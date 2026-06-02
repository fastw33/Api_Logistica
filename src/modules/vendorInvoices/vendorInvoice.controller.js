const { updateVendorInvoice } = require('./vendorInvoice.service')

exports.updateVendorInvoice = async (req, res, next) => {
  try {
    const invoice = await updateVendorInvoice(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )
    res.json({
      message: 'Factura de proveedor actualizada correctamente',
      data: invoice,
    })
  } catch (error) {
    next(error)
  }
}
