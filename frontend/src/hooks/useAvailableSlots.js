import { useState, useCallback } from 'react'
import { servicesApi } from '../services/api'

export function useAvailableSlots(serviceId, date) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSlots = useCallback(async () => {
    if (!serviceId || !date) return

    setLoading(true)
    setError(null)

    try {
      const { data } = await servicesApi.getSlots(serviceId, date)
      setSlots(data.slots || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch available slots')
      setSlots([])
    } finally {
      setLoading(false)
    }
  }, [serviceId, date])

  return { slots, loading, error, refetch: fetchSlots }
}
