'use strict'

const QUOTATION_DOCUMENT_TYPES = [
  'DOCUMENTO DE COTIZACION',
  'REQUERIMIENTO',
  'SOPORTE',
  'FICHA_TECNICA',
  'FACTURA_COMERCIAL',
  'PACKING_LIST',
  'BL',
  'AWB',
  'SEGURO',
  'MANDATO',
  'CERTIFICADO',
  'COTIZACION_PROVEEDOR',
  'OTRO',
]

const PREVIOUS_QUOTATION_DOCUMENT_TYPES = [
  'REQUERIMIENTO',
  'SOPORTE',
  'FICHA_TECNICA',
  'FACTURA_COMERCIAL',
  'PACKING_LIST',
  'BL',
  'AWB',
  'SEGURO',
  'MANDATO',
  'CERTIFICADO',
  'COTIZACION_PROVEEDOR',
  'OTRO',
]

const SHIPMENT_DOCUMENT_TYPES = [
  'DOCUMENTO DE COTIZACION',
  'SOPORTE',
  'FICHA_TECNICA',
  'FACTURA_COMERCIAL',
  'PACKING_LIST',
  'BL',
  'AWB',
  'SEGURO',
  'MANDATO',
  'CERTIFICADO',
  'FACTURA_CLIENTE',
  'FACTURA_PROVEEDOR',
  'SOPORTE_PAGO',
  'SOPORTE_CONTABLE',
  'CONCILIACION',
  'OTRO',
]

const PREVIOUS_SHIPMENT_DOCUMENT_TYPES = [
  'SOPORTE',
  'FICHA_TECNICA',
  'FACTURA_COMERCIAL',
  'PACKING_LIST',
  'BL',
  'AWB',
  'SEGURO',
  'MANDATO',
  'CERTIFICADO',
  'FACTURA_CLIENTE',
  'FACTURA_PROVEEDOR',
  'SOPORTE_PAGO',
  'SOPORTE_CONTABLE',
  'CONCILIACION',
  'OTRO',
]

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('quotation_documents', 'package_name', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'document_name',
    })

    await queryInterface.addColumn('shipment_documents', 'package_name', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'document_name',
    })

    await queryInterface.changeColumn('quotation_documents', 'document_type', {
      type: Sequelize.ENUM(...QUOTATION_DOCUMENT_TYPES),
      allowNull: false,
    })

    await queryInterface.changeColumn('shipment_documents', 'document_type', {
      type: Sequelize.ENUM(...SHIPMENT_DOCUMENT_TYPES),
      allowNull: false,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('quotation_documents', 'document_type', {
      type: Sequelize.ENUM(...PREVIOUS_QUOTATION_DOCUMENT_TYPES),
      allowNull: false,
    })

    await queryInterface.changeColumn('shipment_documents', 'document_type', {
      type: Sequelize.ENUM(...PREVIOUS_SHIPMENT_DOCUMENT_TYPES),
      allowNull: false,
    })

    await queryInterface.removeColumn('quotation_documents', 'package_name')
    await queryInterface.removeColumn('shipment_documents', 'package_name')
  },
}
