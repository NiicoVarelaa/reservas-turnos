const bcrypt = require('bcryptjs')
const db = require('../services/database')
const { supabaseAdmin } = require('../config/supabase')
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, getRefreshTokenExpiryDate } = require('../utils/jwt')
const { registerSchema, loginSchema, refreshTokenSchema } = require('../utils/validators')

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, full_name, phone } = req.validatedData

      // Check if user already exists
      const existing = await db.getUserByEmail(email)
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' })
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12)

      // Create user
      const user = await db.createUser({
        email,
        passwordHash,
        full_name,
        phone,
        role: 'client'
      })

      // Generate tokens
      const accessToken = generateAccessToken(user)
      const refreshToken = generateRefreshToken(user)

      // Store refresh token
      await db.createRefreshToken(user.id, refreshToken, getRefreshTokenExpiryDate())

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        },
        accessToken,
        refreshToken
      })
    } catch (error) {
      next(error)
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.validatedData

      // Find user
      const user = await db.getUserByEmail(email)
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }
      if (!user.password_hash) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash)
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }

      // Generate tokens
      const accessToken = generateAccessToken(user)
      const refreshToken = generateRefreshToken(user)

      // Store refresh token
      await db.createRefreshToken(user.id, refreshToken, getRefreshTokenExpiryDate())

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        },
        accessToken,
        refreshToken
      })
    } catch (error) {
      next(error)
    }
  }

  async google(req, res, next) {
    try {
      const { providerToken, role = 'client' } = req.body

      if (!providerToken) {
        return res.status(400).json({ error: 'providerToken is required' })
      }

      // Verify the Supabase session and get the identity
      let userData
      try {
        const { data: session, error: sessionError } = await supabaseAdmin.auth.getUser(providerToken)
        if (sessionError || !session?.user) {
          return res.status(401).json({ error: 'Invalid Google session' })
        }
        userData = session.user
      } catch (err) {
        return res.status(401).json({ error: 'Invalid Google session' })
      }

      const email = userData.email
      const fullName = userData.user_metadata?.full_name || userData.user_metadata?.name || email?.split('@')[0]
      const avatarUrl = userData.user_metadata?.avatar_url || userData.user_metadata?.picture || null
      const googleId = userData.identities?.find(i => i.provider === 'google')?.id || userData.id

      // Find or create the user in the custom users table
      const user = await db.getOrCreateGoogleUser({
        id: userData.id,
        email,
        fullName,
        avatarUrl,
        googleId,
        role
      })

      if (!user || !user.is_active) {
        return res.status(401).json({ error: 'User not found or inactive' })
      }

      // Generate our own JWT tokens (same as email login)
      const accessToken = generateAccessToken(user)
      const refreshToken = generateRefreshToken(user)
      await db.createRefreshToken(user.id, refreshToken, getRefreshTokenExpiryDate())

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        },
        accessToken,
        refreshToken
      })
    } catch (error) {
      next(error)
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken: token } = req.validatedData

      // Verify refresh token
      const decoded = verifyRefreshToken(token)
      if (decoded.invalid) {
        return res.status(401).json({ error: 'Invalid refresh token' })
      }

      // Check if token exists in DB and is not revoked
      const storedToken = await db.getRefreshToken(token)
      if (!storedToken) {
        return res.status(401).json({ error: 'Refresh token not found or revoked' })
      }

      // Get user
      const user = await db.getUserById(decoded.id)
      if (!user || !user.is_active) {
        return res.status(401).json({ error: 'User not found or inactive' })
      }

      // Revoke old refresh token
      await db.revokeRefreshToken(token)

      // Generate new tokens
      const newAccessToken = generateAccessToken(user)
      const newRefreshToken = generateRefreshToken(user)

      // Store new refresh token
      await db.createRefreshToken(user.id, newRefreshToken, getRefreshTokenExpiryDate())

      res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      })
    } catch (error) {
      next(error)
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken: token } = req.body

      if (token) {
        await db.revokeRefreshToken(token)
      }

      res.json({ message: 'Logged out successfully' })
    } catch (error) {
      next(error)
    }
  }

  async getProfile(req, res, next) {
    try {
      const profile = await db.getProfile(req.user.id)
      res.json({
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          profile
        }
      })
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
