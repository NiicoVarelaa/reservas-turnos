import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '@/services/authService'
import { resetPasswordSchema, formatZodErrors } from '@/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AuthLayout, { AuthErrorMessage, AuthSpinner } from '@/components/auth/AuthLayout'
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const FEATURES = [
  {
    icon: Lock,
    title: 'Mínimo 8 caracteres',
    text: 'Mejor si combinás letras, números y símbolos.',
  },
  {
    icon: ShieldCheck,
    title: 'Datos cifrados',
    text: 'Tu contraseña se guarda de forma segura.',
  },
  {
    icon: CheckCircle2,
    title: 'Listo para reservar',
    text: 'Al guardarla, volvés a entrar a tu cuenta.',
  },
]

const PROOF = {
  quote: 'Restablecí mi contraseña sin llamar a nadie y seguí con mis turnos.',
  author: 'Sofía H. · Paciente',
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!token) {
      setErrors({ form: 'El enlace de restablecimiento es inválido o está incompleto.' })
      return
    }

    const result = resetPasswordSchema.safeParse({ password, confirmPassword })
    if (!result.success) {
      setErrors(formatZodErrors(result.error))
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      setDone(true)
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || 'El enlace es inválido o ya fue usado.'
      setErrors({ form: message })
      toast({ title: 'No pudimos restablecer la contraseña', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      brandEyebrow="Nueva contraseña"
      headline="Elegí una contraseña segura"
      description="Creá una nueva contraseña para recuperar el acceso a tu cuenta y seguir gestionando tus turnos."
      features={FEATURES}
      proof={PROOF}
      topRight={
        <p className="text-sm text-muted-foreground">
          ¿Ya la restableciste?{' '}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      }
      cardEyebrow="Seguridad"
      cardTitle={done ? '¡Contraseña actualizada!' : 'Nueva contraseña'}
      cardDescription={
        done
          ? 'Ya podés iniciar sesión con tu nueva contraseña.'
          : 'Ingresá y confirmá tu nueva contraseña para continuar.'
      }
      secureNote="El enlace es de un solo uso y expira por seguridad."
      footer={
        <>
          ¿Ya la restableciste?{' '}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Iniciá sesión
          </Link>
        </>
      }
    >
      {done ? (
        <div className="mt-6">
          <div className="flex flex-col items-center rounded-2xl border border-teal/20 bg-teal/[0.06] px-5 py-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal/15 text-teal ring-1 ring-inset ring-teal/20">
              <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">Todo listo</h2>
            <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Tu contraseña se actualizó correctamente. Usá la nueva la próxima vez que ingreses.
            </p>
          </div>

          <Button
            className="mt-4 h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-shadow hover:shadow-primary/30"
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          {!token && (
            <AuthErrorMessage
              message="El enlace es inválido o está incompleto. Usá el enlace que recibiste por email."
              icon={AlertTriangle}
            />
          )}

          {errors.form && <AuthErrorMessage message={errors.form} icon={AlertTriangle} />}

          <div className="space-y-2">
            <Label htmlFor="reset-password">Nueva contraseña</Label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="reset-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  if (errors.password || errors.form) setErrors({})
                }}
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'reset-password-error' : 'reset-password-hint'}
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
            {errors.password ? (
              <p id="reset-password-error" role="alert" className="text-xs text-destructive">
                {errors.password}
              </p>
            ) : (
              <p id="reset-password-hint" className="text-xs text-muted-foreground">
                Mínimo 8 caracteres.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-confirm">Confirmá la contraseña</Label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="reset-confirm"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  if (errors.confirmPassword || errors.form) setErrors({})
                }}
                placeholder="Repetí la contraseña"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? 'reset-confirm-error' : undefined}
                className={cn(
                  'h-11 rounded-xl pl-10 pr-10',
                  errors.confirmPassword && 'border-destructive focus-visible:ring-destructive'
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((value) => !value)}
                aria-label={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                aria-pressed={showConfirm}
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="reset-confirm-error" role="alert" className="text-xs text-destructive">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-shadow hover:shadow-primary/30"
            disabled={loading || !token}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <AuthSpinner />
                Guardando...
              </span>
            ) : (
              'Guardar contraseña'
            )}
          </Button>

          <p className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
            Si el enlace expiró, pedí uno nuevo desde “¿Olvidaste tu contraseña?”.
          </p>
        </form>
      )}
    </AuthLayout>
  )
}
