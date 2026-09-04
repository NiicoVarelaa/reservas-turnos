import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '@/services/authService'
import { forgotPasswordSchema } from '@/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const result = forgotPasswordSchema.safeParse({ email })
    if (!result.success) {
      const formatted = {}
      result.error.errors.forEach(err => { formatted[err.path[0]] = err.message })
      setErrors(formatted)
      setLoading(false)
      return
    }

    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Hubo un problema. Intentalo de nuevo.', variant: 'destructive' })
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

        {sent ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-teal/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-teal" />
            </div>
            <h2 className="text-xl font-bold mb-2">Revisa tu email</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Si existe una cuenta con <strong className="text-foreground">{email}</strong>, enviamos un
              enlace para restablecer tu contraseña (válido por 30 minutos).
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Si no lo ves, revisa la carpeta de spam o intenta de nuevo en unos minutos.
            </p>
            <Button variant="outline" className="w-full h-11 rounded-xl" onClick={() => { setSent(false); setEmail('') }}>
              Enviar de nuevo
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-1">¿Olvidaste tu contraseña?</h2>
              <p className="text-sm text-muted-foreground">
                Ingresá tu email y te enviaremos un enlace para restablecerla.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className={`pl-10 h-11 rounded-xl ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <Button type="submit" className="w-full h-11 rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-shadow" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    Enviando...
                  </span>
                ) : 'Enviar enlace'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              ¿Recordaste tu contraseña?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Iniciá sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}