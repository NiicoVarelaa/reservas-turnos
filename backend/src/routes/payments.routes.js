const express = require('express')
const router = express.Router()
const paymentsController = require('../controllers/payments.controller')
const { validate } = require('../middleware/zodValidator')
const { paymentSessionSchema } = require('../utils/validators')

router.post('/create-session', validate(paymentSessionSchema), paymentsController.createCheckoutSession)

module.exports = router
