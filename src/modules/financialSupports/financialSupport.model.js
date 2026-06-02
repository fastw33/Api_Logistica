const { sequelize, DataTypes } = require('../../config/db')
const { FINANCIAL_SUPPORT_TYPES } = require('../../utils/logisticsEnums')

const FinancialSupport = sequelize.define(
  'FinancialSupport',
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
    support_type: {
      type: DataTypes.ENUM(...FINANCIAL_SUPPORT_TYPES),
      allowNull: false,
    },
    reference_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
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
    tableName: 'financial_supports',
    timestamps: false,
  }
)

module.exports = FinancialSupport
