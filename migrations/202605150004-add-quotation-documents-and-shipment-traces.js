'use strict'

const QUOTATION_DOCUMENT_TYPES = [
  'REQUERIMIENTO',
  'SOPORTE',
  'FICHA_TECNICA',
  'FACTURA_COMERCIAL',
  'PACKING_LIST',
  'BL',
  'AWB',
  'SEGURO',
  'MANDATO',
  'CERTIFICADO',
  'COTIZACION_PROVEEDOR',
  'OTRO',
]

const SHIPMENT_TRACE_TYPES = [
  'NOTA',
  'SEGUIMIENTO',
  'HITO',
  'NOVEDAD',
  'CAMBIO_ESTADO',
]

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quotation_documents', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      quotation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'quotations', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      document_type: {
        type: Sequelize.ENUM(...QUOTATION_DOCUMENT_TYPES),
        allowNull: false,
      },
      document_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      file_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      file_size: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      mime_type: {
        type: Sequelize.STRING(120),
        allowNull: true,
      },
      uploaded_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })

    await queryInterface.createTable('shipment_traces', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      shipment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'shipments', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      trace_type: {
        type: Sequelize.ENUM(...SHIPMENT_TRACE_TYPES),
        allowNull: false,
        defaultValue: 'NOTA',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      event_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('shipment_traces')
    await queryInterface.dropTable('quotation_documents')
  },
}
