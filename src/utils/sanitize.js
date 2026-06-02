const sanitizeHtml = require('sanitize-html')

/**
 * Limpia una cadena de texto individual
 * - Elimina etiquetas HTML y scripts
 * - Aplica trim para quitar espacios extra
 */
const sanitizeInput = value => {
  if (typeof value === 'string') {
    return sanitizeHtml(value.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    })
  }
  return value
}

/**
 * Sanitiza todos los campos de un objeto plano
 * Ideal para limpiar datos recibidos por POST o PUT
 */
const sanitizeObject = obj => {
  if (typeof obj !== 'object' || obj === null) return obj

  const sanitized = {}
  for (const key in obj) {
    sanitized[key] = sanitizeInput(obj[key])
  }
  return sanitized
}

module.exports = {
  sanitizeInput,
  sanitizeObject,
}
