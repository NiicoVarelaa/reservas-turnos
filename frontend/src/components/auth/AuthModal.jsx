import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLogin, useRegister } from '@/hooks/useAuth'
import { useBookingStore } from '@/store/bookingStore'
import { loginSchema, registerSchema, formatZodErrors } from '@/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import ResponsiveModal from '@/components/ui/responsive-modal'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react'

const MODES = [
  { value: 'guest', label: 'Invitado', icon: UserRound },
  { value: 'login', label: 'Iniciar sesión', icon: LogIn },
]

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

function ErrorAlert({ children }) {
  if (!children) return null
  return (
    <div
      className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </div>
  )
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  autoComplete = 'current-password',
}) {
  const [show, setShow] = useState(false)
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'h-11 rounded-xl pl-10 pr-10',
            error && 'border-destructive focus-visible:ring-destructive'
          )}
        />
        <button
          type="button"
          onClick={() => setShow((previous) => !previous)}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={show}
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {show ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export default function AuthModal({ open, onOpenChange, onContinue, onLogin }) {
  const { clientInfo, setGuest } = useBookingStore()
  const loginMutation = useLogin()
  const registerMutation = useRegister()
  const [mode, setMode] = useState('guest')
  const [email, setEmail] = useState(clientInfo.email || '')
  const [password, setPassword] = useState('')
  const [createAccount, setCreateAccount] = useState(false)
  const [accountPassword, setAccountPassword] = useState('')
  const [error, setError] = useState('')
  const [guestErrors, setGuestErrors] = useState({})
  const [loginErrors, setLoginErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const changeMode = (nextMode) => {
    setMode(nextMode)
    setError('')
    setGuestErrors({})
    setLoginErrors({})
  }

  const handleGuestContinue = async (event) => {
    event.preventDefault()
    setError('')

    if (createAccount) {
      const result = registerSchema.safeParse({
        email: clientInfo.email,
        password: accountPassword,
        full_name: clientInfo.name,
        phone: clientInfo.phone,
      })

      if (!result.success) {
        const nextErrors = formatZodErrors(result.error)
        setGuestErrors(nextErrors)
        if (nextErrors.password) {
          document.getElementById('guest-password')?.focus()
        }
        return
      }

      setGuestErrors({})
      setLoading(true)

      try {
        await registerMutation.mutateAsync({
          email: clientInfo.email,
          password: accountPassword,
          metadata: {
            full_name: clientInfo.name,
            phone: clientInfo.phone,
          },
        })
      } catch (err) {
        setError(err.message || 'No pudimos crear tu cuenta. Probá de nuevo.')
        setLoading(false)
        return
      }

      setLoading(false)
    } else {
      setGuest({
        name: clientInfo.name,
        email: clientInfo.email,
        phone: clientInfo.phone,
      })
    }

    onContinue()
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')

    const result = loginSchema.safeParse({ email: email.trim(), password })

    if (!result.success) {
      const nextErrors = formatZodErrors(result.error)
      setLoginErrors(nextErrors)
      if (nextErrors.email) {
        document.getElementById('auth-email')?.focus()
      } else if (nextErrors.password) {
        document.getElementById('auth-password')?.focus()
      }
      return
    }

    setLoginErrors({})
    setLoading(true)

    try {
      await loginMutation.mutateAsync({ email: email.trim(), password })
      onLogin()
    } catch (err) {
      setError(err.message || 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  const isGuest = mode === 'guest'

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="¿Cómo querés continuar?"
      description="Podés reservar como invitado o iniciar sesión para ver tus turnos."
    >
      <div className="mt-4 space-y-4 px-4 sm:px-0">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1.5" role="group" aria-label="Cómo querés continuar">
          {MODES.map(({ value, label, icon: Icon }) => {
            const selected = mode === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => changeMode(value)}
                aria-pressed={selected}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  selected
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            )
          })}
        </div>

        {isGuest ? (
          <form onSubmit={handleGuestContinue} className="space-y-4" noValidate>
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Reservás a nombre de
              </p>
              <p className="mt-2 text-sm font-semibold">{clientInfo.name || '—'}</p>
              <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{clientInfo.email || '—'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{clientInfo.phone || '—'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 p-4">
              <div>
                <Label htmlFor="create-account" className="text-sm font-medium">Crear una cuenta</Label>
                <p id="create-account-hint" className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Para ver tus turnos y reservar más rápido la próxima vez.
                </p>
              </div>
              <Switch
                id="create-account"
                checked={createAccount}
                onCheckedChange={(checked) => {
                  setCreateAccount(checked)
                  setError('')
                  setGuestErrors({})
                }}
                aria-describedby="create-account-hint"
              />
            </div>

            {createAccount && (
              <PasswordInput
                id="guest-password"
                label="Contraseña"
                value={accountPassword}
                onChange={(event) => {
                  setAccountPassword(event.target.value)
                  if (guestErrors.password) {
                    setGuestErrors((previous) => {
                      const next = { ...previous }
                      delete next.password
                      return next
                    })
                  }
                }}
                error={guestErrors.password}
                hint="Mínimo 8 caracteres."
                autoComplete="new-password"
              />
            )}

            <ErrorAlert>{error}</ErrorAlert>

            <Button
              type="submit"
              className="h-11 w-full rounded-xl font-medium shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Procesando...
                </span>
              ) : (
                <>
                  {createAccount ? 'Crear cuenta y continuar' : 'Continuar como invitado'}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </Button>

            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              Al continuar aceptás los{' '}
              <Link to="/terms" target="_blank" rel="noreferrer" className="font-medium text-primary underline-offset-4 hover:underline">
                Términos y Condiciones
              </Link>{' '}
              y la{' '}
              <Link to="/legal" target="_blank" rel="noreferrer" className="font-medium text-primary underline-offset-4 hover:underline">
                Política de Privacidad
              </Link>
              .
            </p>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="auth-email">Email</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (loginErrors.email) {
                      setLoginErrors((previous) => {
                        const next = { ...previous }
                        delete next.email
                        return next
                      })
                    }
                  }}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  aria-invalid={Boolean(loginErrors.email)}
                  aria-describedby={loginErrors.email ? 'auth-email-error' : undefined}
                  className={cn(
                    'h-11 rounded-xl pl-10',
                    loginErrors.email && 'border-destructive focus-visible:ring-destructive'
                  )}
                />
              </div>
              {loginErrors.email && (
                <p id="auth-email-error" role="alert" className="text-xs text-destructive">
                  {loginErrors.email}
                </p>
              )}
            </div>

            <PasswordInput
              id="auth-password"
              label="Contraseña"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                if (loginErrors.password) {
                  setLoginErrors((previous) => {
                    const next = { ...previous }
                    delete next.password
                    return next
                  })
                }
              }}
              error={loginErrors.password}
              autoComplete="current-password"
            />

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                target="_blank"
                rel="noreferrer"
                className="rounded text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <ErrorAlert>{error}</ErrorAlert>

            <Button
              type="submit"
              className="h-11 w-full rounded-xl font-medium shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Ingresando...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              ¿Todavía no tenés cuenta? Podés continuar como invitado.
            </p>
          </form>
        )}
      </div>
    </ResponsiveModal>
  )
}
