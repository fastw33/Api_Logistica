const { updateShipmentSale } = require('./shipmentSale.service')

exports.updateSale = async (req, res, next) => {
  try {
    const sale = await updateShipmentSale(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )
    res.json({
      message: 'Venta actualizada correctamente',
      data: sale,
    })
  } catch (error) {
    next(error)
  }
}
