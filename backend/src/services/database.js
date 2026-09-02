const { supabaseAdmin } = require('../config/supabase')

class DatabaseService {
  // ==========================================
  // USERS (JWT Auth)
  // ==========================================
  async createUser(userData) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: userData.email,
        password_hash: userData.passwordHash,
        full_name: userData.full_name || null,
        phone: userData.phone || null,
        role: userData.role || 'client'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUserById(userId) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) return null
    return data
  }

  async getUserByEmail(email) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) return null
    return data
  }

  async createRefreshToken(userId, token, expiresAt) {
    const { data, error } = await supabaseAdmin
      .from('refresh_tokens')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getRefreshToken(token) {
    const { data, error } = await supabaseAdmin
      .from('refresh_tokens')
      .select('*')
      .eq('token', token)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error) return null
    return data
  }

  async revokeRefreshToken(token) {
    const { error } = await supabaseAdmin
      .from('refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('token', token)

    if (error) throw error
    return true
  }

  async revokeAllUserTokens(userId) {
    const { error } = await supabaseAdmin
      .from('refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('revoked_at', null)

    if (error) throw error
    return true
  }

  async getUserByGoogleId(googleId) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .maybeSingle()

    if (error) {
      console.error('getUserByGoogleId error:', error)
      return null
    }
    return data
  }

  // Ensure a user exists for a Supabase Auth (Google) identity.
  // The on_auth_user_created trigger keeps `users` in sync with auth.users,
  // so normally the row already exists with id = auth.users.id.
  async getOrCreateGoogleUser({ id, email, fullName, avatarUrl, googleId, role = 'client' }) {
    // By Supabase Auth id (already synced by trigger)
    if (id) {
      const existing = await this.getUserById(id)
      if (existing) {
        if (googleId && !existing.google_id) {
          const { data: linked, error } = await supabaseAdmin
            .from('users')
            .update({ google_id: googleId, provider: 'google', avatar_url: avatarUrl || existing.avatar_url })
            .eq('id', existing.id)
            .select()
            .single()
          if (error) throw error
          return linked
        }
        return existing
      }
    }

    // Fallback: match by google_id or email
    let user = googleId ? await this.getUserByGoogleId(googleId) : null
    if (!user) user = await this.getUserByEmail(email)

    if (user) {
      if (googleId && !user.google_id) {
        const { data: linked, error } = await supabaseAdmin
          .from('users')
          .update({ google_id: googleId, provider: 'google', avatar_url: avatarUrl || user.avatar_url })
          .eq('id', user.id)
          .select()
          .single()
        if (error) throw error
        return linked
      }
      return user
    }

    // Otherwise create a new user (no password -> Google-only)
    const { data: created, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: id || undefined,
        email,
        password_hash: null,
        full_name: fullName || null,
        avatar_url: avatarUrl || null,
        google_id: googleId || null,
        provider: 'google',
        role
      })
      .select()
      .single()

    if (error) throw error
    return created
  }

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
      .select('*, businesses(name, slug, logo_url, primary_color, currency)')
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

  async getServiceProfessionals(serviceId) {
    const { data, error } = await supabaseAdmin
      .from('service_professionals')
      .select(`
        professional_id,
        users(
          full_name,
          email,
          avatar_url,
          profiles(title, specialty, bio, avatar_url, full_name, phone)
        )
      `)
      .eq('service_id', serviceId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return (data || []).map(row => {
      const profiles = Array.isArray(row.users?.profiles)
        ? row.users.profiles[0]
        : row.users?.profiles || null

      return {
        professional_id: row.professional_id,
        users: row.users
          ? {
              full_name: row.users.full_name,
              email: row.users.email,
              avatar_url: row.users.avatar_url
            }
          : null,
        profiles
      }
    })
  }

  // ==========================================
  // NEXT AVAILABLE SLOT
  // ==========================================
  async getNextAvailableSlot(businessId) {
    const now = new Date()

    // Get all active professionals for this business via their services
    const { data: serviceProfs, error: spErr } = await supabaseAdmin
      .from('services')
      .select('professional_id')
      .eq('business_id', businessId)
      .eq('is_active', true)

    if (spErr || !serviceProfs?.length) return null

    const professionalIds = [...new Set(serviceProfs.map(sp => sp.professional_id))]

    // Get schedules for these professionals
    const { data: schedules, error: schErr } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .in('professional_id', professionalIds)
      .eq('is_active', true)

    if (schErr || !schedules?.length) return null

    // Get upcoming appointments (from now onward)
    const { data: appointments } = await supabaseAdmin
      .from('appointments')
      .select('professional_id, start_at, end_at')
      .in('professional_id', professionalIds)
      .not('status', 'eq', 'cancelled')
      .gte('start_at', now.toISOString())
      .order('start_at', { ascending: true })

    // Check next 14 days
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const checkDate = new Date(now)
      checkDate.setDate(checkDate.getDate() + dayOffset)
      const dayOfWeek = checkDate.getDay()

      const daySchedules = schedules.filter(s => s.day_of_week === dayOfWeek)
      if (!daySchedules.length) continue

      for (const sched of daySchedules) {
        const [startH, startM] = sched.start_time.split(':').map(Number)
        const [endH, endM] = sched.end_time.split(':').map(Number)

        const dayStart = new Date(checkDate)
        dayStart.setHours(startH, startM, 0, 0)
        const dayEnd = new Date(checkDate)
        dayEnd.setHours(endH, endM, 0, 0)

        // Use 30-min default slot for quick availability check
        const slotDuration = 30 * 60000
        let cursor = new Date(Math.max(dayStart.getTime(), now.getTime()))

        // Align to schedule start if before it
        if (cursor < dayStart) cursor = new Date(dayStart)

        while (cursor.getTime() + slotDuration <= dayEnd.getTime()) {
          const slotEnd = new Date(cursor.getTime() + slotDuration)
          const profAppts = (appointments || []).filter(
            a => a.professional_id === sched.professional_id
          )
          const hasOverlap = profAppts.some(a => {
            const aStart = new Date(a.start_at)
            const aEnd = new Date(a.end_at)
            return cursor < aEnd && slotEnd > aStart
          })

          if (!hasOverlap) {
            return {
              start: cursor.toISOString(),
              professional_id: sched.professional_id,
            }
          }

          cursor = slotEnd
        }
      }
    }

    return null
  }

  async setServiceProfessionals(serviceId, professionalIds) {
    await supabaseAdmin
      .from('service_professionals')
      .delete()
      .eq('service_id', serviceId)

    if (!professionalIds || professionalIds.length === 0) return

    const rows = professionalIds.map(professionalId => ({
      service_id: serviceId,
      professional_id: professionalId
    }))

    const { data, error } = await supabaseAdmin
      .from('service_professionals')
      .insert(rows)
      .select('professional_id')

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
      .select(`
        *,
        services(name, duration_min, price_cents, currency),
        businesses(name, slug, logo_url, primary_color, whatsapp_number, timezone)
      `)
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

  async getNotification(appointmentId, type, status) {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('id')
      .eq('appointment_id', appointmentId)
      .eq('type', type)
      .eq('status', status)
      .maybeSingle()

    if (error) return null
    return data
  }

  // ==========================================
  // AVAILABLE SLOTS
  // ==========================================
  async getAvailableSlots(professionalId, date, serviceDuration) {
    const [year, month, day] = date.split('-').map(Number)
    const targetDate = new Date(year, month - 1, day)
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
