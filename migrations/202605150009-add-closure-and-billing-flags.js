'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    const quotationTable = await queryInterface.describeTable('quotations')
    const shipmentTable = await queryInterface.describeTable('shipments')

    if (!quotationTable.closure_status) {
      await queryInterface.addColumn('quotations', 'closure_status', {
        type: Sequelize.ENUM('ABIERTA', 'CIERRE_EXITOSO', 'CIERRE_NO_EXITOSO'),
        allowNull: false,
        defaultValue: 'ABIERTA',
        after: 'status',
      })
    }

    if (quotationTable.status_color) {
      await queryInterface.removeColumn('quotations', 'status_color')
    }

    if (!shipmentTable.closure_status) {
      await queryInterface.addColumn('shipments', 'closure_status', {
        type: Sequelize.ENUM('ABIERTO', 'CERRADO'),
        allowNull: false,
        defaultValue: 'ABIERTO',
        after: 'financial_status',
      })
    }

    if (!shipmentTable.customer_invoiced) {
      await queryInterface.addColumn('shipments', 'customer_invoiced', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        after: 'real_profit',
      })
    }

    if (!shipmentTable.customer_paid) {
      await queryInterface.addColumn('shipments', 'customer_paid', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        after: 'customer_invoiced',
      })
    }

    if (!shipmentTable.vendor_invoiced) {
      await queryInterface.addColumn('shipments', 'vendor_invoiced', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        after: 'customer_paid',
      })
    }

    if (!shipmentTable.vendor_paid) {
      await queryInterface.addColumn('shipments', 'vendor_paid', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        after: 'vendor_invoiced',
      })
    }
  },

  async down(queryInterface, Sequelize) {
    const quotationTable = await queryInterface.describeTable('quotations')
    const shipmentTable = await queryInterface.describeTable('shipments')

    if (shipmentTable.vendor_paid) await queryInterface.removeColumn('shipments', 'vendor_paid')
    if (shipmentTable.vendor_invoiced) await queryInterface.removeColumn('shipments', 'vendor_invoiced')
    if (shipmentTable.customer_paid) await queryInterface.removeColumn('shipments', 'customer_paid')
    if (shipmentTable.customer_invoiced) await queryInterface.removeColumn('shipments', 'customer_invoiced')
    if (shipmentTable.closure_status) await queryInterface.removeColumn('shipments', 'closure_status')

    if (!quotationTable.status_color) {
      await queryInterface.addColumn('quotations', 'status_color', {
        type: Sequelize.STRING(30),
        allowNull: true,
      })
    }

    if (quotationTable.closure_status) await queryInterface.removeColumn('quotations', 'closure_status')
  },
}
