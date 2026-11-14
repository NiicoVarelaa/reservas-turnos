import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCreateServices } from '@/hooks/useServiceMutations'
import { useMyBusiness } from '@/hooks/useBusiness'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import OnboardingLayout, { OnboardingErrorMessage } from '@/components/onboarding/OnboardingLayout'
import { cn, formatCurrency } from '@/lib/utils'
import { priceToCents, resolveCurrency } from '@/lib/format'
import { ArrowRight, Clock, Loader2, Plus, Trash2 } from 'lucide-react'

const DEFAULT_SERVICES = {
  odontologia: [
    { name: 'Consulta general', duration_min: 30, price: '50', description: 'Consulta estándar de 30 minutos' },
    { name: 'Limpieza dental', duration_min: 45, price: '80', description: 'Limpieza profesional completa' },
    { name: 'Blanqueamiento', duration_min: 60, price: '150', description: 'Blanqueamiento dental profesional' },
  ],
  medicina: [
    { name: 'Consulta general', duration_min: 30, price: '50', description: 'Consulta médica general' },
    { name: 'Consulta con especialista', duration_min: 45, price: '80', description: 'Consulta con especialista' },
  ],
  belleza: [
    { name: 'Manicura', duration_min: 45, price: '35', description: 'Manicura completa' },
    { name: 'Depilación', duration_min: 30, price: '40', description: 'Depilación con cera' },
  ],
  peluqueria: [
    { name: 'Corte', duration_min: 30, price: '30', description: 'Corte y peinado' },
    { name: 'Color', duration_min: 90, price: '90', description: 'Coloración completa' },
  ],
  default: [
    { name: 'Consulta', duration_min: 30, price: '50', description: 'Consulta inicial' },
    { name: 'Servicio completo', duration_min: 60, price: '100', description: 'Servicio completo' },
  ],
}

const createEmptyService = () => ({ name: '', duration_min: 30, price: '', description: '' })

const isValidPrice = (value) => /^\d+(?:[.,]\d{1,2})?$/.test(String(value).trim())

export default function SetupServices() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: business } = useMyBusiness()
  const category = location.state?.category || 'odontologia'
  const businessCurrency = resolveCurrency(business?.currency)

  const [services, setServices] = useState(() =>
    (DEFAULT_SERVICES[category] || DEFAULT_SERVICES.default).map((service) => ({ ...service }))
  )
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const createServices = useCreateServices()

  const updateService = (index, field, value) => {
    setServices((previous) =>
      previous.map((service, position) =>
        position === index ? { ...service, [field]: value } : service
      )
    )
    setErrors((previous) => {
      if (!previous[index]?.[field]) return previous
      const next = { ...previous, [index]: { ...previous[index] } }
      delete next[index][field]
      return next
    })
    if (error) setError('')
  }

  const addService = () => {
    setServices((previous) => [...previous, createEmptyService()])
    if (error) setError('')
  }

  const removeService = (index) => {
    setServices((previous) => previous.filter((_, position) => position !== index))
    setErrors({})
    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const nextErrors = {}
    const payload = []

    services.forEach((service, index) => {
      const name = service.name.trim()
      const description = service.description.trim()
      const duration = Number.parseInt(service.duration_min, 10)
      const hasContent = name || description || String(service.price).trim()

      if (!hasContent) return

      const entry = {}

      if (name.length < 2) {
        entry.name = 'El nombre debe tener al menos 2 caracteres.'
      } else if (name.length > 100) {
        entry.name = 'El nombre no puede superar los 100 caracteres.'
      }

      if (!Number.isFinite(duration) || duration < 5 || duration > 480) {
        entry.duration_min = 'La duración debe estar entre 5 y 480 minutos.'
      }

      if (!isValidPrice(service.price)) {
        entry.price = 'Ingresá un precio válido, por ejemplo 25000.'
      }

      if (Object.keys(entry).length > 0) {
        nextErrors[index] = entry
        return
      }

      payload.push({
        name,
        description,
        duration_min: duration,
        price_cents: priceToCents(service.price),
        currency: businessCurrency,
      })
    })

    if (payload.length === 0 && Object.keys(nextErrors).length === 0) {
      setError('Agregá al menos un servicio con nombre y precio.')
      return
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const firstInvalid = Object.keys(nextErrors)[0]
      document.getElementById(`service-${firstInvalid}-name`)?.focus()
      setError('Revisá los servicios marcados antes de continuar.')
      return
    }

    setErrors({})

    try {
      await createServices.mutateAsync(payload)
      navigate('/onboarding/schedule')
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'No pudimos guardar tus servicios.')
    }
  }

  const previewTotal = services.reduce((sum, service) => {
    if (!isValidPrice(service.price)) return sum
    return sum + priceToCents(service.price)
  }, 0)

  return (
    <OnboardingLayout
      step="services"
      title="Agregá tus servicios"
      description="Cargá qué ofrecés, cuánto dura cada turno y su precio. Podés editarlos después."
    >
      <OnboardingErrorMessage message={error} />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="space-y-3">
          {services.map((service, index) => {
            const serviceErrors = errors[index] || {}
            const previewCents = isValidPrice(service.price) ? priceToCents(service.price) : null

            return (
              <div
                key={index}
                className={cn(
                  'rounded-2xl border bg-background/60 p-4 transition-colors sm:p-5',
                  Object.keys(serviceErrors).length > 0
                    ? 'border-destructive/40'
                    : 'border-border/70'
                )}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    Servicio {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeService(index)}
                    disabled={services.length === 1}
                    aria-label={`Eliminar servicio ${index + 1}`}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`service-${index}-name`} className="text-xs">
                      Nombre
                    </Label>
                    <Input
                      id={`service-${index}-name`}
                      value={service.name}
                      onChange={(event) => updateService(index, 'name', event.target.value)}
                      placeholder="Ej: Consulta general"
                      maxLength={100}
                      aria-invalid={Boolean(serviceErrors.name)}
                      aria-describedby={serviceErrors.name ? `service-${index}-name-error` : undefined}
                      className={cn(
                        'h-11 rounded-xl',
                        serviceErrors.name && 'border-destructive focus-visible:ring-destructive'
                      )}
                    />
                    {serviceErrors.name && (
                      <p id={`service-${index}-name-error`} role="alert" className="text-xs text-destructive">
                        {serviceErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`service-${index}-description`} className="text-xs">
                      Descripción <span className="font-normal text-muted-foreground">(opcional)</span>
                    </Label>
                    <Input
                      id={`service-${index}-description`}
                      value={service.description}
                      onChange={(event) => updateService(index, 'description', event.target.value)}
                      placeholder="Qué incluye el servicio"
                      maxLength={500}
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`service-${index}-duration`} className="text-xs">
                        Duración (minutos)
                      </Label>
                      <div className="relative">
                        <Clock
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <Input
                          id={`service-${index}-duration`}
                          type="number"
                          inputMode="numeric"
                          value={service.duration_min}
                          onChange={(event) =>
                            updateService(index, 'duration_min', event.target.value)
                          }
                          min="5"
                          max="480"
                          step="5"
                          aria-invalid={Boolean(serviceErrors.duration_min)}
                          aria-describedby={
                            serviceErrors.duration_min ? `service-${index}-duration-error` : undefined
                          }
                          className={cn(
                            'h-11 rounded-xl pl-10',
                            serviceErrors.duration_min &&
                              'border-destructive focus-visible:ring-destructive'
                          )}
                        />
                      </div>
                      {serviceErrors.duration_min && (
                        <p
                          id={`service-${index}-duration-error`}
                          role="alert"
                          className="text-xs text-destructive"
                        >
                          {serviceErrors.duration_min}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`service-${index}-price`} className="text-xs">
                        Precio
                      </Label>
                      <div className="relative">
                        <Input
                          id={`service-${index}-price`}
                          type="text"
                          inputMode="decimal"
                          value={service.price}
                          onChange={(event) => updateService(index, 'price', event.target.value)}
                          placeholder="25000"
                          aria-invalid={Boolean(serviceErrors.price)}
                          aria-describedby={
                            serviceErrors.price ? `service-${index}-price-error` : undefined
                          }
                          className={cn(
                            'h-11 rounded-xl pr-14',
                            serviceErrors.price &&
                              'border-destructive focus-visible:ring-destructive'
                          )}
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                          {businessCurrency}
                        </span>
                      </div>
                      {serviceErrors.price ? (
                        <p
                          id={`service-${index}-price-error`}
                          role="alert"
                          className="text-xs text-destructive"
                        >
                          {serviceErrors.price}
                        </p>
                      ) : (
                        previewCents !== null && (
                          <p className="text-xs text-muted-foreground">
                            Se mostrará como{' '}
                            <span className="font-medium text-foreground">
                              {formatCurrency(previewCents, businessCurrency)}
                            </span>
                          </p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addService}
          className="h-11 w-full rounded-xl border-dashed"
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Agregar otro servicio
        </Button>

        <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {services.length} {services.length === 1 ? 'servicio' : 'servicios'} · Precio de lista{' '}
            <span className="font-medium text-foreground">
              {formatCurrency(previewTotal, businessCurrency)}
            </span>
          </p>
          <Button
            type="submit"
            className="h-11 rounded-xl px-5 text-sm font-semibold shadow-lg shadow-primary/20 transition-shadow hover:shadow-primary/30"
            disabled={createServices.isPending}
          >
            {createServices.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Guardando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Guardar y continuar
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </OnboardingLayout>
  )
}
