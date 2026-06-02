const express = require('express')
const router = express.Router()
const controller = require('./shipmentSale.controller')
const validator = require('./shipmentSale.validator')
const validate = require('../../utils/validatorResult')

router.patch('/:id', validator.validateUpdate, validate, controller.updateSale)

module.exports = router
