const { sequelize, DataTypes } = require('../../config/db')
const { EXPERIMENTAL_ITEM_ROLES } = require('../experimentalQuotes/experimentalQuote.constants')

const ExperimentalQuoteItem = sequelize.define(
  'ExperimentalQuoteItem',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    experimental_quote_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...EXPERIMENTAL_ITEM_ROLES),
      allowNull: false,
    },
    concept: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    charge_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    base_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    base_value: {
      type: DataTypes.DECIMAL(18, 3),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.DECIMAL(18, 3),
      allowNull: true,
    },
    rate_value: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: true,
    },
    minimum_value: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: true,
    },
    total_value: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    included_in_total: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    confirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'USD',
    },
    operation_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata_json: {
      type: DataTypes.JSON,
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
    tableName: 'experimental_quote_items',
    timestamps: false,
  }
)

module.exports = ExperimentalQuoteItem
