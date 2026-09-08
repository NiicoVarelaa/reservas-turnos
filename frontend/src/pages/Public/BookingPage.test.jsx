import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

vi.mock('@/services/api', () => ({
  servicesApi: {
    getById: vi.fn(),
    getProfessionals: vi.fn(),
    getAvailableSlots: vi.fn()
  },
  bookingsApi: { create: vi.fn() },
  paymentsApi: { createSession: vi.fn() },
  default: {}
}))

vi.mock('@/hooks/useProfessionals', () => ({
  useProfessionals: () => ({ professionals: [], loading: false })
}))

vi.mock('@/hooks/useAvailableSlots', () => ({
  useAvailableSlots: () => ({ slots: [], loading: false, refetch: vi.fn() })
}))

vi.mock('@/components/auth/AuthModal', () => ({
  default: () => null
}))

import { servicesApi } from '@/services/api'
import BookingPage from './BookingPage'

const renderBooking = (serviceId) =>
  render(
    <MemoryRouter initialEntries={[`/book/${serviceId}`]}>
      <Routes>
        <Route path="/book/:serviceId" element={<BookingPage />} />
      </Routes>
    </MemoryRouter>
  )

describe('BookingPage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('loads the service and shows its details', async () => {
    servicesApi.getById.mockResolvedValue({
      data: { service: { id: 'svc-1', name: 'Limpieza Dental', duration_min: 30 } }
    })

    renderBooking('svc-1')

    expect(await screen.findByText('Limpieza Dental')).toBeInTheDocument()
    expect(screen.getByText('30 min')).toBeInTheDocument()
    expect(screen.getByText('¿Con qué profesional querés tu turno?')).toBeInTheDocument()
  })

  it('shows a not found screen when the service does not exist', async () => {
    servicesApi.getById.mockResolvedValue({ data: { service: null } })

    renderBooking('missing-service')

    expect(await screen.findByText('Servicio no encontrado')).toBeInTheDocument()
  })

  it('shows the select-service guard when there is no service id', async () => {
    render(
      <MemoryRouter initialEntries={['/book']}>
        <Routes>
          <Route path="/book" element={<BookingPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Seleccioná un servicio primero')).toBeInTheDocument()
  })
})