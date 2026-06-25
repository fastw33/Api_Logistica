const { body, param } = require('express-validator')
const { FINANCIAL_SUPPORT_TYPES } = require('../../utils/logisticsEnums')

exports.validateCreate = [
  param('id').isInt().withMessage('ID de shipment inválido'),
  body('support_type')
    .custom((value, { req }) => {
      if (value) return true
      const paymentUpload = Array.isArray(req.files?.payment_file)
        ? req.files.payment_file[0]
        : null
      if (paymentUpload) return true
      throw new Error('support_type es requerido')
    })
    .bail()
    .custom(value => {
      if (!value) return true
      if (FINANCIAL_SUPPORT_TYPES.includes(value)) return true
      throw new Error(
        `support_type debe ser uno de: ${FINANCIAL_SUPPORT_TYPES.join(', ')}`
      )
    }),
  body('reference_type').optional({ nullable: true }).isString().withMessage('reference_type debe ser string'),
  body('reference_id').optional({ nullable: true }).isInt().withMessage('reference_id debe ser entero'),
  body('file_url').optional({ nullable: true }).isString().withMessage('file_url debe ser string'),
  body('notes').optional({ nullable: true }).isString().withMessage('notes debe ser string'),
]

exports.validateIdParam = [param('id').isInt().withMessage('ID inválido')]
