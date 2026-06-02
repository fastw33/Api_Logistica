const { sequelize, DataTypes } = require('../../config/db')

const QuotationSale = sequelize.define(
  'QuotationSale',
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
    customer_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    concept: {
      type: DataTypes.STRING(255),
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
    tableName: 'quotation_sales',
    timestamps: false,
  }
)

module.exports = QuotationSale
