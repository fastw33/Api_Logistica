const { updateShipmentTask } = require('./shipmentTask.service')

exports.updateTask = async (req, res, next) => {
  try {
    const task = await updateShipmentTask(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )
    res.json({
      message: 'Tarea actualizada correctamente',
      data: task,
    })
  } catch (error) {
    next(error)
  }
}
