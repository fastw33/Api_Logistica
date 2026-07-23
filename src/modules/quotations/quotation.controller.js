const quotationService = require('./quotation.service')
const { convertQuotationToShipment } = require('../shipments/shipment.service')
const { createQuotationDocument } = require('../quotationDocuments/quotationDocument.service')
const {
  createQuotationPdfBuffer,
  buildQuotationPdfFilename,
} = require('../../utils/quotationPdf')
const {
  createQuotationProviderQuote,
} = require('../quotationProviderQuotes/quotationProviderQuote.service')
const { createQuotationSale } = require('../quotationSales/quotationSale.service')
const { createQuotationTrace } = require('../quotationTraces/quotationTrace.service')

function buildUploadedFileUrl(folder, entityPrefix, entityId, file) {
  return `/uploads/${folder}/${entityPrefix}-${entityId}/${file.filename}`
}

function getUploadedDocumentFiles(req) {
  if (Array.isArray(req.files)) return req.files
  if (req.file) return [req.file]
  return []
}

exports.getAllQuotations = async (req, res, next) => {
  try {
    const result = await quotationService.listQuotations(req.query)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

exports.getQuotationById = async (req, res, next) => {
  try {
    const quotation = await quotationService.getQuotationById(req.params.id)
    if (!quotation) {
      return res.status(404).json({ message: 'Cotización no encontrada' })
    }
    res.json(quotation)
  } catch (error) {
    next(error)
  }
}

exports.downloadQuotationPdf = async (req, res, next) => {
  try {
    const quotation = await quotationService.getQuotationById(req.params.id)
    if (!quotation) {
      return res.status(404).json({ message: 'Cotización no encontrada' })
    }

    const pdfBuffer = await createQuotationPdfBuffer(quotation)
    const filename = buildQuotationPdfFilename(quotation)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', pdfBuffer.length)

    return res.send(pdfBuffer)
  } catch (error) {
    next(error)
  }
}

exports.createQuotation = async (req, res, next) => {
  try {
    const quotation = await quotationService.createQuotation(
      req.body,
      req.usuario?.id_usuario || null
    )
    res.status(201).json({
      message: 'Cotización creada correctamente',
      data: quotation,
    })
  } catch (error) {
    next(error)
  }
}

exports.updateQuotation = async (req, res, next) => {
  try {
    const quotation = await quotationService.updateQuotation(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )
    res.json({
      message: 'Cotización actualizada correctamente',
      data: quotation,
    })
  } catch (error) {
    next(error)
  }
}

exports.approveQuotation = async (req, res, next) => {
  try {
    const result = await quotationService.approveQuotation(
      req.params.id,
      req.usuario?.id_usuario || null
    )
    res.json({
      message: 'Cotización aprobada y DO generado correctamente',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

exports.closeUnsuccessfulQuotation = async (req, res, next) => {
  try {
    const quotation = await quotationService.closeQuotationUnsuccessful(
      req.params.id,
      req.usuario?.id_usuario || null
    )
    res.json({
      message: 'Cotización cerrada como no exitosa',
      data: quotation,
    })
  } catch (error) {
    next(error)
  }
}

exports.convertToShipment = async (req, res, next) => {
  try {
    const shipment = await convertQuotationToShipment(
      req.params.id,
      req.usuario?.id_usuario || null
    )
    res.json({
      message: 'Cotización convertida a DO correctamente',
      data: shipment,
    })
  } catch (error) {
    next(error)
  }
}

exports.createDocument = async (req, res, next) => {
  try {
    const quotationId = Number(req.params.id)
    const uploadedFiles = getUploadedDocumentFiles(req)

    if (!uploadedFiles.length && !req.body.file_url) {
      return res.status(400).json({
        message: 'Debes adjuntar un archivo o enviar file_url',
      })
    }

    const filesToPersist = uploadedFiles.length
      ? uploadedFiles
      : [{ originalname: req.body.document_name || 'Documento CT', file_url: req.body.file_url }]

    const documents = []
    for (const file of filesToPersist) {
      const fileUrl =
        file.file_url ||
        buildUploadedFileUrl('quotation-documents', 'quotation', quotationId, file)
      documents.push(
        await createQuotationDocument(
          quotationId,
          {
            document_type: req.body.document_type,
            document_name: req.body.document_name || file.originalname || 'Documento CT',
            package_name: req.body.package_name || null,
            file_url: fileUrl,
            file_size: file.size || null,
            mime_type: file.mimetype || null,
          },
          req.usuario?.id_usuario || null
        )
      )
    }

    res.status(201).json({
      message:
        documents.length > 1
          ? 'Paquete de documentos CT cargado correctamente'
          : 'Documento de CT cargado correctamente',
      data: documents.length > 1 ? documents : documents[0],
    })
  } catch (error) {
    next(error)
  }
}

exports.createProviderQuote = async (req, res, next) => {
  try {
    const quote = await createQuotationProviderQuote(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )

    res.status(201).json({
      message: 'Cotización de proveedor registrada correctamente',
      data: quote,
    })
  } catch (error) {
    next(error)
  }
}

exports.createSale = async (req, res, next) => {
  try {
    const sale = await createQuotationSale(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )

    res.status(201).json({
      message: 'Venta de CT registrada correctamente',
      data: sale,
    })
  } catch (error) {
    next(error)
  }
}

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
