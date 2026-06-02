const { body, param } = require('express-validator')
const { SHIPMENT_DOCUMENT_TYPES } = require('../../utils/logisticsEnums')

exports.validateCreate = [
  param('id').isInt().withMessage('ID de shipment inválido'),
  body('document_type')
    .exists()
    .withMessage('document_type es requerido')
    .bail()
    .isIn(SHIPMENT_DOCUMENT_TYPES)
    .withMessage(`document_type debe ser uno de: ${SHIPMENT_DOCUMENT_TYPES.join(', ')}`),
  body('document_name').optional({ nullable: true }).isString().withMessage('document_name debe ser string'),
  body('quotation_id').optional({ nullable: true }).isInt().withMessage('quotation_id debe ser entero'),
  body('file_url').optional({ nullable: true }).isString().withMessage('file_url debe ser string'),
]

exports.validateDelete = [param('id').isInt().withMessage('ID inválido')]
