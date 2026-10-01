import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { businessApi } from '@/services/api'
import { queryKeys } from '@/lib/queryKeys'

export function useMyBusiness() {
  return useQuery({
    queryKey: queryKeys.business.my(),
    queryFn: async () => {
      const { data } = await businessApi.getMyBusiness()
      return data.business
    },
  })
}

export function useBusinessBySlug(slug) {
  return useQuery({
    queryKey: queryKeys.business.bySlug(slug),
    queryFn: async () => {
      const { data } = await businessApi.getBySlug(slug)
      return data.business
    },
    enabled: Boolean(slug),
    retry: false,
  })
}

export function useNextAvailableSlot(businessId) {
  const { data } = useQuery({
    queryKey: queryKeys.business.nextAvailableSlot(businessId),
    queryFn: async () => {
      const { data } = await businessApi.getNextAvailableSlot(businessId)
      return data.slot || null
    },
    enabled: Boolean(businessId),
    retry: false,
    staleTime: 60 * 1000,
  })

  return { slot: data || null }
}

export function useCreateBusiness() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload) => businessApi.create(payload),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(queryKeys.business.my(), data.business)
    },
  })
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }) => businessApi.update(id, updates),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(queryKeys.business.my(), data.business)
      if (data.business?.slug) {
        queryClient.setQueryData(queryKeys.business.bySlug(data.business.slug), data.business)
      }
    },
  })
}
