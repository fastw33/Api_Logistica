const test = require('node:test')
const assert = require('node:assert/strict')

const { selectInternalService } = require('../experimentalQuote.selector')

test('selecciona marítimo LCL 0.2 correctamente', () => {
  const result = selectInternalService({
    tipo_servicio: 'MARITIMO',
    modalidad: 'LCL',
    volumen: 0.2,
  })

  assert.equal(result.serviceCode, 'maritimo_lcl_0_2_metros')
  assert.equal(result.requiresManualValidation, false)
})

test('marca validación manual cuando LCL supera 8 m3', () => {
  const result = selectInternalService({
    tipo_servicio: 'MARITIMO',
    modalidad: 'LCL',
    volumen: 9,
  })

  assert.equal(result.requiresManualValidation, true)
  assert.match(result.reason, /supera el rango interno/i)
})

test('selecciona aéreo triangulación', () => {
  const result = selectInternalService({
    tipo_servicio: 'AEREO',
    service_variant: 'TRIANGULACION',
  })

  assert.equal(result.serviceCode, 'aereo_triangulacion')
})
