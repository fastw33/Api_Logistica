'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    const quotationTable = await queryInterface.describeTable('quotations')
    const shipmentTable = await queryInterface.describeTable('shipments')

    if (!quotationTable.origin_port) {
      await queryInterface.addColumn('quotations', 'origin_port', {
        type: Sequelize.STRING(120),
        allowNull: true,
        after: 'origin_city',
      })
    }

    if (!quotationTable.destination_port) {
      await queryInterface.addColumn('quotations', 'destination_port', {
        type: Sequelize.STRING(120),
        allowNull: true,
        after: 'destination_city',
      })
    }

    if (!shipmentTable.origin_port) {
      await queryInterface.addColumn('shipments', 'origin_port', {
        type: Sequelize.STRING(120),
        allowNull: true,
        after: 'origin_city',
      })
    }

    if (!shipmentTable.destination_port) {
      await queryInterface.addColumn('shipments', 'destination_port', {
        type: Sequelize.STRING(120),
        allowNull: true,
        after: 'destination_city',
      })
    }
  },

  async down(queryInterface) {
    const quotationTable = await queryInterface.describeTable('quotations')
    const shipmentTable = await queryInterface.describeTable('shipments')

    if (shipmentTable.destination_port) await queryInterface.removeColumn('shipments', 'destination_port')
    if (shipmentTable.origin_port) await queryInterface.removeColumn('shipments', 'origin_port')
    if (quotationTable.destination_port) await queryInterface.removeColumn('quotations', 'destination_port')
    if (quotationTable.origin_port) await queryInterface.removeColumn('quotations', 'origin_port')
  },
}
