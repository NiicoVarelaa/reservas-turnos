const express = require('express')
const router = express.Router()
const appointmentsController = require('../controllers/appointments.controller')
const { authMiddleware } = require('../middleware/auth')
const { validateAppointmentId } = require('../middleware/validation')

router.get('/', authMiddleware, appointmentsController.getAppointments)
router.get('/stats', authMiddleware, appointmentsController.getStats)
router.get('/:id', authMiddleware, validateAppointmentId, appointmentsController.getAppointment)
router.patch('/:id', authMiddleware, validateAppointmentId, appointmentsController.updateAppointment)
router.post('/:id/cancel', authMiddleware, validateAppointmentId, appointmentsController.cancelAppointment)

module.exports = router
