const express = require('express')
const router = express.Router()
const controller = require('./shipmentDocument.controller')
const validator = require('./shipmentDocument.validator')
const validate = require('../../utils/validatorResult')

router.delete('/:id', validator.validateDelete, validate, controller.deleteDocument)

module.exports = router
