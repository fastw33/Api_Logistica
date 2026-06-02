const { body, param } = require('express-validator')
const { SHIPMENT_PROVIDER_SERVICE_CODES } = require('../../utils/logisticsEnums')

exports.validateCreate = [
  param('id').isInt().withMessage('ID de shipment inválido'),
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
  body('provider_type')
    .optional({ nullable: true })
    .isString()
    .withMessage('provider_type debe ser string'),
  body('service_code')
    .optional({ nullable: true })
    .isIn(SHIPMENT_PROVIDER_SERVICE_CODES)
    .withMessage(
      `service_code debe ser uno de: ${SHIPMENT_PROVIDER_SERVICE_CODES.join(', ')}`
    ),
  body('contact_name')
    .optional({ nullable: true })
    .isString()
    .withMessage('contact_name debe ser string'),
  body('contact_email')
    .optional({ nullable: true })
    .isEmail()
    .withMessage('contact_email debe ser un correo válido'),
  body('notes')
    .optional({ nullable: true })
    .isString()
    .withMessage('notes debe ser string'),
]

exports.validateIdParam = [param('id').isInt().withMessage('ID inválido')]
