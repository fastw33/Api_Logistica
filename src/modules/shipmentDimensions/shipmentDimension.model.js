const { sequelize, DataTypes } = require('../../config/db')

const ShipmentDimension = sequelize.define(
  'ShipmentDimension',
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
    quantity: {
      type: DataTypes.DECIMAL(18, 3),
      allowNull: false,
    },
    package_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gross_weight: {
      type: DataTypes.DECIMAL(18, 3),
      allowNull: true,
    },
    volumetric_weight: {
      type: DataTypes.DECIMAL(18, 3),
      allowNull: true,
    },
    volume_cbm: {
      type: DataTypes.DECIMAL(18, 3),
      allowNull: true,
    },
    length: {
      type: DataTypes.DECIMAL(18, 3),
      allowNull: true,
    },
    width: {
      type: DataTypes.DECIMAL(18, 3),
      allowNull: true,
    },
    height: {
      type: DataTypes.DECIMAL(18, 3),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
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
    tableName: 'shipment_dimensions',
    timestamps: false,
  }
)

module.exports = ShipmentDimension
