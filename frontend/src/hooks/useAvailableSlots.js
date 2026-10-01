import { useQuery } from '@tanstack/react-query'
import { servicesApi } from '../services/api'
import { queryKeys } from '../lib/queryKeys'

export function useAvailableSlots(serviceId, date, professionalId) {
  const enabled = Boolean(serviceId && date && professionalId)

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: queryKeys.services.slots(serviceId, date, professionalId),
    queryFn: async () => {
      const { data } = await servicesApi.getSlots(serviceId, date, professionalId)
      return data.slots || []
    },
    enabled,
    staleTime: 15 * 1000,
  })

  return {
    slots: data || [],
    loading: isFetching,
    error: error?.response?.data?.error || null,
    refetch,
  }
}

export default useAvailableSlots
