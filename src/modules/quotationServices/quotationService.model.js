const { sequelize, DataTypes } = require('../../config/db')
const { QUOTATION_SERVICE_CODES } = require('../../utils/logisticsEnums')

const QuotationService = sequelize.define(
  'QuotationService',
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
    service_code: {
      type: DataTypes.ENUM(...QUOTATION_SERVICE_CODES),
      allowNull: false,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'quotation_services',
    timestamps: false,
  }
)

module.exports = QuotationService
