const fs = require('fs')
const path = require('path')
const multer = require('multer')

const MAX_UPLOAD_SIZE_MB = 100
const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const folder = req.uploadFolder || 'general'
    const entityPrefix = req.uploadEntity || 'shipment'
    const entityId =
      req.params.id ||
      req.body.shipment_id ||
      req.body.quotation_id ||
      'sin-registro'
    const destination = path.join(
      __dirname,
      '..',
      'uploads',
      folder,
      `${entityPrefix}-${entityId}`
    )
    ensureDir(destination)
    cb(null, destination)
  },
  filename(req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, '-')
    cb(null, `${Date.now()}-${safeName}`)
  },
})

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/xml',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
])

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.has(file.mimetype)) {
    return cb(null, true)
  }
  return cb(new Error('Tipo de archivo no permitido'))
}

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_UPLOAD_SIZE_BYTES,
    files: 4,
  },
})
