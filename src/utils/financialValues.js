function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function normalizeCurrency(value, fallback = 'COP') {
  const normalized = String(value || fallback)
    .trim()
    .toUpperCase()

  return normalized || fallback
}

function resolvePrimaryTotal(data = {}) {
  return (
    toNumber(data.total) ??
    toNumber(data.subtotal) ??
    toNumber(data.unit_value) ??
    toNumber(data.quoted_value) ??
    0
  )
}

function buildFlatAmountPayload(data = {}, options = {}) {
  const total = resolvePrimaryTotal(data)

  return {
    currency: normalizeCurrency(data.currency, options.defaultCurrency || 'COP'),
    quantity: toNumber(data.quantity) || 1,
    unit_value: total,
    subtotal: total,
    tax: 0,
    total,
  }
}

function buildFlatInvoicePayload(data = {}, options = {}) {
  const total = resolvePrimaryTotal(data)
  const paidAmount = toNumber(data.paid_amount)
  const balance = toNumber(data.balance)

  return {
    currency: normalizeCurrency(data.currency, options.defaultCurrency || 'COP'),
    subtotal: total,
    taxes: 0,
    total,
    paid_amount: paidAmount != null ? paidAmount : 0,
    balance:
      balance != null
        ? balance
        : Math.max(total - (paidAmount != null ? paidAmount : 0), 0),
  }
}

function resolveExchangeRate(rate) {
  const parsed = toNumber(rate)
  return parsed && parsed > 0 ? parsed : null
}

function convertAmount(amount, { fromCurrency, toCurrency, rate } = {}) {
  const numericAmount = toNumber(amount) || 0
  const from = normalizeCurrency(fromCurrency, 'COP')
  const to = normalizeCurrency(toCurrency, from)

  if (from === to) return numericAmount

  const exchangeRate = resolveExchangeRate(rate)
  if (!exchangeRate) return numericAmount

  if (from === 'COP' && to !== 'COP') {
    return numericAmount / exchangeRate
  }

  if (from !== 'COP' && to === 'COP') {
    return numericAmount * exchangeRate
  }

  return numericAmount
}

module.exports = {
  toNumber,
  normalizeCurrency,
  buildFlatAmountPayload,
  buildFlatInvoicePayload,
  convertAmount,
}
