const express = require('express')
const router = express.Router()
const controller = require('./quotationSale.controller')
const validator = require('./quotationSale.validator')
const validate = require('../../utils/validatorResult')

router.patch('/:id', validator.validateUpdate, validate, controller.updateSale)
router.delete('/:id', validator.validateIdParam, validate, controller.deleteSale)

module.exports = router
