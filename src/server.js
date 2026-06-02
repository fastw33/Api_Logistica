const { sequelize } = require('./config/db')
const app = require('./app')

const PORT = process.env.PORT

if (!PORT) {
  console.error('La variable de entorno PORT no está definida en .env')
  process.exit(1)
}

const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log('Conexión a la base de datos establecida.')

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`)
    })
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error)
    process.exit(1)
  }
}

startServer()
