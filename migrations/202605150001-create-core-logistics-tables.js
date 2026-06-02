'use strict'

const QUOTATION_TRANSPORT_MODES = ['MARITIMO', 'AEREO', 'TERRESTRE']
const QUOTATION_MODALITIES = ['FCL', 'LCL', 'AEREO', 'NO_APLICA']
const QUOTATION_BUSINESS_TYPES = [
  'IMPORTACIONES',
  'EXPORTACIONES',
  'LOGISTICA_ALMACENAMIENTO',
  'TRANSPORTE',
]
const QUOTATION_MATERIAL_CLASSES = ['NO_PELIGROSO', 'PELIGROSO']
const QUOTATION_STATUSES = [
  'BORRADOR',
  'ENVIADA',
  'APROBADA',
  'RECHAZADA',
  'VENCIDA',
  'CONVERTIDA',
]
const QUOTATION_SERVICE_CODES = [
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
const SHIPMENT_OPERATIONAL_STATUSES = [
  'CREADA',
  'OPERACIONES',
  'RESERVADA',
  'EN_TRANSITO',
  'ARRIBADA',
  'NACIONALIZACION',
  'ENTREGADA',
  'FINALIZADA_OPERATIVAMENTE',
  'CANCELADA',
]
const SHIPMENT_FINANCIAL_STATUSES = [
  'PENDIENTE_FACTURACION',
  'FACTURADA_CLIENTE',
  'PENDIENTE_FACTURAS_PROVEEDOR',
  'PENDIENTE_PAGOS',
  'EN_CONCILIACION',
  'RENTABILIDAD_CALCULADA',
  'CIERRE_FINANCIERO',
  'CERRADA',
]
const SHIPMENT_DOCUMENT_TYPES = [
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
const SHIPMENT_TASK_STATUSES = [
  'PENDIENTE',
  'EN_PROCESO',
  'COMPLETADA',
  'CANCELADA',
]
const SHIPMENT_TASK_PRIORITIES = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA']
const SHIPMENT_COST_STATUSES = ['ESTIMADO', 'CONFIRMADO', 'FACTURADO', 'PAGADO']
const SHIPMENT_COST_TYPES = [
  'FLETE',
  'ADUANA',
  'TRANSPORTE',
  'SEGURO',
  'BODEGAJE',
  'DOCUMENTACION',
  'DEMORAS',
  'STORAGE',
  'INSPECCION',
  'OTROS',
]
const SHIPMENT_SALE_STATUSES = ['PENDIENTE', 'FACTURADO', 'PAGADO']
const INVOICE_PAYMENT_STATUSES = ['PENDIENTE', 'PARCIAL', 'PAGADA']
const FINANCIAL_SUPPORT_TYPES = [
  'FACTURA_CLIENTE',
  'FACTURA_PROVEEDOR',
  'SOPORTE_TRANSFERENCIA',
  'SOPORTE_PAGO',
  'COMPROBANTE_CONTABLE',
  'CONCILIACION',
  'OTRO',
]

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quotations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      lead_external_id: { type: Sequelize.STRING(100), allowNull: false },
      customer_id: { type: Sequelize.STRING(100), allowNull: false },
      project_external_id: { type: Sequelize.STRING(100), allowNull: true },
      project_name: { type: Sequelize.STRING(255), allowNull: true },
      subject: { type: Sequelize.STRING(255), allowNull: false },
      transport_mode: { type: Sequelize.ENUM(...QUOTATION_TRANSPORT_MODES), allowNull: false },
      modality: { type: Sequelize.ENUM(...QUOTATION_MODALITIES), allowNull: false },
      business_type: { type: Sequelize.ENUM(...QUOTATION_BUSINESS_TYPES), allowNull: false },
      material_class: {
        type: Sequelize.ENUM(...QUOTATION_MATERIAL_CLASSES),
        allowNull: false,
        defaultValue: 'NO_PELIGROSO',
      },
      declared_value: { type: Sequelize.DECIMAL(18, 2), allowNull: true },
      cif_value: { type: Sequelize.DECIMAL(18, 2), allowNull: true },
      currency: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'COP' },
      origin_country: { type: Sequelize.STRING(100), allowNull: false },
      origin_city: { type: Sequelize.STRING(100), allowNull: true },
      origin_address: { type: Sequelize.STRING(255), allowNull: true },
      destination_country: { type: Sequelize.STRING(100), allowNull: false },
      destination_city: { type: Sequelize.STRING(100), allowNull: true },
      destination_address: { type: Sequelize.STRING(255), allowNull: true },
      incoterm: { type: Sequelize.STRING(20), allowNull: true },
      commercial_id: { type: Sequelize.INTEGER, allowNull: true },
      status: {
        type: Sequelize.ENUM(...QUOTATION_STATUSES),
        allowNull: false,
        defaultValue: 'BORRADOR',
      },
      status_color: { type: Sequelize.STRING(30), allowNull: true },
      next_review_date: { type: Sequelize.DATE, allowNull: true },
      cargo_description: { type: Sequelize.TEXT, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_by: { type: Sequelize.INTEGER, allowNull: true },
      updated_by: { type: Sequelize.INTEGER, allowNull: true },
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

    await queryInterface.createTable('quotation_services', {
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
      service_code: { type: Sequelize.ENUM(...QUOTATION_SERVICE_CODES), allowNull: false },
      enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
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

    await queryInterface.createTable('shipments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      quotation_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'quotations', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      lead_external_id: { type: Sequelize.STRING(100), allowNull: false },
      customer_id: { type: Sequelize.STRING(100), allowNull: false },
      project_external_id: { type: Sequelize.STRING(100), allowNull: true },
      project_name: { type: Sequelize.STRING(255), allowNull: true },
      do_number: { type: Sequelize.STRING(50), allowNull: true, unique: true },
      file_number: { type: Sequelize.STRING(50), allowNull: true, unique: true },
      subject: { type: Sequelize.STRING(255), allowNull: false },
      transport_mode: { type: Sequelize.ENUM(...QUOTATION_TRANSPORT_MODES), allowNull: false },
      modality: { type: Sequelize.ENUM(...QUOTATION_MODALITIES), allowNull: false },
      business_type: { type: Sequelize.ENUM(...QUOTATION_BUSINESS_TYPES), allowNull: false },
      material_class: {
        type: Sequelize.ENUM(...QUOTATION_MATERIAL_CLASSES),
        allowNull: false,
        defaultValue: 'NO_PELIGROSO',
      },
      operational_status: {
        type: Sequelize.ENUM(...SHIPMENT_OPERATIONAL_STATUSES),
        allowNull: false,
        defaultValue: 'CREADA',
      },
      financial_status: {
        type: Sequelize.ENUM(...SHIPMENT_FINANCIAL_STATUSES),
        allowNull: false,
        defaultValue: 'PENDIENTE_FACTURACION',
      },
      incoterm: { type: Sequelize.STRING(20), allowNull: true },
      origin_country: { type: Sequelize.STRING(100), allowNull: false },
      origin_city: { type: Sequelize.STRING(100), allowNull: true },
      origin_address: { type: Sequelize.STRING(255), allowNull: true },
      destination_country: { type: Sequelize.STRING(100), allowNull: false },
      destination_city: { type: Sequelize.STRING(100), allowNull: true },
      destination_address: { type: Sequelize.STRING(255), allowNull: true },
      declared_value: { type: Sequelize.DECIMAL(18, 2), allowNull: true },
      cif_value: { type: Sequelize.DECIMAL(18, 2), allowNull: true },
      currency: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'COP' },
      trm: { type: Sequelize.DECIMAL(18, 6), allowNull: true },
      euro_usd_factor: { type: Sequelize.DECIMAL(18, 6), allowNull: true },
      estimated_profit: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
      real_profit: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
      cargo_description: { type: Sequelize.TEXT, allowNull: true },
      etd: { type: Sequelize.DATE, allowNull: true },
      eta: { type: Sequelize.DATE, allowNull: true },
      release_date: { type: Sequelize.DATE, allowNull: true },
      transit_days: { type: Sequelize.INTEGER, allowNull: true },
      commercial_id: { type: Sequelize.INTEGER, allowNull: true },
      operator_id: { type: Sequelize.INTEGER, allowNull: true },
      created_by: { type: Sequelize.INTEGER, allowNull: true },
      updated_by: { type: Sequelize.INTEGER, allowNull: true },
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

    await queryInterface.createTable('shipment_documents', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      shipment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'shipments', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      quotation_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'quotations', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      document_type: { type: Sequelize.ENUM(...SHIPMENT_DOCUMENT_TYPES), allowNull: false },
      document_name: { type: Sequelize.STRING(255), allowNull: false },
      file_url: { type: Sequelize.STRING(500), allowNull: false },
      file_size: { type: Sequelize.BIGINT, allowNull: true },
      mime_type: { type: Sequelize.STRING(120), allowNull: true },
      uploaded_by: { type: Sequelize.INTEGER, allowNull: true },
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

    await queryInterface.createTable('shipment_tasks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      shipment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'shipments', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      assigned_to: { type: Sequelize.INTEGER, allowNull: true },
      status: {
        type: Sequelize.ENUM(...SHIPMENT_TASK_STATUSES),
        allowNull: false,
        defaultValue: 'PENDIENTE',
      },
      priority: {
        type: Sequelize.ENUM(...SHIPMENT_TASK_PRIORITIES),
        allowNull: false,
        defaultValue: 'MEDIA',
      },
      due_date: { type: Sequelize.DATE, allowNull: true },
      completed_at: { type: Sequelize.DATE, allowNull: true },
      created_by: { type: Sequelize.INTEGER, allowNull: true },
      updated_by: { type: Sequelize.INTEGER, allowNull: true },
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

    await queryInterface.createTable('shipment_dimensions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      shipment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'shipments', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      quantity: { type: Sequelize.DECIMAL(18, 3), allowNull: false },
      package_type: { type: Sequelize.STRING(100), allowNull: true },
      gross_weight: { type: Sequelize.DECIMAL(18, 3), allowNull: true },
      volumetric_weight: { type: Sequelize.DECIMAL(18, 3), allowNull: true },
      volume_cbm: { type: Sequelize.DECIMAL(18, 3), allowNull: true },
      length: { type: Sequelize.DECIMAL(18, 3), allowNull: true },
      width: { type: Sequelize.DECIMAL(18, 3), allowNull: true },
      height: { type: Sequelize.DECIMAL(18, 3), allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
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

    await queryInterface.createTable('customer_invoices', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      shipment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'shipments', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      customer_id: { type: Sequelize.STRING(100), allowNull: false },
      invoice_number: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      currency: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'COP' },
      subtotal: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
      taxes: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
      total: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
      paid_amount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
      balance: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
      payment_status: {
        type: Sequelize.ENUM(...INVOICE_PAYMENT_STATUSES),
        allowNull: false,
        defaultValue: 'PENDIENTE',
      },
      payment_date: { type: Sequelize.DATE, allowNull: true },
      invoice_date: { type: Sequelize.DATE, allowNull: true },
      due_date: { type: Sequelize.DATE, allowNull: true },
      pdf_url: { type: Sequelize.STRING(500), allowNull: true },
      xml_url: { type: Sequelize.STRING(500), allowNull: true },
      support_file_url: { type: Sequelize.STRING(500), allowNull: true },
      created_by: { type: Sequelize.INTEGER, allowNull: true },
      updated_by: { type: Sequelize.INTEGER, allowNull: true },
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

    await queryInterface.createTable('vendor_invoices', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      shipment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'shipments', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      vendor_id: { type: Sequelize.STRING(100), allowNull: false },
      invoice_number: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      currency: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'COP' },
      subtotal: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
      taxes: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
      total: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
      paid_amount: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
      balance: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
      payment_status: {
        type: Sequelize.ENUM(...INVOICE_PAYMENT_STATUSES),
        allowNull: false,
        defaultValue: 'PENDIENTE',
      },
      payment_date: { type: Sequelize.DATE, allowNull: true },
      invoice_date: { type: Sequelize.DATE, allowNull: true },
      due_date: { type: Sequelize.DATE, allowNull: true },
      pdf_url: { type: Sequelize.STRING(500), allowNull: true },
      xml_url: { type: Sequelize.STRING(500), allowNull: true },
      support_file_url: { type: Sequelize.STRING(500), allowNull: true },
      created_by: { type: Sequelize.INTEGER, allowNull: true },
      updated_by: { type: Sequelize.INTEGER, allowNull: true },
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

    await queryInterface.createTable('shipment_costs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      shipment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'shipments', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      vendor_id: { type: Sequelize.STRING(100), allowNull: true },
      concept: { type: Sequelize.STRING(255), allowNull: false },
      cost_type: { type: Sequelize.ENUM(...SHIPMENT_COST_TYPES), allowNull: false },
      currency: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'COP' },
      quantity: { type: Sequelize.DECIMAL(18, 3), allowNull: false, defaultValue: 1 },
      unit_value: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
      subtotal: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
      tax: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
      total: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
      is_estimated: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      is_final: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      vendor_invoice_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'vendor_invoices', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM(...SHIPMENT_COST_STATUSES),
        allowNull: false,
        defaultValue: 'ESTIMADO',
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_by: { type: Sequelize.INTEGER, allowNull: true },
      updated_by: { type: Sequelize.INTEGER, allowNull: true },
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

    await queryInterface.createTable('shipment_sales', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      shipment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'shipments', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      customer_id: { type: Sequelize.STRING(100), allowNull: false },
      concept: { type: Sequelize.STRING(255), allowNull: false },
      currency: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'COP' },
      quantity: { type: Sequelize.DECIMAL(18, 3), allowNull: false, defaultValue: 1 },
      unit_value: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
      subtotal: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
      tax: { type: Sequelize.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
      total: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
      customer_invoice_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'customer_invoices', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM(...SHIPMENT_SALE_STATUSES),
        allowNull: false,
        defaultValue: 'PENDIENTE',
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_by: { type: Sequelize.INTEGER, allowNull: true },
      updated_by: { type: Sequelize.INTEGER, allowNull: true },
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

    await queryInterface.createTable('financial_supports', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      shipment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'shipments', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      support_type: { type: Sequelize.ENUM(...FINANCIAL_SUPPORT_TYPES), allowNull: false },
      reference_type: { type: Sequelize.STRING(100), allowNull: true },
      reference_id: { type: Sequelize.INTEGER, allowNull: true },
      file_url: { type: Sequelize.STRING(500), allowNull: false },
      notes: { type: Sequelize.TEXT, allowNull: true },
      uploaded_by: { type: Sequelize.INTEGER, allowNull: true },
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

    await queryInterface.createTable('shipment_audit_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      shipment_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'shipments', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      entity_type: { type: Sequelize.STRING(100), allowNull: false },
      entity_id: { type: Sequelize.INTEGER, allowNull: true },
      action: { type: Sequelize.STRING(100), allowNull: false },
      old_values: { type: Sequelize.JSON, allowNull: true },
      new_values: { type: Sequelize.JSON, allowNull: true },
      user_id: { type: Sequelize.INTEGER, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('shipment_audit_logs')
    await queryInterface.dropTable('financial_supports')
    await queryInterface.dropTable('shipment_sales')
    await queryInterface.dropTable('shipment_costs')
    await queryInterface.dropTable('vendor_invoices')
    await queryInterface.dropTable('customer_invoices')
    await queryInterface.dropTable('shipment_dimensions')
    await queryInterface.dropTable('shipment_tasks')
    await queryInterface.dropTable('shipment_documents')
    await queryInterface.dropTable('shipments')
    await queryInterface.dropTable('quotation_services')
    await queryInterface.dropTable('quotations')
  },
}
