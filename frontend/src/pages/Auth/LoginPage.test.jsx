import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

const rejectLogin = vi.fn().mockRejectedValue(new Error('Credenciales inválidas'))

vi.mock('@/hooks/useAuth', () => ({
  useLogin: () => ({ mutateAsync: rejectLogin, isPending: false }),
  useRegister: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useGoogleLogin: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useLogout: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useProfile: () => ({ data: null, isLoading: false, isError: false, refetch: vi.fn() }),
  useUpdateProfile: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useAuthUser: () => null,
  useIsAuthenticated: () => false,
}))

vi.mock('@/components/auth/GoogleButton', () => ({
  default: () => <button type="button">Continuar con Google</button>
}))

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}))

import LoginPage from './LoginPage'

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </MemoryRouter>
  )

describe('LoginPage', () => {
  it('renders the login form with both role options and Google button', () => {
    renderLogin()

    expect(screen.getByRole('heading', { name: 'Iniciá sesión' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Profesional/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Cliente/i })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: /Continuar con Google/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Creá una' }).length).toBeGreaterThan(0)
  })

  it('shows a link to recover the password', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: '¿Olvidaste tu contraseña?' })).toBeInTheDocument()
  })

  it('updates the context when switching role', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: /Cliente/i }))

    expect(screen.getByRole('button', { name: /Cliente/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Profesional/i })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('heading', { name: 'Tu sonrisa, a un clic' })).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    renderLogin()

    const passwordInput = screen.getByLabelText('Contraseña')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))

    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeInTheDocument()
  })

  it('validates the email before submitting', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.type(screen.getByLabelText('Contraseña'), 'secret')
    fireEvent.submit(screen.getByLabelText('Email').closest('form'))

    expect(await screen.findByText('Email inválido')).toBeInTheDocument()
  })

  it('shows the form error banner when login fails', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument()
  })
})
