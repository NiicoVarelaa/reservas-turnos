import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

vi.mock('@/services/api', () => ({
  servicesApi: {
    getById: vi.fn(),
    getProfessionals: vi.fn(),
    getSlots: vi.fn()
  },
  bookingsApi: { create: vi.fn() },
  paymentsApi: { createSession: vi.fn() },
  default: {}
}))

vi.mock('@/components/auth/AuthModal', () => ({
  default: () => null
}))

import { servicesApi } from '@/services/api'
import BookingPage from './BookingPage'
import { renderWithProviders } from '@/test/utils'

const renderBooking = (serviceId) =>
  renderWithProviders(
    <MemoryRouter initialEntries={[`/book/${serviceId}`]}>
      <Routes>
        <Route path="/book/:serviceId" element={<BookingPage />} />
      </Routes>
    </MemoryRouter>
  )

describe('BookingPage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('loads the service and shows its details', async () => {
    servicesApi.getById.mockResolvedValue({
      data: { service: { id: 'svc-1', name: 'Limpieza Dental', duration_min: 30 } }
    })

    renderBooking('svc-1')

    expect(await screen.findByRole('heading', { name: 'Limpieza Dental' })).toBeInTheDocument()
    expect(screen.getAllByText('30 min').length).toBeGreaterThan(0)
    expect(screen.getByText('¿Con qué profesional querés atenderte?')).toBeInTheDocument()
  })

  it('shows a not found screen when the service does not exist', async () => {
    servicesApi.getById.mockResolvedValue({ data: { service: null } })

    renderBooking('missing-service')

    expect(await screen.findByText('No encontramos este servicio')).toBeInTheDocument()
  })

  it('shows the select-service guard when there is no service id', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/book']}>
        <Routes>
          <Route path="/book" element={<BookingPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Elegí un servicio primero')).toBeInTheDocument()
  })
})
