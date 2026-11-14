import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '@/services/authService'
import { forgotPasswordSchema, formatZodErrors } from '@/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AuthLayout, { AuthErrorMessage, AuthSpinner } from '@/components/auth/AuthLayout'
import { AlertTriangle, CheckCircle2, Clock3, Lock, Mail, ShieldCheck } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const FEATURES = [
  {
    icon: Mail,
    title: 'Enlace por email',
    text: 'Llega en segundos a la casilla de tu cuenta.',
  },
  {
    icon: Clock3,
    title: 'Válido 30 minutos',
    text: 'Por seguridad, el enlace expira rápido.',
  },
  {
    icon: ShieldCheck,
    title: 'Sin compartir datos',
    text: 'Solo vos podés restablecer la contraseña.',
  },
]

const PROOF = {
  quote: 'Me olvidé la contraseña y en dos minutos ya estaba reservando de nuevo.',
  author: 'Lucía F. · Paciente',
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const result = forgotPasswordSchema.safeParse({ email: email.trim() })
    if (!result.success) {
      setErrors(formatZodErrors(result.error))
      return
    }

    setLoading(true)
    try {
      await authService.forgotPassword(email.trim())
      setSent(true)
      setErrors({})
    } catch (err) {
      setErrors({ form: err.message || 'Hubo un problema. Intentá de nuevo.' })
      toast({
        title: 'No pudimos enviar el email',
        description: err.message || 'Intentá de nuevo en unos segundos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      brandEyebrow="Recuperar acceso"
      headline="Recuperá el acceso a tu cuenta"
      description="Te enviamos un enlace seguro para que puedas elegir una nueva contraseña y volver a tus turnos."
      features={FEATURES}
      proof={PROOF}
      topRight={
        <p className="text-sm text-muted-foreground">
          ¿Recordaste tu contraseña?{' '}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      }
      cardEyebrow="Recuperar acceso"
      cardTitle={sent ? 'Revisá tu email' : '¿Olvidaste tu contraseña?'}
      cardDescription={
        sent
          ? 'Si la cuenta existe, el enlace ya está en camino.'
          : 'Ingresá tu email y te enviamos un enlace para restablecerla.'
      }
      secureNote="Nunca te vamos a pedir tu contraseña por email."
      footer={
        <>
          ¿Recordaste tu contraseña?{' '}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Iniciá sesión
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="mt-6">
          <div className="flex flex-col items-center rounded-2xl border border-teal/20 bg-teal/[0.06] px-5 py-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal/15 text-teal ring-1 ring-inset ring-teal/20">
              <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">Enlace enviado</h2>
            <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Si existe una cuenta con <strong className="text-foreground">{email}</strong>, vas a
              recibir un enlace válido por 30 minutos.
            </p>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
              Si no lo ves, revisá la carpeta de spam o intentá de nuevo en unos minutos.
            </p>
          </div>

          <Button
            variant="outline"
            className="mt-4 h-11 w-full rounded-xl"
            onClick={() => {
              setSent(false)
              setEmail('')
            }}
          >
            Enviar de nuevo
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          {errors.form && <AuthErrorMessage message={errors.form} icon={AlertTriangle} />}

          <div className="space-y-2">
            <Label htmlFor="forgot-email">Email</Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="forgot-email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (errors.email || errors.form) setErrors({})
                }}
                placeholder="tu@email.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'forgot-email-error' : undefined}
                className={`h-11 rounded-xl pl-10 ${
                  errors.email ? 'border-destructive focus-visible:ring-destructive' : ''
                }`}
              />
            </div>
            {errors.email && (
              <p id="forgot-email-error" role="alert" className="text-xs text-destructive">
                {errors.email}
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
                Enviando...
              </span>
            ) : (
              'Enviar enlace'
            )}
          </Button>

          <p className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
            Por tu seguridad, no revelamos si un email está registrado.
          </p>
        </form>
      )}
    </AuthLayout>
  )
}
