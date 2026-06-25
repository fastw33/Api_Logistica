const { sequelize, DataTypes } = require('../../config/db')
const {
  QUOTATION_BUSINESS_TYPES,
  QUOTATION_CLOSURE_STATUSES,
  QUOTATION_MATERIAL_CLASSES,
  QUOTATION_MODALITIES,
  QUOTATION_STATUSES,
  QUOTATION_TRANSPORT_MODES,
} = require('../../utils/logisticsEnums')

const Quotation = sequelize.define(
  'Quotation',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    line_key: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'fastway',
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
    incoterm: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    commercial_id: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...QUOTATION_STATUSES),
      allowNull: false,
      defaultValue: 'BORRADOR',
    },
    closure_status: {
      type: DataTypes.ENUM(...QUOTATION_CLOSURE_STATUSES),
      allowNull: false,
      defaultValue: 'ABIERTA',
    },
    next_review_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cargo_description: {
      type: DataTypes.TEXT,
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
    tableName: 'quotations',
    timestamps: false,
  }
)

module.exports = Quotation
