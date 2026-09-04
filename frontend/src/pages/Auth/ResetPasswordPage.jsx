import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '@/services/authService'
import { resetPasswordSchema } from '@/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!token) {
      setErrors({ form: 'Enlace de restablecimiento inválido o incompleto.' })
      return
    }

    const result = resetPasswordSchema.safeParse({ password, confirmPassword })
    if (!result.success) {
      const formatted = {}
      result.error.errors.forEach(err => { formatted[err.path[0]] = err.message })
      setErrors(formatted)
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      setDone(true)
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'El enlace es inválido o ya fue usado.'
      setErrors({ form: msg })
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-navy to-primary p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-2xl p-8">
        <div className="flex items-center gap-2 mb-8">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Volver</span>
          </Link>
        </div>

        {done ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-teal/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-teal" />
            </div>
            <h2 className="text-xl font-bold mb-2">¡Contraseña actualizada!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Tu contraseña se restableció correctamente. Ahora podés iniciar sesión con tu nueva contraseña.
            </p>
            <Button
              className="w-full h-11 rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-shadow"
              onClick={() => navigate('/login')}
            >
              Iniciar sesión
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-1">Nueva contraseña</h2>
              <p className="text-sm text-muted-foreground">
                Elegí una nueva contraseña para tu cuenta.
              </p>
            </div>

            {!token && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3" role="alert">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>Enlace inválido o incompleto. Usá el enlace que recibiste por email.</p>
              </div>
            )}

            {errors.form && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3" role="alert">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>{errors.form}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-password" className="text-sm font-medium">Nueva contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="reset-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className={`pl-10 h-11 rounded-xl ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-confirm" className="text-sm font-medium">Confirmá la contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="reset-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repetí la contraseña"
                    className={`pl-10 h-11 rounded-xl ${errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full h-11 rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-shadow" disabled={loading || !token}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    Guardando...
                  </span>
                ) : 'Guardar contraseña'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}