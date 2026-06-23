'use strict'

const LEGACY_QUOTATION_BUSINESS_TYPES = [
  'IMPORTACIONES',
  'EXPORTACIONES',
  'LOGISTICA_ALMACENAMIENTO',
  'TRANSPORTE',
]

const LEGACY_QUOTATION_SERVICE_CODES = [
  'ADUANA_EXTERIOR',
  'BODEGA_ZF',
  'DTA',
  'ETIQUETADO',
  'FLETE_INTERNACIONAL',
  'FLETE_NACIONAL',
  'LIBERACION_BL_GUIA',
  'NACIONALIZACION',
  'OTM',
  'PICKUP',
  'SEGURO',
  'SERVICIOS_EXTERIOR',
  'URBANO',
]

const QUOTATION_BUSINESS_TYPES = [
  'AEREO',
  'CORREO',
  'MARITIMO',
  'ALMACENAMIENTO',
  'TERRESTRE',
  'LOGISTICA_CIRCULAR',
  'ASESORIA',
  ...LEGACY_QUOTATION_BUSINESS_TYPES,
]

const QUOTATION_SERVICE_CODES = [
  'ADUANA_EXPORTACION',
  'ADUANA_EXTERIOR',
  'ALISTAMIENTO_CARGA',
  'BODEGA_EXTERIOR',
  'BODEGA_ZF',
  'DTA',
  'ETIQUETADO',
  'FLETE_INTERNACIONAL',
  'FLETE_NACIONAL',
  'LIBERACION_BL_GUIA',
  'NACIONALIZACION',
  'OTM',
  'PICKUP',
  'SEGURO',
  'SERVICIOS_EXTERIOR',
  'TERRESTRE_DESTINO',
  'TRANSPORTE_NACIONAL',
  'URBANO',
  'ALISTAMIENTO',
  'ALMACENAMIENTO',
  'ARRENDAMIENTO',
  'CONCESION_ESPACIOS',
  'CUADRILLA_DESCARGUE',
  'MANEJO_INVENTARIOS',
  'USO_INSTAL_CROSS_DOCKING_5_DIAS_LIB',
  'USO_INSTAL_TRANSBORDO_CARRO_A_CARRO',
  'USO_MONTACARGAS',
  'CUORRIER',
  'TERRESTRE',
  'TUNGSTENO',
  'COBALTO',
  '718',
  'OTROS',
  'ASESORIA',
  'COMERCIALIZADORA',
]

async function getNormalizedTables(queryInterface) {
  const tables = await queryInterface.showAllTables()
  return tables.map(table =>
    typeof table === 'string' ? table : table?.tableName || table?.name || ''
  )
}

async function hasColumn(queryInterface, tableName, columnName) {
  try {
    const table = await queryInterface.describeTable(tableName)
    return Boolean(table?.[columnName])
  } catch {
    return false
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await getNormalizedTables(queryInterface)

    if (
      tables.includes('quotations') &&
      (await hasColumn(queryInterface, 'quotations', 'business_type'))
    ) {
      await queryInterface.changeColumn('quotations', 'business_type', {
        type: Sequelize.ENUM(...QUOTATION_BUSINESS_TYPES),
        allowNull: false,
      })
    }

    if (
      tables.includes('shipments') &&
      (await hasColumn(queryInterface, 'shipments', 'business_type'))
    ) {
      await queryInterface.changeColumn('shipments', 'business_type', {
        type: Sequelize.ENUM(...QUOTATION_BUSINESS_TYPES),
        allowNull: false,
      })
    }

    if (
      tables.includes('quotation_services') &&
      (await hasColumn(queryInterface, 'quotation_services', 'service_code'))
    ) {
      await queryInterface.changeColumn('quotation_services', 'service_code', {
        type: Sequelize.ENUM(...QUOTATION_SERVICE_CODES),
        allowNull: false,
      })
    }

    if (
      tables.includes('quotation_provider_quotes') &&
      (await hasColumn(queryInterface, 'quotation_provider_quotes', 'service_code'))
    ) {
      await queryInterface.changeColumn('quotation_provider_quotes', 'service_code', {
        type: Sequelize.ENUM(...QUOTATION_SERVICE_CODES),
        allowNull: true,
      })
    }

    if (
      tables.includes('shipment_providers') &&
      (await hasColumn(queryInterface, 'shipment_providers', 'service_code'))
    ) {
      await queryInterface.changeColumn('shipment_providers', 'service_code', {
        type: Sequelize.ENUM(...QUOTATION_SERVICE_CODES),
        allowNull: true,
      })
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = await getNormalizedTables(queryInterface)

    if (
      tables.includes('quotations') &&
      (await hasColumn(queryInterface, 'quotations', 'business_type'))
    ) {
      await queryInterface.changeColumn('quotations', 'business_type', {
        type: Sequelize.ENUM(...LEGACY_QUOTATION_BUSINESS_TYPES),
        allowNull: false,
      })
    }

    if (
      tables.includes('shipments') &&
      (await hasColumn(queryInterface, 'shipments', 'business_type'))
    ) {
      await queryInterface.changeColumn('shipments', 'business_type', {
        type: Sequelize.ENUM(...LEGACY_QUOTATION_BUSINESS_TYPES),
        allowNull: false,
      })
    }

    if (
      tables.includes('quotation_services') &&
      (await hasColumn(queryInterface, 'quotation_services', 'service_code'))
    ) {
      await queryInterface.changeColumn('quotation_services', 'service_code', {
        type: Sequelize.ENUM(...LEGACY_QUOTATION_SERVICE_CODES),
        allowNull: false,
      })
    }

    if (
      tables.includes('quotation_provider_quotes') &&
      (await hasColumn(queryInterface, 'quotation_provider_quotes', 'service_code'))
    ) {
      await queryInterface.changeColumn('quotation_provider_quotes', 'service_code', {
        type: Sequelize.ENUM(...LEGACY_QUOTATION_SERVICE_CODES),
        allowNull: true,
      })
    }

    if (
      tables.includes('shipment_providers') &&
      (await hasColumn(queryInterface, 'shipment_providers', 'service_code'))
    ) {
      await queryInterface.changeColumn('shipment_providers', 'service_code', {
        type: Sequelize.ENUM(...LEGACY_QUOTATION_SERVICE_CODES),
        allowNull: true,
      })
    }
  },
}
