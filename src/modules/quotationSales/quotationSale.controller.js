const {
  deleteQuotationSale,
  updateQuotationSale,
} = require('./quotationSale.service')

exports.updateSale = async (req, res, next) => {
  try {
    const sale = await updateQuotationSale(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )

    res.json({
      message: 'Venta de CT actualizada correctamente',
      data: sale,
    })
  } catch (error) {
    next(error)
  }
}

exports.deleteSale = async (req, res, next) => {
  try {
    const sale = await deleteQuotationSale(
      req.params.id,
      req.usuario?.id_usuario || null
    )

    res.json({
      message: 'Venta de CT eliminada correctamente',
      data: sale,
    })
  } catch (error) {
    next(error)
  }
}
