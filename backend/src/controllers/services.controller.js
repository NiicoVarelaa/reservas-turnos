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

  async getServiceProfessionals(req, res, next) {
    try {
      const professionals = await db.getServiceProfessionals(req.params.id)
      res.json({ professionals })
    } catch (error) {
      next(error)
    }
  }

  async getAvailableSlots(req, res, next) {
    try {
      const { id } = req.params
      const { date, professionalId } = req.validatedData

      const service = await db.getService(id)
      const professionals = await db.getServiceProfessionals(id)

      if (!professionals.some(p => p.professional_id === professionalId)) {
        return res.status(400).json({ error: 'Ese profesional no atiende este servicio' })
      }

      const slots = await db.getAvailableSlots(
        professionalId,
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

      const { professional_ids, ...rest } = req.validatedData
      const serviceData = {
        ...rest,
        business_id: business.id,
        professional_id: req.user.id
      }

      const service = await db.createService(serviceData)
      const ids = professional_ids && professional_ids.length
        ? professional_ids
        : [req.user.id]
      await db.setServiceProfessionals(service.id, ids)

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

      const { professional_ids, ...rest } = req.body
      const updated = await db.updateService(req.params.id, rest)
      if (professional_ids && Array.isArray(professional_ids)) {
        await db.setServiceProfessionals(req.params.id, professional_ids)
      }
      res.json({ service: updated })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new ServicesController()
