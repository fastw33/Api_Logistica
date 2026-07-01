'use strict'

async function tableExists(queryInterface, tableName) {
  const [rows] = await queryInterface.sequelize.query(
    'SHOW TABLES LIKE ?',
    { replacements: [tableName] }
  )

  return Array.isArray(rows) && rows.length > 0
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const quotationsTable = await queryInterface.describeTable('quotations')

    if (!quotationsTable.quotation_number) {
      await queryInterface.addColumn('quotations', 'quotation_number', {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      })
    }

    const hasSequencesTable = await tableExists(queryInterface, 'logistics_sequences')

    if (!hasSequencesTable) {
      await queryInterface.createTable('logistics_sequences', {
        sequence_key: {
          type: Sequelize.STRING(20),
          primaryKey: true,
          allowNull: false,
        },
        current_value: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      })
    }

    await queryInterface.sequelize.query(
      `
      INSERT INTO logistics_sequences (sequence_key, current_value)
      VALUES ('CT', 4224), ('FW', 2174)
      ON DUPLICATE KEY UPDATE current_value = GREATEST(current_value, VALUES(current_value))
      `
    )
  },

  async down(queryInterface) {
    const quotationsTable = await queryInterface.describeTable('quotations')

    if (quotationsTable.quotation_number) {
      await queryInterface.removeColumn('quotations', 'quotation_number')
    }
  },
}
