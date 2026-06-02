'use strict'

const QUOTATION_SERVICE_CODES = [
  'ADUANA_EXTERIOR',
  'BODEGA_ZF',
  'DTA',
  'ETIQUETADO',
  'FLETE_INTERNACIONAL',
  'FLETE_NACIONAL',
  'LIBERACION_BL_GUIA',
  'NACIONALIZACION',
  'OTM',
  'PICKUP',
  'SEGURO',
  'SERVICIOS_EXTERIOR',
  'URBANO',
]

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('quotations', 'commercial_id', {
      type: Sequelize.STRING(250),
      allowNull: true,
    })

    await queryInterface.changeColumn('shipments', 'commercial_id', {
      type: Sequelize.STRING(250),
      allowNull: true,
    })

    await queryInterface.changeColumn('shipments', 'operator_id', {
      type: Sequelize.STRING(250),
      allowNull: true,
    })

    await queryInterface.changeColumn('shipment_tasks', 'assigned_to', {
      type: Sequelize.STRING(250),
      allowNull: true,
    })

    await queryInterface.createTable('shipment_providers', {
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
      provider_id: {
        type: Sequelize.STRING(250),
        allowNull: false,
      },
      provider_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      provider_type: {
        type: Sequelize.STRING(120),
        allowNull: true,
      },
      service_code: {
        type: Sequelize.ENUM(...QUOTATION_SERVICE_CODES),
        allowNull: true,
      },
      contact_name: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      contact_email: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      updated_by: {
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('shipment_providers')

    await queryInterface.changeColumn('shipment_tasks', 'assigned_to', {
      type: Sequelize.INTEGER,
      allowNull: true,
    })

    await queryInterface.changeColumn('shipments', 'operator_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    })

    await queryInterface.changeColumn('shipments', 'commercial_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    })

    await queryInterface.changeColumn('quotations', 'commercial_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    })
  },
}
