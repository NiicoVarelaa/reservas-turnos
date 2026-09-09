import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn()
}))

import { useMediaQuery } from '@/hooks/useMediaQuery'
import ResponsiveModal from './responsive-modal'

describe('ResponsiveModal', () => {
  it('renders a centered dialog on desktop', () => {
    useMediaQuery.mockReturnValue(false)

    render(
      <ResponsiveModal open title="Título" description="Descripción">
        <p>Cuerpo</p>
      </ResponsiveModal>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByText('Cuerpo')).toBeInTheDocument()
  })

  it('renders a bottom drawer on mobile', () => {
    useMediaQuery.mockReturnValue(true)

    render(
      <ResponsiveModal open title="Título" description="Descripción">
        <p>Cuerpo</p>
      </ResponsiveModal>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByText('Cuerpo')).toBeInTheDocument()
  })
})