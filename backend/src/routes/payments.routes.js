const express = require('express')
const router = express.Router()
const paymentsController = require('../controllers/payments.controller')
const { validatePaymentSession } = require('../middleware/validation')

router.post('/create-session', validatePaymentSession, paymentsController.createCheckoutSession)

module.exports = router
