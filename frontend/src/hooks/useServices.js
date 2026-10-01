import { useQuery } from '@tanstack/react-query'
import { servicesApi } from '../services/api'
import { queryKeys } from '../lib/queryKeys'

export function useServices(filters = {}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.services.list(filters),
    queryFn: async () => {
      const { data } = await servicesApi.getAll(filters)
      return (data.services || []).filter((s) => s?.id)
    },
  })

  return {
    services: data || [],
    loading: isLoading,
    error: error?.response?.data?.error || null,
    refetch,
  }
}

export default useServices
