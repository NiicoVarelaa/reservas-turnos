process.env.NODE_ENV = 'test'
process.env.JWT_ACCESS_SECRET = require('../helpers/constants').TEST_ACCESS_SECRET
process.env.JWT_REFRESH_SECRET = require('../helpers/constants').TEST_REFRESH_SECRET
process.env.FRONTEND_URL = 'http://localhost:5173'

jest.mock('../../src/services/database', () => require('../helpers/database'))
jest.mock('../../src/config/supabase', () => require('../helpers/supabase'))
jest.mock('../../src/services/email', () => require('../helpers/email'))

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const request = require('supertest')

const app = require('../../src/app')
const db = require('../helpers/database')
const email = require('../helpers/email')
const { supabaseAdmin } = require('../helpers/supabase')
const { USER_ID, TEST_REFRESH_SECRET } = require('../helpers/constants')

const user = { id: USER_ID, email: 'ana@test.com', full_name: 'Ana', role: 'client', is_active: true }

describe('Auth integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/register', () => {
    it('creates a client user and returns tokens', async () => {
      db.getUserByEmail.mockResolvedValue(null)
      db.createUser.mockResolvedValue({ ...user })
      db.createRefreshToken.mockResolvedValue({})

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'ana@test.com', password: 'supersecret1', full_name: 'Ana' })

      expect(res.status).toBe(201)
      expect(res.body.accessToken).toBeDefined()
      expect(res.body.refreshToken).toBeDefined()
      expect(db.createUser).toHaveBeenCalledWith(expect.objectContaining({
        email: 'ana@test.com',
        role: 'client'
      }))
      expect(db.createUser.mock.calls[0][0].password_hash).not.toBe('supersecret1')
    })

    it('rejects a duplicate email', async () => {
      db.getUserByEmail.mockResolvedValue(user)

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'ana@test.com', password: 'supersecret1' })

      expect(res.status).toBe(409)
      expect(res.body.error).toMatch(/already registered/i)
    })

    it('rejects a weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'ana@test.com', password: 'short' })

      expect(res.status).toBe(400)
      expect(db.createUser).not.toHaveBeenCalled()
    })
  })

  describe('POST /api/auth/login', () => {
    it('logs in with valid credentials', async () => {
      const passwordHash = await bcrypt.hash('supersecret1', 4)
      db.getUserByEmail.mockResolvedValue({ ...user, password_hash: passwordHash })
      db.createRefreshToken.mockResolvedValue({})

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ana@test.com', password: 'supersecret1' })

      expect(res.status).toBe(200)
      expect(res.body.accessToken).toBeDefined()
      expect(res.body.user.role).toBe('client')
    })

    it('rejects a wrong password', async () => {
      const passwordHash = await bcrypt.hash('otra-cosa-1', 4)
      db.getUserByEmail.mockResolvedValue({ ...user, password_hash: passwordHash })

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ana@test.com', password: 'supersecret1' })

      expect(res.status).toBe(401)
    })

    it('rejects accounts without a password (Google-only)', async () => {
      db.getUserByEmail.mockResolvedValue({ ...user, password_hash: null })

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ana@test.com', password: 'supersecret1' })

      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/auth/google', () => {
    it('creates a client user from a valid Google session', async () => {
      supabaseAdmin.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'google-user-id',
            email: 'ana@test.com',
            user_metadata: { full_name: 'Ana' },
            identities: [{ provider: 'google', id: 'g-123' }]
          }
        },
        error: null
      })
      db.getOrCreateGoogleUser.mockResolvedValue({ ...user, id: 'google-user-id', is_active: true })
      db.createRefreshToken.mockResolvedValue({})

      const res = await request(app)
        .post('/api/auth/google')
        .send({ providerToken: 'session-token' })

      expect(res.status).toBe(200)
      expect(res.body.accessToken).toBeDefined()
      expect(db.getOrCreateGoogleUser).toHaveBeenCalledWith(expect.objectContaining({ role: 'client' }))
    })

    it('rejects an invalid Google session', async () => {
      supabaseAdmin.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'bad' } })

      const res = await request(app)
        .post('/api/auth/google')
        .send({ providerToken: 'nope' })

      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('rotates a valid refresh token', async () => {
      const oldRefresh = jwt.sign({ id: USER_ID, type: 'refresh' }, TEST_REFRESH_SECRET, { expiresIn: '7d' })

      db.getRefreshToken.mockResolvedValue({ id: 'rt-1' })
      db.getUserById.mockResolvedValue(user)
      db.revokeRefreshToken.mockResolvedValue({})
      db.createRefreshToken.mockResolvedValue({})

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: oldRefresh })

      expect(res.status).toBe(200)
      expect(res.body.accessToken).toBeDefined()
      expect(db.revokeRefreshToken).toHaveBeenCalledWith(oldRefresh)
    })

    it('rejects an invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'garbage' })

      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/auth/forgot-password', () => {
    it('does not leak whether the email is registered', async () => {
      db.getUserByEmail.mockResolvedValue(null)

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nadie@test.com' })

      expect(res.status).toBe(200)
      expect(email.sendPasswordReset).not.toHaveBeenCalled()
    })

    it('stores a reset token and emails the reset link', async () => {
      let issuedToken
      db.getUserByEmail.mockResolvedValue(user)
      db.createPasswordResetToken.mockImplementation((_userId, token) => {
        issuedToken = token
        return {}
      })

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'ana@test.com' })

      expect(res.status).toBe(200)
      expect(db.createPasswordResetToken).toHaveBeenCalledWith(USER_ID, issuedToken, expect.any(Date))
      expect(email.sendPasswordReset).toHaveBeenCalledTimes(1)
      expect(email.sendPasswordReset.mock.calls[0][1]).toContain(`token=${issuedToken}`)
    })
  })

  describe('POST /api/auth/reset-password', () => {
    it('updates the password and revokes all sessions', async () => {
      db.getValidPasswordResetToken.mockResolvedValue({ user_id: USER_ID, token: 'tk-1' })
      db.getUserById.mockResolvedValue(user)
      db.updateUserPassword.mockResolvedValue({ ...user })
      db.markPasswordResetUsed.mockResolvedValue({})
      db.revokeAllUserTokens.mockResolvedValue({})

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'tk-1', password: 'nueva-segura-1' })

      expect(res.status).toBe(200)
      expect(db.updateUserPassword).toHaveBeenCalledWith(USER_ID, expect.any(String))
      expect(db.updateUserPassword.mock.calls[0][1]).not.toBe('nueva-segura-1')
      expect(db.markPasswordResetUsed).toHaveBeenCalledWith('tk-1')
      expect(db.revokeAllUserTokens).toHaveBeenCalledWith(USER_ID)
    })

    it('rejects an invalid or expired token', async () => {
      db.getValidPasswordResetToken.mockResolvedValue(null)

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'bad', password: 'nueva-segura-1' })

      expect(res.status).toBe(400)
      expect(db.updateUserPassword).not.toHaveBeenCalled()
    })
  })
})