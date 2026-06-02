const express = require('express')
const router = express.Router()
const controller = require('./shipmentTask.controller')
const validator = require('./shipmentTask.validator')
const validate = require('../../utils/validatorResult')

router.patch('/:id', validator.validateUpdate, validate, controller.updateTask)

module.exports = router
