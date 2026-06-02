'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('experimental_quotes')
    if (!table.quotation_id) {
      await queryInterface.addColumn('experimental_quotes', 'quotation_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'quotations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      })
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('experimental_quotes')
    if (table.quotation_id) {
      await queryInterface.removeColumn('experimental_quotes', 'quotation_id')
    }
  },
}
