const { body, param } = require('express-validator')

const commonBodyRules = [
  body('quotation_id').optional({ nullable: true }).isInt().withMessage('quotation_id debe ser entero'),
  body('cliente').optional().isString().withMessage('cliente debe ser string'),
  body('source_customer_id').optional({ nullable: true }).isString().withMessage('source_customer_id debe ser string'),
  body('tipo_servicio').optional().isString().withMessage('tipo_servicio debe ser string'),
  body('modalidad').optional({ nullable: true }).isString().withMessage('modalidad debe ser string'),
  body('service_variant').optional({ nullable: true }).isString().withMessage('service_variant debe ser string'),
  body('incoterm').optional().isString().withMessage('incoterm debe ser string'),
  body('origen').optional().isString().withMessage('origen debe ser string'),
  body('destino').optional().isString().withMessage('destino debe ser string'),
  body('puerto_origen').optional({ nullable: true }).isString().withMessage('puerto_origen debe ser string'),
  body('puerto_destino').optional({ nullable: true }).isString().withMessage('puerto_destino debe ser string'),
  body('aeropuerto_origen').optional({ nullable: true }).isString().withMessage('aeropuerto_origen debe ser string'),
  body('aeropuerto_destino').optional({ nullable: true }).isString().withMessage('aeropuerto_destino debe ser string'),
  body('mercancia').optional().isString().withMessage('mercancia debe ser string'),
  body('mercancia_peligrosa').optional().isBoolean().withMessage('mercancia_peligrosa debe ser boolean'),
  body('numero_piezas').optional().isInt({ min: 1 }).withMessage('numero_piezas debe ser entero positivo'),
  body('volumen').optional({ nullable: true }).isDecimal().withMessage('volumen debe ser numérico'),
  body('peso_real').optional({ nullable: true }).isDecimal().withMessage('peso_real debe ser numérico'),
  body('valor_comercial').optional({ nullable: true }).isDecimal().withMessage('valor_comercial debe ser numérico'),
  body('numero_guias').optional({ nullable: true }).isInt({ min: 0 }).withMessage('numero_guias debe ser entero'),
  body('numero_shippers').optional({ nullable: true }).isInt({ min: 0 }).withMessage('numero_shippers debe ser entero'),
  body('numero_contenedores').optional({ nullable: true }).isInt({ min: 0 }).withMessage('numero_contenedores debe ser entero'),
  body('container_size').optional({ nullable: true }).isString().withMessage('container_size debe ser string'),
  body('moneda').optional().isString().withMessage('moneda debe ser string'),
  body('provider_pricing_mode').optional().isString().withMessage('provider_pricing_mode debe ser string'),
  body('provider_final_total').optional({ nullable: true }).isDecimal().withMessage('provider_final_total debe ser numérico'),
  body('provider_currency').optional({ nullable: true }).isString().withMessage('provider_currency debe ser string'),
  body('provider_quote_reference').optional({ nullable: true }).isString().withMessage('provider_quote_reference debe ser string'),
  body('provider_quote_valid_until').optional({ nullable: true }).isISO8601().withMessage('provider_quote_valid_until debe ser fecha válida'),
  body('observaciones').optional({ nullable: true }).isString().withMessage('observaciones debe ser string'),
  body('extra_not_included').optional().isArray().withMessage('extra_not_included debe ser arreglo'),
  body('extra_not_included.*').optional().isString().withMessage('extra_not_included debe contener strings'),
  body('dimension_items').optional().isArray().withMessage('dimension_items debe ser arreglo'),
  body('provider_charges').optional().isArray().withMessage('provider_charges debe ser arreglo'),
  body('persist').optional().isBoolean().withMessage('persist debe ser boolean'),
]

exports.validateIdParam = [param('id').isInt().withMessage('ID inválido')]

exports.validateCreate = commonBodyRules
exports.validateUpdate = [param('id').isInt().withMessage('ID inválido'), ...commonBodyRules]
exports.validateCalculate = commonBodyRules
