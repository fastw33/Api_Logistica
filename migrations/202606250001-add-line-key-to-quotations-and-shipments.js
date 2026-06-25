'use strict'

async function addColumnIfMissing(queryInterface, tableName, columnName, definition) {
  const table = await queryInterface.describeTable(tableName)
  if (table[columnName]) return
  await queryInterface.addColumn(tableName, columnName, definition)
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, 'quotations', 'line_key', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'fastway',
    })

    await addColumnIfMissing(queryInterface, 'shipments', 'line_key', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'fastway',
    })

    await queryInterface.sequelize.query(`
      UPDATE quotations
      SET line_key = CASE
        WHEN LOWER(COALESCE(subject, '')) LIKE '%harvest%' THEN 'harvest'
        WHEN LOWER(COALESCE(subject, '')) LIKE '%greenway%' THEN 'greenway'
        ELSE 'fastway'
      END
      WHERE line_key IS NULL OR TRIM(line_key) = ''
    `)

    await queryInterface.sequelize.query(`
      UPDATE shipments
      SET line_key = CASE
        WHEN quotation_id IS NOT NULL THEN (
          SELECT q.line_key
          FROM quotations q
          WHERE q.id = shipments.quotation_id
          LIMIT 1
        )
        WHEN LOWER(COALESCE(subject, '')) LIKE '%harvest%' THEN 'harvest'
        WHEN LOWER(COALESCE(subject, '')) LIKE '%greenway%' THEN 'greenway'
        ELSE 'fastway'
      END
      WHERE line_key IS NULL OR TRIM(line_key) = ''
    `)
  },

  async down(queryInterface) {
    const quotations = await queryInterface.describeTable('quotations')
    if (quotations.line_key) {
      await queryInterface.removeColumn('quotations', 'line_key')
    }

    const shipments = await queryInterface.describeTable('shipments')
    if (shipments.line_key) {
      await queryInterface.removeColumn('shipments', 'line_key')
    }
  },
}
