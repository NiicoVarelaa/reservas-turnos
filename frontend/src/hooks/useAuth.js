import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/services/api'
import { authService } from '@/services/authService'
import { queryKeys } from '@/lib/queryKeys'

export { useIsAuthenticated, useAuthUser } from './useSession'

export function useProfile() {
  const { isAuthenticated } = authService.getSnapshot()

  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: async () => {
      const { data } = await authApi.getProfile()
      return data.user || null
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates) => authApi.updateProfile(updates),
    onSuccess: (response) => {
      const profile = response?.data?.profile
      const cachedUser = authService.getUser()

      if (cachedUser && profile) {
        authService.setTokens(
          authService.getAccessToken(),
          authService.getRefreshToken(),
          {
            ...cachedUser,
            full_name: profile.full_name || cachedUser.full_name,
            profile,
          }
        )
      }

      queryClient.setQueryData(queryKeys.auth.profile(), (previous) =>
        previous ? { ...previous, profile: profile || previous.profile } : previous
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() })
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password }) => authService.login(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.profile(), data.user)
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password, metadata }) => authService.register(email, password, metadata),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.profile(), data.user)
    },
  })
}

export function useGoogleLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (providerToken) => authService.googleLogin(providerToken),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.profile(), data.user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      queryClient.clear()
    },
  })
}
