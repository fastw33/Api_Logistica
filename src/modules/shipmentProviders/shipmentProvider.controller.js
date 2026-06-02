const {
  deleteShipmentProvider,
} = require('./shipmentProvider.service')

exports.deleteProvider = async (req, res, next) => {
  try {
    await deleteShipmentProvider(req.params.id, req.usuario?.id_usuario || null)
    res.json({
      message: 'Proveedor del DO eliminado correctamente',
    })
  } catch (error) {
    next(error)
  }
}
