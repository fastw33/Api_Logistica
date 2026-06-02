const { createShipmentTrace } = require('./shipmentTrace.service')

exports.createTrace = async (req, res, next) => {
  try {
    const trace = await createShipmentTrace(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )

    res.status(201).json({
      message: 'Trazabilidad registrada correctamente',
      data: trace,
    })
  } catch (error) {
    next(error)
  }
}
