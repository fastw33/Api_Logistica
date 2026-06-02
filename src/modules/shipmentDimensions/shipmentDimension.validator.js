const { body, param } = require('express-validator')

exports.validateCreate = [
  param('id').isInt().withMessage('ID de shipment inválido'),
  body('quantity').exists().withMessage('quantity es requerido').bail().isDecimal().withMessage('quantity debe ser numérico'),
  body('package_type').optional({ nullable: true }).isString().withMessage('package_type debe ser string'),
  body('gross_weight').optional({ nullable: true }).isDecimal().withMessage('gross_weight debe ser numérico'),
  body('volumetric_weight').optional({ nullable: true }).isDecimal().withMessage('volumetric_weight debe ser numérico'),
  body('volume_cbm').optional({ nullable: true }).isDecimal().withMessage('volume_cbm debe ser numérico'),
  body('length').optional({ nullable: true }).isDecimal().withMessage('length debe ser numérico'),
  body('width').optional({ nullable: true }).isDecimal().withMessage('width debe ser numérico'),
  body('height').optional({ nullable: true }).isDecimal().withMessage('height debe ser numérico'),
  body('notes').optional({ nullable: true }).isString().withMessage('notes debe ser string'),
]

exports.validateUpdate = [
  param('id').isInt().withMessage('ID inválido'),
  body('quantity').optional().isDecimal().withMessage('quantity debe ser numérico'),
  body('package_type').optional({ nullable: true }).isString().withMessage('package_type debe ser string'),
  body('gross_weight').optional({ nullable: true }).isDecimal().withMessage('gross_weight debe ser numérico'),
  body('volumetric_weight').optional({ nullable: true }).isDecimal().withMessage('volumetric_weight debe ser numérico'),
  body('volume_cbm').optional({ nullable: true }).isDecimal().withMessage('volume_cbm debe ser numérico'),
  body('length').optional({ nullable: true }).isDecimal().withMessage('length debe ser numérico'),
  body('width').optional({ nullable: true }).isDecimal().withMessage('width debe ser numérico'),
  body('height').optional({ nullable: true }).isDecimal().withMessage('height debe ser numérico'),
  body('notes').optional({ nullable: true }).isString().withMessage('notes debe ser string'),
]
