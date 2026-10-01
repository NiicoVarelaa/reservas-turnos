import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { servicesApi } from '@/services/api'
import { queryKeys } from '@/lib/queryKeys'

const invalidateServiceLists = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.services.all })
}

export function useService(id) {
  return useQuery({
    queryKey: queryKeys.services.detail(id),
    queryFn: async () => {
      const { data } = await servicesApi.getById(id)
      return data.service
    },
    enabled: Boolean(id) && id !== 'undefined',
    retry: false,
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload) => servicesApi.create(payload),
    onSuccess: () => invalidateServiceLists(queryClient),
  })
}

export function useCreateServices() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payloads) => {
      for (const payload of payloads) {
        await servicesApi.create(payload)
      }
    },
    onSuccess: () => invalidateServiceLists(queryClient),
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }) => servicesApi.update(id, updates),
    onSuccess: () => invalidateServiceLists(queryClient),
  })
}

export function useDeleteService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => servicesApi.remove(id),
    onSuccess: () => invalidateServiceLists(queryClient),
  })
}
