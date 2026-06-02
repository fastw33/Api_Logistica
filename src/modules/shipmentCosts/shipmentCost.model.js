const { sequelize, DataTypes } = require('../../config/db')
const {
  SHIPMENT_COST_STATUSES,
  SHIPMENT_COST_TYPES,
} = require('../../utils/logisticsEnums')

const ShipmentCost = sequelize.define(
  'ShipmentCost',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shipment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    concept: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cost_type: {
      type: DataTypes.ENUM(...SHIPMENT_COST_TYPES),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'COP',
    },
    quantity: {
      type: DataTypes.DECIMAL(18, 3),
      allowNull: false,
      defaultValue: 1,
    },
    unit_value: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    tax: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    is_estimated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_final: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    vendor_invoice_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...SHIPMENT_COST_STATUSES),
      allowNull: false,
      defaultValue: 'ESTIMADO',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'shipment_costs',
    timestamps: false,
  }
)

module.exports = ShipmentCost
