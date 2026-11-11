import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLogin } from '@/hooks/useAuth'
import { loginSchema, formatZodErrors } from '@/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import GoogleButton from '@/components/auth/GoogleButton'
import InitialsAvatar from '@/components/ui/InitialsAvatar'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
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
  Sparkles,
  Star,
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

const PROOF_AVATARS = ['María López', 'Carlos García', 'Ana Rodríguez']
const FIELD_IDS = {
  email: 'email',
  password: 'password',
}
const FIELD_ORDER = ['email', 'password']

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
    <div className="min-h-screen lg:flex">
      {/* Panel de marca */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-navy via-navy to-primary lg:flex lg:w-[46%] xl:w-[48%]">
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-teal/15 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.55) 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
          <Link
            to="/"
            className="flex w-fit items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
            aria-label="Smile Book — Inicio"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/15">
              <img src="/logo.png" alt="" className="h-6 w-6 object-contain" />
            </span>
            <span className="text-lg font-bold text-white">Smile Book</span>
          </Link>

          <div className="max-w-md py-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
              Acceso
            </span>

            <h2 className="mt-5 text-[2.15rem] font-bold leading-[1.15] tracking-tight text-white text-balance xl:text-4xl">
              {content.headline}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/65">
              {content.description}
            </p>

            <ul className="mt-9 space-y-5">
              {content.features.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-inset ring-white/10">
                    <Icon className="h-4 w-4 text-teal" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/55">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex -space-x-2" aria-hidden="true">
                  {PROOF_AVATARS.map((name) => (
                    <InitialsAvatar
                      key={name}
                      name={name}
                      className="h-8 w-8 text-[10px] ring-2 ring-navy"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-0.5 text-teal" aria-label="Calificación 4.9 de 5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3 w-3 fill-current" aria-hidden="true" />
                  ))}
                  <span className="ml-1.5 text-xs font-medium text-white/70">4.9</span>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                “{content.proof.quote}”
              </p>
              <p className="mt-1.5 text-xs text-white/45">{content.proof.author}</p>
            </div>

            <p className="mt-5 text-xs text-white/40">
              © {new Date().getFullYear()} Smile Book ·{' '}
              <Link to="/terms" className="transition-colors hover:text-white/70">
                Términos
              </Link>{' '}
              ·{' '}
              <Link to="/legal" className="transition-colors hover:text-white/70">
                Privacidad
              </Link>
            </p>
          </div>
        </div>
      </aside>

      {/* Panel del formulario */}
      <main className="flex flex-1 flex-col">
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border/70 bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver
          </Link>
          <Link to="/" className="flex items-center gap-2" aria-label="Smile Book — Inicio">
            <img src="/logo.png" alt="" className="h-6 w-6 object-contain" />
            <span className="text-sm font-bold">Smile Book</span>
          </Link>
        </div>

        <div className="relative flex flex-1 items-center justify-center bg-gradient-to-b from-background via-background to-muted/30 p-6 sm:p-10 lg:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -right-24 top-8 h-64 w-64 rounded-full bg-teal/5 blur-3xl" />
            <div className="absolute -left-24 bottom-8 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="relative w-full max-w-lg">
            <div className="mb-6 hidden items-center justify-between gap-4 lg:flex">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Volver al inicio
              </Link>
              <p className="text-sm text-muted-foreground">
                ¿No tenés cuenta?{' '}
                <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
                  Creá una
                </Link>
              </p>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl shadow-primary/[0.04] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Acceso
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance">
                Iniciá sesión
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Elegí el tipo de cuenta e ingresá con tu email y contraseña.
              </p>

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
                      <Spinner />
                      Ingresando...
                    </span>
                  ) : (
                    'Iniciar sesión'
                  )}
                </Button>
              </form>

              <div className="mt-6 border-t border-border/70 pt-5 text-center text-sm text-muted-foreground lg:hidden">
                ¿No tenés cuenta?{' '}
                <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
                  Creá una
                </Link>
              </div>
            </div>

            <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
              Conexión segura. Tus credenciales están protegidas.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
