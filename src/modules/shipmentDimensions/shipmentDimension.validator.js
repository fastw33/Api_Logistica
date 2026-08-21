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
  body('dimension_unit')
    .optional({ nullable: true })
    .isIn(['cm', 'm'])
    .withMessage('dimension_unit debe ser cm o m'),
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
  body('dimension_unit')
    .optional({ nullable: true })
    .isIn(['cm', 'm'])
    .withMessage('dimension_unit debe ser cm o m'),
  body('notes').optional({ nullable: true }).isString().withMessage('notes debe ser string'),
]

exports.validateSync = [
  param('id').isInt().withMessage('ID de shipment inválido'),
  body('dimensions').optional().isArray().withMessage('dimensions debe ser un arreglo'),
  body('dimensions.*.quantity')
    .optional({ nullable: true })
    .isDecimal()
    .withMessage('dimensions.quantity debe ser numérico'),
  body('dimensions.*.package_type')
    .optional({ nullable: true })
    .isString()
    .withMessage('dimensions.package_type debe ser string'),
  body('dimensions.*.gross_weight')
    .optional({ nullable: true })
    .isDecimal()
    .withMessage('dimensions.gross_weight debe ser numérico'),
  body('dimensions.*.volumetric_weight')
    .optional({ nullable: true })
    .isDecimal()
    .withMessage('dimensions.volumetric_weight debe ser numérico'),
  body('dimensions.*.volume_cbm')
    .optional({ nullable: true })
    .isDecimal()
    .withMessage('dimensions.volume_cbm debe ser numérico'),
  body('dimensions.*.length')
    .optional({ nullable: true })
    .isDecimal()
    .withMessage('dimensions.length debe ser numérico'),
  body('dimensions.*.width')
    .optional({ nullable: true })
    .isDecimal()
    .withMessage('dimensions.width debe ser numérico'),
  body('dimensions.*.height')
    .optional({ nullable: true })
    .isDecimal()
    .withMessage('dimensions.height debe ser numérico'),
  body('dimensions.*.dimension_unit')
    .optional({ nullable: true })
    .isIn(['cm', 'm'])
    .withMessage('dimensions.dimension_unit debe ser cm o m'),
  body('dimensions.*.notes')
    .optional({ nullable: true })
    .isString()
    .withMessage('dimensions.notes debe ser string'),
]
