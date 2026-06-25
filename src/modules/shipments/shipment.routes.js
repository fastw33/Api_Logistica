const express = require('express')
const router = express.Router()
const controller = require('./shipment.controller')
const shipmentValidator = require('./shipment.validator')
const documentValidator = require('../shipmentDocuments/shipmentDocument.validator')
const traceValidator = require('../shipmentTraces/shipmentTrace.validator')
const providerValidator = require('../shipmentProviders/shipmentProvider.validator')
const taskValidator = require('../shipmentTasks/shipmentTask.validator')
const dimensionValidator = require('../shipmentDimensions/shipmentDimension.validator')
const costValidator = require('../shipmentCosts/shipmentCost.validator')
const saleValidator = require('../shipmentSales/shipmentSale.validator')
const customerInvoiceValidator = require('../customerInvoices/customerInvoice.validator')
const vendorInvoiceValidator = require('../vendorInvoices/vendorInvoice.validator')
const financialSupportValidator = require('../financialSupports/financialSupport.validator')
const upload = require('../../middlewares/documentUpload.middleware')
const { normalizeInvoicePayload } = require('../../middlewares/invoicePayload.middleware')
const validate = require('../../utils/validatorResult')

router.get('/', controller.getAllShipments)
router.get('/:id', shipmentValidator.validateIdParam, validate, controller.getShipmentById)
router.post('/', shipmentValidator.validateCreate, validate, controller.createShipment)
router.patch('/:id', shipmentValidator.validateUpdate, validate, controller.updateShipment)

router.post(
  '/:id/documents',
  (req, res, next) => {
    req.uploadFolder = 'documents'
    req.uploadEntity = 'shipment'
    next()
  },
  upload.single('file'),
  documentValidator.validateCreate,
  validate,
  controller.createDocument
)

router.post('/:id/traces', traceValidator.validateCreate, validate, controller.createTrace)
router.post('/:id/providers', providerValidator.validateCreate, validate, controller.createProvider)
router.post('/:id/tasks', taskValidator.validateCreate, validate, controller.createTask)
router.post('/:id/dimensions', dimensionValidator.validateCreate, validate, controller.createDimension)
router.post('/:id/costs', costValidator.validateCreate, validate, controller.createCost)
router.post('/:id/sales', saleValidator.validateCreate, validate, controller.createSale)
router.post(
  '/:id/customer-invoices',
  (req, res, next) => {
    req.uploadFolder = 'customer-invoices'
    req.uploadEntity = 'shipment'
    next()
  },
  upload.fields([
    { name: 'invoice_file', maxCount: 1 },
    { name: 'payment_file', maxCount: 1 },
  ]),
  normalizeInvoicePayload,
  customerInvoiceValidator.validateCreate,
  validate,
  controller.createCustomerInvoice
)
router.post(
  '/:id/vendor-invoices',
  (req, res, next) => {
    req.uploadFolder = 'vendor-invoices'
    req.uploadEntity = 'shipment'
    next()
  },
  upload.fields([
    { name: 'invoice_file', maxCount: 1 },
    { name: 'payment_file', maxCount: 1 },
  ]),
  normalizeInvoicePayload,
  vendorInvoiceValidator.validateCreate,
  validate,
  controller.createVendorInvoice
)
router.post(
  '/:id/financial-supports',
  (req, res, next) => {
    req.uploadFolder = 'financial-supports'
    req.uploadEntity = 'shipment'
    next()
  },
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'payment_file', maxCount: 1 },
  ]),
  financialSupportValidator.validateCreate,
  validate,
  controller.createFinancialSupport
)
router.get(
  '/:id/profitability',
  shipmentValidator.validateIdParam,
  validate,
  controller.getProfitability
)
router.post(
  '/:id/financial-close',
  shipmentValidator.validateIdParam,
  validate,
  controller.financialClose
)
router.post('/:id/close', shipmentValidator.validateIdParam, validate, controller.closeShipment)

module.exports = router
