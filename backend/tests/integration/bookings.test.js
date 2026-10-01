process.env.NODE_ENV = 'test'
process.env.JWT_ACCESS_SECRET = require('../helpers/constants').TEST_ACCESS_SECRET
process.env.JWT_REFRESH_SECRET = require('../helpers/constants').TEST_REFRESH_SECRET
process.env.FRONTEND_URL = 'http://localhost:5173'

jest.mock('../../src/services/database', () => require('../helpers/database'))
jest.mock('../../src/config/supabase', () => require('../helpers/supabase'))
jest.mock('../../src/services/whatsapp', () => require('../helpers/whatsapp'))
jest.mock('../../src/config/stripe', () => require('../helpers/stripe'))

const request = require('supertest')

const app = require('../../src/app')
const db = require('../helpers/database')
const { UUID } = require('../helpers/constants')

const validPayload = {
  serviceId: UUID,
  professionalId: '22222222-2222-4222-8222-222222222222',
  date: '2026-09-05',
  startTime: '10:00',
  endTime: '10:30',
  clientName: 'María García',
  clientEmail: 'maria@test.com',
  clientPhone: '+5491123456789'
}

describe('Bookings integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/bookings', () => {
    it('creates a booking when the slot is free', async () => {
      db.getService.mockResolvedValue({ id: UUID, business_id: UUID })
      db.checkAppointmentOverlap.mockResolvedValue(false)
      db.createAppointment.mockResolvedValue({ id: UUID, status: 'pending' })

      const res = await request(app)
        .post('/api/bookings')
        .send(validPayload)

      expect(res.status).toBe(201)
      expect(res.body.message).toMatch(/created/i)
      expect(db.createAppointment).toHaveBeenCalledWith(expect.objectContaining({
        business_id: UUID,
        service_id: UUID,
        professional_id: validPayload.professionalId,
        status: 'pending',
        client_email: 'maria@test.com',
        client_phone: '+5491123456789',
        notes: null
      }))
    })

    it('stores start/end in UTC from the client-provided local time', async () => {
      db.getService.mockResolvedValue({ id: UUID, business_id: UUID })
      db.checkAppointmentOverlap.mockResolvedValue(false)
      db.createAppointment.mockResolvedValue({})

      await request(app)
        .post('/api/bookings')
        .send(validPayload)

      const data = db.createAppointment.mock.calls[0][0]
      expect(data.start_at).toBe('2026-09-05T10:00:00.000Z')
      expect(data.end_at).toBe('2026-09-05T10:30:00.000Z')
    })

    it('rejects the booking when the slot overlaps', async () => {
      db.getService.mockResolvedValue({ id: UUID, business_id: UUID })
      db.checkAppointmentOverlap.mockResolvedValue(true)
      db.createAppointment.mockResolvedValue({})

      const res = await request(app)
        .post('/api/bookings')
        .send(validPayload)

      expect(res.status).toBe(409)
      expect(res.body.error).toMatch(/already booked/i)
      expect(db.createAppointment).not.toHaveBeenCalled()
    })

    it('rejects invalid payload without touching the database', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({ serviceId: 'not-a-uuid', date: '05/09/2026' })

      expect(res.status).toBe(400)
      expect(db.getService).not.toHaveBeenCalled()
    })

    it('checks overlap with the professional and time window', async () => {
      db.getService.mockResolvedValue({ id: UUID, business_id: UUID })
      db.checkAppointmentOverlap.mockResolvedValue(false)
      db.createAppointment.mockResolvedValue({})

      await request(app)
        .post('/api/bookings')
        .send(validPayload)

      expect(db.checkAppointmentOverlap).toHaveBeenCalledWith(
        validPayload.professionalId,
        '2026-09-05T10:00:00.000Z',
        '2026-09-05T10:30:00.000Z'
      )
    })
  })

  describe('GET /api/bookings/:id', () => {
    it('returns an existing booking', async () => {
      db.getAppointment.mockResolvedValue({ id: UUID, status: 'pending' })

      const res = await request(app)
        .get(`/api/bookings/${UUID}`)

      expect(res.status).toBe(200)
      expect(res.body.appointment.id).toBe(UUID)
    })

    it('404 when the booking does not exist', async () => {
      db.getAppointment.mockResolvedValue(null)

      const res = await request(app)
        .get(`/api/bookings/${UUID}`)

      expect(res.status).toBe(404)
    })
  })

  describe('POST /api/bookings/:id/cancel', () => {
    it('cancels a pending booking and notifies via WhatsApp', async () => {
      db.getAppointment.mockResolvedValue({ id: UUID, status: 'pending' })
      db.cancelAppointment.mockResolvedValue({ id: UUID, status: 'cancelled' })

      const res = await request(app)
        .post(`/api/bookings/${UUID}/cancel`)

      expect(res.status).toBe(200)
      expect(db.cancelAppointment).toHaveBeenCalledWith(UUID)

      await new Promise(r => setTimeout(r, 0))
      const whatsapp = require('../helpers/whatsapp')
      expect(whatsapp.sendCancellation).toHaveBeenCalledWith(UUID)
    })

    it('rejects cancelling an already cancelled booking', async () => {
      db.getAppointment.mockResolvedValue({ id: UUID, status: 'cancelled' })

      const res = await request(app)
        .post(`/api/bookings/${UUID}/cancel`)

      expect(res.status).toBe(400)
      expect(db.cancelAppointment).not.toHaveBeenCalled()
    })

    it('rejects cancelling a paid booking', async () => {
      db.getAppointment.mockResolvedValue({ id: UUID, status: 'paid' })

      const res = await request(app)
        .post(`/api/bookings/${UUID}/cancel`)

      expect(res.status).toBe(400)
      expect(db.cancelAppointment).not.toHaveBeenCalled()
    })
  })
})