const { verifyAccessToken } = require('../utils/jwt')
const db = require('../services/database')

const jwtAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyAccessToken(token)

    if (decoded.invalid) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    if (decoded.expired) {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' })
    }

    // Verify user still exists and is active
    const user = await db.getUserById(decoded.id)

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User not found or inactive' })
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    }

    next()
  } catch (error) {
    console.error('JWT auth error:', error)
    res.status(401).json({ error: 'Authentication failed' })
  }
}

const optionalJwt = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = verifyAccessToken(token)

      if (!decoded.invalid && !decoded.expired) {
        const user = await db.getUserById(decoded.id)
        if (user && user.is_active) {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role
          }
        }
      }
    }

    next()
  } catch (error) {
    next()
  }
}

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    next()
  }
}

module.exports = { jwtAuth, optionalJwt, requireRole }
