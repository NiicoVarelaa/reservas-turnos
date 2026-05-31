const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.json({ message: 'Get services' })
})

router.get('/:id/slots', (req, res) => {
  res.json({ message: 'Get available slots for service' })
})

module.exports = router
