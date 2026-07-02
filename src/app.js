const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
const rateLimit = require('./config/rateLimit')
const authMiddleware = require('./middlewares/auth.middleware')
const sanitizeRequest = require('./middlewares/sanitizeRequest')
const errorHandler = require('./middlewares/errorHandler')
const notFound = require('./middlewares/notFound')
require('dotenv').config()

const app = express()
const REQUEST_BODY_LIMIT = '100mb'

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

const uploadFrameAncestors = allowedOrigins.length
  ? `frame-ancestors 'self' ${allowedOrigins.join(' ')}`
  : 'frame-ancestors *'

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  methods: 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}

app.use(cors(corsOptions))
app.use(
  helmet({
    frameguard: false,
  })
)
app.use(rateLimit)
app.use(express.json({ limit: REQUEST_BODY_LIMIT }))
app.use(express.urlencoded({ extended: true, limit: REQUEST_BODY_LIMIT }))
app.use(sanitizeRequest)

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'up' })
})

require('./model/associations')

app.use((req, res, next) => {
  if (req.path.startsWith('/health') || req.path.startsWith('/uploads')) {
    return next()
  }
  return authMiddleware(req, res, next)
})

app.use('/uploads', (req, res, next) => {
  res.setHeader('Content-Security-Policy', uploadFrameAncestors)
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  next()
})

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
  })
)

const rutas = [
  ['quotations', './modules/quotations/quotation.routes'],
  ['quotation-documents', './modules/quotationDocuments/quotationDocument.routes'],
  ['quotation-provider-quotes', './modules/quotationProviderQuotes/quotationProviderQuote.routes'],
  ['quotation-sales', './modules/quotationSales/quotationSale.routes'],
  ['experimental-logistics-quotes', './modules/experimentalQuotes/experimentalQuote.routes'],
  ['shipments', './modules/shipments/shipment.routes'],
  ['shipment-providers', './modules/shipmentProviders/shipmentProvider.routes'],
  ['documents', './modules/shipmentDocuments/shipmentDocument.routes'],
  ['tasks', './modules/shipmentTasks/shipmentTask.routes'],
  ['dimensions', './modules/shipmentDimensions/shipmentDimension.routes'],
  ['costs', './modules/shipmentCosts/shipmentCost.routes'],
  ['sales', './modules/shipmentSales/shipmentSale.routes'],
  ['customer-invoices', './modules/customerInvoices/customerInvoice.routes'],
  ['vendor-invoices', './modules/vendorInvoices/vendorInvoice.routes'],
  ['financial-supports', './modules/financialSupports/financialSupport.routes'],
]

rutas.forEach(([nombre, routePath]) => {
  try {
    const route = require(routePath)
    app.use(`/api/${nombre}`, route)
  } catch (error) {
    console.error(`Error cargando módulo [${nombre}]:`, error.message)
  }
})

app.use(notFound)
app.use(errorHandler)

module.exports = app
