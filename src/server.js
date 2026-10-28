const { sequelize, setDatabaseStatus } = require('./config/db')
const app = require('./app')

const PORT = process.env.PORT
const DB_CONNECT_RETRIES = Number(process.env.DB_CONNECT_RETRIES || 0)
const DB_RETRY_BASE_DELAY_MS = Number(process.env.DB_RETRY_BASE_DELAY_MS || 2000)
const DB_RETRY_MAX_DELAY_MS = Number(process.env.DB_RETRY_MAX_DELAY_MS || 30000)
const DB_HEALTHCHECK_INTERVAL_MS = Number(
  process.env.DB_HEALTHCHECK_INTERVAL_MS || 30000,
)

if (!PORT) {
  console.error('La variable de entorno PORT no está definida en .env')
  process.exit(1)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getRetryDelay(attempt) {
  const exponentialDelay = DB_RETRY_BASE_DELAY_MS * 2 ** Math.min(attempt - 1, 5)
  return Math.min(exponentialDelay, DB_RETRY_MAX_DELAY_MS)
}

function shouldKeepRetrying(attempt) {
  return DB_CONNECT_RETRIES === 0 || attempt < DB_CONNECT_RETRIES
}

async function connectDatabaseWithRetry() {
  let attempt = 0

  while (true) {
    attempt += 1

    try {
      await sequelize.authenticate()
      setDatabaseStatus({ connected: true })
      console.log('Conexión a la base de datos establecida.')
      return
    } catch (error) {
      setDatabaseStatus({ connected: false, error })
      console.error(
        `Error al conectar a la base de datos (intento ${attempt}):`,
        error.message,
      )

      if (!shouldKeepRetrying(attempt)) {
        console.error(
          'No fue posible conectar a la base de datos después de los reintentos configurados.',
        )
        return
      }

      await sleep(getRetryDelay(attempt))
    }
  }
}

async function monitorDatabaseConnection() {
  while (true) {
    await sleep(DB_HEALTHCHECK_INTERVAL_MS)

    try {
      await sequelize.authenticate()
      setDatabaseStatus({ connected: true })
    } catch (error) {
      setDatabaseStatus({ connected: false, error })
      console.error('Conexión a la base de datos no disponible:', error.message)
      await connectDatabaseWithRetry()
    }
  }
}

const startServer = () => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`)
  })

  connectDatabaseWithRetry()
    .then(() => monitorDatabaseConnection())
    .catch(error => {
      setDatabaseStatus({ connected: false, error })
      console.error('Error inesperado en el monitor de base de datos:', error)
    })

  const shutdown = async signal => {
    console.log(`Recibida señal ${signal}. Cerrando servidor...`)
    server.close(async () => {
      try {
        await sequelize.close()
      } catch (error) {
        console.error('Error cerrando conexión de base de datos:', error.message)
      } finally {
        process.exit(0)
      }
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

startServer()
