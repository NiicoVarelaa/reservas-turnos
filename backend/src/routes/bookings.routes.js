const express = require('express')
const router = express.Router()
const bookingsController = require('../controllers/bookings.controller')
const { validateBooking, validateAppointmentId } = require('../middleware/validation')

router.post('/', validateBooking, bookingsController.createBooking)
router.get('/:id', validateAppointmentId, bookingsController.getBooking)
router.post('/:id/cancel', validateAppointmentId, bookingsController.cancelBooking)

module.exports = router
