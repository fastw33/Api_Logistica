const { body, param } = require('express-validator')
const { INVOICE_PAYMENT_STATUSES } = require('../../utils/logisticsEnums')

const commonRules = [
  body('vendor_id').optional().isString().withMessage('vendor_id debe ser string'),
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
  body('cost_ids').optional().isArray().withMessage('cost_ids debe ser arreglo'),
  body('cost_ids.*').optional().isInt().withMessage('cost_ids debe contener enteros'),
]

exports.validateCreate = [
  param('id').isInt().withMessage('ID de shipment inválido'),
  body('vendor_id').exists().withMessage('vendor_id es requerido').bail().isString(),
  body('invoice_number').exists().withMessage('invoice_number es requerido').bail().isString(),
  body('subtotal').exists().withMessage('subtotal es requerido').bail().isDecimal(),
  body('total').exists().withMessage('total es requerido').bail().isDecimal(),
  ...commonRules,
]

exports.validateUpdate = [param('id').isInt().withMessage('ID inválido'), ...commonRules]
