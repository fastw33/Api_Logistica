const { body, param } = require('express-validator')
const {
  SHIPMENT_COST_STATUSES,
  SHIPMENT_COST_TYPES,
} = require('../../utils/logisticsEnums')

const commonRules = [
  body('vendor_id').optional({ nullable: true }).isString().withMessage('vendor_id debe ser string'),
  body('concept').optional().isString().withMessage('concept debe ser string'),
  body('cost_type').optional().isIn(SHIPMENT_COST_TYPES).withMessage('cost_type inválido'),
  body('currency').optional().isString().withMessage('currency debe ser string'),
  body('quantity').optional().isDecimal().withMessage('quantity debe ser numérico'),
  body('unit_value').optional().isDecimal().withMessage('unit_value debe ser numérico'),
  body('subtotal').optional().isDecimal().withMessage('subtotal debe ser numérico'),
  body('tax').optional().isDecimal().withMessage('tax debe ser numérico'),
  body('total').optional().isDecimal().withMessage('total debe ser numérico'),
  body('is_estimated').optional().isBoolean().withMessage('is_estimated debe ser boolean'),
  body('is_final').optional().isBoolean().withMessage('is_final debe ser boolean'),
  body('vendor_invoice_id').optional({ nullable: true }).isInt().withMessage('vendor_invoice_id debe ser entero'),
  body('status').optional().isIn(SHIPMENT_COST_STATUSES).withMessage('status inválido'),
  body('notes').optional({ nullable: true }).isString().withMessage('notes debe ser string'),
]

exports.validateCreate = [
  param('id').isInt().withMessage('ID de shipment inválido'),
  body('concept').exists().withMessage('concept es requerido').bail().isString(),
  body('cost_type').exists().withMessage('cost_type es requerido').bail().isIn(SHIPMENT_COST_TYPES),
  body('unit_value').exists().withMessage('unit_value es requerido').bail().isDecimal(),
  body('subtotal').exists().withMessage('subtotal es requerido').bail().isDecimal(),
  body('total').exists().withMessage('total es requerido').bail().isDecimal(),
  ...commonRules,
]

exports.validateUpdate = [param('id').isInt().withMessage('ID inválido'), ...commonRules]
