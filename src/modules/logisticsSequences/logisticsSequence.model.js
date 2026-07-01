const { sequelize, DataTypes } = require('../../config/db')

const LogisticsSequence = sequelize.define(
  'LogisticsSequence',
  {
    sequence_key: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
    },
    current_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'logistics_sequences',
    timestamps: false,
  }
)

module.exports = LogisticsSequence
