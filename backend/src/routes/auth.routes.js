const express = require('express')
const router = express.Router()

router.post('/verify', (req, res) => {
  res.json({ message: 'Auth verify endpoint' })
})

module.exports = router
