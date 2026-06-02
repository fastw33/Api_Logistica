const { sequelize, DataTypes } = require('../../config/db')
const {
  SHIPMENT_TASK_PRIORITIES,
  SHIPMENT_TASK_STATUSES,
} = require('../../utils/logisticsEnums')

const ShipmentTask = sequelize.define(
  'ShipmentTask',
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    assigned_to: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...SHIPMENT_TASK_STATUSES),
      allowNull: false,
      defaultValue: 'PENDIENTE',
    },
    priority: {
      type: DataTypes.ENUM(...SHIPMENT_TASK_PRIORITIES),
      allowNull: false,
      defaultValue: 'MEDIA',
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
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
    tableName: 'shipment_tasks',
    timestamps: false,
  }
)

module.exports = ShipmentTask
