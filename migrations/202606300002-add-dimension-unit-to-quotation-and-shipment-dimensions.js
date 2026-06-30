'use strict'

async function addColumnIfMissing(queryInterface, tableName, columnName, definition) {
  const table = await queryInterface.describeTable(tableName)
  if (table[columnName]) return
  await queryInterface.addColumn(tableName, columnName, definition)
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(
      queryInterface,
      'quotation_dimensions',
      'dimension_unit',
      {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'cm',
        after: 'height',
      }
    )

    await addColumnIfMissing(
      queryInterface,
      'shipment_dimensions',
      'dimension_unit',
      {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'cm',
        after: 'height',
      }
    )

    await queryInterface.sequelize.query(`
      UPDATE quotation_dimensions
      SET dimension_unit = 'cm'
      WHERE dimension_unit IS NULL OR TRIM(dimension_unit) = ''
    `)

    await queryInterface.sequelize.query(`
      UPDATE shipment_dimensions
      SET dimension_unit = 'cm'
      WHERE dimension_unit IS NULL OR TRIM(dimension_unit) = ''
    `)
  },

  async down(queryInterface) {
    const quotationDimensions = await queryInterface.describeTable(
      'quotation_dimensions'
    )
    const shipmentDimensions = await queryInterface.describeTable(
      'shipment_dimensions'
    )

    if (quotationDimensions.dimension_unit) {
      await queryInterface.removeColumn('quotation_dimensions', 'dimension_unit')
    }

    if (shipmentDimensions.dimension_unit) {
      await queryInterface.removeColumn('shipment_dimensions', 'dimension_unit')
    }
  },
}
