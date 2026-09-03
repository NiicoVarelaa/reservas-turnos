const express = require('express')
const router = express.Router()
const servicesController = require('../controllers/services.controller')
const { jwtAuth, requireRole } = require('../middleware/jwtAuth')
const { validate } = require('../middleware/zodValidator')
const { serviceSchema, uuidParamSchema, slotsQuerySchema } = require('../utils/validators')

router.get('/', servicesController.getAllServices)
router.get('/:id/professionals', validate(uuidParamSchema, 'params'), servicesController.getServiceProfessionals)
router.get('/:id/slots', validate(uuidParamSchema, 'params'), validate(slotsQuerySchema, 'query'), servicesController.getAvailableSlots)
router.get('/:id', validate(uuidParamSchema, 'params'), servicesController.getService)
router.post('/', jwtAuth, requireRole('professional', 'admin'), validate(serviceSchema), servicesController.createService)
router.put('/:id', jwtAuth, requireRole('professional', 'admin'), validate(uuidParamSchema, 'params'), servicesController.updateService)
router.delete('/:id', jwtAuth, requireRole('professional', 'admin'), validate(uuidParamSchema, 'params'), servicesController.deleteService)

module.exports = router
