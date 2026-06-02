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
    const allTables = await queryInterface.showAllTables()
    if (allTables.includes('quotation_provider_quotes')) return

    await queryInterface.createTable('quotation_provider_quotes', {
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
      provider_id: {
        type: Sequelize.STRING(250),
        allowNull: false,
      },
      provider_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      service_code: {
        type: Sequelize.ENUM(...QUOTATION_SERVICE_CODES),
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'USD',
      },
      quoted_value: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0,
      },
      quoted_trm: {
        type: Sequelize.DECIMAL(18, 6),
        allowNull: true,
      },
      validity_date: {
        type: Sequelize.DATEONLY,
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

  async down(queryInterface) {
    const allTables = await queryInterface.showAllTables()
    if (allTables.includes('quotation_provider_quotes')) {
      await queryInterface.dropTable('quotation_provider_quotes')
    }
  },
}
