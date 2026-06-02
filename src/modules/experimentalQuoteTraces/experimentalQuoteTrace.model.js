const { sequelize, DataTypes } = require('../../config/db')

const ExperimentalQuoteTrace = sequelize.define(
  'ExperimentalQuoteTrace',
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
    event_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    detail_json: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'experimental_quote_traces',
    timestamps: false,
  }
)

module.exports = ExperimentalQuoteTrace
