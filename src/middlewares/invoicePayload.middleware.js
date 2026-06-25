function normalizeNullableField(body, field) {
  if (!Object.prototype.hasOwnProperty.call(body, field)) return

  const value = body[field]
  if (value === '' || value === 'null' || value === 'undefined') {
    body[field] = null
  }
}

function normalizeArrayField(body, field) {
  if (!Object.prototype.hasOwnProperty.call(body, field)) return

  const value = body[field]
  if (Array.isArray(value)) {
    body[field] = value.filter(item => item !== '' && item != null).map(Number)
    return
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      body[field] = []
      return
    }

    try {
      const parsed = JSON.parse(trimmed)
      body[field] = Array.isArray(parsed)
        ? parsed.filter(item => item !== '' && item != null).map(Number)
        : []
      return
    } catch (error) {
      body[field] = trimmed
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
        .map(Number)
    }
  }
}

function normalizeInvoicePayload(req, res, next) {
  const body = req.body || {}

  ;[
    'payment_date',
    'invoice_date',
    'due_date',
    'pdf_url',
    'xml_url',
    'support_file_url',
    'customer_id',
    'vendor_id',
  ].forEach(field => normalizeNullableField(body, field))

  normalizeArrayField(body, 'sale_ids')
  normalizeArrayField(body, 'cost_ids')

  req.body = body
  next()
}

module.exports = {
  normalizeInvoicePayload,
}
