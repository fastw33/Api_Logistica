const { body, param } = require('express-validator')
const { QUOTATION_SERVICE_CODES } = require('../../utils/logisticsEnums')

exports.validateCreate = [
  param('id').isInt().withMessage('ID de cotización inválido'),
  body('provider_id')
    .exists()
    .withMessage('provider_id es requerido')
    .bail()
    .isString()
    .withMessage('provider_id debe ser string'),
  body('provider_name')
    .exists()
    .withMessage('provider_name es requerido')
    .bail()
    .isString()
    .withMessage('provider_name debe ser string'),
  body('service_code')
    .optional({ nullable: true })
    .isIn(QUOTATION_SERVICE_CODES)
    .withMessage(`service_code debe ser uno de: ${QUOTATION_SERVICE_CODES.join(', ')}`),
  body('currency')
    .exists()
    .withMessage('currency es requerido')
    .bail()
    .isString()
    .withMessage('currency debe ser string'),
  body('quoted_value')
    .exists()
    .withMessage('quoted_value es requerido')
    .bail()
    .isDecimal()
    .withMessage('quoted_value debe ser numérico'),
  body('quoted_trm')
    .optional({ nullable: true })
    .isDecimal()
    .withMessage('quoted_trm debe ser numérico'),
  body('validity_date')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('validity_date debe ser fecha válida'),
  body('notes')
    .optional({ nullable: true })
    .isString()
    .withMessage('notes debe ser string'),
]

exports.validateIdParam = [param('id').isInt().withMessage('ID inválido')]
