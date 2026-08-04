import { useState, useEffect, useCallback } from 'react'
import { servicesApi } from '../services/api'

export function useProfessionals(serviceId) {
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfessionals = useCallback(async () => {
    if (!serviceId || serviceId === 'undefined') return

    setLoading(true)
    setError(null)

    try {
      const { data } = await servicesApi.getProfessionals(serviceId)
      setProfessionals(data.professionals || [])
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar los profesionales')
      setProfessionals([])
    } finally {
      setLoading(false)
    }
  }, [serviceId])

  useEffect(() => {
    fetchProfessionals()
  }, [fetchProfessionals])

  return { professionals, loading, error, refetch: fetchProfessionals }
}