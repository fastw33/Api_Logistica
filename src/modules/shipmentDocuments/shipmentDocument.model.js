const { sequelize, DataTypes } = require('../../config/db')
const { SHIPMENT_DOCUMENT_TYPES } = require('../../utils/logisticsEnums')

const ShipmentDocument = sequelize.define(
  'ShipmentDocument',
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
    quotation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    document_type: {
      type: DataTypes.ENUM(...SHIPMENT_DOCUMENT_TYPES),
      allowNull: false,
    },
    document_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    package_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    file_size: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    mime_type: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    uploaded_by: {
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
    tableName: 'shipment_documents',
    timestamps: false,
  }
)

module.exports = ShipmentDocument
