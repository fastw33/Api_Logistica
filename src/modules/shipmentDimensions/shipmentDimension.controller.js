const { updateShipmentDimension } = require('./shipmentDimension.service')

exports.updateDimension = async (req, res, next) => {
  try {
    const dimension = await updateShipmentDimension(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )

    res.json({
      message: 'Dimensión actualizada correctamente',
      data: dimension,
    })
  } catch (error) {
    next(error)
  }
}
