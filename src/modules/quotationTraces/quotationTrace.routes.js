const express = require('express')
const router = express.Router()
const controller = require('./quotationTrace.controller')
const validator = require('./quotationTrace.validator')
const validate = require('../../utils/validatorResult')

router.post('/:id', validator.validateCreate, validate, controller.createTrace)

module.exports = router
