const jwt = require('jsonwebtoken')
const jwtConfig = require('../config/jwt')

const authMiddleware = (req, res, next) => {
  const internalServiceKey = String(process.env.INTERNAL_SERVICE_KEY || '').trim()
  const incomingInternalKey = String(
    req.headers['x-internal-service-key'] || ''
  ).trim()

  if (
    internalServiceKey &&
    incomingInternalKey &&
    incomingInternalKey === internalServiceKey
  ) {
    req.usuario = {
      internal_service: true,
      id_usuario: null,
      id_personal: null,
      permisos: {},
    }
    req.personal = null
    return next()
  }

  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, jwtConfig.secret)
    req.usuario = {
      ...decoded,
      id_usuario: decoded?.id_usuario || decoded?.id || null,
      id_personal:
        decoded?.id_personal || decoded?.personal?.id_personal || null,
      permisos: decoded?.permisos || {},
    }
    req.personal = decoded?.personal || null
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' })
  }
}

module.exports = authMiddleware
