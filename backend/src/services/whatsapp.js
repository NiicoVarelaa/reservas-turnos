const { sendWhatsAppMessage } = require('../config/whatsapp')
const db = require('../services/database')

class WhatsAppService {
  async sendConfirmation(appointmentId) {
    try {
      const appointment = await db.getAppointment(appointmentId)

      if (!appointment) {
        throw new Error(`Appointment ${appointmentId} not found`)
      }

      const startDate = new Date(appointment.start_at)
      const formattedDate = startDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      const formattedTime = startDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })

      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: appointment.client_name },
            { type: 'text', text: formattedDate },
            { type: 'text', text: formattedTime },
            { type: 'text', text: appointment.services.name }
          ]
        }
      ]

      const result = await sendWhatsAppMessage(
        appointment.client_phone,
        'confirmacion_reserva',
        'es',
        components
      )

      await db.createNotification({
        appointment_id: appointmentId,
        type: 'confirmation',
        channel: 'whatsapp',
        status: 'sent',
        sent_at: new Date().toISOString()
      })

      console.log(`Confirmation sent to ${appointment.client_phone}`)
      return result
    } catch (error) {
      console.error('Failed to send confirmation:', error)

      await db.createNotification({
        appointment_id: appointmentId,
        type: 'confirmation',
        channel: 'whatsapp',
        status: 'failed'
      })

      throw error
    }
  }

  async sendReminder(appointmentId) {
    try {
      const appointment = await db.getAppointment(appointmentId)

      if (!appointment) {
        throw new Error(`Appointment ${appointmentId} not found`)
      }

      const startDate = new Date(appointment.start_at)
      const formattedDate = startDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      const formattedTime = startDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })

      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: appointment.client_name },
            { type: 'text', text: formattedDate },
            { type: 'text', text: formattedTime },
            { type: 'text', text: appointment.services.name }
          ]
        }
      ]

      const result = await sendWhatsAppMessage(
        appointment.client_phone,
        'recordatorio_reserva',
        'es',
        components
      )

      await db.createNotification({
        appointment_id: appointmentId,
        type: 'reminder',
        channel: 'whatsapp',
        status: 'sent',
        sent_at: new Date().toISOString()
      })

      console.log(`Reminder sent to ${appointment.client_phone}`)
      return result
    } catch (error) {
      console.error('Failed to send reminder:', error)
      throw error
    }
  }

  async sendCancellation(appointmentId) {
    try {
      const appointment = await db.getAppointment(appointmentId)

      if (!appointment) {
        throw new Error(`Appointment ${appointmentId} not found`)
      }

      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: appointment.client_name },
            { type: 'text', text: appointment.services.name }
          ]
        }
      ]

      const result = await sendWhatsAppMessage(
        appointment.client_phone,
        'cancelacion_reserva',
        'es',
        components
      )

      await db.createNotification({
        appointment_id: appointmentId,
        type: 'cancellation',
        channel: 'whatsapp',
        status: 'sent',
        sent_at: new Date().toISOString()
      })

      console.log(`Cancellation sent to ${appointment.client_phone}`)
      return result
    } catch (error) {
      console.error('Failed to send cancellation:', error)
      throw error
    }
  }
}

module.exports = new WhatsAppService()
