const db = require('../services/database')

class ServicesController {
  async getAllServices(req, res, next) {
    try {
      const { businessId, professionalId } = req.query
      const filters = {}
      if (businessId) filters.businessId = businessId
      if (professionalId) filters.professionalId = professionalId

      const services = await db.getServices(filters)
      res.json({ services })
    } catch (error) {
      next(error)
    }
  }

  async getService(req, res, next) {
    try {
      const service = await db.getService(req.params.id)
      res.json({ service })
    } catch (error) {
      next(error)
    }
  }

  async getAvailableSlots(req, res, next) {
    try {
      const { id } = req.params
      const { date } = req.query

      if (!date) {
        return res.status(400).json({ error: 'Date query parameter is required (YYYY-MM-DD)' })
      }

      const service = await db.getService(id)
      const slots = await db.getAvailableSlots(
        service.professional_id,
        date,
        service.duration_min
      )

      res.json({ slots, service })
    } catch (error) {
      next(error)
    }
  }

  async createService(req, res, next) {
    try {
      const business = await db.getBusinessByOwnerId(req.user.id)

      if (!business) {
        return res.status(400).json({ error: 'You must create a business first' })
      }

      const serviceData = {
        ...req.body,
        business_id: business.id,
        professional_id: req.user.id
      }

      const service = await db.createService(serviceData)
      res.status(201).json({ service })
    } catch (error) {
      next(error)
    }
  }

  async updateService(req, res, next) {
    try {
      const service = await db.getService(req.params.id)

      if (service.professional_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to update this service' })
      }

      const updated = await db.updateService(req.params.id, req.body)
      res.json({ service: updated })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new ServicesController()
