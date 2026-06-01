const express = require('express')
const router = express.Router()
const businessController = require('../controllers/business.controller')
const { authMiddleware } = require('../middleware/auth')
const { validateBusiness, validateBusinessId } = require('../middleware/validation')

router.get('/my', authMiddleware, businessController.getMyBusiness)
router.get('/:id', validateBusinessId, businessController.getBusiness)
router.get('/slug/:slug', businessController.getBusinessBySlug)
router.post('/', authMiddleware, validateBusiness, businessController.createBusiness)
router.put('/:id', authMiddleware, validateBusinessId, businessController.updateBusiness)

module.exports = router
