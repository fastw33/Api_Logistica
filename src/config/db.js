const { Sequelize, DataTypes } = require('sequelize')
require('dotenv').config()

const databaseStatus = {
  connected: false,
  lastConnectedAt: null,
  lastError: null,
}

function setDatabaseStatus({ connected, error = null }) {
  databaseStatus.connected = connected
  databaseStatus.lastConnectedAt = connected
    ? new Date().toISOString()
    : databaseStatus.lastConnectedAt
  databaseStatus.lastError = error
    ? {
        name: error.name,
        code: error.parent?.code || error.original?.code || error.code || null,
        message: error.message,
        at: new Date().toISOString(),
      }
    : null
}

function getDatabaseStatus() {
  return { ...databaseStatus }
}

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
    pool: {
      max: Number(process.env.DB_POOL_MAX || 10),
      min: Number(process.env.DB_POOL_MIN || 0),
      acquire: Number(process.env.DB_POOL_ACQUIRE_MS || 30000),
      idle: Number(process.env.DB_POOL_IDLE_MS || 10000),
      evict: Number(process.env.DB_POOL_EVICT_MS || 10000),
    },
    dialectOptions: {
      connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT_MS || 10000),
    },
    retry: {
      max: Number(process.env.DB_QUERY_RETRIES || 2),
      match: [
        /Deadlock/i,
        /ETIMEDOUT/i,
        /ECONNRESET/i,
        /ECONNREFUSED/i,
        /PROTOCOL_CONNECTION_LOST/i,
      ],
    },
    timezone: '-05:00', // Ajuste para hora de Bogotá
    define: {
      timestamps: false, // Evita createdAt / updatedAt automáticos
    },
  }
)

// Exportar sequelize y DataTypes
module.exports = {
  sequelize,
  DataTypes,
  getDatabaseStatus,
  setDatabaseStatus,
}
