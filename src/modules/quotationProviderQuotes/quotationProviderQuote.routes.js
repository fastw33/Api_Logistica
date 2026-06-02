const express = require('express')
const router = express.Router()
const controller = require('./quotationProviderQuote.controller')
const validator = require('./quotationProviderQuote.validator')
const validate = require('../../utils/validatorResult')

router.delete('/:id', validator.validateIdParam, validate, controller.deleteProviderQuote)

module.exports = router
