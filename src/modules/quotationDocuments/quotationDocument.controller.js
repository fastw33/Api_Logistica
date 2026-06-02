const {
  deleteQuotationDocument,
} = require('./quotationDocument.service')

exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await deleteQuotationDocument(
      req.params.id,
      req.usuario?.id_usuario || null
    )

    res.json({
      message: 'Documento de CT eliminado correctamente',
      data: document,
    })
  } catch (error) {
    next(error)
  }
}
