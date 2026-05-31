const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.json({ message: 'Get appointments' })
})

router.patch('/:id', (req, res) => {
  res.json({ message: 'Update appointment' })
})

module.exports = router
