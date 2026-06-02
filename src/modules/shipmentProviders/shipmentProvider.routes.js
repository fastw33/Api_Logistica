const express = require('express')
const router = express.Router()
const controller = require('./shipmentProvider.controller')
const validator = require('./shipmentProvider.validator')
const validate = require('../../utils/validatorResult')

router.delete('/:id', validator.validateIdParam, validate, controller.deleteProvider)

module.exports = router
