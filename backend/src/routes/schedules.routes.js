const express = require('express')
const router = express.Router()
const db = require('../services/database')
const { jwtAuth } = require('../middleware/jwtAuth')
const { validate } = require('../middleware/zodValidator')
const { scheduleSchema, uuidParamSchema } = require('../utils/validators')

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

router.delete('/:id', jwtAuth, validate(uuidParamSchema, 'params'), async (req, res, next) => {
  try {
    const business = await db.getBusinessByOwnerId(req.user.id)

    if (!business) {
      return res.status(404).json({ error: 'Business not found' })
    }

    const schedule = await db.getSchedules(business.id, req.user.id)
    const owned = schedule.find(s => s.id === req.params.id)

    if (!owned) {
      return res.status(403).json({ error: 'Not authorized to delete this schedule' })
    }

    await db.deleteSchedule(req.params.id)
    res.json({ message: 'Schedule deleted successfully' })
  } catch (error) {
    next(error)
  }
})

module.exports = router
