import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { businessApi } from '../../services/api'
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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
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
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Configurá tu Negocio</h1>
          <p className="text-muted-foreground mt-2">
            Paso 1 de 3: Información básica
          </p>
        </div>

        <div className="w-full bg-muted rounded-full h-2 mb-8">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: '33%' }} />
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive text-sm" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nombre del negocio *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Clínica Dental Sonrisa"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Este nombre aparecerá en tu página de reservas pública
            </p>
          </div>

          <div>
            <label htmlFor="tagline" className="block text-sm font-medium mb-1">
              Descripción corta
            </label>
            <input
              id="tagline"
              name="tagline"
              type="text"
              value={formData.tagline}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Tu sonrisa, nuestra prioridad"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Rubro *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="whatsapp_number" className="block text-sm font-medium mb-1">
              WhatsApp del negocio
            </label>
            <input
              id="whatsapp_number"
              name="whatsapp_number"
              type="tel"
              value={formData.whatsapp_number}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="+5491112345678"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="primary_color" className="block text-sm font-medium mb-1">
                Color principal
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="primary_color"
                  name="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={handleChange}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{formData.primary_color}</span>
              </div>
            </div>
            <div>
              <label htmlFor="secondary_color" className="block text-sm font-medium mb-1">
                Color secundario
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="secondary_color"
                  name="secondary_color"
                  type="color"
                  value={formData.secondary_color}
                  onChange={handleChange}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{formData.secondary_color}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
  )
}
