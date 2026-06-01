const express = require('express')
const router = express.Router()
const businessController = require('../controllers/business.controller')
const { authMiddleware } = require('../middleware/auth')

router.get('/my', authMiddleware, businessController.getMyBusiness)
router.get('/:id', businessController.getBusiness)
router.get('/slug/:slug', businessController.getBusinessBySlug)
router.post('/', authMiddleware, businessController.createBusiness)
router.put('/:id', authMiddleware, businessController.updateBusiness)

module.exports = router
