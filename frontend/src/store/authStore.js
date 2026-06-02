import { create } from 'zustand'
import { authService } from '@/services/authService'

export const useAuthStore = create((set) => ({
  user: authService.getUser(),
  guestInfo: null,
  isAuthenticated: authService.isAuthenticated(),
  isGuest: false,
  loading: false,

  login: async (email, password) => {
    set({ loading: true })
    try {
      const data = await authService.login(email, password)
      set({ user: data.user, isAuthenticated: true, isGuest: false, guestInfo: null, loading: false })
      return data
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  register: async (email, password, metadata = {}) => {
    set({ loading: true })
    try {
      const data = await authService.register(email, password, metadata)
      set({ user: data.user, isAuthenticated: true, isGuest: false, guestInfo: null, loading: false })
      return data
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  loginAsGuest: (info) => {
    set({
      isGuest: true,
      isAuthenticated: false,
      guestInfo: info
    })
  },

  logout: async () => {
    await authService.logout()
    set({ user: null, guestInfo: null, isAuthenticated: false, isGuest: false })
  },

  init: () => {
    const user = authService.getUser()
    const isAuth = authService.isAuthenticated()
    set({ user, isAuthenticated: isAuth, loading: false })
  },

  refreshProfile: async () => {
    try {
      const data = await authService.getProfile()
      set({ user: data.user })
    } catch {
      // Ignore errors
    }
  }
}))
