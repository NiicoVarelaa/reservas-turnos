const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  bookingSchema,
  paymentSessionSchema,
  businessSchema,
  serviceSchema,
  slotsQuerySchema,
  scheduleSchema,
  profileUpdateSchema
} = require('../../src/utils/validators')

const UUID = '0bb8d4c3-7f1d-4a4e-b4b6-2a5b2fd36e0c'

describe('validators', () => {
  describe('registerSchema', () => {
    it('accepts a valid registration', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'supersecret1',
        full_name: 'Ana Pérez',
        phone: '+5491123456789'
      })
      expect(result.success).toBe(true)
    })

    it('accepts registration without optional fields', () => {
      const result = registerSchema.safeParse({ email: 'a@b.com', password: 'supersecret1' })
      expect(result.success).toBe(true)
    })

    it('rejects an invalid email', () => {
      const result = registerSchema.safeParse({ email: 'not-an-email', password: 'supersecret1' })
      expect(result.success).toBe(false)
    })

    it('rejects a short password', () => {
      const result = registerSchema.safeParse({ email: 'a@b.com', password: 'short' })
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('accepts valid credentials', () => {
      expect(loginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true)
    })

    it('rejects missing password', () => {
      expect(loginSchema.safeParse({ email: 'a@b.com' }).success).toBe(false)
    })
  })

  describe('forgotPasswordSchema', () => {
    it('accepts a valid email', () => {
      expect(forgotPasswordSchema.safeParse({ email: 'a@b.com' }).success).toBe(true)
    })

    it('rejects an invalid email', () => {
      expect(forgotPasswordSchema.safeParse({ email: 'nope' }).success).toBe(false)
    })
  })

  describe('resetPasswordSchema', () => {
    it('accepts a token and a strong password', () => {
      expect(resetPasswordSchema.safeParse({ token: 'abc', password: 'supersecret1' }).success).toBe(true)
    })

    it('rejects a short password', () => {
      expect(resetPasswordSchema.safeParse({ token: 'abc', password: 'short' }).success).toBe(false)
    })

    it('rejects a missing token', () => {
      expect(resetPasswordSchema.safeParse({ password: 'supersecret1' }).success).toBe(false)
    })
  })

  describe('bookingSchema', () => {
    const validBooking = {
      serviceId: UUID,
      professionalId: UUID,
      date: '2026-09-05',
      startTime: '10:00',
      endTime: '10:30',
      clientName: 'María García',
      clientEmail: 'maria@example.com',
      clientPhone: '+5491187654321'
    }

    it('accepts a valid booking', () => {
      expect(bookingSchema.safeParse(validBooking).success).toBe(true)
    })

    it('accepts optional notes', () => {
      expect(bookingSchema.safeParse({ ...validBooking, notes: 'Sin sal' }).success).toBe(true)
    })

    it('rejects a malformed date', () => {
      expect(bookingSchema.safeParse({ ...validBooking, date: '05/09/2026' }).success).toBe(false)
    })

    it('rejects an invalid time', () => {
      expect(bookingSchema.safeParse({ ...validBooking, startTime: '25:00' }).success).toBe(false)
    })

    it('rejects a non-UUID serviceId', () => {
      expect(bookingSchema.safeParse({ ...validBooking, serviceId: 'not-a-uuid' }).success).toBe(false)
    })
  })

  describe('paymentSessionSchema', () => {
    it('accepts only the appointmentId', () => {
      const result = paymentSessionSchema.safeParse({ appointmentId: UUID })
      expect(result.success).toBe(true)
    })

    it('strips client-supplied amount/currency (server derives the price)', () => {
      const result = paymentSessionSchema.safeParse({
        appointmentId: UUID,
        amount: 100,
        currency: 'usd'
      })
      expect(result.success).toBe(true)
      expect(result.data.amount).toBeUndefined()
      expect(result.data.currency).toBeUndefined()
    })

    it('rejects a non-UUID appointmentId', () => {
      expect(paymentSessionSchema.safeParse({ appointmentId: 'nope' }).success).toBe(false)
    })
  })

  describe('businessSchema', () => {
    const validBusiness = { name: 'Sonrisa', category: 'odontologia' }

    it('accepts a valid business', () => {
      expect(businessSchema.safeParse(validBusiness).success).toBe(true)
    })

    it('rejects an unknown category', () => {
      expect(businessSchema.safeParse({ ...validBusiness, category: 'barman' }).success).toBe(false)
    })

    it('rejects a malformed hex color', () => {
      expect(businessSchema.safeParse({ ...validBusiness, primary_color: 'red' }).success).toBe(false)
    })
  })

  describe('serviceSchema', () => {
    const validService = { name: 'Limpieza', duration_min: 30, price_cents: 15000 }

    it('accepts a valid service', () => {
      expect(serviceSchema.safeParse(validService).success).toBe(true)
    })

    it('rejects a duration under 5 minutes', () => {
      expect(serviceSchema.safeParse({ ...validService, duration_min: 4 }).success).toBe(false)
    })

    it('rejects a negative price', () => {
      expect(serviceSchema.safeParse({ ...validService, price_cents: -1 }).success).toBe(false)
    })
  })

  describe('slotsQuerySchema', () => {
    it('accepts a valid date + professionalId', () => {
      expect(slotsQuerySchema.safeParse({ date: '2026-09-05', professionalId: UUID }).success).toBe(true)
    })

    it('rejects a bad date format', () => {
      expect(slotsQuerySchema.safeParse({ date: '05-09-2026', professionalId: UUID }).success).toBe(false)
    })
  })

  describe('scheduleSchema', () => {
    const valid = { day_of_week: 3, start_time: '09:00', end_time: '17:00' }

    it('accepts a valid schedule', () => {
      expect(scheduleSchema.safeParse(valid).success).toBe(true)
    })

    it('rejects day_of_week out of range', () => {
      expect(scheduleSchema.safeParse({ ...valid, day_of_week: 7 }).success).toBe(false)
    })

    it('rejects a missing end time', () => {
      expect(scheduleSchema.safeParse({ day_of_week: 0, start_time: '09:00' }).success).toBe(false)
    })
  })

  describe('profileUpdateSchema', () => {
    it('accepts a partial update', () => {
      expect(profileUpdateSchema.safeParse({ bio: 'Hola' }).success).toBe(true)
    })

    it('rejects an invalid phone', () => {
      expect(profileUpdateSchema.safeParse({ phone: '12' }).success).toBe(false)
    })
  })
})