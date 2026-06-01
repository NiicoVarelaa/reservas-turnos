const { supabaseAdmin } = require('../config/supabase')
const db = require('../services/database')

class AuthController {
  async verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' })
      }

      const token = authHeader.split(' ')[1]

      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      const profile = await db.getProfile(user.id)

      res.json({
        user: {
          id: user.id,
          email: user.email,
          profile
        }
      })
    } catch (error) {
      next(error)
    }
  }

  async getProfile(req, res, next) {
    try {
      const profile = await db.getProfile(req.user.id)
      res.json({ profile })
    } catch (error) {
      next(error)
    }
  }

  async updateProfile(req, res, next) {
    try {
      const allowedUpdates = ['full_name', 'phone', 'avatar_url', 'bio']
      const updates = {}

      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key]
        }
      }

      const profile = await db.updateProfile(req.user.id, updates)
      res.json({ profile })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new AuthController()
