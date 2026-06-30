'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quotation_dimensions', {
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
      quantity: {
        type: Sequelize.DECIMAL(18, 3),
        allowNull: false,
      },
      package_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      gross_weight: {
        type: Sequelize.DECIMAL(18, 3),
        allowNull: true,
      },
      volumetric_weight: {
        type: Sequelize.DECIMAL(18, 3),
        allowNull: true,
      },
      volume_cbm: {
        type: Sequelize.DECIMAL(18, 3),
        allowNull: true,
      },
      length: {
        type: Sequelize.DECIMAL(18, 3),
        allowNull: true,
      },
      width: {
        type: Sequelize.DECIMAL(18, 3),
        allowNull: true,
      },
      height: {
        type: Sequelize.DECIMAL(18, 3),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('quotation_dimensions', ['quotation_id'], {
      name: 'idx_quotation_dimensions_quotation_id',
    })
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'quotation_dimensions',
      'idx_quotation_dimensions_quotation_id'
    )
    await queryInterface.dropTable('quotation_dimensions')
  },
}
