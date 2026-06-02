const { sequelize, DataTypes } = require('../../config/db')
const { SHIPMENT_PROVIDER_SERVICE_CODES } = require('../../utils/logisticsEnums')

const ShipmentProvider = sequelize.define(
  'ShipmentProvider',
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
    provider_id: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    provider_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    provider_type: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    service_code: {
      type: DataTypes.ENUM(...SHIPMENT_PROVIDER_SERVICE_CODES),
      allowNull: true,
    },
    contact_name: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    contact_email: {
      type: DataTypes.STRING(150),
      allowNull: true,
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
    tableName: 'shipment_providers',
    timestamps: false,
  }
)

module.exports = ShipmentProvider
