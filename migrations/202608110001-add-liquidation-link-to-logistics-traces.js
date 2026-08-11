'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('quotation_traces', 'liquidation_link', {
      type: Sequelize.TEXT,
      allowNull: true,
    })

    await queryInterface.addColumn('shipment_traces', 'liquidation_link', {
      type: Sequelize.TEXT,
      allowNull: true,
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('shipment_traces', 'liquidation_link')
    await queryInterface.removeColumn('quotation_traces', 'liquidation_link')
  },
}
