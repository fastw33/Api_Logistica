const { calculateAirWeight } = require('./airWeightCalculation.service')
const { getPricingRule, getTariffSnapshot, getInternalTariffCatalog } = require('./internalTariff.service')
const { roundCurrency, sum, toNumber } = require('./experimentalQuote.helpers')

function buildNotIncludedItems(payload, providerItems = []) {
  const defaults = getInternalTariffCatalog().not_included_defaults || []
  const dynamic = providerItems
    .filter(item => item.included_in_total === false)
    .map(item => item.concept)

  return [...new Set([...(payload.extra_not_included || []), ...defaults, ...dynamic])]
}

function resolveBaseValue(unit, payload, calculationContext = {}, charge) {
  if (unit === 'fijo') return 1
  if (unit === 'kg_vol') return calculationContext.peso_cobrable
  if (unit === 'contenedor') return toNumber(payload.numero_contenedores)
  if (unit === 'guia') return toNumber(payload.numero_guias)
  if (unit === 'shipper') return toNumber(payload.numero_shippers)
  if (unit === 'ton_mt3') {
    const volume = toNumber(payload.volumen)
    const weightReal = toNumber(payload.peso_real)
    if (volume == null || weightReal == null) return null
    return roundCurrency(Math.max(volume, weightReal / 1000))
  }

  if (charge?.container_size) {
    const containerSize = String(payload.container_size || '').trim()
    if (containerSize !== String(charge.container_size)) return 0
  }

  return null
}

function buildProviderItems(payload) {
  const mode = payload.provider_pricing_mode || 'NONE'
  const currency = payload.provider_currency || payload.moneda || 'USD'

  if (mode === 'FINAL_TOTAL') {
    const total = roundCurrency(toNumber(payload.provider_final_total) || 0)
    return [
      {
        role: 'PROVIDER',
        concept: 'Costo proveedor liquidado',
        charge_type: 'fijo',
        base_type: 'fijo',
        base_value: 1,
        quantity: 1,
        rate_value: total,
        minimum_value: total,
        total_value: total,
        included_in_total: true,
        confirmed: true,
        currency,
        operation_text: `Valor final proveedor = ${total}`,
        notes: payload.provider_quote_reference || null,
        metadata_json: {
          provider_pricing_mode: mode,
          provider_quote_reference: payload.provider_quote_reference || null,
        },
      },
    ]
  }

  if (mode === 'ITEMIZED') {
    return (payload.provider_charges || []).map(item => {
      const quantity = toNumber(item.quantity) || 1
      const unitValue = toNumber(item.unit_value)
      const fallbackTotal = toNumber(item.total)
      const total = roundCurrency(
        fallbackTotal != null ? fallbackTotal : quantity * (unitValue || 0)
      )
      const confirmed = item.is_confirmed !== false && item.charge_type !== 'estimado' && item.charge_type !== 'puntual'

      return {
        role: confirmed ? 'PROVIDER' : 'NOT_INCLUDED',
        concept: item.concept,
        charge_type: item.charge_type || 'variable',
        base_type: item.base_type || 'fijo',
        base_value: quantity,
        quantity,
        rate_value: unitValue != null ? unitValue : total,
        minimum_value: null,
        total_value: total,
        included_in_total: confirmed,
        confirmed,
        currency: item.currency || currency,
        operation_text:
          fallbackTotal != null
            ? `${item.concept}: valor final proveedor ${fallbackTotal}`
            : `${item.concept}: ${quantity} x ${unitValue || 0}`,
        notes: item.notes || null,
        metadata_json: item,
      }
    })
  }

  return []
}

function buildFastWayItems(payload, serviceCode, calculationContext = {}) {
  const rule = getPricingRule(serviceCode)
  if (!rule) return []

  return (rule.charges || []).map(charge => {
    const baseValue = resolveBaseValue(charge.unit, payload, calculationContext, charge)
    const rawValue =
      charge.unit === 'fijo'
        ? charge.tariff
        : roundCurrency((baseValue || 0) * Number(charge.tariff || 0))
    const appliedValue =
      charge.minimum != null
        ? Math.max(rawValue, Number(charge.minimum))
        : rawValue

    return {
      role: 'FAST_WAY',
      concept: charge.concept,
      charge_type: charge.charge_type,
      base_type: charge.unit,
      base_value: charge.unit === 'fijo' ? 1 : baseValue,
      quantity: charge.unit === 'fijo' ? 1 : baseValue,
      rate_value: Number(charge.tariff || 0),
      minimum_value: charge.minimum != null ? Number(charge.minimum) : null,
      total_value: roundCurrency(appliedValue),
      included_in_total: true,
      confirmed: true,
      currency: payload.moneda || 'USD',
      operation_text:
        charge.unit === 'fijo'
          ? `${charge.concept}: tarifa fija ${charge.tariff}`
          : `${charge.concept}: ${baseValue} x ${charge.tariff}${charge.minimum != null ? `, mínima ${charge.minimum}` : ''}`,
      notes: charge.base_key,
      metadata_json: charge,
    }
  })
}

function calculateExperimentalQuote(payload, selectionResult) {
  const serviceCode = selectionResult.serviceCode
  const rule = getPricingRule(serviceCode)
  let airWeight = null

  if (String(payload.tipo_servicio || '').toUpperCase() === 'AEREO') {
    airWeight = calculateAirWeight(payload)
  }

  const calculationContext = {
    peso_cobrable: airWeight?.peso_cobrable || toNumber(payload.peso_real),
  }

  const providerItems = buildProviderItems(payload)
  const fastWayItems = buildFastWayItems(payload, serviceCode, calculationContext)
  const noIncluidos = buildNotIncludedItems(payload, providerItems)
  const notIncludedItems = providerItems
    .filter(item => item.included_in_total === false)
    .map(item => ({
      ...item,
      role: 'NOT_INCLUDED',
    }))

  const totalProveedor = roundCurrency(
    sum(providerItems.filter(item => item.included_in_total).map(item => item.total_value))
  )
  const totalFastWay = roundCurrency(sum(fastWayItems.map(item => item.total_value)))
  const totalCliente = roundCurrency(totalProveedor + totalFastWay)

  return {
    serviceCode,
    serviceRule: rule,
    airWeight,
    providerItems,
    fastWayItems,
    notIncludedItems,
    noIncluidos,
    totals: {
      total_proveedor: totalProveedor,
      total_fast_way: totalFastWay,
      total_cliente: totalCliente,
    },
    tariffSnapshot: getTariffSnapshot(serviceCode),
  }
}

module.exports = {
  calculateExperimentalQuote,
}
