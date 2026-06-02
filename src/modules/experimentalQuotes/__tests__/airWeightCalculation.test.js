const test = require('node:test')
const assert = require('node:assert/strict')

const { calculateAirWeight } = require('../airWeightCalculation.service')

test('calcula peso volumétrico y cobrable para aéreo', () => {
  const result = calculateAirWeight({
    peso_real: 180,
    dimension_items: [
      { quantity: 2, length: 120, width: 80, height: 75 },
      { quantity: 2, length: 100, width: 70, height: 60 },
    ],
  })

  assert.equal(result.peso_real, 180)
  assert.equal(result.peso_cobrable, result.peso_volumetrico)
  assert.ok(result.peso_volumetrico > 180)
})
