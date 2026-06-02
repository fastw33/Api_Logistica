const Quotation = require('../modules/quotations/quotation.model')
const QuotationService = require('../modules/quotationServices/quotationService.model')
const QuotationDocument = require('../modules/quotationDocuments/quotationDocument.model')
const QuotationProviderQuote = require('../modules/quotationProviderQuotes/quotationProviderQuote.model')
const QuotationSale = require('../modules/quotationSales/quotationSale.model')
const QuotationTrace = require('../modules/quotationTraces/quotationTrace.model')
const ExperimentalQuote = require('../modules/experimentalQuotes/experimentalQuote.model')
const ExperimentalQuoteItem = require('../modules/experimentalQuoteItems/experimentalQuoteItem.model')
const ExperimentalQuoteTrace = require('../modules/experimentalQuoteTraces/experimentalQuoteTrace.model')
const Shipment = require('../modules/shipments/shipment.model')
const ShipmentDocument = require('../modules/shipmentDocuments/shipmentDocument.model')
const ShipmentTrace = require('../modules/shipmentTraces/shipmentTrace.model')
const ShipmentProvider = require('../modules/shipmentProviders/shipmentProvider.model')
const ShipmentTask = require('../modules/shipmentTasks/shipmentTask.model')
const ShipmentDimension = require('../modules/shipmentDimensions/shipmentDimension.model')
const ShipmentCost = require('../modules/shipmentCosts/shipmentCost.model')
const ShipmentSale = require('../modules/shipmentSales/shipmentSale.model')
const CustomerInvoice = require('../modules/customerInvoices/customerInvoice.model')
const VendorInvoice = require('../modules/vendorInvoices/vendorInvoice.model')
const FinancialSupport = require('../modules/financialSupports/financialSupport.model')
const ShipmentAuditLog = require('../modules/shipmentAuditLogs/shipmentAuditLog.model')

Quotation.hasMany(QuotationService, {
  foreignKey: 'quotation_id',
  as: 'services',
})
QuotationService.belongsTo(Quotation, {
  foreignKey: 'quotation_id',
  as: 'quotation',
})

Quotation.hasMany(QuotationDocument, {
  foreignKey: 'quotation_id',
  as: 'documents',
})
QuotationDocument.belongsTo(Quotation, {
  foreignKey: 'quotation_id',
  as: 'quotation',
})

Quotation.hasMany(QuotationProviderQuote, {
  foreignKey: 'quotation_id',
  as: 'provider_quotes',
})
QuotationProviderQuote.belongsTo(Quotation, {
  foreignKey: 'quotation_id',
  as: 'quotation',
})

Quotation.hasMany(QuotationSale, {
  foreignKey: 'quotation_id',
  as: 'sales',
})
QuotationSale.belongsTo(Quotation, {
  foreignKey: 'quotation_id',
  as: 'quotation',
})

Quotation.hasMany(QuotationTrace, {
  foreignKey: 'quotation_id',
  as: 'traces',
})
QuotationTrace.belongsTo(Quotation, {
  foreignKey: 'quotation_id',
  as: 'quotation',
})

Quotation.hasMany(Shipment, {
  foreignKey: 'quotation_id',
  as: 'shipments',
})
Shipment.belongsTo(Quotation, {
  foreignKey: 'quotation_id',
  as: 'quotation',
})

Shipment.hasMany(ShipmentDocument, {
  foreignKey: 'shipment_id',
  as: 'documents',
})
ShipmentDocument.belongsTo(Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment',
})

Shipment.hasMany(ShipmentTrace, {
  foreignKey: 'shipment_id',
  as: 'traces',
})
ShipmentTrace.belongsTo(Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment',
})

Shipment.hasMany(ShipmentProvider, {
  foreignKey: 'shipment_id',
  as: 'providers',
})
ShipmentProvider.belongsTo(Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment',
})

Shipment.hasMany(ShipmentTask, {
  foreignKey: 'shipment_id',
  as: 'tasks',
})
ShipmentTask.belongsTo(Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment',
})

Shipment.hasMany(ShipmentDimension, {
  foreignKey: 'shipment_id',
  as: 'dimensions',
})
ShipmentDimension.belongsTo(Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment',
})

Shipment.hasMany(ShipmentCost, {
  foreignKey: 'shipment_id',
  as: 'costs',
})
ShipmentCost.belongsTo(Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment',
})

Shipment.hasMany(ShipmentSale, {
  foreignKey: 'shipment_id',
  as: 'sales',
})
ShipmentSale.belongsTo(Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment',
})

Shipment.hasMany(CustomerInvoice, {
  foreignKey: 'shipment_id',
  as: 'customer_invoices',
})
CustomerInvoice.belongsTo(Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment',
})

Shipment.hasMany(VendorInvoice, {
  foreignKey: 'shipment_id',
  as: 'vendor_invoices',
})
VendorInvoice.belongsTo(Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment',
})

Shipment.hasMany(FinancialSupport, {
  foreignKey: 'shipment_id',
  as: 'financial_supports',
})
FinancialSupport.belongsTo(Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment',
})

Shipment.hasMany(ShipmentAuditLog, {
  foreignKey: 'shipment_id',
  as: 'audit_logs',
})
ShipmentAuditLog.belongsTo(Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment',
})

CustomerInvoice.hasMany(ShipmentSale, {
  foreignKey: 'customer_invoice_id',
  as: 'sales',
})
ShipmentSale.belongsTo(CustomerInvoice, {
  foreignKey: 'customer_invoice_id',
  as: 'customer_invoice',
})

ExperimentalQuote.hasMany(ExperimentalQuoteItem, {
  foreignKey: 'experimental_quote_id',
  as: 'items',
})
ExperimentalQuoteItem.belongsTo(ExperimentalQuote, {
  foreignKey: 'experimental_quote_id',
  as: 'quote',
})

ExperimentalQuote.hasMany(ExperimentalQuoteTrace, {
  foreignKey: 'experimental_quote_id',
  as: 'traces',
})
ExperimentalQuoteTrace.belongsTo(ExperimentalQuote, {
  foreignKey: 'experimental_quote_id',
  as: 'quote',
})

VendorInvoice.hasMany(ShipmentCost, {
  foreignKey: 'vendor_invoice_id',
  as: 'costs',
})
ShipmentCost.belongsTo(VendorInvoice, {
  foreignKey: 'vendor_invoice_id',
  as: 'vendor_invoice',
})

module.exports = {
  Quotation,
  QuotationService,
  QuotationDocument,
  QuotationProviderQuote,
  QuotationSale,
  QuotationTrace,
  ExperimentalQuote,
  ExperimentalQuoteItem,
  ExperimentalQuoteTrace,
  Shipment,
  ShipmentDocument,
  ShipmentTrace,
  ShipmentProvider,
  ShipmentTask,
  ShipmentDimension,
  ShipmentCost,
  ShipmentSale,
  CustomerInvoice,
  VendorInvoice,
  FinancialSupport,
  ShipmentAuditLog,
}
