const express = require('express')
const router = express.Router()
const paymentsController = require('../controllers/payments.controller')

// Stripe webhook needs raw body for signature verification
router.post('/stripe',
  express.raw({ type: 'application/json' }),
  paymentsController.handleStripeWebhook
)

module.exports = router
