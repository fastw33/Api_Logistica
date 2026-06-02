const express = require('express')
const router = express.Router()
const controller = require('./financialSupport.controller')
const validator = require('./financialSupport.validator')
const validate = require('../../utils/validatorResult')

router.delete('/:id', validator.validateIdParam, validate, controller.deleteSupport)

module.exports = router
