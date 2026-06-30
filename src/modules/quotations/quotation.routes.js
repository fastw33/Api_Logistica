const express = require('express')
const router = express.Router()
const controller = require('./quotation.controller')
const validator = require('./quotation.validator')
const documentValidator = require('../quotationDocuments/quotationDocument.validator')
const providerQuoteValidator = require('../quotationProviderQuotes/quotationProviderQuote.validator')
const quotationSaleValidator = require('../quotationSales/quotationSale.validator')
const traceValidator = require('../quotationTraces/quotationTrace.validator')
const upload = require('../../middlewares/documentUpload.middleware')
const validate = require('../../utils/validatorResult')

router.get('/', controller.getAllQuotations)
router.get('/:id', validator.validateIdParam, validate, controller.getQuotationById)
router.get('/:id/pdf', validator.validateIdParam, validate, controller.downloadQuotationPdf)
router.post('/', validator.validateCreate, validate, controller.createQuotation)
router.patch('/:id', validator.validateUpdate, validate, controller.updateQuotation)
router.post(
  '/:id/provider-quotes',
  providerQuoteValidator.validateCreate,
  validate,
  controller.createProviderQuote
)
router.post(
  '/:id/sales',
  quotationSaleValidator.validateCreate,
  validate,
  controller.createSale
)
router.post(
  '/:id/traces',
  traceValidator.validateCreate,
  validate,
  controller.createTrace
)
router.post(
  '/:id/documents',
  (req, res, next) => {
    req.uploadFolder = 'quotation-documents'
    req.uploadEntity = 'quotation'
    next()
  },
  upload.single('file'),
  documentValidator.validateCreate,
  validate,
  controller.createDocument
)
router.post('/:id/approve', validator.validateIdParam, validate, controller.approveQuotation)
router.post(
  '/:id/close-unsuccessful',
  validator.validateIdParam,
  validate,
  controller.closeUnsuccessfulQuotation
)
router.post(
  '/:id/convert-to-shipment',
  validator.validateIdParam,
  validate,
  controller.convertToShipment
)

module.exports = router
