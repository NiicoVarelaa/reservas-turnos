import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn()
}))

import { useMediaQuery } from '@/hooks/useMediaQuery'
import ConfirmDialog from './confirm-dialog'

describe('ConfirmDialog', () => {
  it('renders a centered dialog on desktop', () => {
    useMediaQuery.mockReturnValue(false)

    render(
      <ConfirmDialog
        open
        title="Eliminar servicio"
        description="¿Seguro que querés eliminar este servicio?"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        confirmVariant="destructive"
        onConfirm={() => {}}
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Eliminar servicio')).toBeInTheDocument()
    expect(screen.getByText('¿Seguro que querés eliminar este servicio?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('renders a bottom drawer on mobile', () => {
    useMediaQuery.mockReturnValue(true)

    render(
      <ConfirmDialog
        open
        title="Cancelar reserva"
        description="¿Seguro que querés cancelar esta reserva?"
        confirmLabel="Confirmar cancelación"
        cancelLabel="Volver"
        confirmVariant="destructive"
        onConfirm={() => {}}
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Cancelar reserva')).toBeInTheDocument()
    expect(screen.getByText('¿Seguro que querés cancelar esta reserva?')).toBeInTheDocument()
  })

  it('triggers onConfirm when the confirm button is clicked', async () => {
    useMediaQuery.mockReturnValue(false)
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <ConfirmDialog
        open
        title="Eliminar servicio"
        description="¿Seguro que querés eliminar este servicio?"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        confirmVariant="destructive"
        onConfirm={onConfirm}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('takes no action and closes the dialog when the cancel button is clicked', async () => {
    useMediaQuery.mockReturnValue(false)
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const onConfirm = vi.fn()

    render(
      <ConfirmDialog
        open
        title="Eliminar servicio"
        description="¿Seguro que querés eliminar este servicio?"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        confirmVariant="destructive"
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('disables action buttons while loading', () => {
    useMediaQuery.mockReturnValue(false)

    render(
      <ConfirmDialog
        open
        title="Eliminar servicio"
        description="¿Seguro que querés eliminar este servicio?"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        confirmVariant="destructive"
        loading
        onConfirm={() => {}}
      />
    )

    expect(screen.getByText('Procesando...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
  })
})
