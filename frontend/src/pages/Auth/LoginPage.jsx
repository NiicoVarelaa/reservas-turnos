import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogIn, Building2, User } from 'lucide-react'

export default function LoginPage() {
  const [professionalEmail, setProfessionalEmail] = useState('')
  const [professionalPassword, setProfessionalPassword] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPassword, setClientPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleProfessionalLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(professionalEmail, professionalPassword)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleClientLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(clientEmail, clientPassword)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>Elegí cómo querés ingresar</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm" role="alert">
              {error}
            </div>
          )}

          <Tabs defaultValue="professional">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="professional">
                <Building2 className="w-4 h-4 mr-2" />
                Profesional
              </TabsTrigger>
              <TabsTrigger value="client">
                <User className="w-4 h-4 mr-2" />
                Cliente
              </TabsTrigger>
            </TabsList>

            <TabsContent value="professional" className="mt-4">
              <form onSubmit={handleProfessionalLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prof-email">Email</Label>
                  <Input
                    id="prof-email"
                    type="email"
                    value={professionalEmail}
                    onChange={(e) => setProfessionalEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prof-password">Contraseña</Label>
                  <Input
                    id="prof-password"
                    type="password"
                    value={professionalPassword}
                    onChange={(e) => setProfessionalPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="client" className="mt-4">
              <form onSubmit={handleClientLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-password">Contraseña</Label>
                  <Input
                    id="client-password"
                    type="password"
                    value={clientPassword}
                    onChange={(e) => setClientPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Registrate
            </Link>
          </p>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Volver al inicio
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
