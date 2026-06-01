const express = require('express')
const router = express.Router()
const servicesController = require('../controllers/services.controller')
const { authMiddleware, requireRole } = require('../middleware/auth')
const { validateServiceId } = require('../middleware/validation')

router.get('/', servicesController.getAllServices)
router.get('/:id/slots', validateServiceId, servicesController.getAvailableSlots)
router.get('/:id', validateServiceId, servicesController.getService)
router.post('/', authMiddleware, requireRole(['professional', 'admin']), servicesController.createService)
router.put('/:id', authMiddleware, requireRole(['professional', 'admin']), validateServiceId, servicesController.updateService)

module.exports = router
