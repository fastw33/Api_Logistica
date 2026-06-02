const { deleteShipmentDocument } = require('./shipmentDocument.service')

exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await deleteShipmentDocument(
      req.params.id,
      req.usuario?.id_usuario || null
    )
    res.json({
      message: 'Documento eliminado correctamente',
      data: document,
    })
  } catch (error) {
    next(error)
  }
}
