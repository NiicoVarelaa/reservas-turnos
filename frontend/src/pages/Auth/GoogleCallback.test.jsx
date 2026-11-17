import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import GoogleCallback from './GoogleCallback'

const getSession = vi.fn()

vi.mock('@/lib/supabaseClient', () => ({
  isGoogleEnabled: () => true,
  supabaseClient: {
    auth: {
      getSession: (...args) => getSession(...args),
    },
  },
}))

vi.mock('@/hooks/useAuth', () => ({
  useGoogleLogin: () => ({
    mutateAsync: vi.fn(() => new Promise(() => {})),
    isPending: true,
  }),
}))

getSession.mockResolvedValue({
  data: { session: { access_token: 'provider-token' } },
  error: null,
})

describe('GoogleCallback', () => {
  it('renders the verification state while exchanging the session', async () => {
    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <Routes>
          <Route path="/auth/callback" element={<GoogleCallback />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText('Conectando tu cuenta')).toBeInTheDocument()
    expect(screen.getByText('Verificando tu cuenta de Google...')).toBeInTheDocument()
    expect(screen.getByText('Un segundo y estás dentro')).toBeInTheDocument()
  })
})
