const { body, param } = require('express-validator')
const { INVOICE_PAYMENT_STATUSES } = require('../../utils/logisticsEnums')

const commonRules = [
  body('customer_id').optional().isString().withMessage('customer_id debe ser string'),
  body('invoice_number').optional().isString().withMessage('invoice_number debe ser string'),
  body('currency').optional().isString().withMessage('currency debe ser string'),
  body('subtotal').optional().isDecimal().withMessage('subtotal debe ser numérico'),
  body('taxes').optional().isDecimal().withMessage('taxes debe ser numérico'),
  body('total').optional().isDecimal().withMessage('total debe ser numérico'),
  body('paid_amount').optional().isDecimal().withMessage('paid_amount debe ser numérico'),
  body('balance').optional().isDecimal().withMessage('balance debe ser numérico'),
  body('payment_status').optional().isIn(INVOICE_PAYMENT_STATUSES).withMessage('payment_status inválido'),
  body('payment_date').optional({ nullable: true }).isISO8601().withMessage('payment_date debe ser fecha válida'),
  body('invoice_date').optional({ nullable: true }).isISO8601().withMessage('invoice_date debe ser fecha válida'),
  body('due_date').optional({ nullable: true }).isISO8601().withMessage('due_date debe ser fecha válida'),
  body('pdf_url').optional({ nullable: true }).isString().withMessage('pdf_url debe ser string'),
  body('xml_url').optional({ nullable: true }).isString().withMessage('xml_url debe ser string'),
  body('support_file_url').optional({ nullable: true }).isString().withMessage('support_file_url debe ser string'),
  body('sale_ids').optional().isArray().withMessage('sale_ids debe ser arreglo'),
  body('sale_ids.*').optional().isInt().withMessage('sale_ids debe contener enteros'),
]

exports.validateCreate = [
  param('id').isInt().withMessage('ID de shipment inválido'),
  body('customer_id').exists().withMessage('customer_id es requerido').bail().isString(),
  body('invoice_number').exists().withMessage('invoice_number es requerido').bail().isString(),
  body('total').exists().withMessage('total es requerido').bail().isDecimal(),
  ...commonRules,
]

exports.validateUpdate = [param('id').isInt().withMessage('ID inválido'), ...commonRules]
