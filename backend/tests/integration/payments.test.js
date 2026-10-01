process.env.NODE_ENV = 'test'
process.env.JWT_ACCESS_SECRET = require('../helpers/constants').TEST_ACCESS_SECRET
process.env.JWT_REFRESH_SECRET = require('../helpers/constants').TEST_REFRESH_SECRET
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
process.env.FRONTEND_URL = 'http://localhost:5173'

jest.mock('../../src/services/database', () => require('../helpers/database'))
jest.mock('../../src/config/supabase', () => require('../helpers/supabase'))
jest.mock('../../src/config/stripe', () => require('../helpers/stripe'))
jest.mock('../../src/services/whatsapp', () => require('../helpers/whatsapp'))

const request = require('supertest')

const app = require('../../src/app')
const db = require('../helpers/database')
const { stripe } = require('../helpers/stripe')
const { UUID, USER_ID } = require('../helpers/constants')

const appointment = {
  id: UUID,
  service_id: UUID,
  professional_id: USER_ID,
  client_email: 'maria@test.com',
  status: 'pending',
  services: { name: 'Limpieza', price_cents: 15000, currency: 'ars' },
  businesses: { name: 'Sonrisa' }
}

const session = { id: 'cs_test_123', url: 'https://checkout.stripe.com/c/pay/cs_test_123' }

describe('Payments integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/payments/create-session', () => {
    it('derives amount/currency from the service price and ignores client-sent values', async () => {
      db.getAppointment.mockResolvedValue(appointment)
      stripe.checkout.sessions.create.mockResolvedValue(session)
      db.updateAppointment.mockResolvedValue({})

      const res = await request(app)
        .post('/api/payments/create-session')
        .send({ appointmentId: UUID, amount: 1, currency: 'usd' })

      expect(res.status).toBe(200)
      expect(res.body.sessionId).toBe('cs_test_123')
      expect(res.body.checkoutUrl).toBe(session.url)

      const createArgs = stripe.checkout.sessions.create.mock.calls[0][0]
      expect(createArgs.line_items[0].price_data.unit_amount).toBe(15000)
      expect(createArgs.line_items[0].price_data.currency).toBe('ars')
      expect(createArgs.line_items[0].price_data.product_data.name).toBe('Limpieza')
      expect(createArgs.metadata.appointmentId).toBe(UUID)

      expect(db.updateAppointment).toHaveBeenCalledWith(UUID, { stripe_session_id: 'cs_test_123' })
    })

    it('404 when the appointment does not exist', async () => {
      db.getAppointment.mockResolvedValue(null)

      const res = await request(app)
        .post('/api/payments/create-session')
        .send({ appointmentId: UUID })

      expect(res.status).toBe(404)
      expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
    })

    it('400 when the appointment is not pending', async () => {
      db.getAppointment.mockResolvedValue({ ...appointment, status: 'paid' })

      const res = await request(app)
        .post('/api/payments/create-session')
        .send({ appointmentId: UUID })

      expect(res.status).toBe(400)
      expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
    })

    it('400 when the service has no valid price', async () => {
      db.getAppointment.mockResolvedValue({
        ...appointment,
        services: { name: 'Limpieza', price_cents: 0, currency: 'ars' }
      })

      const res = await request(app)
        .post('/api/payments/create-session')
        .send({ appointmentId: UUID })

      expect(res.status).toBe(400)
      expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
    })
  })
})