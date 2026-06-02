const { sequelize, DataTypes } = require('../../config/db')
const { SHIPMENT_TRACE_TYPES } = require('../../utils/logisticsEnums')

const QuotationTrace = sequelize.define(
  'QuotationTrace',
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
    trace_type: {
      type: DataTypes.ENUM(...SHIPMENT_TRACE_TYPES),
      allowNull: false,
      defaultValue: 'NOTA',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    event_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    created_by: {
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
    tableName: 'quotation_traces',
    timestamps: false,
  }
)

module.exports = QuotationTrace
