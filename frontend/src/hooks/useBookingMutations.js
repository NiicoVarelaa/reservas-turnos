import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingsApi, paymentsApi } from '@/services/api'
import { queryKeys } from '@/lib/queryKeys'

const SLOT_TAKEN_ERROR = 'This time slot is already booked'
const SLOT_TAKEN_MESSAGE = 'Este horario ya fue reservado. Por favor, elegí otro horario.'

export const getBookingErrorMessage = (err) => {
  const raw = err.response?.data?.error || err.response?.data?.error?.message || err.message
  const message = typeof raw === 'string' ? raw : 'Error al crear la reserva'
  return message === SLOT_TAKEN_ERROR ? SLOT_TAKEN_MESSAGE : message
}

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload) => bookingsApi.create(payload),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(queryKeys.bookings.detail(data.appointment.id), data.appointment)
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
    },
  })
}

export function useBooking(sessionId) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(sessionId),
    queryFn: async () => {
      const { data } = await bookingsApi.getById(sessionId)
      return data.appointment || null
    },
    enabled: Boolean(sessionId),
    retry: false,
  })
}

export function useCreatePaymentSession() {
  return useMutation({
    mutationFn: (payload) => paymentsApi.createSession(payload),
  })
}
