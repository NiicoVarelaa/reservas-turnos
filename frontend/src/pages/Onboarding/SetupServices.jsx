import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { servicesApi, schedulesApi } from '../../services/api'
import { Plus, Trash2, Clock, DollarSign, Save } from 'lucide-react'

const DEFAULT_SERVICES = {
  odontologia: [
    { name: 'Consulta General', duration_min: 30, price_cents: 5000, description: 'Consulta estándar de 30 minutos' },
    { name: 'Limpieza Dental', duration_min: 45, price_cents: 8000, description: 'Limpieza profesional completa' },
    { name: 'Blanqueamiento', duration_min: 60, price_cents: 15000, description: 'Blanqueamiento dental profesional' },
  ],
  medicina: [
    { name: 'Consulta General', duration_min: 30, price_cents: 5000, description: 'Consulta médica general' },
    { name: 'Consulta Especialista', duration_min: 45, price_cents: 8000, description: 'Consulta con especialista' },
  ],
  belleza: [
    { name: 'Consulta', duration_min: 20, price_cents: 3000, description: 'Consulta de evaluación' },
    { name: 'Tratamiento Facial', duration_min: 60, price_cents: 12000, description: 'Tratamiento facial completo' },
  ],
  peluqueria: [
    { name: 'Corte', duration_min: 30, price_cents: 3000, description: 'Corte de cabello' },
    { name: 'Corte y Peinado', duration_min: 60, price_cents: 5000, description: 'Corte y peinado completo' },
  ],
  default: [
    { name: 'Consulta', duration_min: 30, price_cents: 5000, description: 'Consulta inicial' },
    { name: 'Servicio Completo', duration_min: 60, price_cents: 10000, description: 'Servicio completo' },
  ]
}

export default function SetupServices() {
  const location = useLocation()
  const navigate = useNavigate()

  const category = location.state?.category || 'odontologia'
  const suggestedServices = DEFAULT_SERVICES[category] || DEFAULT_SERVICES.default

  const [services, setServices] = useState(suggestedServices)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addService = () => {
    setServices([...services, { name: '', duration_min: 30, price_cents: 5000, description: '' }])
  }

  const removeService = (index) => {
    setServices(services.filter((_, i) => i !== index))
  }

  const updateService = (index, field, value) => {
    setServices(services.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    ))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const validServices = services.filter(s => s.name.trim())

    if (validServices.length === 0) {
      setError('Agregá al menos un servicio')
      return
    }

    setLoading(true)

    try {
      await Promise.all(
        validServices.map(service => servicesApi.create(service))
      )

      navigate('/onboarding/schedule')
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (cents) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(cents)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Agregá tus Servicios</h1>
          <p className="text-muted-foreground mt-2">
            Paso 2 de 3: Configurá los servicios que ofrecés
          </p>
        </div>

        <div className="w-full bg-muted rounded-full h-2 mb-8">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: '66%' }} />
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive text-sm" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {services.map((service, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Servicio {index + 1}
                  </span>
                  {services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={service.name}
                  onChange={(e) => updateService(index, 'name', e.target.value)}
                  placeholder="Nombre del servicio"
                  className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />

                <input
                  type="text"
                  value={service.description}
                  onChange={(e) => updateService(index, 'description', e.target.value)}
                  placeholder="Descripción (opcional)"
                  className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      value={service.duration_min}
                      onChange={(e) => updateService(index, 'duration_min', parseInt(e.target.value))}
                      placeholder="Duración (min)"
                      className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      min="5"
                      step="5"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      value={service.price_cents}
                      onChange={(e) => updateService(index, 'price_cents', parseInt(e.target.value))}
                      placeholder="Precio"
                      className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      min="0"
                      step="100"
                    />
                  </div>
                </div>

                {service.name && service.price_cents && (
                  <p className="text-xs text-muted-foreground">
                    {service.name} - {service.duration_min} min - {formatPrice(service.price_cents)}
                  </p>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addService}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-md border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar otro servicio
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar y Continuar'}
          </button>
        </form>
      </div>
    </div>
  )
}
