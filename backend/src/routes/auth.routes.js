const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const { jwtAuth } = require('../middleware/jwtAuth')
const { validate } = require('../middleware/zodValidator')
const { authLimiter, sensitiveLimiter } = require('../middleware/rateLimiter')
const { registerSchema, loginSchema, refreshTokenSchema, profileUpdateSchema } = require('../utils/validators')

// Public routes (rate limited to prevent brute-force / abuse)
router.post('/register', authLimiter, validate(registerSchema), authController.register)
router.post('/login', authLimiter, validate(loginSchema), authController.login)
router.post('/google', authLimiter, authController.google)
router.post('/refresh', authLimiter, validate(refreshTokenSchema), authController.refresh)
router.post('/logout', authController.logout)

// Protected routes
router.get('/profile', jwtAuth, authController.getProfile)
router.put('/profile', jwtAuth, validate(profileUpdateSchema, 'body'), authController.updateProfile)

module.exports = router
