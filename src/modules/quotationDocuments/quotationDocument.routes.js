const express = require('express')
const router = express.Router()
const controller = require('./quotationDocument.controller')
const validator = require('./quotationDocument.validator')
const validate = require('../../utils/validatorResult')

router.delete('/:id', validator.validateDelete, validate, controller.deleteDocument)

module.exports = router
