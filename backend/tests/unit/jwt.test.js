process.env.JWT_ACCESS_SECRET = 'test-access-secret'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
process.env.JWT_ACCESS_EXPIRES_IN = '15m'
process.env.JWT_REFRESH_EXPIRES_IN = '7d'

const jwt = require('jsonwebtoken')
const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getRefreshTokenExpiryDate
} = require('../../src/utils/jwt')

const user = { id: 'user-1', email: 'test@example.com', role: 'client' }

describe('jwt', () => {
  describe('generateAccessToken', () => {
    it('produces a token that verifies with the expected payload', () => {
      const token = generateAccessToken(user)
      const decoded = verifyAccessToken(token)

      expect(decoded).toMatchObject({
        id: user.id,
        email: user.email,
        role: user.role
      })
    })
  })

  describe('generateRefreshToken', () => {
    it('produces a refresh token flagged with type refresh', () => {
      const token = generateRefreshToken(user)
      const decoded = verifyRefreshToken(token)

      expect(decoded).toMatchObject({
        id: user.id,
        type: 'refresh'
      })
    })
  })

  describe('verifyAccessToken', () => {
    it('reports an expired access token', () => {
      const expired = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '-1s' })
      expect(verifyAccessToken(expired).expired).toBe(true)
    })

    it('reports an invalid access token', () => {
      expect(verifyAccessToken('not-a-valid-token').invalid).toBe(true)
    })

    it('rejects a refresh token used as access token', () => {
      const refresh = generateRefreshToken(user)
      expect(verifyAccessToken(refresh).invalid).toBe(true)
    })
  })

  describe('verifyRefreshToken', () => {
    it('reports an invalid refresh token', () => {
      expect(verifyRefreshToken('garbage').invalid).toBe(true)
    })

    it('rejects an access token used as refresh token', () => {
      const access = generateAccessToken(user)
      expect(verifyRefreshToken(access).invalid).toBe(true)
    })
  })

  describe('getRefreshTokenExpiryDate', () => {
    it('returns a date roughly 7 days in the future', () => {
      const before = Date.now()
      const date = getRefreshTokenExpiryDate().getTime()
      const after = before + 7 * 24 * 60 * 60 * 1000 + 60 * 1000

      expect(date).toBeGreaterThan(before)
      expect(date).toBeLessThanOrEqual(after)
    })
  })

  describe('fail-fast', () => {
    it('throws when the secret environment variables are missing', () => {
      delete process.env.JWT_ACCESS_SECRET
      delete process.env.JWT_REFRESH_SECRET

      expect(() => {
        jest.isolateModules(() => {
          require('../../src/utils/jwt')
        })
      }).toThrow(/environment variables are required/)

      process.env.JWT_ACCESS_SECRET = 'test-access-secret'
      process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
    })
  })
})