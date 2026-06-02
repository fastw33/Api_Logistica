const {
  deleteQuotationProviderQuote,
} = require('./quotationProviderQuote.service')

exports.deleteProviderQuote = async (req, res, next) => {
  try {
    await deleteQuotationProviderQuote(req.params.id, req.usuario?.id_usuario || null)
    res.json({
      message: 'Cotización de proveedor eliminada correctamente',
    })
  } catch (error) {
    next(error)
  }
}
