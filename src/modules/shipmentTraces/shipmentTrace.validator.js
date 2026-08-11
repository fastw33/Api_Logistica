const { body, param } = require('express-validator')
const { SHIPMENT_TRACE_TYPES } = require('../../utils/logisticsEnums')

exports.validateCreate = [
  param('id').isInt().withMessage('ID de shipment inválido'),
  body('trace_type')
    .optional()
    .isIn(SHIPMENT_TRACE_TYPES)
    .withMessage(`trace_type debe ser uno de: ${SHIPMENT_TRACE_TYPES.join(', ')}`),
  body('title')
    .optional({ nullable: true })
    .isString()
    .withMessage('title debe ser string'),
  body('note')
    .exists()
    .withMessage('note es requerido')
    .bail()
    .isString()
    .withMessage('note debe ser string'),
  body('liquidation_link')
    .optional({ nullable: true })
    .isString()
    .withMessage('liquidation_link debe ser string'),
  body('event_at')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('event_at debe ser fecha válida'),
]
