function formatMoney(amount, currency = 'USD') {
  return `${currency} ${Number(amount || 0).toFixed(2)}`
}

function formatCommercialQuote(quote) {
  const providerLines = (quote.provider_items || [])
    .filter(item => item.included_in_total)
    .map(item => `- ${item.concept}: ${formatMoney(item.total_value, item.currency)}`)

  const fastWayLines = (quote.fast_way_items || [])
    .map(item => `- ${item.concept}: ${formatMoney(item.total_value, item.currency)}`)

  const notIncludedLines = (quote.no_incluidos || []).map(item => `- ${item}`)
  const airSection = quote.air_weight_calculation
    ? [
        `Peso real: ${quote.air_weight_calculation.peso_real} kg`,
        `Peso volumétrico: ${quote.air_weight_calculation.peso_volumetrico} kg`,
        `Peso cobrable: ${quote.air_weight_calculation.peso_cobrable} kg`,
      ]
    : []

  const text = [
    `COTIZACIÓN - ${quote.tipo_servicio_solicitado}`,
    '',
    `Origen: ${quote.origen}`,
    `Puerto/Aeropuerto de cargue: ${quote.puerto_origen || quote.aeropuerto_origen || 'N/A'}`,
    `Destino: ${quote.destino}`,
    `Puerto/Aeropuerto de descarga: ${quote.puerto_destino || quote.aeropuerto_destino || 'N/A'}`,
    `Modalidad: ${quote.modalidad || 'N/A'}`,
    `Incoterm: ${quote.incoterm}`,
    `Mercancía: ${quote.mercancia}`,
    `Número de piezas: ${quote.numero_piezas}`,
    quote.volumen != null ? `Volumen: ${quote.volumen}` : null,
    `Peso estimado: ${quote.peso_real || 'N/A'}`,
    quote.valor_comercial != null ? `Valor de la mercancía: ${quote.valor_comercial}` : null,
    `Mercancía peligrosa: ${quote.mercancia_peligrosa ? 'Sí' : 'No'}`,
    ...airSection,
    '',
    'VALOR DEL SERVICIO',
    '',
    'Cargos proveedor',
    ...(providerLines.length ? providerLines : ['- Pendiente por validación']),
    '',
    'Cargos Fast Way',
    ...(fastWayLines.length ? fastWayLines : ['- Sin cargos internos']),
    '',
    `TOTAL COTIZACIÓN: ${formatMoney(quote.total_cliente, quote.moneda)}`,
    '',
    'NO INCLUIDO',
    ...(notIncludedLines.length ? notIncludedLines : ['- Sin observaciones']),
    '',
    'RESUMEN',
    `- Total proveedor: ${formatMoney(quote.total_proveedor, quote.moneda)}`,
    `- Total Fast Way: ${formatMoney(quote.total_fast_way, quote.moneda)}`,
    `- TOTAL COTIZACIÓN: ${formatMoney(quote.total_cliente, quote.moneda)}`,
    '',
    'Quedamos atentos a sus comentarios.',
    'Cordialmente,',
    'FAST WAY LOGISTICS S.A.S.',
  ]
    .filter(Boolean)
    .join('\n')

  return {
    text,
    sections: {
      provider: providerLines,
      fast_way: fastWayLines,
      not_included: quote.no_incluidos || [],
    },
  }
}

function formatInternalTable(quote) {
  const rows = [...(quote.provider_items || []), ...(quote.fast_way_items || [])].map(item => ({
    item: item.concept,
    base_proveedor: item.role === 'PROVIDER' ? Number(item.total_value || 0) : 0,
    cargo_fast_way: item.role === 'FAST_WAY' ? Number(item.total_value || 0) : 0,
    genero_rentabilidad: item.role === 'FAST_WAY',
    valor_final: Number(item.total_value || 0),
  }))

  return {
    rows,
    totals: {
      total_base_proveedor: Number(quote.total_proveedor || 0),
      total_fast_way: Number(quote.total_fast_way || 0),
      total_cliente: Number(quote.total_cliente || 0),
    },
  }
}

function formatMathReport(quote) {
  const provider = (quote.provider_items || []).map(item => ({
    concepto: item.concept,
    base_operativa: item.base_value,
    tarifa_aplicada: item.rate_value,
    minima: item.minimum_value,
    operacion: item.operation_text,
    resultado: item.total_value,
  }))

  const fastWay = (quote.fast_way_items || []).map(item => ({
    concepto: item.concept,
    base_operativa: item.base_value,
    tarifa_aplicada: item.rate_value,
    minima: item.minimum_value,
    operacion: item.operation_text,
    resultado: item.total_value,
  }))

  return {
    provider,
    fast_way: fastWay,
    air_weight_calculation: quote.air_weight_calculation || null,
  }
}

module.exports = {
  formatCommercialQuote,
  formatInternalTable,
  formatMathReport,
}
