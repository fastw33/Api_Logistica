const { createLogger, format, transports } = require('winston')
const path = require('path')

// Configurar timestamp con zona horaria de Bogotá
const timestampBogota = format.timestamp({
  format: () =>
    new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
})

const logger = createLogger({
  level: 'info',
  format: format.combine(
    timestampBogota, // ⏰ Hora en Bogotá
    format.json() // 📄 Formato JSON
  ),
  transports: [
    new transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
    }),
    new transports.File({
      filename: path.join(__dirname, '../../logs/actions.log'),
    }),
    new transports.Console(), // Útil para desarrollo
  ],
})

module.exports = logger
