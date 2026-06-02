const { createQuotationTrace } = require('./quotationTrace.service')

exports.createTrace = async (req, res, next) => {
  try {
    const trace = await createQuotationTrace(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )

    res.status(201).json({
      message: 'Comentario de CT registrado correctamente',
      data: trace,
    })
  } catch (error) {
    next(error)
  }
}
