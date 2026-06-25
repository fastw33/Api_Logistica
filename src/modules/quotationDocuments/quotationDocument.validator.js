const { body, param } = require('express-validator')
const { QUOTATION_DOCUMENT_TYPES } = require('../../utils/logisticsEnums')

exports.validateCreate = [
  param('id').isInt().withMessage('ID de cotización inválido'),
  body('document_type')
    .exists()
    .withMessage('document_type es requerido')
    .bail()
    .isIn(QUOTATION_DOCUMENT_TYPES)
    .withMessage(
      `document_type debe ser uno de: ${QUOTATION_DOCUMENT_TYPES.join(', ')}`
    ),
  body('document_name')
    .optional({ nullable: true })
    .isString()
    .withMessage('document_name debe ser string'),
  body('package_name')
    .optional({ nullable: true })
    .isString()
    .withMessage('package_name debe ser string'),
  body('file_url')
    .optional({ nullable: true })
    .isString()
    .withMessage('file_url debe ser string'),
]

exports.validateDelete = [param('id').isInt().withMessage('ID inválido')]
