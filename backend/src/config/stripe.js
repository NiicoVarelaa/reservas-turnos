const Stripe = require('stripe')

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing Stripe secret key')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia'
})

module.exports = { stripe }
