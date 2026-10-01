import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { schedulesApi } from '@/services/api'
import { queryKeys } from '@/lib/queryKeys'

export function useSchedules() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.schedules.all(),
    queryFn: async () => {
      const { data } = await schedulesApi.getAll()
      return data.schedules || []
    },
  })

  return { schedules: data || [], loading: isLoading }
}

export function useCreateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (schedule) => schedulesApi.create(schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all })
    },
  })
}

export function useReplaceSchedules() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (schedules) => {
      const { data } = await schedulesApi.getAll()
      const existing = data.schedules || []

      await Promise.all(existing.map(s => schedulesApi.remove(s.id)))
      for (const schedule of schedules) {
        await schedulesApi.create(schedule)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all })
    },
  })
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => schedulesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all })
    },
  })
}
