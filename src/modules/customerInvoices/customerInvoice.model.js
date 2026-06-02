const { sequelize, DataTypes } = require('../../config/db')
const { INVOICE_PAYMENT_STATUSES } = require('../../utils/logisticsEnums')

const CustomerInvoice = sequelize.define(
  'CustomerInvoice',
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
    customer_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    invoice_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'COP',
    },
    subtotal: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    taxes: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    paid_amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    balance: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    payment_status: {
      type: DataTypes.ENUM(...INVOICE_PAYMENT_STATUSES),
      allowNull: false,
      defaultValue: 'PENDIENTE',
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    invoice_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    pdf_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    xml_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    support_file_url: {
      type: DataTypes.STRING(500),
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
    tableName: 'customer_invoices',
    timestamps: false,
  }
)

module.exports = CustomerInvoice
