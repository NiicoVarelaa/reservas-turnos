import { useSyncExternalStore } from 'react'
import { authService } from '@/services/authService'

const subscribe = (listener) => authService.subscribe(listener)
const getSnapshot = () => authService.getSnapshot()
const getServerSnapshot = () => ({ isAuthenticated: false, user: null })

export function useSession() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function useIsAuthenticated() {
  return useSession().isAuthenticated
}

export function useAuthUser() {
  return useSession().user
}
