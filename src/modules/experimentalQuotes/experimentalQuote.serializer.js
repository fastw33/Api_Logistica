function serializeExperimentalQuote(quote, items = [], traces = []) {
  const providerItems = items.filter(item => item.role === 'PROVIDER')
  const fastWayItems = items.filter(item => item.role === 'FAST_WAY')
  const notIncludedItems = items.filter(item => item.role === 'NOT_INCLUDED')

  return {
    ...quote.toJSON(),
    provider_items: providerItems,
    fast_way_items: fastWayItems,
    not_included_items: notIncludedItems,
    traces,
  }
}

module.exports = {
  serializeExperimentalQuote,
}
