import { useState, useEffect, useCallback } from 'react'
import { servicesApi } from '../services/api'

export function useServices(filters = {}) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await servicesApi.getAll(filters)
      const validServices = (data.services || []).filter(s => s?.id)
      setServices(validServices)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch services')
      setServices([])
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  return { services, loading, error, refetch: fetchServices }
}
