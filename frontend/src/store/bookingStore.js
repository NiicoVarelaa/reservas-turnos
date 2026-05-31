import { create } from 'zustand'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const useBookingStore = create((set, get) => ({
  selectedDate: null,
  selectedSlot: null,
  selectedService: null,
  clientInfo: { name: '', email: '', phone: '' },
  bookingStatus: 'idle',
  currentAppointment: null,
  error: null,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  setSelectedService: (service) => set({ selectedService: service }),
  setClientInfo: (info) => set({ clientInfo: { ...get().clientInfo, ...info } }),

  reset: () => set({
    selectedDate: null,
    selectedSlot: null,
    selectedService: null,
    clientInfo: { name: '', email: '', phone: '' },
    bookingStatus: 'idle',
    currentAppointment: null,
    error: null
  }),

  createBooking: async () => {
    const { selectedService, selectedDate, selectedSlot, clientInfo } = get()

    if (!selectedService || !selectedDate || !selectedSlot) {
      set({ error: 'Missing booking details', bookingStatus: 'error' })
      return
    }

    set({ bookingStatus: 'creating', error: null })

    try {
      const { data } = await axios.post(`${API_URL}/api/bookings`, {
        serviceId: selectedService.id,
        professionalId: selectedService.professional_id,
        date: selectedDate,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        clientName: clientInfo.name,
        clientEmail: clientInfo.email,
        clientPhone: clientInfo.phone
      })

      set({ currentAppointment: data.appointment, bookingStatus: 'created' })
      return data.appointment
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to create booking', bookingStatus: 'error' })
      throw err
    }
  },

  createPaymentSession: async (appointmentId) => {
    set({ bookingStatus: 'pending_payment', error: null })

    try {
      const { data } = await axios.post(`${API_URL}/api/payments/create-session`, {
        appointmentId,
        amount: get().selectedService.price_cents,
        currency: get().selectedService.currency || 'usd'
      })

      return data.checkoutUrl
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to create payment session', bookingStatus: 'error' })
      throw err
    }
  }
}))
