const express = require('express')
const router = express.Router()
const servicesController = require('../controllers/services.controller')
const { jwtAuth, requireRole } = require('../middleware/jwtAuth')
const { validate } = require('../middleware/zodValidator')
const { serviceSchema, uuidParamSchema } = require('../utils/validators')

router.get('/', servicesController.getAllServices)
router.get('/:id/slots', validate(uuidParamSchema, 'params'), servicesController.getAvailableSlots)
router.get('/:id', validate(uuidParamSchema, 'params'), servicesController.getService)
router.post('/', jwtAuth, requireRole('professional', 'admin'), validate(serviceSchema), servicesController.createService)
router.put('/:id', jwtAuth, requireRole('professional', 'admin'), validate(uuidParamSchema, 'params'), servicesController.updateService)

module.exports = router
