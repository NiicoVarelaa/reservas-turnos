import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn()
  }
}))

import api from './api'
import { authService } from './authService'

const user = { id: 'uuid', email: 'test@example.com', role: 'client' }
const loginPayload = { accessToken: 'acc-token', refreshToken: 'ref-token', user }

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('starts without tokens', () => {
    expect(authService.getAccessToken()).toBeNull()
    expect(authService.getRefreshToken()).toBeNull()
    expect(authService.getUser()).toBeNull()
    expect(authService.isAuthenticated()).toBe(false)
  })

  describe('login', () => {
    it('posts credentials, stores tokens and returns the payload', async () => {
      api.post.mockResolvedValue({ data: loginPayload })

      const result = await authService.login('test@example.com', 'secret')

      expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'secret'
      })
      expect(result).toEqual(loginPayload)
      expect(authService.getAccessToken()).toBe('acc-token')
      expect(authService.getRefreshToken()).toBe('ref-token')
      expect(authService.getUser()).toEqual(user)
      expect(authService.isAuthenticated()).toBe(true)
    })
  })

  describe('register', () => {
    it('sends metadata and stores tokens', async () => {
      api.post.mockResolvedValue({ data: loginPayload })

      const result = await authService.register('test@example.com', 'secretpass8', {
        full_name: 'Juan Pérez',
        phone: '+541123456789'
      })

      expect(api.post).toHaveBeenCalledWith('/api/auth/register', {
        email: 'test@example.com',
        password: 'secretpass8',
        full_name: 'Juan Pérez',
        phone: '+541123456789'
      })
      expect(result).toEqual(loginPayload)
      expect(authService.getUser()).toEqual(user)
    })
  })

  describe('googleLogin', () => {
    it('defaults to the client role', async () => {
      api.post.mockResolvedValue({ data: loginPayload })

      const result = await authService.googleLogin('provider-token')

      expect(api.post).toHaveBeenCalledWith('/api/auth/google', {
        providerToken: 'provider-token',
        role: 'client'
      })
      expect(result).toEqual(loginPayload)
    })

    it('accepts an explicit role', async () => {
      api.post.mockResolvedValue({ data: loginPayload })

      await authService.googleLogin('provider-token', 'professional')

      expect(api.post).toHaveBeenCalledWith('/api/auth/google', {
        providerToken: 'provider-token',
        role: 'professional'
      })
    })
  })

  describe('refresh', () => {
    it('posts the refresh token and stores new tokens', async () => {
      localStorage.setItem('jwt-refresh-token', 'existing-refresh')
      api.post.mockResolvedValue({ data: { accessToken: 'new-acc', refreshToken: 'new-ref' } })

      const result = await authService.refresh()

      expect(api.post).toHaveBeenCalledWith('/api/auth/refresh', { refreshToken: 'existing-refresh' })
      expect(result).toEqual({ accessToken: 'new-acc', refreshToken: 'new-ref' })
      expect(authService.getAccessToken()).toBe('new-acc')
    })

    it('throws when there is no refresh token', async () => {
      await expect(authService.refresh()).rejects.toThrow('No refresh token')
    })
  })

  describe('logout', () => {
    it('posts logout and clears storage', async () => {
      authService.setTokens('acc', 'ref', user)
      api.post.mockResolvedValue({ data: {} })

      await authService.logout()

      expect(api.post).toHaveBeenCalledWith('/api/auth/logout', { refreshToken: 'ref' })
      expect(authService.getAccessToken()).toBeNull()
      expect(authService.getUser()).toBeNull()
    })

    it('clears storage even if the request fails', async () => {
      authService.setTokens('acc', 'ref', user)
      api.post.mockRejectedValue(new Error('network'))

      await expect(authService.logout()).resolves.toBeUndefined()
      expect(authService.isAuthenticated()).toBe(false)
    })
  })

  describe('profile', () => {
    it('fetches the profile', async () => {
      api.get.mockResolvedValue({ data: { profile: { full_name: 'Ana' } } })

      const result = await authService.getProfile()

      expect(api.get).toHaveBeenCalledWith('/api/auth/profile')
      expect(result.profile.full_name).toBe('Ana')
    })

    it('updates the profile and merges it into the stored user', async () => {
      authService.setTokens('acc', 'ref', { ...user, profile: { full_name: 'Viejo' } })
      api.put.mockResolvedValue({ data: { profile: { full_name: 'Nuevo' } } })

      const result = await authService.updateProfile({ full_name: 'Nuevo' })

      expect(api.put).toHaveBeenCalledWith('/api/auth/profile', { full_name: 'Nuevo' })
      expect(result.profile.full_name).toBe('Nuevo')
      expect(authService.getUser().profile.full_name).toBe('Nuevo')
    })
  })

  describe('password recovery', () => {
    it('forgotPassword posts the email', async () => {
      api.post.mockResolvedValue({ data: { ok: true } })

      const result = await authService.forgotPassword('test@example.com')

      expect(api.post).toHaveBeenCalledWith('/api/auth/forgot-password', { email: 'test@example.com' })
      expect(result.ok).toBe(true)
    })

    it('resetPassword posts the token and password', async () => {
      api.post.mockResolvedValue({ data: { ok: true } })

      const result = await authService.resetPassword('reset-token', 'nuevaClave8')

      expect(api.post).toHaveBeenCalledWith('/api/auth/reset-password', {
        token: 'reset-token',
        password: 'nuevaClave8'
      })
      expect(result.ok).toBe(true)
    })
  })
})