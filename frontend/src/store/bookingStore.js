import { create } from 'zustand'

const initialClientInfo = { name: '', email: '', phone: '' }

export const useBookingStore = create((set, get) => ({
  selectedDate: null,
  selectedSlot: null,
  selectedService: null,
  selectedProfessional: null,
  clientInfo: initialClientInfo,
  isGuest: false,
  guestInfo: null,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  setSelectedService: (service) => set({ selectedService: service }),
  setSelectedProfessional: (professional) => set({ selectedProfessional: professional }),
  setClientInfo: (info) => set({ clientInfo: { ...get().clientInfo, ...info } }),
  setGuest: (info) => set({ isGuest: true, guestInfo: info }),

  reset: () => set({
    selectedDate: null,
    selectedSlot: null,
    selectedService: null,
    selectedProfessional: null,
    clientInfo: initialClientInfo,
    isGuest: false,
    guestInfo: null,
  }),
}))

export default useBookingStore
