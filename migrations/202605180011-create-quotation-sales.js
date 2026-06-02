'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables()
    const normalized = tables.map(table =>
      typeof table === 'string' ? table : table.tableName || table.TABLE_NAME
    )

    if (normalized.includes('quotation_sales')) return

    await queryInterface.createTable('quotation_sales', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      quotation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'quotations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      customer_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      concept: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'COP',
      },
      quantity: {
        type: Sequelize.DECIMAL(18, 3),
        allowNull: false,
        defaultValue: 1,
      },
      unit_value: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      subtotal: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      tax: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
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
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    })
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables()
    const normalized = tables.map(table =>
      typeof table === 'string' ? table : table.tableName || table.TABLE_NAME
    )

    if (!normalized.includes('quotation_sales')) return

    await queryInterface.dropTable('quotation_sales')
  },
}
