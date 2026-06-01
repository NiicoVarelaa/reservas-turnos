const db = require('../services/database')

class AppointmentsController {
  async getAppointments(req, res, next) {
    try {
      const filters = {
        professionalId: req.user.id,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      }

      const appointments = await db.getAppointments(filters)
      res.json({ appointments })
    } catch (error) {
      next(error)
    }
  }

  async getAppointment(req, res, next) {
    try {
      const appointment = await db.getAppointment(req.params.id)

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' })
      }

      res.json({ appointment })
    } catch (error) {
      next(error)
    }
  }

  async updateAppointment(req, res, next) {
    try {
      const appointment = await db.getAppointment(req.params.id)

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' })
      }

      if (appointment.professional_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' })
      }

      const allowedUpdates = ['status', 'notes', 'start_at', 'end_at']
      const updates = {}

      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key]
        }
      }

      const updated = await db.updateAppointment(req.params.id, updates)
      res.json({ appointment: updated })
    } catch (error) {
      next(error)
    }
  }

  async cancelAppointment(req, res, next) {
    try {
      const appointment = await db.getAppointment(req.params.id)

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' })
      }

      if (appointment.professional_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' })
      }

      const cancelled = await db.cancelAppointment(req.params.id)
      res.json({ appointment: cancelled })
    } catch (error) {
      next(error)
    }
  }

  async getStats(req, res, next) {
    try {
      const appointments = await db.getAppointments({
        professionalId: req.user.id
      })

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const stats = {
        total: appointments.length,
        today: appointments.filter(a => new Date(a.start_at) >= today).length,
        pending: appointments.filter(a => a.status === 'pending').length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
        paid: appointments.filter(a => a.status === 'paid').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
      }

      res.json({ stats })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new AppointmentsController()
