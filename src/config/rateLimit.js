const rateLimit = require('express-rate-limit')

function parseWindow(value = '15m') {
  const match = /^(\d+)(ms|s|m|h)$/.exec(String(value).trim())
  const amount = Number(match?.[1] || 15)
  const unit = match?.[2] || 'm'
  const multipliers = { ms: 1, s: 1000, m: 60000, h: 3600000 }

  return amount * multipliers[unit]
}

const limiter = rateLimit({
  windowMs: parseWindow(process.env.RATE_LIMIT_WINDOW),
  max: Number(process.env.RATE_LIMIT_MAX || 600),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas peticiones, intenta más tarde.' },
})

module.exports = limiter
