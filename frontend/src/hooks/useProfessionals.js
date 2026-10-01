import { useQuery } from '@tanstack/react-query'
import { servicesApi } from '../services/api'
import { queryKeys } from '../lib/queryKeys'

export function useProfessionals(serviceId) {
  const enabled = Boolean(serviceId) && serviceId !== 'undefined'

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.services.professionals(serviceId),
    queryFn: async () => {
      const { data } = await servicesApi.getProfessionals(serviceId)
      return data.professionals || []
    },
    enabled,
  })

  return {
    professionals: data || [],
    loading: isLoading,
    error: error?.response?.data?.error || null,
    refetch,
  }
}

export default useProfessionals
