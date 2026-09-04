import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { loginSchema } from '@/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import GoogleButton from '@/components/auth/GoogleButton'
import { Building2, User, ArrowLeft, Mail, Lock, Calendar, Shield, Star } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [professionalEmail, setProfessionalEmail] = useState('')
  const [professionalPassword, setProfessionalPassword] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPassword, setClientPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleProfessionalLogin = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const result = loginSchema.safeParse({ email: professionalEmail, password: professionalPassword })
    if (!result.success) {
      const formatted = {}
      result.error.errors.forEach(err => { formatted[err.path[0]] = err.message })
      setErrors(formatted)
      setLoading(false)
      return
    }

    try {
      await login(professionalEmail, professionalPassword)
      toast({ title: 'Inicio de sesión exitoso', description: 'Bienvenido de vuelta', variant: 'success' })
      navigate('/dashboard')
    } catch (err) {
      setErrors({ form: err.message || 'Error al iniciar sesión' })
      toast({ title: 'Error al iniciar sesión', description: err.message || 'Credenciales inválidas', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleClientLogin = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const result = loginSchema.safeParse({ email: clientEmail, password: clientPassword })
    if (!result.success) {
      const formatted = {}
      result.error.errors.forEach(err => { formatted[err.path[0]] = err.message })
      setErrors(formatted)
      setLoading(false)
      return
    }

    try {
      await login(clientEmail, clientPassword)
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
    <div className="min-h-screen flex">
      {/* Left decorative panel - desktop */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-navy via-navy to-primary overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-teal/15 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)', backgroundSize: '32px 32px' }}
          />
        </div>

        <div className="relative flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-white/15 backdrop-blur flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <img src="/logo.png" alt="Smile Book" className="w-7 h-7 object-contain" />
            </div>
            <span className="font-bold text-lg text-white">Smile Book</span>
          </Link>

          {/* Content */}
          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white leading-tight mb-4 text-balance">
              Bienvenido de vuelta a tu clínica
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-10">
              Accedé a tu panel para gestionar turnos, servicios y pacientes en un solo lugar.
            </p>

            {/* Floating stat cards */}
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Reservas 24/7</p>
                  <p className="text-white/60 text-xs">Tus pacientes pueden reservar cuando quieran</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Pagos seguros</p>
                  <p className="text-white/60 text-xs">Cobrá online con Stripe integrado</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">4.9 en Google</p>
                  <p className="text-white/60 text-xs">+200 profesionales ya confían en nosotros</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Smile Book. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Volver</span>
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Smile Book" className="w-6 h-6 object-contain" />
            <span className="font-bold text-sm">Smile Book</span>
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-b from-background to-muted/30">
          <div className="w-full max-w-md">
            {/* Desktop logo (hidden on mobile) */}
            <div className="hidden lg:flex items-center gap-3 mb-8">
              <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Volver al inicio</span>
              </Link>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-1">Iniciar Sesión</h2>
              <p className="text-muted-foreground">Elegí cómo querés ingresar a tu cuenta</p>
            </div>

            {errors.form && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3" role="alert">
                <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <p>{errors.form}</p>
              </div>
            )}

            <Tabs defaultValue="professional" className="w-full">
              <GoogleButton className="mb-4" label="Continuar con Google" />
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">o con email</span>
                </div>
              </div>
              <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger
                  value="professional"
                  className="rounded-lg text-sm font-medium gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
                >
                  <Building2 className="w-4 h-4" />
                  Profesional
                </TabsTrigger>
                <TabsTrigger
                  value="client"
                  className="rounded-lg text-sm font-medium gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
                >
                  <User className="w-4 h-4" />
                  Cliente
                </TabsTrigger>
              </TabsList>

              <TabsContent value="professional" className="mt-6">
                <form onSubmit={handleProfessionalLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prof-email" className="text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="prof-email"
                        type="email"
                        value={professionalEmail}
                        onChange={(e) => setProfessionalEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className={`pl-10 h-11 rounded-xl ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prof-password" className="text-sm font-medium">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="prof-password"
                        type="password"
                        value={professionalPassword}
                        onChange={(e) => setProfessionalPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`pl-10 h-11 rounded-xl ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                  <div className="flex justify-end -mt-2">
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-shadow" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        Ingresando...
                      </span>
                    ) : 'Iniciar Sesión'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="client" className="mt-6">
                <form onSubmit={handleClientLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-email" className="text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="client-email"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className={`pl-10 h-11 rounded-xl ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-password" className="text-sm font-medium">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="client-password"
                        type="password"
                        value={clientPassword}
                        onChange={(e) => setClientPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`pl-10 h-11 rounded-xl ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                  <div className="flex justify-end -mt-2">
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-shadow" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        Ingresando...
                      </span>
                    ) : 'Iniciar Sesión'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿No tenés cuenta?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Registrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}