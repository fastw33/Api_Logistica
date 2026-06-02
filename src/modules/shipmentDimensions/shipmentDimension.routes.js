const express = require('express')
const router = express.Router()
const controller = require('./shipmentDimension.controller')
const validator = require('./shipmentDimension.validator')
const validate = require('../../utils/validatorResult')

router.patch('/:id', validator.validateUpdate, validate, controller.updateDimension)

module.exports = router
