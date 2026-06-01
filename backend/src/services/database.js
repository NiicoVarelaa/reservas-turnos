const { supabaseAdmin } = require('../config/supabase')

class DatabaseService {
  // ==========================================
  // PROFILES
  // ==========================================
  async getProfile(userId) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  }

  async updateProfile(userId, updates) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ==========================================
  // BUSINESSES
  // ==========================================
  async createBusiness(businessData) {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .insert(businessData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getBusiness(businessId) {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()

    if (error) throw error
    return data
  }

  async getBusinessBySlug(slug) {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) return null
    return data
  }

  async getBusinessByOwnerId(ownerId) {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('owner_id', ownerId)
      .single()

    if (error) return null
    return data
  }

  async updateBusiness(businessId, updates) {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .update(updates)
      .eq('id', businessId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ==========================================
  // SERVICES
  // ==========================================
  async getServices(filters = {}) {
    let query = supabaseAdmin
      .from('services')
      .select('*, businesses(name, slug, logo_url, primary_color)')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (filters.businessId) {
      query = query.eq('business_id', filters.businessId)
    }
    if (filters.professionalId) {
      query = query.eq('professional_id', filters.professionalId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  async getService(serviceId) {
    const { data, error } = await supabaseAdmin
      .from('services')
      .select(`
        *,
        businesses(name, slug, logo_url, primary_color, secondary_color, currency, timezone, whatsapp_number)
      `)
      .eq('id', serviceId)
      .single()

    if (error) throw error
    return data
  }

  async createService(serviceData) {
    const { data, error } = await supabaseAdmin
      .from('services')
      .insert(serviceData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateService(serviceId, updates) {
    const { data, error } = await supabaseAdmin
      .from('services')
      .update(updates)
      .eq('id', serviceId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ==========================================
  // SCHEDULES
  // ==========================================
  async getSchedules(businessId, professionalId) {
    let query = supabaseAdmin
      .from('schedules')
      .select('*')
      .eq('is_active', true)
      .order('day_of_week', { ascending: true })

    if (businessId) {
      query = query.eq('business_id', businessId)
    }
    if (professionalId) {
      query = query.eq('professional_id', professionalId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  async upsertSchedule(scheduleData) {
    const { data, error } = await supabaseAdmin
      .from('schedules')
      .upsert(scheduleData, {
        onConflict: 'professional_id,day_of_week',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteSchedule(scheduleId) {
    const { error } = await supabaseAdmin
      .from('schedules')
      .update({ is_active: false })
      .eq('id', scheduleId)

    if (error) throw error
    return true
  }

  // ==========================================
  // APPOINTMENTS
  // ==========================================
  async getAppointments(filters = {}) {
    let query = supabaseAdmin
      .from('appointments')
      .select(`
        *,
        services(name, duration_min, price_cents),
        businesses(name, slug, logo_url)
      `)
      .order('start_at', { ascending: true })

    if (filters.businessId) {
      query = query.eq('business_id', filters.businessId)
    }
    if (filters.professionalId) {
      query = query.eq('professional_id', filters.professionalId)
    }
    if (filters.clientEmail) {
      query = query.eq('client_email', filters.clientEmail)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.startDate) {
      query = query.gte('start_at', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('start_at', filters.endDate)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  async getAppointment(appointmentId) {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        *,
        services(name, duration_min, price_cents, currency),
        businesses(name, slug, logo_url, primary_color, whatsapp_number, timezone)
      `)
      .eq('id', appointmentId)
      .single()

    if (error) throw error
    return data
  }

  async createAppointment(appointmentData) {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateAppointment(appointmentId, updates) {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .update(updates)
      .eq('id', appointmentId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async cancelAppointment(appointmentId) {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async checkAppointmentOverlap(professionalId, startAt, endAt, excludeId = null) {
    let query = supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('professional_id', professionalId)
      .not('status', 'in', '(cancelled)')
      .lt('start_at', endAt)
      .gt('end_at', startAt)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query
    if (error) throw error
    return data.length > 0
  }

  // ==========================================
  // PAYMENTS
  // ==========================================
  async createPayment(paymentData) {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert(paymentData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updatePayment(paymentId, updates) {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getPaymentByStripeId(stripePaymentIntentId) {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('stripe_payment_intent_id', stripePaymentIntentId)
      .single()

    if (error) throw error
    return data
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  async createNotification(notificationData) {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert(notificationData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateNotification(notificationId, updates) {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update(updates)
      .eq('id', notificationId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ==========================================
  // AVAILABLE SLOTS
  // ==========================================
  async getAvailableSlots(professionalId, date, serviceDuration) {
    const targetDate = new Date(date)
    const dayOfWeek = targetDate.getDay()

    // Get schedule for this day
    const { data: schedule, error: scheduleError } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .single()

    if (scheduleError || !schedule) {
      return []
    }

    // Get existing appointments for this date
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const { data: appointments, error: apptError } = await supabaseAdmin
      .from('appointments')
      .select('start_at, end_at')
      .eq('professional_id', professionalId)
      .not('status', 'in', '(cancelled)')
      .gte('start_at', startOfDay.toISOString())
      .lte('start_at', endOfDay.toISOString())

    if (apptError) throw apptError

    // Generate available slots
    const slots = []
    const [startHour, startMin] = schedule.start_time.split(':').map(Number)
    const [endHour, endMin] = schedule.end_time.split(':').map(Number)

    let currentTime = new Date(targetDate)
    currentTime.setHours(startHour, startMin, 0, 0)

    const endTime = new Date(targetDate)
    endTime.setHours(endHour, endMin, 0, 0)

    while (currentTime.getTime() + serviceDuration * 60000 <= endTime.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + serviceDuration * 60000)

      // Check for overlaps
      const hasOverlap = appointments.some(appt => {
        const apptStart = new Date(appt.start_at)
        const apptEnd = new Date(appt.end_at)
        return currentTime < apptEnd && slotEnd > apptStart
      })

      if (!hasOverlap) {
        slots.push({
          start: currentTime.toISOString(),
          end: slotEnd.toISOString(),
          available: true
        })
      }

      currentTime = slotEnd
    }

    return slots
  }
}

module.exports = new DatabaseService()
