const { getPricingRule } = require('./internalTariff.service')
const { EXPERIMENTAL_PROVIDER_PRICING_MODES } = require('./experimentalQuote.constants')

function addError(list, field, message) {
  list.push({ field, message })
}

function isEmpty(value) {
  return value === null || value === undefined || value === ''
}

function validateProviderData(payload, rule, errors) {
  if (!rule?.requires_provider_pricing) return

  const mode = payload.provider_pricing_mode || 'NONE'
  if (!EXPERIMENTAL_PROVIDER_PRICING_MODES.includes(mode)) {
    addError(
      errors,
      'provider_pricing_mode',
      `provider_pricing_mode debe ser uno de: ${EXPERIMENTAL_PROVIDER_PRICING_MODES.join(', ')}`
    )
    return
  }

  if (mode === 'FINAL_TOTAL' && isEmpty(payload.provider_final_total)) {
    addError(
      errors,
      'provider_final_total',
      'Falta el valor final liquidado del proveedor'
    )
  }

  if (mode === 'ITEMIZED') {
    if (!Array.isArray(payload.provider_charges) || !payload.provider_charges.length) {
      addError(
        errors,
        'provider_charges',
        'Faltan cargos itemizados del proveedor'
      )
      return
    }

    payload.provider_charges.forEach((item, index) => {
      if (isEmpty(item.concept)) {
        addError(errors, `provider_charges[${index}].concept`, 'Cada cargo proveedor debe tener concepto')
      }
      if (isEmpty(item.total) && (isEmpty(item.quantity) || isEmpty(item.unit_value))) {
        addError(
          errors,
          `provider_charges[${index}]`,
          'Cada cargo proveedor debe tener total o quantity + unit_value'
        )
      }
    })
  }

  if (mode === 'NONE') {
    addError(
      errors,
      'provider_pricing_mode',
      'Para este servicio se requiere cotización del proveedor, tarifas por operación, bases de cobro, condiciones, recargos y vigencias'
    )
  }
}

function validateExperimentalQuotePayload(payload, selectionResult = {}) {
  const errors = []

  ;[
    'cliente',
    'tipo_servicio',
    'incoterm',
    'origen',
    'destino',
    'numero_piezas',
    'mercancia',
    'mercancia_peligrosa',
  ].forEach(field => {
    if (isEmpty(payload[field])) {
      addError(errors, field, `${field} es obligatorio`)
    }
  })

  const tipo = String(payload.tipo_servicio || '').toUpperCase()
  const modalidad = String(payload.modalidad || '').toUpperCase()

  if (tipo === 'MARITIMO') {
    ;['volumen', 'peso_real'].forEach(field => {
      if (isEmpty(payload[field])) addError(errors, field, `${field} es obligatorio para marítimo`)
    })

    if (modalidad === 'FCL' && isEmpty(payload.container_size)) {
      addError(errors, 'container_size', 'container_size es obligatorio para marítimo FCL')
    }
  }

  if (tipo === 'AEREO') {
    if (isEmpty(payload.peso_real)) {
      addError(errors, 'peso_real', 'peso_real es obligatorio para aéreo')
    }

    if (!Array.isArray(payload.dimension_items) || !payload.dimension_items.length) {
      addError(errors, 'dimension_items', 'Las dimensiones son obligatorias para aéreo')
    }
  }

  if (tipo === 'TERRESTRE' && modalidad === 'FCL' && isEmpty(payload.numero_contenedores)) {
    addError(
      errors,
      'numero_contenedores',
      'numero_contenedores es obligatorio para terrestre FCL'
    )
  }

  if (selectionResult.validationErrors?.length) {
    selectionResult.validationErrors.forEach(field => {
      addError(errors, field, `${field} es obligatorio para clasificar el servicio`)
    })
  }

  if (selectionResult.serviceCode) {
    const rule = getPricingRule(selectionResult.serviceCode)
    validateProviderData(payload, rule, errors)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

module.exports = {
  validateExperimentalQuotePayload,
}
