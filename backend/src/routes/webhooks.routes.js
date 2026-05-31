const express = require('express')
const router = express.Router()

router.post('/stripe', (req, res) => {
  res.json({ message: 'Stripe webhook endpoint' })
})

module.exports = router
