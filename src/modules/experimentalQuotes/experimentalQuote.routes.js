const express = require('express')
const router = express.Router()
const controller = require('./experimentalQuote.controller')
const validator = require('./experimentalQuote.validator')
const validate = require('../../utils/validatorResult')

router.get('/', controller.getAll)
router.get('/:id', validator.validateIdParam, validate, controller.getById)
router.post('/', validator.validateCreate, validate, controller.create)
router.post('/calculate', validator.validateCalculate, validate, controller.calculate)
router.post(
  '/:id/apply-to-quotation/:quotationId',
  validator.validateIdParam,
  validate,
  controller.applyToQuotation
)
router.post('/:id/calculate', validator.validateUpdate, validate, controller.recalculate)
router.patch('/:id', validator.validateUpdate, validate, controller.update)
router.delete('/:id', validator.validateIdParam, validate, controller.remove)

module.exports = router
