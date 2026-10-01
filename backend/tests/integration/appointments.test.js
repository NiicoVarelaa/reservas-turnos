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
const { accessTokenFor } = require('../helpers/authToken')
const { UUID, USER_ID } = require('../helpers/constants')

const pro = { id: USER_ID, email: 'pro@test.com', role: 'professional', is_active: true }
const OTHER_PRO = '33333333-3333-4333-8333-333333333333'
const authToken = accessTokenFor(pro)

describe('Appointments integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/appointments', () => {
    it('lists appointments for the authenticated professional', async () => {
      db.getUserById.mockResolvedValue(pro)
      db.getAppointments.mockResolvedValue([])

      const res = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(db.getAppointments).toHaveBeenCalledWith(expect.objectContaining({
        professionalId: USER_ID
      }))
    })

    it('rejects requests without a token', async () => {
      const res = await request(app).get('/api/appointments')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/appointments/:id', () => {
    it('returns an own appointment', async () => {
      db.getUserById.mockResolvedValue(pro)
      db.getAppointment.mockResolvedValue({ id: UUID, professional_id: USER_ID, status: 'pending' })

      const res = await request(app)
        .get(`/api/appointments/${UUID}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.appointment.id).toBe(UUID)
    })

    it('forbids accessing another professional appointment', async () => {
      db.getUserById.mockResolvedValue(pro)
      db.getAppointment.mockResolvedValue({ id: UUID, professional_id: OTHER_PRO })

      const res = await request(app)
        .get(`/api/appointments/${UUID}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(403)
    })

    it('404 for a missing appointment', async () => {
      db.getUserById.mockResolvedValue(pro)
      db.getAppointment.mockResolvedValue(null)

      const res = await request(app)
        .get(`/api/appointments/${UUID}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(404)
    })
  })

  describe('PATCH /api/appointments/:id', () => {
    it('rejects a reschedule that overlaps another booking', async () => {
      db.getUserById.mockResolvedValue(pro)
      db.getAppointment.mockResolvedValue({
        id: UUID,
        professional_id: USER_ID,
        start_at: '2026-09-05T10:00:00.000Z',
        end_at: '2026-09-05T10:30:00.000Z'
      })
      db.checkAppointmentOverlap.mockResolvedValue(true)
      db.updateAppointment.mockResolvedValue({})

      const res = await request(app)
        .patch(`/api/appointments/${UUID}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ start_at: '2026-09-06T10:00:00.000Z', end_at: '2026-09-06T10:30:00.000Z' })

      expect(res.status).toBe(409)
      expect(db.updateAppointment).not.toHaveBeenCalled()
    })

    it('forbids updating another professional appointment', async () => {
      db.getUserById.mockResolvedValue(pro)
      db.getAppointment.mockResolvedValue({ id: UUID, professional_id: OTHER_PRO })

      const res = await request(app)
        .patch(`/api/appointments/${UUID}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'confirmed' })

      expect(res.status).toBe(403)
      expect(db.updateAppointment).not.toHaveBeenCalled()
    })

    it('updates allowed fields as the owner', async () => {
      db.getUserById.mockResolvedValue(pro)
      db.getAppointment.mockResolvedValue({
        id: UUID,
        professional_id: USER_ID,
        start_at: '2026-09-05T10:00:00.000Z',
        end_at: '2026-09-05T10:30:00.000Z'
      })
      db.updateAppointment.mockResolvedValue({ id: UUID, status: 'confirmed' })

      const res = await request(app)
        .patch(`/api/appointments/${UUID}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'confirmed' })

      expect(res.status).toBe(200)
      expect(db.updateAppointment).toHaveBeenCalledWith(UUID, { status: 'confirmed' })
    })
  })

  describe('POST /api/appointments/:id/cancel', () => {
    it('cancels an own appointment and notifies via WhatsApp', async () => {
      db.getUserById.mockResolvedValue(pro)
      db.getAppointment.mockResolvedValue({ id: UUID, professional_id: USER_ID, status: 'pending' })
      db.cancelAppointment.mockResolvedValue({ id: UUID, status: 'cancelled' })

      const res = await request(app)
        .post(`/api/appointments/${UUID}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(db.cancelAppointment).toHaveBeenCalledWith(UUID)

      await new Promise(r => setTimeout(r, 0))
      const whatsapp = require('../helpers/whatsapp')
      expect(whatsapp.sendCancellation).toHaveBeenCalledWith(UUID)
    })

    it('forbids cancelling another professional appointment', async () => {
      db.getUserById.mockResolvedValue(pro)
      db.getAppointment.mockResolvedValue({ id: UUID, professional_id: OTHER_PRO })

      const res = await request(app)
        .post(`/api/appointments/${UUID}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(403)
      expect(db.cancelAppointment).not.toHaveBeenCalled()
    })
  })
})