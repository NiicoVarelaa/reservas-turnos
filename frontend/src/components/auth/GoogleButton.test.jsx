import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/supabaseClient', () => ({
  supabaseClient: null,
  isGoogleEnabled: () => false
}))

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}))

import GoogleButton from './GoogleButton'
import { toast } from '@/hooks/use-toast'

describe('GoogleButton', () => {
  it('renders the label', () => {
    render(<GoogleButton label="Continuar con Google" />)
    expect(screen.getByRole('button', { name: /Continuar con Google/i })).toBeInTheDocument()
  })

  it('shows a toast when Google is not configured', async () => {
    const user = userEvent.setup()
    render(<GoogleButton />)

    await user.click(screen.getByRole('button', { name: /Continuar con Google/i }))

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Google no configurado' })
    )
  })
})