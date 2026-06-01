import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  profile: null,
  guestInfo: null,
  isAuthenticated: false,
  isGuest: false,
  loading: true,

  setSession: (session) => {
    set({ session, isAuthenticated: !!session, loading: false })
  },

  setUser: (user) => {
    set({ user })
  },

  setProfile: (profile) => {
    set({ profile })
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    set({ session: data.session, user: data.user, isAuthenticated: true, isGuest: false, guestInfo: null })
    return data
  },

  register: async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
    if (error) throw error
    return data
  },

  loginAsGuest: (info) => {
    set({
      isGuest: true,
      isAuthenticated: false,
      guestInfo: info
    })
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, profile: null, isAuthenticated: false, isGuest: false, guestInfo: null })
  },

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user || null, isAuthenticated: !!session, loading: false })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user || null, isAuthenticated: !!session })
    })
  }
}))
