'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    const allTables = await queryInterface.showAllTables()
    if (allTables.includes('quotation_traces')) return

    await queryInterface.createTable('quotation_traces', {
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
      trace_type: {
        type: Sequelize.ENUM('NOTA', 'SEGUIMIENTO', 'HITO', 'NOVEDAD', 'CAMBIO_ESTADO'),
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
    const allTables = await queryInterface.showAllTables()
    if (allTables.includes('quotation_traces')) {
      await queryInterface.dropTable('quotation_traces')
    }
  },
}
