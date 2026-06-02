const express = require('express')
const router = express.Router()
const controller = require('./shipmentCost.controller')
const validator = require('./shipmentCost.validator')
const validate = require('../../utils/validatorResult')

router.patch('/:id', validator.validateUpdate, validate, controller.updateCost)

module.exports = router
