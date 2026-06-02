'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS usuario')

    await queryInterface.sequelize.query(`
      ALTER TABLE quotations
      ADD COLUMN IF NOT EXISTS project_external_id VARCHAR(100) NULL AFTER customer_id,
      ADD COLUMN IF NOT EXISTS project_name VARCHAR(255) NULL AFTER project_external_id
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE shipments
      ADD COLUMN IF NOT EXISTS project_external_id VARCHAR(100) NULL AFTER customer_id,
      ADD COLUMN IF NOT EXISTS project_name VARCHAR(255) NULL AFTER project_external_id
    `)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('shipments', 'project_name')
    await queryInterface.removeColumn('shipments', 'project_external_id')
    await queryInterface.removeColumn('quotations', 'project_name')
    await queryInterface.removeColumn('quotations', 'project_external_id')
  },
}
