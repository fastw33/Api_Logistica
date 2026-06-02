const { deleteFinancialSupport } = require('./financialSupport.service')

exports.deleteSupport = async (req, res, next) => {
  try {
    const support = await deleteFinancialSupport(
      req.params.id,
      req.usuario?.id_usuario || null
    )

    res.json({
      message: 'Soporte financiero eliminado correctamente',
      data: support,
    })
  } catch (error) {
    next(error)
  }
}
