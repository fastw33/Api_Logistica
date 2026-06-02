const test = require('node:test')
const assert = require('node:assert/strict')

const { selectInternalService } = require('../experimentalQuote.selector')
const { validateExperimentalQuotePayload } = require('../experimentalQuote.validation')
const { calculateExperimentalQuote } = require('../experimentalQuote.calculator')

test('bloquea cálculo aéreo si faltan dimensiones', () => {
  const payload = {
    cliente: 'Cliente demo',
    tipo_servicio: 'AEREO',
    modalidad: 'GENERAL',
    incoterm: 'FOB',
    origen: 'Miami',
    destino: 'Bogotá',
    numero_piezas: 2,
    mercancia: 'Carga general',
    mercancia_peligrosa: false,
    peso_real: 50,
    provider_pricing_mode: 'FINAL_TOTAL',
    provider_final_total: 120,
  }

  const selection = selectInternalService(payload)
  const validation = validateExperimentalQuotePayload(payload, selection)

  assert.equal(validation.isValid, false)
  assert.ok(validation.errors.some(item => item.field === 'dimension_items'))
})

test('calcula proveedor + fast way en aéreo general', () => {
  const payload = {
    cliente: 'Cliente demo',
    tipo_servicio: 'AEREO',
    modalidad: 'GENERAL',
    incoterm: 'FOB',
    origen: 'Miami',
    destino: 'Bogotá',
    aeropuerto_origen: 'MIA',
    aeropuerto_destino: 'BOG',
    numero_piezas: 2,
    mercancia: 'Carga general',
    mercancia_peligrosa: false,
    peso_real: 50,
    moneda: 'USD',
    dimension_items: [{ quantity: 2, length: 50, width: 40, height: 30 }],
    provider_pricing_mode: 'FINAL_TOTAL',
    provider_final_total: 120,
  }

  const selection = selectInternalService(payload)
  const validation = validateExperimentalQuotePayload(payload, selection)

  assert.equal(validation.isValid, true)

  const result = calculateExperimentalQuote(payload, selection)

  assert.equal(result.totals.total_proveedor, 120)
  assert.ok(result.totals.total_fast_way > 0)
  assert.equal(
    result.totals.total_cliente,
    result.totals.total_proveedor + result.totals.total_fast_way
  )
})
