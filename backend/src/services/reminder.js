const db = require('./database')
const whatsappService = require('./whatsapp')

class ReminderService {
  async sendRemindersForUpcomingAppointments() {
    console.log('[ReminderService] Checking for upcoming appointments...')

    try {
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      const tomorrowEnd = new Date(tomorrow)
      tomorrowEnd.setHours(23, 59, 59, 999)

      const appointments = await db.getAppointments({
        status: 'paid',
        startDate: now.toISOString(),
        endDate: tomorrowEnd.toISOString()
      })

      if (!appointments || appointments.length === 0) {
        console.log('[ReminderService] No upcoming appointments found')
        return
      }

      console.log(`[ReminderService] Found ${appointments.length} upcoming appointments`)

      for (const appointment of appointments) {
        const appointmentDate = new Date(appointment.start_at)
        const hoursUntilAppointment = (appointmentDate - now) / (1000 * 60 * 60)

        if (hoursUntilAppointment <= 24 && hoursUntilAppointment > 0) {
          const existingReminder = await this.hasReminderSent(appointment.id)

          if (!existingReminder) {
            console.log(`[ReminderService] Sending reminder for appointment ${appointment.id}`)
            await whatsappService.sendReminder(appointment.id)
          } else {
            console.log(`[ReminderService] Reminder already sent for appointment ${appointment.id}`)
          }
        }
      }

      console.log('[ReminderService] Reminder check completed')
    } catch (error) {
      console.error('[ReminderService] Error:', error)
    }
  }

  async hasReminderSent(appointmentId) {
    try {
      const notifications = await db.getAppointments({})

      const { supabaseAdmin } = require('../config/supabase')
      const { data } = await supabaseAdmin
        .from('notifications')
        .select('id')
        .eq('appointment_id', appointmentId)
        .eq('type', 'reminder')
        .eq('status', 'sent')
        .single()

      return !!data
    } catch {
      return false
    }
  }

  start(intervalMinutes = 30) {
    console.log(`[ReminderService] Starting reminder scheduler (every ${intervalMinutes} minutes)`)

    this.sendRemindersForUpcomingAppointments()

    setInterval(() => {
      this.sendRemindersForUpcomingAppointments()
    }, intervalMinutes * 60 * 1000)
  }
}

module.exports = new ReminderService()
