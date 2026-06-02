const { sequelize, DataTypes } = require('../../config/db')
const {
  EXPERIMENTAL_PROVIDER_PRICING_MODES,
  EXPERIMENTAL_QUOTE_STATUSES,
} = require('./experimentalQuote.constants')

const ExperimentalQuote = sequelize.define(
  'ExperimentalQuote',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    quote_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    quotation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cliente: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    source_customer_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tipo_servicio_solicitado: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    modalidad: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    service_variant: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    servicio_interno_aplicado: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    incoterm: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    origen: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    destino: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    puerto_origen: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    puerto_destino: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    aeropuerto_origen: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    aeropuerto_destino: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    mercancia: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mercancia_peligrosa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    numero_piezas: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    volumen: {
      type: DataTypes.DECIMAL(18, 3),
      allowNull: true,
    },
    peso_real: {
      type: DataTypes.DECIMAL(18, 3),
      allowNull: true,
    },
    peso_volumetrico: {
      type: DataTypes.DECIMAL(18, 3),
      allowNull: true,
    },
    peso_cobrable: {
      type: DataTypes.DECIMAL(18, 3),
      allowNull: true,
    },
    valor_comercial: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    numero_guias: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    numero_shippers: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    numero_contenedores: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    container_size: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    moneda: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'USD',
    },
    provider_pricing_mode: {
      type: DataTypes.ENUM(...EXPERIMENTAL_PROVIDER_PRICING_MODES),
      allowNull: false,
      defaultValue: 'NONE',
    },
    provider_quote_reference: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    provider_quote_valid_until: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    total_proveedor: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total_fast_way: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total_cliente: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    estado: {
      type: DataTypes.ENUM(...EXPERIMENTAL_QUOTE_STATUSES),
      allowNull: false,
      defaultValue: 'BORRADOR',
    },
    requiere_validacion_manual: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    motivo_validacion_manual: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    no_incluidos: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    tarifario_snapshot: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    detalle_calculo_json: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    validation_result_json: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    commercial_quote_json: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    internal_table_json: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    math_report_json: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    request_payload_json: {
      type: DataTypes.JSON,
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
    tableName: 'experimental_quotes',
    timestamps: false,
  }
)

module.exports = ExperimentalQuote
