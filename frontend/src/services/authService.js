import api from './api'

const ACCESS_TOKEN_KEY = 'jwt-access-token'
const REFRESH_TOKEN_KEY = 'jwt-refresh-token'
const USER_KEY = 'jwt-user'

export const authService = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  getUser() {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  },

  setTokens(accessToken, refreshToken, user) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
  },

  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  async login(email, password) {
    const { data } = await api.post('/api/auth/login', { email, password })
    this.setTokens(data.accessToken, data.refreshToken, data.user)
    return data
  },

  async register(email, password, metadata = {}) {
    const { data } = await api.post('/api/auth/register', {
      email,
      password,
      full_name: metadata.full_name,
      phone: metadata.phone
    })
    this.setTokens(data.accessToken, data.refreshToken, data.user)
    return data
  },

  async refresh() {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) throw new Error('No refresh token')

    const { data } = await api.post('/api/auth/refresh', { refreshToken })
    this.setTokens(data.accessToken, data.refreshToken, this.getUser())
    return data
  },

  async logout() {
    const refreshToken = this.getRefreshToken()
    try {
      await api.post('/api/auth/logout', { refreshToken })
    } catch {
      // Ignore errors on logout
    }
    this.clearTokens()
  },

  async getProfile() {
    const { data } = await api.get('/api/auth/profile')
    return data
  },

  async updateProfile(updates) {
    const { data } = await api.put('/api/auth/profile', updates)
    const user = this.getUser()
    if (user && data.profile) {
      this.setTokens(this.getAccessToken(), this.getRefreshToken(), { ...user, profile: data.profile })
    }
    return data
  },

  isAuthenticated() {
    return !!this.getAccessToken()
  }
}

export default authService
