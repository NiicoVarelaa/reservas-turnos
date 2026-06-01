const db = require('../services/database')

class BusinessController {
  async createBusiness(req, res, next) {
    try {
      const businessData = {
        ...req.body,
        owner_id: req.user.id
      }

      const business = await db.createBusiness(businessData)

      await db.updateProfile(req.user.id, {
        onboarding_completed: true
      })

      res.status(201).json({ business })
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Este slug ya está en uso' })
      }
      next(error)
    }
  }

  async getBusiness(req, res, next) {
    try {
      const business = await db.getBusiness(req.params.id)

      if (!business) {
        return res.status(404).json({ error: 'Business not found' })
      }

      res.json({ business })
    } catch (error) {
      next(error)
    }
  }

  async getBusinessBySlug(req, res, next) {
    try {
      const business = await db.getBusinessBySlug(req.params.slug)

      if (!business) {
        return res.status(404).json({ error: 'Business not found' })
      }

      res.json({ business })
    } catch (error) {
      next(error)
    }
  }

  async updateBusiness(req, res, next) {
    try {
      const business = await db.getBusiness(req.params.id)

      if (business.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' })
      }

      const updated = await db.updateBusiness(req.params.id, req.body)
      res.json({ business: updated })
    } catch (error) {
      next(error)
    }
  }

  async getMyBusiness(req, res, next) {
    try {
      const business = await db.getBusinessByOwnerId(req.user.id)

      if (!business) {
        return res.status(404).json({ error: 'No business found' })
      }

      res.json({ business })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new BusinessController()
