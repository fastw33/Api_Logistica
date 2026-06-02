const { sequelize, DataTypes } = require('../../config/db')
const {
  QUOTATION_BUSINESS_TYPES,
  QUOTATION_MATERIAL_CLASSES,
  QUOTATION_MODALITIES,
  QUOTATION_TRANSPORT_MODES,
  SHIPMENT_CLOSURE_STATUSES,
  SHIPMENT_FINANCIAL_STATUSES,
  SHIPMENT_OPERATIONAL_STATUSES,
} = require('../../utils/logisticsEnums')

const Shipment = sequelize.define(
  'Shipment',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    quotation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    lead_external_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    project_external_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    project_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    do_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    file_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    transport_mode: {
      type: DataTypes.ENUM(...QUOTATION_TRANSPORT_MODES),
      allowNull: false,
    },
    modality: {
      type: DataTypes.ENUM(...QUOTATION_MODALITIES),
      allowNull: false,
    },
    business_type: {
      type: DataTypes.ENUM(...QUOTATION_BUSINESS_TYPES),
      allowNull: false,
    },
    material_class: {
      type: DataTypes.ENUM(...QUOTATION_MATERIAL_CLASSES),
      allowNull: false,
      defaultValue: 'NO_PELIGROSO',
    },
    operational_status: {
      type: DataTypes.ENUM(...SHIPMENT_OPERATIONAL_STATUSES),
      allowNull: false,
      defaultValue: 'CREADA',
    },
    financial_status: {
      type: DataTypes.ENUM(...SHIPMENT_FINANCIAL_STATUSES),
      allowNull: false,
      defaultValue: 'PENDIENTE_FACTURACION',
    },
    closure_status: {
      type: DataTypes.ENUM(...SHIPMENT_CLOSURE_STATUSES),
      allowNull: false,
      defaultValue: 'ABIERTO',
    },
    incoterm: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    origin_country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    origin_city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    origin_port: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    origin_address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    destination_country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    destination_city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    destination_port: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    destination_address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    declared_value: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    cif_value: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'COP',
    },
    trm: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: true,
    },
    euro_usd_factor: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: true,
    },
    estimated_profit: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    real_profit: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    customer_invoiced: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    customer_paid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    vendor_invoiced: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    vendor_paid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    cargo_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    etd: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    eta: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    release_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    transit_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    commercial_id: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    operator_id: {
      type: DataTypes.STRING(250),
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
    tableName: 'shipments',
    timestamps: false,
  }
)

module.exports = Shipment
