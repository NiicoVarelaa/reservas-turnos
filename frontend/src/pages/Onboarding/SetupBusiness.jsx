import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { businessApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2 } from 'lucide-react'

const CATEGORIES = [
  { value: 'odontologia', label: 'Odontología', icon: '🦷' },
  { value: 'medicina', label: 'Medicina', icon: '🏥' },
  { value: 'belleza', label: 'Belleza y Estética', icon: '💅' },
  { value: 'peluqueria', label: 'Peluquería', icon: '💇' },
  { value: 'psicologia', label: 'Psicología', icon: '🧠' },
  { value: 'veterinaria', label: 'Veterinaria', icon: '🐾' },
  { value: 'fitness', label: 'Fitness y Deporte', icon: '💪' },
  { value: 'educacion', label: 'Educación', icon: '📚' },
  { value: 'legal', label: 'Legal', icon: '⚖️' },
  { value: 'consultoria', label: 'Consultoría', icon: '💼' },
  { value: 'general', label: 'Otro', icon: '📋' },
]

export default function SetupBusiness() {
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    category: 'odontologia',
    whatsapp_number: '',
    address: '',
    city: '',
    primary_color: '#0f172a',
    secondary_color: '#3b82f6',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await businessApi.create(formData)
      navigate('/onboarding/services', {
        state: { businessId: data.business.id, category: formData.category }
      })
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Configurá tu Negocio</CardTitle>
          <CardDescription>Paso 1 de 3: Información básica</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-2 mb-6">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: '33%' }} />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del negocio *</Label>
              <Input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Clínica Dental Sonrisa" required />
              <p className="text-xs text-muted-foreground">Este nombre aparecerá en tu página de reservas pública</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Descripción corta</Label>
              <Input id="tagline" name="tagline" type="text" value={formData.tagline} onChange={handleChange} placeholder="Tu sonrisa, nuestra prioridad" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Rubro *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná un rubro" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.icon} {cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp del negocio</Label>
              <Input id="whatsapp_number" name="whatsapp_number" type="tel" value={formData.whatsapp_number} onChange={handleChange} placeholder="+5491112345678" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Color principal</Label>
                <div className="flex items-center gap-2">
                  <Input id="primary_color" name="primary_color" type="color" value={formData.primary_color} onChange={handleChange} className="w-12 h-10 p-1" />
                  <span className="text-sm text-muted-foreground">{formData.primary_color}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_color">Color secundario</Label>
                <div className="flex items-center gap-2">
                  <Input id="secondary_color" name="secondary_color" type="color" value={formData.secondary_color} onChange={handleChange} className="w-12 h-10 p-1" />
                  <span className="text-sm text-muted-foreground">{formData.secondary_color}</span>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Guardando...' : 'Continuar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
