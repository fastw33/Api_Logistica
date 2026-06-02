const express = require('express')
const router = express.Router()
const controller = require('./customerInvoice.controller')
const validator = require('./customerInvoice.validator')
const validate = require('../../utils/validatorResult')

router.patch('/:id', validator.validateUpdate, validate, controller.updateCustomerInvoice)

module.exports = router
