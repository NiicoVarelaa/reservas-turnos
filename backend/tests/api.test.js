process.env.NODE_ENV = 'test'
process.env.JWT_ACCESS_SECRET = require('./helpers/constants').TEST_ACCESS_SECRET
process.env.JWT_REFRESH_SECRET = require('./helpers/constants').TEST_REFRESH_SECRET
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy'

jest.mock('../src/services/database', () => require('./helpers/database'))
jest.mock('../src/config/supabase', () => require('./helpers/supabase'))
jest.mock('../src/services/whatsapp', () => require('./helpers/whatsapp'))

const request = require('supertest')
const db = require('./helpers/database')
const app = require('../src/app')

beforeEach(() => {
  jest.clearAllMocks()
  db.getServices.mockResolvedValue([])
})

describe('Health Check', () => {
  it('should return 200 OK', async () => {
    const response = await request(app)
      .get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body.status).toBe('ok')
    expect(response.body).toHaveProperty('timestamp')
    expect(response.body).toHaveProperty('uptime')
  })
})

describe('Services', () => {
  it('should return list of services', async () => {
    const response = await request(app)
      .get('/api/services')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('services')
    expect(Array.isArray(response.body.services)).toBe(true)
  })
})

describe('Bookings', () => {
  it('should reject invalid booking data', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .send({ invalid: 'data' })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
  })
})

describe('Webhooks', () => {
  it('should reject invalid stripe signature', async () => {
    const response = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'invalid')
      .send('{}')

    expect(response.status).toBe(400)
  })
})