const express = require('express')
const router = express.Router()
const controller = require('./vendorInvoice.controller')
const validator = require('./vendorInvoice.validator')
const upload = require('../../middlewares/documentUpload.middleware')
const { normalizeInvoicePayload } = require('../../middlewares/invoicePayload.middleware')
const validate = require('../../utils/validatorResult')

router.patch(
  '/:id',
  (req, res, next) => {
    req.uploadFolder = 'vendor-invoices'
    req.uploadEntity = 'vendor-invoice'
    next()
  },
  upload.fields([
    { name: 'invoice_file', maxCount: 1 },
    { name: 'payment_file', maxCount: 1 },
  ]),
  normalizeInvoicePayload,
  validator.validateUpdate,
  validate,
  controller.updateVendorInvoice
)

module.exports = router
