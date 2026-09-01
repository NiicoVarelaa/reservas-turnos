import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { registerSchema } from '@/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, User, ArrowLeft, Mail, Lock, Phone, UserCircle, CheckCircle2 } from 'lucide-react'

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score: 1, label: 'Débil', color: 'bg-destructive' }
  if (score <= 2) return { score: 2, label: 'Regular', color: 'bg-orange-500' }
  if (score <= 3) return { score: 3, label: 'Buena', color: 'bg-yellow-500' }
  if (score <= 4) return { score: 4, label: 'Fuerte', color: 'bg-teal' }
  return { score: 5, label: 'Muy fuerte', color: 'bg-emerald-500' }
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('client')
  const register = useAuthStore((state) => state.register)
  const navigate = useNavigate()

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) {
      setErrors(prev => { const next = { ...prev }; delete next[e.target.name]; return next })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Las contraseñas no coinciden' })
      return
    }

    const result = registerSchema.safeParse({
      email: formData.email,
      password: formData.password,
      full_name: formData.fullName,
      phone: formData.phone
    })

    if (!result.success) {
      const formatted = {}
      result.error.errors.forEach(err => {
        const field = err.path[0]
        formatted[field] = err.message
      })
      setErrors(formatted)
      return
    }

    setLoading(true)
    try {
      await register(formData.email, formData.password, {
        full_name: formData.fullName,
        phone: formData.phone
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
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-navy via-navy to-primary overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-teal/15 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)', backgroundSize: '32px 32px' }}
          />
        </div>

        <div className="relative flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-white/15 backdrop-blur flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <img src="/logo.png" alt="Smile Book" className="w-7 h-7 object-contain" />
            </div>
            <span className="font-bold text-lg text-white">Smile Book</span>
          </Link>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white leading-tight mb-4 text-balance">
              Creá tu cuenta y empezá a reservar
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-10">
              {role === 'professional'
                ? 'Uní tu clínica a la plataforma y recibí reservas 24/7 con pagos online.'
                : 'Reservá turnos online en segundos y recibí confirmación por WhatsApp.'}
            </p>

            <div className="space-y-4">
              {role === 'professional' ? (
                <>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-teal" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Panel de control</p>
                      <p className="text-white/60 text-xs">Estadísticas, reservas y horarios en un solo lugar</p>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-teal" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Configuración en 3 pasos</p>
                      <p className="text-white/60 text-xs">Negocio, servicios y horarios — listo en minutos</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-teal" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Sin registro complicado</p>
                      <p className="text-white/60 text-xs">Reservá con tu email, sin crear cuenta adicional</p>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-teal" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Confirmación instantánea</p>
                      <p className="text-white/60 text-xs">Recibí los datos de tu turno por WhatsApp al toque</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Smile Book. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col">
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

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-b from-background to-muted/30">
          <div className="w-full max-w-md">
            <div className="hidden lg:flex items-center gap-3 mb-8">
              <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Volver al inicio</span>
              </Link>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-1">Crear Cuenta</h2>
              <p className="text-muted-foreground">Elegí el tipo de cuenta que necesitás</p>
            </div>

            {errors.form && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3" role="alert">
                <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <p>{errors.form}</p>
              </div>
            )}

            <Tabs value={role} onValueChange={setRole} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger
                  value="client"
                  className="rounded-lg text-sm font-medium gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
                >
                  <User className="w-4 h-4" />
                  Cliente
                </TabsTrigger>
                <TabsTrigger
                  value="professional"
                  className="rounded-lg text-sm font-medium gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
                >
                  <Building2 className="w-4 h-4" />
                  Profesional
                </TabsTrigger>
              </TabsList>

              <TabsContent value="client" className="mt-6">
                <p className="text-sm text-muted-foreground mb-5 flex items-center gap-2">
                  <User className="w-4 h-4 text-teal" />
                  Para reservar turnos y ver tu historial
                </p>
              </TabsContent>

              <TabsContent value="professional" className="mt-6">
                <p className="text-sm text-muted-foreground mb-5 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal" />
                  Para gestionar tu negocio y recibir reservas
                </p>
              </TabsContent>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">Nombre completo</Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder={role === 'professional' ? 'Dr. María García' : 'Juan Pérez'}
                    className={`pl-10 h-11 rounded-xl ${errors.full_name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                </div>
                {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className={`pl-10 h-11 rounded-xl ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+5491112345678"
                    className={`pl-10 h-11 rounded-xl ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                </div>
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`pl-10 h-11 rounded-xl ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}

                {formData.password && (
                  <div className="space-y-2 mt-3">
                    <div className="flex gap-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i < passwordStrength.score ? passwordStrength.color : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${
                      passwordStrength.score <= 1 ? 'text-destructive' :
                      passwordStrength.score <= 2 ? 'text-orange-500' :
                      passwordStrength.score <= 3 ? 'text-yellow-600' :
                      'text-teal'
                    }`}>
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`pl-10 h-11 rounded-xl ${
                      errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' :
                      formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-teal focus-visible:ring-teal' : ''
                    }`}
                  />
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal" />
                  )}
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full h-11 rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-shadow" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    Creando cuenta...
                  </span>
                ) : `Crear cuenta de ${role === 'professional' ? 'Profesional' : 'Cliente'}`}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tenés cuenta?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}