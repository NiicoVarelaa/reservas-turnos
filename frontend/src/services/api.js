import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sb-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const servicesApi = {
  getAll: (filters = {}) =>
    api.get('/api/services', { params: filters }),

  getById: (id) =>
    api.get(`/api/services/${id}`),

  getSlots: (id, date) =>
    api.get(`/api/services/${id}/slots`, { params: { date } }),

  create: (data) =>
    api.post('/api/services', data),

  update: (id, data) =>
    api.put(`/api/services/${id}`, data)
}

export const bookingsApi = {
  create: (data) =>
    api.post('/api/bookings', data),

  getById: (id) =>
    api.get(`/api/bookings/${id}`),

  cancel: (id) =>
    api.post(`/api/bookings/${id}/cancel`)
}

export const paymentsApi = {
  createSession: (data) =>
    api.post('/api/payments/create-session', data)
}

export const appointmentsApi = {
  getAll: (params) =>
    api.get('/api/appointments', { params }),

  getById: (id) =>
    api.get(`/api/appointments/${id}`),

  update: (id, data) =>
    api.patch(`/api/appointments/${id}`, data),

  cancel: (id) =>
    api.post(`/api/appointments/${id}/cancel`),

  getStats: () =>
    api.get('/api/appointments/stats')
}

export const authApi = {
  verifyToken: () =>
    api.post('/api/auth/verify'),

  getProfile: () =>
    api.get('/api/auth/profile'),

  updateProfile: (data) =>
    api.put('/api/auth/profile', data)
}

export const businessApi = {
  create: (data) =>
    api.post('/api/business', data),

  getMyBusiness: () =>
    api.get('/api/business/my'),

  getById: (id) =>
    api.get(`/api/business/${id}`),

  getBySlug: (slug) =>
    api.get(`/api/business/slug/${slug}`),

  update: (id, data) =>
    api.put(`/api/business/${id}`, data)
}

export const schedulesApi = {
  getAll: () =>
    api.get('/api/schedules'),

  create: (data) =>
    api.post('/api/schedules', data)
}

export default api
