const { sequelize } = require('../../config/db')
const { createAuditLog } = require('../../utils/audit')
const { recalculateShipmentProfitability } = require('../../utils/profitability')
const { buildFlatAmountPayload } = require('../../utils/financialValues')
const Shipment = require('../shipments/shipment.model')
const ShipmentSale = require('./shipmentSale.model')

async function createShipmentSale(shipmentId, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const shipment = await Shipment.findByPk(shipmentId, { transaction })
    if (!shipment) {
      const error = new Error('Shipment no encontrado')
      error.status = 404
      throw error
    }

    const normalizedAmounts = buildFlatAmountPayload(data, {
      defaultCurrency: shipment.currency || 'COP',
    })

    const sale = await ShipmentSale.create(
      {
        ...data,
        ...normalizedAmounts,
        shipment_id: shipmentId,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    )

    const profitability = await recalculateShipmentProfitability(shipmentId, transaction)

    await createAuditLog({
      shipment_id: shipmentId,
      entity_type: 'shipment_sale',
      entity_id: sale.id,
      action: 'CREACION_VENTA',
      new_values: {
        ...sale.toJSON(),
        profitability,
      },
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return sale
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function updateShipmentSale(id, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const sale = await ShipmentSale.findByPk(id, { transaction })
    if (!sale) {
      const error = new Error('Venta no encontrada')
      error.status = 404
      throw error
    }

    const before = sale.toJSON()
    const shipment = await Shipment.findByPk(sale.shipment_id, { transaction })
    const normalizedAmounts = buildFlatAmountPayload(
      { ...sale.toJSON(), ...data },
      {
        defaultCurrency: shipment?.currency || sale.currency || 'COP',
      }
    )

    await sale.update(
      {
        ...data,
        ...normalizedAmounts,
        updated_by: userId,
        updated_at: new Date(),
      },
      { transaction }
    )

    const profitability = await recalculateShipmentProfitability(sale.shipment_id, transaction)

    await createAuditLog({
      shipment_id: sale.shipment_id,
      entity_type: 'shipment_sale',
      entity_id: sale.id,
      action: 'ACTUALIZACION_VENTA',
      old_values: before,
      new_values: {
        ...sale.toJSON(),
        profitability,
      },
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return sale
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

module.exports = {
  createShipmentSale,
  updateShipmentSale,
}
