const jwt = require('jsonwebtoken')

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-change-in-production'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-in-production'
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m'
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  )
}

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      type: 'refresh'
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  )
}

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_SECRET)
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { expired: true }
    }
    return { invalid: true }
  }
}

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET)
  } catch (error) {
    return { invalid: true }
  }
}

const getRefreshTokenExpiryDate = () => {
  const ms = parseDurationToMs(REFRESH_EXPIRES_IN)
  return new Date(Date.now() + ms)
}

const parseDurationToMs = (duration) => {
  const match = duration.match(/^(\d+)([smhd])$/)
  if (!match) return 7 * 24 * 60 * 60 * 1000 // default 7 days

  const value = parseInt(match[1], 10)
  const unit = match[2]

  switch (unit) {
    case 's': return value * 1000
    case 'm': return value * 60 * 1000
    case 'h': return value * 60 * 60 * 1000
    case 'd': return value * 24 * 60 * 60 * 1000
    default: return 7 * 24 * 60 * 60 * 1000
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getRefreshTokenExpiryDate
}
