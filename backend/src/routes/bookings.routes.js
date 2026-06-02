const express = require('express')
const router = express.Router()
const bookingsController = require('../controllers/bookings.controller')
const { validate } = require('../middleware/zodValidator')
const { bookingSchema, uuidParamSchema } = require('../utils/validators')

router.post('/', validate(bookingSchema), bookingsController.createBooking)
router.get('/:id', validate(uuidParamSchema, 'params'), bookingsController.getBooking)
router.post('/:id/cancel', validate(uuidParamSchema, 'params'), bookingsController.cancelBooking)

module.exports = router
