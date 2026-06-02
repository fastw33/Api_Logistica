const { sequelize, DataTypes } = require('../../config/db')
const { QUOTATION_SERVICE_CODES } = require('../../utils/logisticsEnums')

const QuotationProviderQuote = sequelize.define(
  'QuotationProviderQuote',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    quotation_id: {
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
    service_code: {
      type: DataTypes.ENUM(...QUOTATION_SERVICE_CODES),
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'USD',
    },
    quoted_value: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    quoted_trm: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: true,
    },
    validity_date: {
      type: DataTypes.DATEONLY,
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
    tableName: 'quotation_provider_quotes',
    timestamps: false,
  }
)

module.exports = QuotationProviderQuote
