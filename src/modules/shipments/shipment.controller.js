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
    const shipment = await shipmentService.getShipmentById(req.params.id)
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
    const fileUrl = req.file
      ? buildUploadedFileUrl('documents', shipmentId, req.file)
      : req.body.file_url

    if (!fileUrl) {
      return res.status(400).json({
        message: 'Debes adjuntar un archivo o enviar file_url',
      })
    }

    const document = await createShipmentDocument(
      shipmentId,
      {
        quotation_id: req.body.quotation_id || null,
        document_type: req.body.document_type,
        document_name: req.body.document_name || req.file?.originalname || 'Documento',
        file_url: fileUrl,
        file_size: req.file?.size || null,
        mime_type: req.file?.mimetype || null,
      },
      req.usuario?.id_usuario || null
    )

    res.status(201).json({
      message: 'Documento cargado correctamente',
      data: document,
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
    const invoice = await createCustomerInvoice(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )
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
    const invoice = await createVendorInvoice(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )
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
    const fileUrl = req.file
      ? buildUploadedFileUrl('financial-supports', shipmentId, req.file)
      : req.body.file_url

    if (!fileUrl) {
      return res.status(400).json({
        message: 'Debes adjuntar un archivo o enviar file_url',
      })
    }

    const support = await createFinancialSupport(
      shipmentId,
      {
        support_type: req.body.support_type,
        reference_type: req.body.reference_type || null,
        reference_id: req.body.reference_id || null,
        file_url: fileUrl,
        notes: req.body.notes || null,
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
