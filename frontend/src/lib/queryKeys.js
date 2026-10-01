export const queryKeys = {
  auth: {
    all: ['auth'],
    profile: () => ['auth', 'profile'],
  },
  services: {
    all: ['services'],
    list: (filters) => ['services', 'list', filters],
    detail: (id) => ['services', 'detail', id],
    professionals: (id) => ['services', 'professionals', id],
    slots: (id, date, professionalId) => ['services', 'slots', id, date, professionalId],
  },
  appointments: {
    all: ['appointments'],
    list: (params) => ['appointments', 'list', params],
    detail: (id) => ['appointments', 'detail', id],
  },
  bookings: {
    detail: (id) => ['bookings', 'detail', id],
  },
  business: {
    all: ['business'],
    my: () => ['business', 'my'],
    detail: (id) => ['business', 'detail', id],
    bySlug: (slug) => ['business', 'slug', slug],
    nextAvailableSlot: (id) => ['business', 'next-available-slot', id],
  },
  schedules: {
    all: ['schedules'],
  },
}

export default queryKeys
