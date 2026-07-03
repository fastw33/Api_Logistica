'use strict'

const EXTRA_LOGISTICS_DOCUMENT_TYPES = [
  'RESERVA',
  'WAREHOUSE',
  'CARTA DE RESPONSABILIDAD',
  'IFS + 10',
  'CERTIFICADO DE ORIGEN',
  'FORMATO DE INSTRUCCIONES DE EXPORTACION',
  'FORMATO DE REVISION DE DOCUMENTOS DE EXPORTACION',
  'CERTIFICADO DE ANALISIS',
  'DECLARACION DE IMPORTACION CON LEVANTE',
  'REGISTROS DE IMPORTACION',
  'LICENCIA DE IMPORTACION',
  'SAE',
  'PLANILLA DE TRASLADO',
  'ARIM DE INGRESO',
  'SIIS',
  'CERTIFICACION DE FLETES',
  'FOTOGRAFIAS DE LA MERCANCIA',
  'SOPORTE DE TERCEROS',
  'SHIPPING INSTRUCTION',
  'DRAFT DEL BL',
  'DRAFT DE GUIA AEREA',
  'BL FINAL',
  'ORDEN DE COMPRA',
  'GUIA AEREA FINAL',
  'PROFORMA',
  'FORMATO DE DILIGENCIAMIENTO DAV',
  'FORMATO DE SOLICITUD DE CLASIFICACION',
  'CERTIFICADO DE SEGURO DE MERCANCIAS',
  'TRIBUTOS ESTIMADOS',
]

const PREVIOUS_QUOTATION_DOCUMENT_TYPES = [
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

const PREVIOUS_SHIPMENT_DOCUMENT_TYPES = [
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

const QUOTATION_DOCUMENT_TYPES = Array.from(
  new Set([
    ...PREVIOUS_QUOTATION_DOCUMENT_TYPES,
    ...EXTRA_LOGISTICS_DOCUMENT_TYPES,
  ])
)

const SHIPMENT_DOCUMENT_TYPES = Array.from(
  new Set([
    ...PREVIOUS_SHIPMENT_DOCUMENT_TYPES,
    ...EXTRA_LOGISTICS_DOCUMENT_TYPES,
  ])
)

module.exports = {
  async up(queryInterface, Sequelize) {
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
  },
}
