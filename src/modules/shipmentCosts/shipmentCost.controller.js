const { updateShipmentCost } = require('./shipmentCost.service')

exports.updateCost = async (req, res, next) => {
  try {
    const cost = await updateShipmentCost(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )
    res.json({
      message: 'Costo actualizado correctamente',
      data: cost,
    })
  } catch (error) {
    next(error)
  }
}
