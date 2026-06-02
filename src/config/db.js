const { Sequelize, DataTypes } = require('sequelize')
require('dotenv').config()

// Crear instancia de Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false,
    timezone: '-05:00', // Ajuste para hora de Bogotá
    define: {
      timestamps: false, // Evita createdAt / updatedAt automáticos
    },
  }
)

// Exportar sequelize y DataTypes
module.exports = { sequelize, DataTypes }
