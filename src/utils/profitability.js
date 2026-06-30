const ShipmentCost = require('../modules/shipmentCosts/shipmentCost.model')
const ShipmentSale = require('../modules/shipmentSales/shipmentSale.model')
const Shipment = require('../modules/shipments/shipment.model')
const { convertAmount } = require('./financialValues')

async function calculateShipmentProfitability(shipmentId, transaction) {
  const [shipment, sales, costs] = await Promise.all([
    Shipment.findByPk(shipmentId, {
      attributes: ['id', 'currency', 'trm'],
      transaction,
    }),
    ShipmentSale.findAll({
      where: { shipment_id: shipmentId },
      attributes: ['currency', 'total'],
      transaction,
    }),
    ShipmentCost.findAll({
      where: { shipment_id: shipmentId },
      attributes: ['currency', 'total', 'is_estimated', 'is_final', 'status'],
      transaction,
    }),
  ])

  const shipmentCurrency = shipment?.currency || 'COP'
  const shipmentRate = shipment?.trm || null

  const convertToShipmentCurrency = item =>
    convertAmount(item?.total, {
      fromCurrency: item?.currency || shipmentCurrency,
      toCurrency: shipmentCurrency,
      rate: shipmentRate,
    })

  const totalSales = sales.reduce(
    (sum, item) => sum + convertToShipmentCurrency(item),
    0
  )
  const totalEstimatedCosts = costs
    .filter(item => item?.is_estimated || item?.status === 'ESTIMADO')
    .reduce((sum, item) => sum + convertToShipmentCurrency(item), 0)
  const totalRealCosts = costs
    .filter(
      item =>
        item?.is_final ||
        ['CONFIRMADO', 'FACTURADO', 'PAGADO'].includes(
          String(item?.status || '').trim().toUpperCase()
        )
    )
    .reduce((sum, item) => sum + convertToShipmentCurrency(item), 0)
  const estimatedProfit = totalSales - totalEstimatedCosts
  const realProfit = totalSales - totalRealCosts
  const estimatedMargin = totalSales ? (estimatedProfit / totalSales) * 100 : 0
  const realMargin = totalSales ? (realProfit / totalSales) * 100 : 0

  return {
    shipment_id: shipmentId,
    total_sales: totalSales,
    total_estimated_costs: totalEstimatedCosts,
    total_real_costs: totalRealCosts,
    estimated_profit: estimatedProfit,
    real_profit: realProfit,
    estimated_margin: Number(estimatedMargin.toFixed(2)),
    real_margin: Number(realMargin.toFixed(2)),
  }
}

async function recalculateShipmentProfitability(shipmentId, transaction) {
  const profitability = await calculateShipmentProfitability(shipmentId, transaction)

  await Shipment.update(
    {
      estimated_profit: profitability.estimated_profit,
      real_profit: profitability.real_profit,
    },
    {
      where: { id: shipmentId },
      transaction,
    }
  )

  return profitability
}

module.exports = {
  calculateShipmentProfitability,
  recalculateShipmentProfitability,
}
