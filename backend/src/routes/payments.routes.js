const express = require('express')
const router = express.Router()

router.post('/create-session', (req, res) => {
  res.json({ message: 'Create Stripe checkout session' })
})

module.exports = router
