import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLogin } from '@/hooks/useAuth'
import { loginSchema, formatZodErrors } from '@/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import GoogleButton from '@/components/auth/GoogleButton'
import AuthLayout, { AuthSpinner } from '@/components/auth/AuthLayout'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  History,
  LayoutDashboard,
  Lock,
  Mail,
  MessageSquare,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

const ROLE_OPTIONS = [
  {
    value: 'professional',
    label: 'Profesional',
    description: 'Gestioná tu negocio',
    icon: Building2,
  },
  {
    value: 'client',
    label: 'Cliente',
    description: 'Reservá turnos',
    icon: UserRound,
  },
]

const ROLE_CONTENT = {
  professional: {
    headline: 'Bienvenido de vuelta a tu clínica',
    description:
      'Accedé a tu panel para gestionar turnos, servicios, horarios y pacientes en un solo lugar.',
    features: [
      {
        icon: CalendarCheck,
        title: 'Reservas 24/7',
        text: 'Tus pacientes reservan cuando quieran.',
      },
      {
        icon: ShieldCheck,
        title: 'Pagos seguros',
        text: 'Cobrá online con Stripe integrado.',
      },
      {
        icon: LayoutDashboard,
        title: 'Todo en un panel',
        text: 'Turnos, servicios, horarios y tu negocio.',
      },
    ],
    proof: {
      quote: 'Configuré mis horarios en una tarde y empecé a recibir reservas al día siguiente.',
      author: 'Dra. Camila D. · Odontóloga',
    },
  },
  client: {
    headline: 'Tu sonrisa, a un clic',
    description:
      'Ingresá para reservar tu próximo turno, ver tu historial y recibir confirmaciones por WhatsApp.',
    features: [
      {
        icon: CalendarCheck,
        title: 'Reservá en minutos',
        text: 'Elegí servicio, profesional y horario.',
      },
      {
        icon: MessageSquare,
        title: 'Confirmación por WhatsApp',
        text: 'Recibí el recordatorio de tu turno.',
      },
      {
        icon: History,
        title: 'Tu historial a mano',
        text: 'Consultá tus reservas cuando quieras.',
      },
    ],
    proof: {
      quote: 'Reservar mi turno fue súper simple. Confirmé por WhatsApp en minutos.',
      author: 'María L. · Paciente',
    },
  },
}

const FIELD_IDS = {
  email: 'email',
  password: 'password',
}
const FIELD_ORDER = ['email', 'password']

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('professional')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const login = useLogin()
  const navigate = useNavigate()
  const content = ROLE_CONTENT[role]

  const clearError = (field) => {
    if (!errors[field] && !errors.form) return
    setErrors((previous) => {
      const next = { ...previous }
      delete next[field]
      delete next.form
      return next
    })
  }

  const handleRoleChange = (nextRole) => {
    if (nextRole === role) return
    setRole(nextRole)
    setErrors({})
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    clearError('email')
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    clearError('password')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const result = loginSchema.safeParse({ email: email.trim(), password })

    if (!result.success) {
      const nextErrors = formatZodErrors(result.error)
      setErrors(nextErrors)
      const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field])
      if (firstInvalid) document.getElementById(FIELD_IDS[firstInvalid])?.focus()
      return
    }

    setErrors({})
    setLoading(true)

    try {
      await login.mutateAsync({ email: email.trim(), password })
      toast({ title: 'Inicio de sesión exitoso', description: 'Bienvenido de vuelta', variant: 'success' })
      navigate('/dashboard')
    } catch (err) {
      setErrors({ form: err.message || 'Error al iniciar sesión' })
      toast({ title: 'Error al iniciar sesión', description: err.message || 'Credenciales inválidas', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      brandEyebrow="Acceso"
      headline={content.headline}
      description={content.description}
      features={content.features}
      proof={content.proof}
      topRight={
        <p className="text-sm text-muted-foreground">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
            Creá una
          </Link>
        </p>
      }
      cardEyebrow="Acceso"
      cardTitle="Iniciá sesión"
      cardDescription="Elegí el tipo de cuenta e ingresá con tu email y contraseña."
      footer={
        <>
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
            Creá una
          </Link>
        </>
      }
    >
      <fieldset className="mt-6">
        <legend className="mb-2 text-sm font-medium">Tipo de cuenta</legend>
        <div className="grid grid-cols-2 gap-3">
          {ROLE_OPTIONS.map(({ value, label, description, icon: Icon }) => {
            const selected = role === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleRoleChange(value)}
                aria-pressed={selected}
                disabled={loading}
                className={cn(
                  'relative flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
                  selected
                    ? 'border-primary/30 bg-primary/5 ring-1 ring-inset ring-primary/15'
                    : 'border-border bg-background hover:border-primary/20 hover:bg-muted/40'
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                    selected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="mt-1 text-sm font-semibold text-foreground">{label}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
                {selected && (
                  <CheckCircle2
                    className="absolute right-3 top-3 h-4 w-4 text-primary"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>
      </fieldset>

      <GoogleButton className="mt-5" label="Continuar con Google" />

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border/70" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">o con email</span>
        </div>
      </div>

      {errors.form && (
        <div
          className="mb-5 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
          role="alert"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/20">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </div>
          <p>{errors.form}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="tu@email.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={cn(
                'h-11 rounded-xl pl-10',
                errors.email && 'border-destructive focus-visible:ring-destructive'
              )}
            />
          </div>
          {errors.email && (
            <p id="email-error" role="alert" className="text-xs text-destructive">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={cn(
                'h-11 rounded-xl pl-10 pr-10',
                errors.password && 'border-destructive focus-visible:ring-destructive'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPassword}
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" role="alert" className="text-xs text-destructive">
              {errors.password}
            </p>
          )}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="rounded text-xs font-medium text-primary underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-shadow hover:shadow-primary/30"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <AuthSpinner />
              Ingresando...
            </span>
          ) : (
            'Iniciar sesión'
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}
