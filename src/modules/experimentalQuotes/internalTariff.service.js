const tariffConfig = require('./fastwayInternalTariff.json')

function getInternalTariffCatalog() {
  return tariffConfig
}

function getPricingRule(serviceCode) {
  return tariffConfig.services?.[serviceCode] || null
}

function getTariffSnapshot(serviceCode) {
  const rule = getPricingRule(serviceCode)
  if (!rule) return null

  return {
    currency: tariffConfig.currency,
    validity_months: tariffConfig.validity_months,
    version: tariffConfig.version,
    service: rule,
  }
}

module.exports = {
  getInternalTariffCatalog,
  getPricingRule,
  getTariffSnapshot,
}
