const { sequelize } = require('../../config/db')
const { createAuditLog } = require('../../utils/audit')
const { recalculateShipmentProfitability } = require('../../utils/profitability')
const { buildFlatAmountPayload } = require('../../utils/financialValues')
const Shipment = require('../shipments/shipment.model')
const ShipmentCost = require('./shipmentCost.model')
const ShipmentTrace = require('../shipmentTraces/shipmentTrace.model')

async function createShipmentCost(shipmentId, data, userId) {
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

    const cost = await ShipmentCost.create(
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

    await ShipmentTrace.create(
      {
        shipment_id: shipmentId,
        trace_type: 'NOVEDAD',
        title: cost.is_estimated ? 'Costo base DO' : 'Costo adicional DO',
        note: `${cost.concept} · ${cost.currency} ${cost.total} · ${cost.status}`,
        event_at: new Date(),
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    )

    const profitability = await recalculateShipmentProfitability(shipmentId, transaction)

    await createAuditLog({
      shipment_id: shipmentId,
      entity_type: 'shipment_cost',
      entity_id: cost.id,
      action: 'CREACION_COSTO',
      new_values: {
        ...cost.toJSON(),
        profitability,
      },
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return cost
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function updateShipmentCost(id, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const cost = await ShipmentCost.findByPk(id, { transaction })
    if (!cost) {
      const error = new Error('Costo no encontrado')
      error.status = 404
      throw error
    }

    const before = cost.toJSON()
    const shipment = await Shipment.findByPk(cost.shipment_id, { transaction })
    const normalizedAmounts = buildFlatAmountPayload(
      { ...cost.toJSON(), ...data },
      {
        defaultCurrency: shipment?.currency || cost.currency || 'COP',
      }
    )

    await cost.update(
      {
        ...data,
        ...normalizedAmounts,
        updated_by: userId,
        updated_at: new Date(),
      },
      { transaction }
    )

    await ShipmentTrace.create(
      {
        shipment_id: cost.shipment_id,
        trace_type: 'SEGUIMIENTO',
        title: cost.is_estimated ? 'Ajuste costo base DO' : 'Ajuste costo adicional DO',
        note: `${cost.concept} · ${cost.currency} ${cost.total} · ${cost.status}`,
        event_at: new Date(),
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    )

    const profitability = await recalculateShipmentProfitability(cost.shipment_id, transaction)

    await createAuditLog({
      shipment_id: cost.shipment_id,
      entity_type: 'shipment_cost',
      entity_id: cost.id,
      action: 'ACTUALIZACION_COSTO',
      old_values: before,
      new_values: {
        ...cost.toJSON(),
        profitability,
      },
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return cost
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

module.exports = {
  createShipmentCost,
  updateShipmentCost,
}
