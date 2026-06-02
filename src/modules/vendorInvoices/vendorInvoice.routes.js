const express = require('express')
const router = express.Router()
const controller = require('./vendorInvoice.controller')
const validator = require('./vendorInvoice.validator')
const validate = require('../../utils/validatorResult')

router.patch('/:id', validator.validateUpdate, validate, controller.updateVendorInvoice)

module.exports = router
