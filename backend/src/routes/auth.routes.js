const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const { authMiddleware } = require('../middleware/auth')

router.post('/verify', authController.verifyToken)
router.get('/profile', authMiddleware, authController.getProfile)
router.put('/profile', authMiddleware, authController.updateProfile)

module.exports = router
