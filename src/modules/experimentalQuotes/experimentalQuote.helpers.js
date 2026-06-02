function toNumber(value) {
  if (value === '' || value == null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function sum(values = []) {
  return values.reduce((acc, value) => acc + Number(value || 0), 0)
}

function roundCurrency(value) {
  return Number(Number(value || 0).toFixed(2))
}

function buildExperimentalQuoteNumber(id) {
  return `EXP-CT-${String(id).padStart(6, '0')}`
}

module.exports = {
  toNumber,
  sum,
  roundCurrency,
  buildExperimentalQuoteNumber,
}
