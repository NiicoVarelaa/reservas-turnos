const request = require('supertest')

describe('Health Check', () => {
  it('should return 200 OK', async () => {
    const response = await request('http://localhost:4000')
      .get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body.status).toBe('ok')
    expect(response.body).toHaveProperty('timestamp')
    expect(response.body).toHaveProperty('uptime')
  })
})

describe('Services', () => {
  it('should return list of services', async () => {
    const response = await request('http://localhost:4000')
      .get('/api/services')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('services')
    expect(Array.isArray(response.body.services)).toBe(true)
  })
})

describe('Bookings', () => {
  it('should reject invalid booking data', async () => {
    const response = await request('http://localhost:4000')
      .post('/api/bookings')
      .send({ invalid: 'data' })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
  })
})

describe('Webhooks', () => {
  it('should reject invalid stripe signature', async () => {
    const response = await request('http://localhost:4000')
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'invalid')
      .send('{}')

    expect(response.status).toBe(400)
  })
})
