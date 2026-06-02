const { body, param } = require('express-validator')
const {
  SHIPMENT_TASK_PRIORITIES,
  SHIPMENT_TASK_STATUSES,
} = require('../../utils/logisticsEnums')

exports.validateCreate = [
  param('id').isInt().withMessage('ID de shipment inválido'),
  body('title').exists().withMessage('title es requerido').bail().isString(),
  body('description').optional({ nullable: true }).isString().withMessage('description debe ser string'),
  body('assigned_to').optional({ nullable: true }).isString().withMessage('assigned_to debe ser string'),
  body('status').optional().isIn(SHIPMENT_TASK_STATUSES).withMessage('status inválido'),
  body('priority').optional().isIn(SHIPMENT_TASK_PRIORITIES).withMessage('priority inválido'),
  body('due_date').optional({ nullable: true }).isISO8601().withMessage('due_date debe ser fecha válida'),
]

exports.validateUpdate = [
  param('id').isInt().withMessage('ID inválido'),
  body('title').optional().isString().withMessage('title debe ser string'),
  body('description').optional({ nullable: true }).isString().withMessage('description debe ser string'),
  body('assigned_to').optional({ nullable: true }).isString().withMessage('assigned_to debe ser string'),
  body('status').optional().isIn(SHIPMENT_TASK_STATUSES).withMessage('status inválido'),
  body('priority').optional().isIn(SHIPMENT_TASK_PRIORITIES).withMessage('priority inválido'),
  body('due_date').optional({ nullable: true }).isISO8601().withMessage('due_date debe ser fecha válida'),
  body('completed_at').optional({ nullable: true }).isISO8601().withMessage('completed_at debe ser fecha válida'),
]
