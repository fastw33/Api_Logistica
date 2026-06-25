const { body, param } = require('express-validator')
const {
  QUOTATION_BUSINESS_TYPES,
  QUOTATION_CLOSURE_STATUSES,
  QUOTATION_MATERIAL_CLASSES,
  QUOTATION_MODALITIES,
  QUOTATION_SERVICE_CODES,
  QUOTATION_STATUSES,
  QUOTATION_TRANSPORT_MODES,
} = require('../../utils/logisticsEnums')

const commonQuotationRules = [
  body('line_key')
    .optional({ values: 'falsy' })
    .isIn(['fastway', 'harvest', 'greenway'])
    .withMessage('line_key debe ser uno de: fastway, harvest, greenway'),
  body('lead_external_id')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('lead_external_id debe ser string'),
  body('customer_id')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('customer_id debe ser string'),
  body('project_external_id')
    .optional({ nullable: true })
    .isString()
    .withMessage('project_external_id debe ser string'),
  body('project_name')
    .optional({ nullable: true })
    .isString()
    .withMessage('project_name debe ser string'),
  body('subject')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('subject debe ser string'),
  body('transport_mode')
    .optional()
    .isIn(QUOTATION_TRANSPORT_MODES)
    .withMessage(`transport_mode debe ser uno de: ${QUOTATION_TRANSPORT_MODES.join(', ')}`),
  body('modality')
    .optional()
    .isIn(QUOTATION_MODALITIES)
    .withMessage(`modality debe ser uno de: ${QUOTATION_MODALITIES.join(', ')}`),
  body('business_type')
    .optional()
    .isIn(QUOTATION_BUSINESS_TYPES)
    .withMessage(`business_type debe ser uno de: ${QUOTATION_BUSINESS_TYPES.join(', ')}`),
  body('material_class')
    .optional()
    .isIn(QUOTATION_MATERIAL_CLASSES)
    .withMessage(`material_class debe ser uno de: ${QUOTATION_MATERIAL_CLASSES.join(', ')}`),
  body('declared_value')
    .optional({ values: 'falsy', nullable: true })
    .isDecimal()
    .withMessage('declared_value debe ser numérico'),
  body('cif_value')
    .optional({ values: 'falsy', nullable: true })
    .isDecimal()
    .withMessage('cif_value debe ser numérico'),
  body('currency').optional().isString().withMessage('currency debe ser string'),
  body('trm')
    .optional({ values: 'falsy', nullable: true })
    .isDecimal()
    .withMessage('trm debe ser numérico'),
  body('origin_country').optional().isString().withMessage('origin_country debe ser string'),
  body('origin_city').optional({ nullable: true }).isString().withMessage('origin_city debe ser string'),
  body('origin_port').optional({ nullable: true }).isString().withMessage('origin_port debe ser string'),
  body('origin_address').optional({ nullable: true }).isString().withMessage('origin_address debe ser string'),
  body('destination_country').optional().isString().withMessage('destination_country debe ser string'),
  body('destination_city').optional({ nullable: true }).isString().withMessage('destination_city debe ser string'),
  body('destination_port').optional({ nullable: true }).isString().withMessage('destination_port debe ser string'),
  body('destination_address').optional({ nullable: true }).isString().withMessage('destination_address debe ser string'),
  body('incoterm').optional({ nullable: true }).isString().withMessage('incoterm debe ser string'),
  body('commercial_id').optional({ nullable: true }).isString().withMessage('commercial_id debe ser string'),
  body('status')
    .optional()
    .isIn(QUOTATION_STATUSES)
    .withMessage(`status debe ser uno de: ${QUOTATION_STATUSES.join(', ')}`),
  body('closure_status')
    .optional()
    .isIn(QUOTATION_CLOSURE_STATUSES)
    .withMessage(`closure_status debe ser uno de: ${QUOTATION_CLOSURE_STATUSES.join(', ')}`),
  body('next_review_date')
    .optional({ values: 'falsy', nullable: true })
    .isISO8601()
    .withMessage('next_review_date debe ser fecha válida'),
  body('cargo_description').optional({ nullable: true }).isString().withMessage('cargo_description debe ser string'),
  body('notes').optional({ nullable: true }).isString().withMessage('notes debe ser string'),
  body('services').optional().isArray().withMessage('services debe ser un arreglo'),
  body('services.*.service_code')
    .optional()
    .isIn(QUOTATION_SERVICE_CODES)
    .withMessage(`service_code debe ser uno de: ${QUOTATION_SERVICE_CODES.join(', ')}`),
  body('services.*.enabled').optional().isBoolean().withMessage('enabled debe ser boolean'),
]

exports.validateCreate = [
  body('line_key')
    .exists()
    .withMessage('line_key es requerido')
    .bail()
    .isIn(['fastway', 'harvest', 'greenway'])
    .withMessage('line_key debe ser uno de: fastway, harvest, greenway'),
  body('lead_external_id').exists().withMessage('lead_external_id es requerido').bail().isString(),
  body('customer_id').exists().withMessage('customer_id es requerido').bail().isString(),
  body('subject').exists().withMessage('subject es requerido').bail().isString(),
  body('transport_mode')
    .exists()
    .withMessage('transport_mode es requerido')
    .bail()
    .isIn(QUOTATION_TRANSPORT_MODES)
    .withMessage(`transport_mode debe ser uno de: ${QUOTATION_TRANSPORT_MODES.join(', ')}`),
  body('modality')
    .exists()
    .withMessage('modality es requerido')
    .bail()
    .isIn(QUOTATION_MODALITIES)
    .withMessage(`modality debe ser uno de: ${QUOTATION_MODALITIES.join(', ')}`),
  body('business_type')
    .exists()
    .withMessage('business_type es requerido')
    .bail()
    .isIn(QUOTATION_BUSINESS_TYPES)
    .withMessage(`business_type debe ser uno de: ${QUOTATION_BUSINESS_TYPES.join(', ')}`),
  body('origin_country').exists().withMessage('origin_country es requerido').bail().isString(),
  body('destination_country').exists().withMessage('destination_country es requerido').bail().isString(),
  ...commonQuotationRules,
]

exports.validateUpdate = [
  param('id').isInt().withMessage('ID inválido'),
  ...commonQuotationRules,
]

exports.validateIdParam = [param('id').isInt().withMessage('ID inválido')]
