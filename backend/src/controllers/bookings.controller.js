const db = require('../services/database')

class BookingsController {
  async createBooking(req, res, next) {
    try {
      const {
        serviceId,
        professionalId,
        date,
        startTime,
        endTime,
        clientName,
        clientEmail,
        clientPhone,
        notes
      } = req.body

      // Get service to find the business
      const service = await db.getService(serviceId)

      // Check for overlapping appointments
      const startAt = new Date(`${date}T${startTime}:00`)
      const endAt = new Date(`${date}T${endTime}:00`)

      const hasOverlap = await db.checkAppointmentOverlap(
        professionalId,
        startAt.toISOString(),
        endAt.toISOString()
      )

      if (hasOverlap) {
        return res.status(409).json({
          error: 'This time slot is already booked'
        })
      }

      const appointmentData = {
        business_id: service.business_id,
        service_id: serviceId,
        professional_id: professionalId,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        status: 'pending',
        notes: notes || null
      }

      const appointment = await db.createAppointment(appointmentData)

      res.status(201).json({
        message: 'Booking created successfully',
        appointment
      })
    } catch (error) {
      next(error)
    }
  }

  async getBooking(req, res, next) {
    try {
      const appointment = await db.getAppointment(req.params.id)

      if (!appointment) {
        return res.status(404).json({ error: 'Booking not found' })
      }

      res.json({ appointment })
    } catch (error) {
      next(error)
    }
  }

  async cancelBooking(req, res, next) {
    try {
      const appointment = await db.getAppointment(req.params.id)

      if (!appointment) {
        return res.status(404).json({ error: 'Booking not found' })
      }

      if (appointment.status === 'cancelled') {
        return res.status(400).json({ error: 'Booking is already cancelled' })
      }

      if (appointment.status === 'paid') {
        return res.status(400).json({
          error: 'Paid bookings cannot be cancelled. Please contact support for refunds.'
        })
      }

      const cancelled = await db.cancelAppointment(req.params.id)

      res.json({
        message: 'Booking cancelled successfully',
        appointment: cancelled
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new BookingsController()
