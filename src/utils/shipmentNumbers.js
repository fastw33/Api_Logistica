const LogisticsSequence = require('../modules/logisticsSequences/logisticsSequence.model')

function formatFileNumber(value) {
  return `FILE-${String(value).padStart(6, '0')}`
}

async function reserveSequenceValue(sequenceKey, transaction) {
  const normalizedKey = String(sequenceKey || '').trim().toUpperCase()

  const sequence = await LogisticsSequence.findOne({
    where: { sequence_key: normalizedKey },
    transaction,
    lock: transaction ? transaction.LOCK.UPDATE : undefined,
  })

  if (!sequence) {
    const error = new Error(`No existe la secuencia logística ${normalizedKey}`)
    error.status = 500
    throw error
  }

  const currentValue = Number(sequence.current_value)

  if (!Number.isInteger(currentValue) || currentValue < 0) {
    const error = new Error(`La secuencia logística ${normalizedKey} tiene un valor inválido`)
    error.status = 500
    throw error
  }

  const nextValue = currentValue + 1

  await sequence.update(
    {
      current_value: nextValue,
    },
    { transaction }
  )

  return nextValue
}

async function generateQuotationNumber(transaction) {
  const nextValue = await reserveSequenceValue('CT', transaction)
  return `CT${nextValue}`
}

async function generateShipmentNumbers(transaction) {
  const nextValue = await reserveSequenceValue('FW', transaction)

  return {
    do_number: `FW${nextValue}`,
    file_number: formatFileNumber(nextValue),
  }
}

module.exports = {
  generateQuotationNumber,
  generateShipmentNumbers,
}
