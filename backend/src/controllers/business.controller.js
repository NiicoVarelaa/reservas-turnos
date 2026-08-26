const db = require('../services/database')
const AppError = require('../utils/AppError')

const slotCache = new Map()
function cacheGet(key) { const e = slotCache.get(key); if (!e || Date.now() > e.exp) { slotCache.delete(key); return undefined } return e.val }
function cacheSet(key, val, ttl) { slotCache.set(key, { val, exp: Date.now() + ttl * 1000 }) }

class BusinessController {
  async createBusiness(req, res, next) {
    try {
      const existingBusiness = await db.getBusinessByOwnerId(req.user.id)

      if (existingBusiness) {
        throw AppError.conflict('You already have a business. Update it instead.')
      }

      const businessData = {
        ...req.validatedData,
        owner_id: req.user.id
      }

      const business = await db.createBusiness(businessData)

      await db.updateProfile(req.user.id, {
        onboarding_completed: true
      })

      res.status(201).json({ business })
    } catch (error) {
      next(error)
    }
  }

  async getBusiness(req, res, next) {
    try {
      const business = await db.getBusiness(req.params.id)

      if (!business) {
        throw AppError.notFound('Business not found')
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
        throw AppError.notFound('Business not found')
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
        throw AppError.forbidden('Not authorized to update this business')
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
        throw AppError.notFound('No business found. Complete onboarding first.')
      }

      res.json({ business })
    } catch (error) {
      next(error)
    }
  }

  async getNextAvailableSlot(req, res, next) {
    try {
      const { id } = req.params
      const cacheKey = `next-slot:${id}`
      const cached = cacheGet(cacheKey)
      if (cached) return res.json(cached)

      const slot = await db.getNextAvailableSlot(id)
      const result = { slot }
      cacheSet(cacheKey, result, 60)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new BusinessController()
