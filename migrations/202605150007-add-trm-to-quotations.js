'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    const quotationTable = await queryInterface.describeTable('quotations')
    if (!quotationTable.trm) {
      await queryInterface.addColumn('quotations', 'trm', {
        type: Sequelize.DECIMAL(18, 6),
        allowNull: true,
        after: 'currency',
      })
    }
  },

  async down(queryInterface) {
    const quotationTable = await queryInterface.describeTable('quotations')
    if (quotationTable.trm) {
      await queryInterface.removeColumn('quotations', 'trm')
    }
  },
}
