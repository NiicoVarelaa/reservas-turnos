const db = require('../services/database')
const whatsappService = require('../services/whatsapp')

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

      if (appointment.professional_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' })
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

      // Re-check for overlapping appointments when rescheduling
      if (updates.start_at || updates.end_at) {
        const startAt = updates.start_at || appointment.start_at
        const endAt = updates.end_at || appointment.end_at
        const overlapping = await db.checkAppointmentOverlap(
          appointment.professional_id,
          startAt,
          endAt,
          appointment.id
        )

        if (overlapping) {
          return res.status(409).json({ error: 'El horario seleccionado se superpone con otra reserva' })
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

      // Notify the client via WhatsApp (async, don't block response)
      whatsappService.sendCancellation(req.params.id)
        .then(() => console.log(`Cancellation WhatsApp sent for appointment: ${req.params.id}`))
        .catch(err => console.error(`Cancellation WhatsApp failed for appointment: ${req.params.id}`, err))

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
