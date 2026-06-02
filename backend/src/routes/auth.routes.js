const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const { jwtAuth } = require('../middleware/jwtAuth')
const { validate } = require('../middleware/zodValidator')
const { registerSchema, loginSchema, refreshTokenSchema, profileUpdateSchema } = require('../utils/validators')

// Public routes
router.post('/register', validate(registerSchema), authController.register)
router.post('/login', validate(loginSchema), authController.login)
router.post('/refresh', validate(refreshTokenSchema), authController.refresh)
router.post('/logout', authController.logout)

// Protected routes
router.get('/profile', jwtAuth, authController.getProfile)
router.put('/profile', jwtAuth, validate(profileUpdateSchema, 'body'), authController.updateProfile)

module.exports = router
