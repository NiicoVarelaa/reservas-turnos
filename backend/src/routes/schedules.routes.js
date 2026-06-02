const express = require('express')
const router = express.Router()
const db = require('../services/database')
const { jwtAuth } = require('../middleware/jwtAuth')
const { validate } = require('../middleware/zodValidator')
const { scheduleSchema } = require('../utils/validators')

router.post('/', jwtAuth, validate(scheduleSchema), async (req, res, next) => {
  try {
    const business = await db.getBusinessByOwnerId(req.user.id)

    if (!business) {
      return res.status(400).json({ error: 'You must create a business first' })
    }

    const scheduleData = {
      ...req.validatedData,
      business_id: business.id,
      professional_id: req.user.id
    }

    const schedule = await db.upsertSchedule(scheduleData)
    res.status(201).json({ schedule })
  } catch (error) {
    next(error)
  }
})

router.get('/', jwtAuth, async (req, res, next) => {
  try {
    const business = await db.getBusinessByOwnerId(req.user.id)

    if (!business) {
      return res.status(404).json({ error: 'Business not found' })
    }

    const schedules = await db.getSchedules(business.id, req.user.id)
    res.json({ schedules })
  } catch (error) {
    next(error)
  }
})

module.exports = router
