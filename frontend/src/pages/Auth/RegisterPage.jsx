import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegister } from '@/hooks/useAuth'
import { registerSchema, formatZodErrors } from '@/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import GoogleButton from '@/components/auth/GoogleButton'
import AuthLayout, { AuthSpinner } from '@/components/auth/AuthLayout'
import { cn } from '@/lib/utils'
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  Settings2,
  TrendingUp,
  UserRound,
} from 'lucide-react'

const ROLE_OPTIONS = [
  {
    value: 'client',
    label: 'Cliente',
    description: 'Reservá turnos',
    icon: UserRound,
  },
  {
    value: 'professional',
    label: 'Profesional',
    description: 'Gestioná tu negocio',
    icon: Building2,
  },
]

const ROLE_CONTENT = {
  client: {
    headline: 'Tu sonrisa, a un clic',
    description:
      'Creá tu cuenta para reservar turnos online, ver tu historial y recibir confirmaciones por WhatsApp.',
    steps: [
      {
        icon: UserRound,
        title: 'Creá tu cuenta',
        text: 'Solo necesitás tu email y una contraseña.',
      },
      {
        icon: CalendarCheck,
        title: 'Elegí tu turno',
        text: 'Servicio, profesional, fecha y horario.',
      },
      {
        icon: MessageSquare,
        title: 'Confirmá por WhatsApp',
        text: 'Recibí la confirmación al instante.',
      },
    ],
    proof: {
      quote: 'Reservar mi turno fue súper simple. Confirmé por WhatsApp en minutos.',
      author: 'María L. · Paciente',
    },
  },
  professional: {
    headline: 'Tu clínica, con reservas 24/7',
    description:
      'Creá tu cuenta para configurar tu negocio, publicar tus servicios y recibir reservas con pagos online.',
    steps: [
      {
        icon: Building2,
        title: 'Creá tu cuenta',
        text: 'Accedé al panel de gestión en minutos.',
      },
      {
        icon: Settings2,
        title: 'Configurá tu negocio',
        text: 'Servicios, precios y horarios en 3 pasos.',
      },
      {
        icon: TrendingUp,
        title: 'Recibí reservas 24/7',
        text: 'Con pagos online protegidos por Stripe.',
      },
    ],
    proof: {
      quote: 'Configuré mis horarios en una tarde y empecé a recibir reservas al día siguiente.',
      author: 'Dra. Camila D. · Odontóloga',
    },
  },
}

const FIELD_IDS = {
  full_name: 'fullName',
  email: 'email',
  phone: 'phone',
  password: 'password',
  confirmPassword: 'confirmPassword',
  terms: 'terms',
}
const FIELD_ORDER = ['full_name', 'email', 'phone', 'password', 'confirmPassword', 'terms']

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '', text: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score: 1, label: 'Débil', color: 'bg-destructive', text: 'text-destructive' }
  if (score <= 2) return { score: 2, label: 'Regular', color: 'bg-orange-500', text: 'text-orange-700' }
  if (score <= 3) return { score: 3, label: 'Buena', color: 'bg-yellow-500', text: 'text-amber-700' }
  if (score <= 4) return { score: 4, label: 'Fuerte', color: 'bg-teal', text: 'text-emerald-700' }
  return { score: 5, label: 'Muy fuerte', color: 'bg-emerald-500', text: 'text-emerald-700' }
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
  show,
  onToggle,
  showCheck = false,
  matched = false,
  children,
}) {
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
          name={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'h-11 rounded-xl pl-10',
            showCheck ? 'pr-16' : 'pr-10',
            error && 'border-destructive focus-visible:ring-destructive',
            !error && showCheck && matched && 'border-teal focus-visible:ring-teal'
          )}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={show}
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {show ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
        {showCheck && matched && !error && (
          <CheckCircle2
            className="pointer-events-none absolute right-10 top-1/2 h-4 w-4 -translate-y-1/2 text-teal"
            aria-hidden="true"
          />
        )}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      {children}
    </div>
  )
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('client')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const register = useRegister()
  const navigate = useNavigate()

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password])
  const passwordsMatch = Boolean(formData.confirmPassword) && formData.password === formData.confirmPassword
  const content = ROLE_CONTENT[role]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((previous) => ({ ...previous, [name]: value }))
    if (errors[name] || errors.form) {
      setErrors((previous) => {
        const next = { ...previous }
        delete next[name]
        delete next.form
        return next
      })
    }
  }

  const handleTermsChange = (e) => {
    setAcceptedTerms(e.target.checked)
    if (errors.terms || errors.form) {
      setErrors((previous) => {
        const next = { ...previous }
        delete next.terms
        delete next.form
        return next
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const nextErrors = {}

    if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (!acceptedTerms) {
      nextErrors.terms = 'Tenés que aceptar los términos para crear tu cuenta.'
    }

    const result = registerSchema.safeParse({
      email: formData.email.trim(),
      password: formData.password,
      full_name: formData.fullName.trim(),
      phone: formData.phone.trim() || undefined,
    })

    if (!result.success) {
      Object.assign(nextErrors, formatZodErrors(result.error))
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field])
      if (firstInvalid) document.getElementById(FIELD_IDS[firstInvalid])?.focus()
      return
    }

    setErrors({})
    setLoading(true)

    try {
      await register.mutateAsync({
        email: formData.email.trim(),
        password: formData.password,
        metadata: {
          full_name: formData.fullName.trim(),
          phone: formData.phone.trim(),
        },
      })

      if (role === 'professional') {
        navigate('/onboarding/business')
      } else {
        navigate('/book')
      }
    } catch (err) {
      setErrors({ form: err.message || 'Error al crear la cuenta' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      brandEyebrow="Crear cuenta"
      headline={content.headline}
      description={content.description}
      features={content.steps}
      featuresOrdered
      proof={content.proof}
      topRight={
        <p className="text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      }
      cardEyebrow="Registro"
      cardTitle="Creá tu cuenta"
      cardDescription="Elegí el tipo de cuenta y completá tus datos para empezar."
      secureNote="Tus datos están protegidos y nunca los compartimos con terceros."
      footer={
        <>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Iniciá sesión
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
                onClick={() => setRole(value)}
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

      <GoogleButton role={role} className="mt-5" label="Registrarte con Google" />

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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre completo</Label>
            <div className="relative">
              <UserRound
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder={role === 'professional' ? 'Dra. María García' : 'Juan Pérez'}
                autoComplete="name"
                aria-invalid={Boolean(errors.full_name)}
                aria-describedby={errors.full_name ? 'fullName-error' : undefined}
                className={cn(
                  'h-11 rounded-xl pl-10',
                  errors.full_name && 'border-destructive focus-visible:ring-destructive'
                )}
              />
            </div>
            {errors.full_name && (
              <p id="fullName-error" role="alert" className="text-xs text-destructive">
                {errors.full_name}
              </p>
            )}
          </div>

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
                value={formData.email}
                onChange={handleChange}
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Teléfono <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <div className="relative">
            <Phone
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+5491112345678"
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'phone-error' : 'phone-hint'}
              className={cn(
                'h-11 rounded-xl pl-10',
                errors.phone && 'border-destructive focus-visible:ring-destructive'
              )}
            />
          </div>
          {errors.phone ? (
            <p id="phone-error" role="alert" className="text-xs text-destructive">
              {errors.phone}
            </p>
          ) : (
            <p id="phone-hint" className="text-xs text-muted-foreground">
              Lo usamos para confirmar tus turnos por WhatsApp.
            </p>
          )}
        </div>

        <PasswordField
          id="password"
          label="Contraseña"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
          show={showPassword}
          onToggle={() => setShowPassword((value) => !value)}
        >
          {formData.password ? (
            <div className="space-y-1.5 pt-1">
              <div className="flex gap-1.5" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className={cn(
                      'h-1.5 flex-1 rounded-full transition-all duration-300',
                      index < passwordStrength.score ? passwordStrength.color : 'bg-muted'
                    )}
                  />
                ))}
              </div>
              <p
                className={cn('text-xs font-medium', passwordStrength.text)}
                aria-live="polite"
              >
                {passwordStrength.label}
              </p>
            </div>
          ) : (
            <p className="pt-1 text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
          )}
        </PasswordField>

        <PasswordField
          id="confirmPassword"
          label="Confirmar contraseña"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
          show={showConfirmPassword}
          onToggle={() => setShowConfirmPassword((value) => !value)}
          showCheck
          matched={passwordsMatch}
        />

        <div>
          <label
            htmlFor="terms"
            className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
          >
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={handleTermsChange}
              aria-invalid={Boolean(errors.terms)}
              aria-describedby={errors.terms ? 'terms-error' : undefined}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <span>
              Acepto los{' '}
              <Link
                to="/terms"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Términos y Condiciones
              </Link>{' '}
              y la{' '}
              <Link
                to="/legal"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Política de Privacidad
              </Link>
              .
            </span>
          </label>
          {errors.terms && (
            <p id="terms-error" role="alert" className="mt-1.5 text-xs text-destructive">
              {errors.terms}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-shadow hover:shadow-primary/30"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <AuthSpinner />
              Creando cuenta...
            </span>
          ) : (
            `Crear cuenta ${role === 'professional' ? 'profesional' : 'de cliente'}`
          )}
        </Button>
      </form>

    </AuthLayout>
  )
}