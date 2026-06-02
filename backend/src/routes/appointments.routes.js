const express = require('express')
const router = express.Router()
const appointmentsController = require('../controllers/appointments.controller')
const { jwtAuth } = require('../middleware/jwtAuth')
const { validate } = require('../middleware/zodValidator')
const { uuidParamSchema } = require('../utils/validators')

router.get('/', jwtAuth, appointmentsController.getAppointments)
router.get('/stats', jwtAuth, appointmentsController.getStats)
router.get('/:id', jwtAuth, validate(uuidParamSchema, 'params'), appointmentsController.getAppointment)
router.patch('/:id', jwtAuth, validate(uuidParamSchema, 'params'), appointmentsController.updateAppointment)
router.post('/:id/cancel', jwtAuth, validate(uuidParamSchema, 'params'), appointmentsController.cancelAppointment)

module.exports = router
