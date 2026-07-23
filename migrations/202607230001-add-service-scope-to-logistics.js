'use strict'

const SERVICE_SCOPES = [
  'IMPORTACION',
  'EXPORTACION',
  'ALMACENAMIENTO',
  'TERRESTRE',
  'LOGISTICA_CIRCULAR',
  'ASESORIA',
]

async function addColumnIfMissing(queryInterface, tableName, columnName, definition) {
  const table = await queryInterface.describeTable(tableName)
  if (table[columnName]) return false
  await queryInterface.addColumn(tableName, columnName, definition)
  return true
}

async function hasColumn(queryInterface, tableName, columnName) {
  const table = await queryInterface.describeTable(tableName)
  return Boolean(table[columnName])
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, 'quotations', 'service_scope', {
      type: Sequelize.ENUM(...SERVICE_SCOPES),
      allowNull: true,
      after: 'business_type',
    })

    await addColumnIfMissing(queryInterface, 'shipments', 'service_scope', {
      type: Sequelize.ENUM(...SERVICE_SCOPES),
      allowNull: true,
      after: 'business_type',
    })

    await queryInterface.sequelize.query(`
      UPDATE quotations
      SET service_scope = CASE
        WHEN business_type IN ('EXPORTACIONES') THEN 'EXPORTACION'
        WHEN business_type IN ('IMPORTACIONES') THEN 'IMPORTACION'
        WHEN business_type IN ('ALMACENAMIENTO', 'LOGISTICA_ALMACENAMIENTO') THEN 'ALMACENAMIENTO'
        WHEN business_type IN ('TERRESTRE', 'TRANSPORTE', 'CORREO') THEN 'TERRESTRE'
        WHEN business_type = 'LOGISTICA_CIRCULAR' THEN 'LOGISTICA_CIRCULAR'
        WHEN business_type = 'ASESORIA' THEN 'ASESORIA'
        ELSE service_scope
      END
      WHERE service_scope IS NULL OR service_scope = 'IMPORTACION'
    `)

    await queryInterface.sequelize.query(`
      UPDATE shipments
      SET service_scope = CASE
        WHEN quotation_id IS NOT NULL THEN COALESCE(
          (
            SELECT q.service_scope
            FROM quotations q
            WHERE q.id = shipments.quotation_id
            LIMIT 1
          ),
          service_scope
        )
        WHEN business_type IN ('EXPORTACIONES') THEN 'EXPORTACION'
        WHEN business_type IN ('IMPORTACIONES') THEN 'IMPORTACION'
        WHEN business_type IN ('ALMACENAMIENTO', 'LOGISTICA_ALMACENAMIENTO') THEN 'ALMACENAMIENTO'
        WHEN business_type IN ('TERRESTRE', 'TRANSPORTE', 'CORREO') THEN 'TERRESTRE'
        WHEN business_type = 'LOGISTICA_CIRCULAR' THEN 'LOGISTICA_CIRCULAR'
        WHEN business_type = 'ASESORIA' THEN 'ASESORIA'
        ELSE service_scope
      END
      WHERE service_scope IS NULL OR service_scope = 'IMPORTACION'
    `)
  },

  async down(queryInterface) {
    if (await hasColumn(queryInterface, 'shipments', 'service_scope')) {
      await queryInterface.removeColumn('shipments', 'service_scope')
    }

    if (await hasColumn(queryInterface, 'quotations', 'service_scope')) {
      await queryInterface.removeColumn('quotations', 'service_scope')
    }
  },
}
