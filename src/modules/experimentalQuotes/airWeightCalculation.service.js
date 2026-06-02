const { BusinessValidationError } = require('./experimentalQuote.errors')
const { roundCurrency, toNumber } = require('./experimentalQuote.helpers')

function calculateAirWeight(payload) {
  const dimensions = Array.isArray(payload.dimension_items)
    ? payload.dimension_items
    : []

  if (!dimensions.length) {
    throw new BusinessValidationError(
      'No se puede calcular el peso volumétrico sin dimensiones',
      [{ field: 'dimension_items', message: 'Debes enviar dimensiones para operaciones aéreas' }]
    )
  }

  const details = dimensions.map((item, index) => {
    const quantity = toNumber(item.quantity)
    const length = toNumber(item.length)
    const width = toNumber(item.width)
    const height = toNumber(item.height)

    if (!quantity || !length || !width || !height) {
      throw new BusinessValidationError(
        'Las dimensiones aéreas están incompletas',
        [
          {
            field: `dimension_items[${index}]`,
            message: 'Cada dimensión debe incluir quantity, length, width y height',
          },
        ]
      )
    }

    const pieceVolumetricWeight = (length * width * height) / 6000
    const totalVolumetricWeight = pieceVolumetricWeight * quantity

    return {
      quantity,
      length,
      width,
      height,
      piece_volumetric_weight: roundCurrency(pieceVolumetricWeight),
      total_volumetric_weight: roundCurrency(totalVolumetricWeight),
      operation: `(${length} x ${width} x ${height}) / 6000 x ${quantity}`,
    }
  })

  const pesoVolumetrico = roundCurrency(
    details.reduce((acc, item) => acc + item.total_volumetric_weight, 0)
  )
  const pesoReal = roundCurrency(toNumber(payload.peso_real) || 0)
  const pesoCobrable = roundCurrency(Math.max(pesoReal, pesoVolumetrico))

  return {
    peso_real: pesoReal,
    peso_volumetrico: pesoVolumetrico,
    peso_cobrable: pesoCobrable,
    details,
  }
}

module.exports = {
  calculateAirWeight,
}
