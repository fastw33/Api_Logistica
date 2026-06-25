const express = require('express')
const router = express.Router()
const controller = require('./customerInvoice.controller')
const validator = require('./customerInvoice.validator')
const upload = require('../../middlewares/documentUpload.middleware')
const { normalizeInvoicePayload } = require('../../middlewares/invoicePayload.middleware')
const validate = require('../../utils/validatorResult')

router.patch(
  '/:id',
  (req, res, next) => {
    req.uploadFolder = 'customer-invoices'
    req.uploadEntity = 'customer-invoice'
    next()
  },
  upload.fields([
    { name: 'invoice_file', maxCount: 1 },
    { name: 'payment_file', maxCount: 1 },
  ]),
  normalizeInvoicePayload,
  validator.validateUpdate,
  validate,
  controller.updateCustomerInvoice
)

module.exports = router
