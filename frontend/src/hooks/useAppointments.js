import { useState, useEffect, useCallback } from 'react'
import { appointmentsApi } from '../services/api'

export function useAppointments(filters = {}) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await appointmentsApi.getAll(filters)
      setAppointments(data.appointments || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch appointments')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  return { appointments, loading, error, refetch: fetchAppointments }
}
