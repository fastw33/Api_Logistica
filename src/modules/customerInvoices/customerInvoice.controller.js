const { updateCustomerInvoice } = require('./customerInvoice.service')

exports.updateCustomerInvoice = async (req, res, next) => {
  try {
    const invoice = await updateCustomerInvoice(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )
    res.json({
      message: 'Factura de cliente actualizada correctamente',
      data: invoice,
    })
  } catch (error) {
    next(error)
  }
}
