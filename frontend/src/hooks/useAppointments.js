import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { appointmentsApi } from '@/services/api'
import { queryKeys } from '@/lib/queryKeys'

export function useAppointments(filters = {}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.appointments.list(filters),
    queryFn: async () => {
      const { data } = await appointmentsApi.getAll(filters)
      return data.appointments || []
    },
  })

  return {
    appointments: data || [],
    loading: isLoading,
    error: error?.response?.data?.error || null,
    refetch,
  }
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }) => appointmentsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
    },
  })
}

export function useCancelAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => appointmentsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
    },
  })
}

export default useAppointments
