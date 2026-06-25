const { body, param } = require('express-validator')
const {
  QUOTATION_BUSINESS_TYPES,
  QUOTATION_MATERIAL_CLASSES,
  QUOTATION_MODALITIES,
  QUOTATION_TRANSPORT_MODES,
  SHIPMENT_CLOSURE_STATUSES,
  SHIPMENT_FINANCIAL_STATUSES,
  SHIPMENT_OPERATIONAL_STATUSES,
} = require('../../utils/logisticsEnums')

const commonShipmentRules = [
  body('line_key')
    .optional({ values: 'falsy' })
    .isIn(['fastway', 'harvest', 'greenway'])
    .withMessage('line_key debe ser uno de: fastway, harvest, greenway'),
  body('quotation_id').optional({ nullable: true }).isInt().withMessage('quotation_id debe ser entero'),
  body('lead_external_id').optional().isString().withMessage('lead_external_id debe ser string'),
  body('customer_id').optional().isString().withMessage('customer_id debe ser string'),
  body('project_external_id')
    .optional({ nullable: true })
    .isString()
    .withMessage('project_external_id debe ser string'),
  body('project_name')
    .optional({ nullable: true })
    .isString()
    .withMessage('project_name debe ser string'),
  body('subject').optional().isString().withMessage('subject debe ser string'),
  body('transport_mode').optional().isIn(QUOTATION_TRANSPORT_MODES).withMessage('transport_mode inválido'),
  body('modality').optional().isIn(QUOTATION_MODALITIES).withMessage('modality inválido'),
  body('business_type').optional().isIn(QUOTATION_BUSINESS_TYPES).withMessage('business_type inválido'),
  body('material_class').optional().isIn(QUOTATION_MATERIAL_CLASSES).withMessage('material_class inválido'),
  body('operational_status')
    .optional()
    .isIn(SHIPMENT_OPERATIONAL_STATUSES)
    .withMessage(`operational_status debe ser uno de: ${SHIPMENT_OPERATIONAL_STATUSES.join(', ')}`),
  body('financial_status')
    .optional()
    .isIn(SHIPMENT_FINANCIAL_STATUSES)
    .withMessage(`financial_status debe ser uno de: ${SHIPMENT_FINANCIAL_STATUSES.join(', ')}`),
  body('closure_status')
    .optional()
    .isIn(SHIPMENT_CLOSURE_STATUSES)
    .withMessage(`closure_status debe ser uno de: ${SHIPMENT_CLOSURE_STATUSES.join(', ')}`),
  body('incoterm').optional({ nullable: true }).isString().withMessage('incoterm debe ser string'),
  body('origin_country').optional().isString().withMessage('origin_country debe ser string'),
  body('origin_city').optional({ nullable: true }).isString().withMessage('origin_city debe ser string'),
  body('origin_port').optional({ nullable: true }).isString().withMessage('origin_port debe ser string'),
  body('origin_address').optional({ nullable: true }).isString().withMessage('origin_address debe ser string'),
  body('destination_country').optional().isString().withMessage('destination_country debe ser string'),
  body('destination_city').optional({ nullable: true }).isString().withMessage('destination_city debe ser string'),
  body('destination_port').optional({ nullable: true }).isString().withMessage('destination_port debe ser string'),
  body('destination_address').optional({ nullable: true }).isString().withMessage('destination_address debe ser string'),
  body('declared_value').optional({ values: 'falsy', nullable: true }).isDecimal().withMessage('declared_value debe ser numérico'),
  body('cif_value').optional({ values: 'falsy', nullable: true }).isDecimal().withMessage('cif_value debe ser numérico'),
  body('currency').optional().isString().withMessage('currency debe ser string'),
  body('trm').optional({ values: 'falsy', nullable: true }).isDecimal().withMessage('trm debe ser numérico'),
  body('euro_usd_factor').optional({ nullable: true }).isDecimal().withMessage('euro_usd_factor debe ser numérico'),
  body('cargo_description').optional({ nullable: true }).isString().withMessage('cargo_description debe ser string'),
  body('etd').optional({ values: 'falsy', nullable: true }).isISO8601().withMessage('etd debe ser fecha válida'),
  body('eta').optional({ values: 'falsy', nullable: true }).isISO8601().withMessage('eta debe ser fecha válida'),
  body('release_date').optional({ values: 'falsy', nullable: true }).isISO8601().withMessage('release_date debe ser fecha válida'),
  body('transit_days').optional({ nullable: true }).isInt().withMessage('transit_days debe ser entero'),
  body('commercial_id').optional({ nullable: true }).isString().withMessage('commercial_id debe ser string'),
  body('operator_id').optional({ nullable: true }).isString().withMessage('operator_id debe ser string'),
  body('customer_invoiced').optional().isBoolean().withMessage('customer_invoiced debe ser boolean'),
  body('customer_paid').optional().isBoolean().withMessage('customer_paid debe ser boolean'),
  body('vendor_invoiced').optional().isBoolean().withMessage('vendor_invoiced debe ser boolean'),
  body('vendor_paid').optional().isBoolean().withMessage('vendor_paid debe ser boolean'),
]

exports.validateCreate = [
  body('lead_external_id').exists().withMessage('lead_external_id es requerido').bail().isString(),
  body('customer_id').exists().withMessage('customer_id es requerido').bail().isString(),
  body('subject').exists().withMessage('subject es requerido').bail().isString(),
  body('transport_mode').exists().withMessage('transport_mode es requerido').bail().isIn(QUOTATION_TRANSPORT_MODES),
  body('modality').exists().withMessage('modality es requerido').bail().isIn(QUOTATION_MODALITIES),
  body('business_type').exists().withMessage('business_type es requerido').bail().isIn(QUOTATION_BUSINESS_TYPES),
  body('origin_country').exists().withMessage('origin_country es requerido').bail().isString(),
  body('destination_country').exists().withMessage('destination_country es requerido').bail().isString(),
  ...commonShipmentRules,
]

exports.validateUpdate = [param('id').isInt().withMessage('ID inválido'), ...commonShipmentRules]
exports.validateIdParam = [param('id').isInt().withMessage('ID inválido')]
