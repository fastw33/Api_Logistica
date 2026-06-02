const { Op } = require('sequelize')
const ShipmentCost = require('../modules/shipmentCosts/shipmentCost.model')
const ShipmentSale = require('../modules/shipmentSales/shipmentSale.model')
const Shipment = require('../modules/shipments/shipment.model')

async function calculateShipmentProfitability(shipmentId, transaction) {
  const [salesTotal, estimatedCostsTotal, finalCostsTotal] = await Promise.all([
    ShipmentSale.sum('total', {
      where: { shipment_id: shipmentId },
      transaction,
    }),
    ShipmentCost.sum('total', {
      where: {
        shipment_id: shipmentId,
        [Op.or]: [{ is_estimated: true }, { status: 'ESTIMADO' }],
      },
      transaction,
    }),
    ShipmentCost.sum('total', {
      where: {
        shipment_id: shipmentId,
        [Op.or]: [
          { is_final: true },
          { status: { [Op.in]: ['CONFIRMADO', 'FACTURADO', 'PAGADO'] } },
        ],
      },
      transaction,
    }),
  ])

  const totalSales = Number(salesTotal || 0)
  const totalEstimatedCosts = Number(estimatedCostsTotal || 0)
  const totalRealCosts = Number(finalCostsTotal || 0)
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
