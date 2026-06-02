import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useBookingStore } from '@/store/bookingStore'
import { loginSchema, registerSchema } from '@/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Lock, Mail, Phone, ArrowRight } from 'lucide-react'

export default function AuthModal({ open, onOpenChange, onContinue, onLogin }) {
  const { loginAsGuest, login, register } = useAuthStore()
  const { clientInfo } = useBookingStore()
  const [mode, setMode] = useState('guest')
  const [email, setEmail] = useState(clientInfo.email || '')
  const [password, setPassword] = useState('')
  const [createAccount, setCreateAccount] = useState(false)
  const [accountPassword, setAccountPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleContinueAsGuest = () => {
    loginAsGuest({
      name: clientInfo.name,
      email: clientInfo.email,
      phone: clientInfo.phone
    })
    onContinue()
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (createAccount) {
        const result = registerSchema.safeParse({
          email: clientInfo.email,
          password: accountPassword,
          full_name: clientInfo.name,
          phone: clientInfo.phone
        })
        if (!result.success) {
          setError(result.error.errors[0]?.message || 'Datos inválidos')
          setLoading(false)
          return
        }

        await register(clientInfo.email, accountPassword, {
          full_name: clientInfo.name,
          phone: clientInfo.phone
        })
      } else {
        const result = loginSchema.safeParse({ email, password })
        if (!result.success) {
          setError(result.error.errors[0]?.message || 'Datos inválidos')
          setLoading(false)
          return
        }

        await login(email, password)
      }
      onLogin()
    } catch (err) {
      setError(err.message || 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¿Cómo querés continuar?</DialogTitle>
          <DialogDescription>
            Podés reservar como invitado o iniciar sesión para ver tus turnos
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={setMode} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guest">Invitado</TabsTrigger>
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
          </TabsList>

          <TabsContent value="guest" className="mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <Input value={clientInfo.name} readOnly className="bg-muted" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <Input value={clientInfo.email} readOnly className="bg-muted" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <Input value={clientInfo.phone} readOnly className="bg-muted" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <Label className="text-sm font-medium">Crear cuenta</Label>
                    <p className="text-xs text-muted-foreground">Para ver tus turnos después</p>
                  </div>
                  <Switch checked={createAccount} onCheckedChange={setCreateAccount} />
                </div>

                {createAccount && (
                  <div className="space-y-2">
                    <Label>Contraseña</Label>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        value={accountPassword}
                        onChange={(e) => setAccountPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleContinueAsGuest} disabled={createAccount && accountPassword.length < 8}>
                  {createAccount ? 'Crear cuenta y continuar' : 'Continuar como invitado'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="login" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {error && (
                  <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Contraseña</Label>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
