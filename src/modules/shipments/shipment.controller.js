const shipmentService = require('./shipment.service')
const { createShipmentDocument } = require('../shipmentDocuments/shipmentDocument.service')
const { createShipmentTask } = require('../shipmentTasks/shipmentTask.service')
const { createShipmentDimension } = require('../shipmentDimensions/shipmentDimension.service')
const { createShipmentTrace } = require('../shipmentTraces/shipmentTrace.service')
const { createShipmentProvider } = require('../shipmentProviders/shipmentProvider.service')
const { createShipmentCost } = require('../shipmentCosts/shipmentCost.service')
const { createShipmentSale } = require('../shipmentSales/shipmentSale.service')
const { createCustomerInvoice } = require('../customerInvoices/customerInvoice.service')
const { createVendorInvoice } = require('../vendorInvoices/vendorInvoice.service')
const { createFinancialSupport } = require('../financialSupports/financialSupport.service')

function buildUploadedFileUrl(folder, shipmentId, file) {
  return `/uploads/${folder}/shipment-${shipmentId}/${file.filename}`
}

function getUploadedFile(req, fieldName) {
  const fileGroup = req.files?.[fieldName]
  return Array.isArray(fileGroup) && fileGroup.length ? fileGroup[0] : null
}

function getSupportUploadFile(req) {
  return (
    getUploadedFile(req, 'file') ||
    getUploadedFile(req, 'payment_file') ||
    req.file ||
    null
  )
}

function getUploadedDocumentFiles(req) {
  if (Array.isArray(req.files)) return req.files
  if (req.file) return [req.file]
  return []
}

function buildInvoicePayload(req, shipmentId, folderName) {
  const invoiceFile = getUploadedFile(req, 'invoice_file')

  return {
    ...req.body,
    support_file_url: invoiceFile
      ? buildUploadedFileUrl(folderName, shipmentId, invoiceFile)
      : req.body.support_file_url || null,
  }
}

async function createPaymentSupportFromUpload({
  req,
  shipmentId,
  invoiceId,
  referenceType,
  invoiceNumber,
  folderName,
  userId,
}) {
  const paymentFile = getUploadedFile(req, 'payment_file')
  if (!paymentFile) return null

  return createFinancialSupport(
    shipmentId,
    {
      support_type: 'SOPORTE_PAGO',
      reference_type: referenceType,
      reference_id: invoiceId,
      file_url: buildUploadedFileUrl(folderName, shipmentId, paymentFile),
      notes:
        req.body.payment_support_notes ||
        `Comprobante de pago relacionado a ${invoiceNumber}`,
    },
    userId
  )
}

exports.getAllShipments = async (req, res, next) => {
  try {
    const result = await shipmentService.listShipments(req.query)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

exports.getShipmentById = async (req, res, next) => {
  try {
    const shipment = await shipmentService.getShipmentById(req.params.id, req.query)
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment no encontrado' })
    }
    res.json(shipment)
  } catch (error) {
    next(error)
  }
}

exports.createShipment = async (req, res, next) => {
  try {
    const shipment = await shipmentService.createShipment(
      req.body,
      req.usuario?.id_usuario || null
    )
    res.status(201).json({
      message: 'DO creado correctamente',
      data: shipment,
    })
  } catch (error) {
    next(error)
  }
}

exports.updateShipment = async (req, res, next) => {
  try {
    const shipment = await shipmentService.updateShipment(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )
    res.json({
      message: 'DO actualizado correctamente',
      data: shipment,
    })
  } catch (error) {
    next(error)
  }
}

exports.createDocument = async (req, res, next) => {
  try {
    const shipmentId = Number(req.params.id)
    const uploadedFiles = getUploadedDocumentFiles(req)

    if (!uploadedFiles.length && !req.body.file_url) {
      return res.status(400).json({
        message: 'Debes adjuntar un archivo o enviar file_url',
      })
    }

    const filesToPersist = uploadedFiles.length
      ? uploadedFiles
      : [{ originalname: req.body.document_name || 'Documento', file_url: req.body.file_url }]

    const documents = []
    for (const file of filesToPersist) {
      const fileUrl = file.file_url || buildUploadedFileUrl('documents', shipmentId, file)
      documents.push(
        await createShipmentDocument(
          shipmentId,
          {
            quotation_id: req.body.quotation_id || null,
            document_type: req.body.document_type,
            document_name: req.body.document_name || file.originalname || 'Documento',
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
          ? 'Paquete de documentos cargado correctamente'
          : 'Documento cargado correctamente',
      data: documents.length > 1 ? documents : documents[0],
    })
  } catch (error) {
    next(error)
  }
}

exports.createTask = async (req, res, next) => {
  try {
    const task = await createShipmentTask(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )
    res.status(201).json({
      message: 'Tarea creada correctamente',
      data: task,
    })
  } catch (error) {
    next(error)
  }
}

exports.createTrace = async (req, res, next) => {
  try {
    const trace = await createShipmentTrace(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )
    res.status(201).json({
      message: 'Nota de trazabilidad registrada correctamente',
      data: trace,
    })
  } catch (error) {
    next(error)
  }
}

exports.createProvider = async (req, res, next) => {
  try {
    const provider = await createShipmentProvider(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )
    res.status(201).json({
      message: 'Proveedor del DO registrado correctamente',
      data: provider,
    })
  } catch (error) {
    next(error)
  }
}

exports.createDimension = async (req, res, next) => {
  try {
    const dimension = await createShipmentDimension(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )
    res.status(201).json({
      message: 'Dimensión creada correctamente',
      data: dimension,
    })
  } catch (error) {
    next(error)
  }
}

exports.syncDimensions = async (req, res, next) => {
  try {
    const shipment = await shipmentService.syncShipmentDimensions(
      req.params.id,
      req.body?.dimensions || [],
      req.usuario?.id_usuario || null
    )
    res.json({
      message: 'Dimensiones del DO actualizadas correctamente',
      data: shipment,
    })
  } catch (error) {
    next(error)
  }
}

exports.createCost = async (req, res, next) => {
  try {
    const cost = await createShipmentCost(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )
    res.status(201).json({
      message: 'Costo registrado correctamente',
      data: cost,
    })
  } catch (error) {
    next(error)
  }
}

exports.createSale = async (req, res, next) => {
  try {
    const sale = await createShipmentSale(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )
    res.status(201).json({
      message: 'Venta registrada correctamente',
      data: sale,
    })
  } catch (error) {
    next(error)
  }
}

exports.createCustomerInvoice = async (req, res, next) => {
  try {
    const shipmentId = Number(req.params.id)
    const payload = buildInvoicePayload(req, shipmentId, 'customer-invoices')

    if (!payload.support_file_url) {
      return res.status(400).json({
        message: 'Debes adjuntar el archivo de la factura cliente',
      })
    }

    const invoice = await createCustomerInvoice(
      shipmentId,
      payload,
      req.usuario?.id_usuario || null
    )

    await createPaymentSupportFromUpload({
      req,
      shipmentId,
      invoiceId: invoice.id,
      referenceType: 'customer_invoice',
      invoiceNumber: invoice.invoice_number,
      folderName: 'customer-invoices',
      userId: req.usuario?.id_usuario || null,
    })

    res.status(201).json({
      message: 'Factura de cliente registrada correctamente',
      data: invoice,
    })
  } catch (error) {
    next(error)
  }
}

exports.createVendorInvoice = async (req, res, next) => {
  try {
    const shipmentId = Number(req.params.id)
    const payload = buildInvoicePayload(req, shipmentId, 'vendor-invoices')

    if (!payload.support_file_url) {
      return res.status(400).json({
        message: 'Debes adjuntar el archivo de la factura proveedor',
      })
    }

    const invoice = await createVendorInvoice(
      shipmentId,
      payload,
      req.usuario?.id_usuario || null
    )

    await createPaymentSupportFromUpload({
      req,
      shipmentId,
      invoiceId: invoice.id,
      referenceType: 'vendor_invoice',
      invoiceNumber: invoice.invoice_number,
      folderName: 'vendor-invoices',
      userId: req.usuario?.id_usuario || null,
    })

    res.status(201).json({
      message: 'Factura de proveedor registrada correctamente',
      data: invoice,
    })
  } catch (error) {
    next(error)
  }
}

exports.createFinancialSupport = async (req, res, next) => {
  try {
    const shipmentId = Number(req.params.id)
    const uploadedFile = getSupportUploadFile(req)
    const fileUrl = uploadedFile
      ? buildUploadedFileUrl('financial-supports', shipmentId, uploadedFile)
      : req.body.file_url
    const supportType =
      req.body.support_type ||
      (getUploadedFile(req, 'payment_file') ? 'SOPORTE_PAGO' : null)
    const notes = req.body.notes || req.body.payment_support_notes || null

    if (!fileUrl) {
      return res.status(400).json({
        message: 'Debes adjuntar un archivo o enviar file_url',
      })
    }

    const support = await createFinancialSupport(
      shipmentId,
      {
        support_type: supportType,
        reference_type: req.body.reference_type || null,
        reference_id: req.body.reference_id || null,
        file_url: fileUrl,
        notes,
      },
      req.usuario?.id_usuario || null
    )

    res.status(201).json({
      message: 'Soporte financiero cargado correctamente',
      data: support,
    })
  } catch (error) {
    next(error)
  }
}

exports.getProfitability = async (req, res, next) => {
  try {
    const shipment = await shipmentService.getShipmentById(req.params.id)
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment no encontrado' })
    }

    const profitability = await shipmentService.calculateShipmentProfitability(
      req.params.id
    )

    res.json(profitability)
  } catch (error) {
    next(error)
  }
}

exports.financialClose = async (req, res, next) => {
  try {
    const shipment = await shipmentService.closeFinancialShipment(
      req.params.id,
      req.usuario?.id_usuario || null
    )
    res.json({
      message: 'Cierre financiero ejecutado correctamente',
      data: shipment,
    })
  } catch (error) {
    next(error)
  }
}

exports.closeShipment = async (req, res, next) => {
  try {
    const shipment = await shipmentService.closeShipment(
      req.params.id,
      req.usuario?.id_usuario || null
    )
    res.json({
      message: 'DO cerrado correctamente',
      data: shipment,
    })
  } catch (error) {
    next(error)
  }
}
