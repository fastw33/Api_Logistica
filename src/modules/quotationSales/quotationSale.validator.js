const { body, param } = require('express-validator')

const commonRules = [
  body('customer_id').optional().isString().withMessage('customer_id debe ser string'),
  body('concept').optional().isString().withMessage('concept debe ser string'),
  body('currency').optional().isString().withMessage('currency debe ser string'),
  body('quantity').optional().isDecimal().withMessage('quantity debe ser numérico'),
  body('unit_value').optional().isDecimal().withMessage('unit_value debe ser numérico'),
  body('subtotal').optional().isDecimal().withMessage('subtotal debe ser numérico'),
  body('tax').optional().isDecimal().withMessage('tax debe ser numérico'),
  body('total').optional().isDecimal().withMessage('total debe ser numérico'),
  body('notes').optional({ nullable: true }).isString().withMessage('notes debe ser string'),
]

exports.validateCreate = [
  param('id').isInt().withMessage('ID de quotation inválido'),
  body('customer_id').exists().withMessage('customer_id es requerido').bail().isString(),
  body('concept').exists().withMessage('concept es requerido').bail().isString(),
  body('total').exists().withMessage('total es requerido').bail().isDecimal(),
  ...commonRules,
]

exports.validateUpdate = [param('id').isInt().withMessage('ID inválido'), ...commonRules]

exports.validateIdParam = [param('id').isInt().withMessage('ID inválido')]
