import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateBusiness } from '@/hooks/useBusiness'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import OnboardingLayout, { OnboardingErrorMessage } from '@/components/onboarding/OnboardingLayout'
import { cn } from '@/lib/utils'
import { ArrowRight, Loader2 } from 'lucide-react'

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

const CURRENCIES = [
  { value: 'ARS', label: 'Peso argentino (ARS)' },
  { value: 'USD', label: 'Dólar estadounidense (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'MXN', label: 'Peso mexicano (MXN)' },
  { value: 'CLP', label: 'Peso chileno (CLP)' },
  { value: 'COP', label: 'Peso colombiano (COP)' },
  { value: 'UYU', label: 'Peso uruguayo (UYU)' },
  { value: 'BRL', label: 'Real brasileño (BRL)' },
  { value: 'PEN', label: 'Sol peruano (PEN)' },
]

const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/

const INITIAL_FORM = {
  name: '',
  tagline: '',
  category: 'odontologia',
  whatsapp_number: '',
  address: '',
  city: '',
  currency: 'ARS',
  primary_color: '#0f172a',
  secondary_color: '#0e9aa3',
}

function SectionTitle({ children, hint }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold text-foreground">{children}</h2>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export default function SetupBusiness() {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const createBusiness = useCreateBusiness()

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
    if (errors[name]) {
      setErrors((previous) => {
        const next = { ...previous }
        delete next[name]
        return next
      })
    }
    if (error) setError('')
  }

  const validate = () => {
    const nextErrors = {}

    if (formData.name.trim().length < 2) {
      nextErrors.name = 'Ingresá un nombre de al menos 2 caracteres.'
    }

    const whatsapp = formData.whatsapp_number.trim().replace(/[\s()-]/g, '')
    if (whatsapp && !PHONE_REGEX.test(whatsapp)) {
      nextErrors.whatsapp_number = 'Usá el formato internacional, por ejemplo +5491112345678.'
    }

    setErrors(nextErrors)
    const firstInvalid = Object.keys(nextErrors)[0]
    if (firstInvalid) document.getElementById(firstInvalid)?.focus()
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!validate()) return

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      currency: formData.currency,
      primary_color: formData.primary_color,
      secondary_color: formData.secondary_color,
    }

    if (formData.tagline.trim()) payload.tagline = formData.tagline.trim()
    if (formData.address.trim()) payload.address = formData.address.trim()
    if (formData.city.trim()) payload.city = formData.city.trim()

    const whatsapp = formData.whatsapp_number.trim().replace(/[\s()-]/g, '')
    if (whatsapp) payload.whatsapp_number = whatsapp

    try {
      const { data } = await createBusiness.mutateAsync(payload)
      navigate('/onboarding/services', {
        state: { businessId: data.business.id, category: formData.category },
      })
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'No pudimos guardar tu negocio.')
    }
  }

  return (
    <OnboardingLayout
      step="business"
      title="Configurá tu negocio"
      description="Estos datos aparecen en tu página pública de reservas. Podés ajustarlos más adelante."
    >
      <OnboardingErrorMessage message={error} />

      <form onSubmit={handleSubmit} noValidate className="space-y-7">
        <section>
          <SectionTitle hint="El nombre y la descripción se muestran a tus clientes.">
            Datos del negocio
          </SectionTitle>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre del negocio <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Clínica Dental Sonrisa"
                autoComplete="organization"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className={cn(
                  'h-11 rounded-xl',
                  errors.name && 'border-destructive focus-visible:ring-destructive'
                )}
              />
              {errors.name && (
                <p id="name-error" role="alert" className="text-xs text-destructive">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Descripción corta</Label>
              <Input
                id="tagline"
                name="tagline"
                type="text"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="Tu sonrisa, nuestra prioridad"
                maxLength={200}
                className="h-11 rounded-xl"
              />
            </div>
          </div>
        </section>

        <section>
          <SectionTitle hint="Nos ayuda a sugerirte servicios y horarios.">Rubro</SectionTitle>
          <div
            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
            role="group"
            aria-label="Rubro del negocio"
          >
            {CATEGORIES.map((category) => {
              const selected = formData.category === category.value
              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setFormData((previous) => ({ ...previous, category: category.value }))}
                  aria-pressed={selected}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    selected
                      ? 'border-primary/30 bg-primary/5 font-semibold text-foreground ring-1 ring-inset ring-primary/15'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/20 hover:bg-muted/40'
                  )}
                >
                  <span aria-hidden="true" className="text-base">
                    {category.icon}
                  </span>
                  <span className="text-[13px] leading-snug">{category.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <SectionTitle hint="Se usan para confirmar reservas y mostrar tu ubicación.">
            Contacto
          </SectionTitle>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp del negocio</Label>
              <Input
                id="whatsapp_number"
                name="whatsapp_number"
                type="tel"
                inputMode="tel"
                value={formData.whatsapp_number}
                onChange={handleChange}
                placeholder="+54 9 11 1234 5678"
                aria-invalid={Boolean(errors.whatsapp_number)}
                aria-describedby={errors.whatsapp_number ? 'whatsapp-error' : 'whatsapp-hint'}
                className={cn(
                  'h-11 rounded-xl',
                  errors.whatsapp_number && 'border-destructive focus-visible:ring-destructive'
                )}
              />
              {errors.whatsapp_number ? (
                <p id="whatsapp-error" role="alert" className="text-xs text-destructive">
                  {errors.whatsapp_number}
                </p>
              ) : (
                <p id="whatsapp-hint" className="text-xs text-muted-foreground">
                  Incluí el código de país. Lo usamos para confirmar turnos.
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Buenos Aires"
                  autoComplete="address-level2"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Av. Corrientes 1234"
                  autoComplete="street-address"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <SectionTitle hint="Definen los colores de tu página pública y el precio de tus servicios.">
            Identidad y moneda
          </SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData((previous) => ({ ...previous, currency: value }))
                }
              >
                <SelectTrigger id="currency" className="h-11 rounded-xl">
                  <SelectValue placeholder="Elegí una moneda" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                La usamos para mostrar los precios de tus servicios.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_color">Color principal</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primary_color"
                  name="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={handleChange}
                  className="h-11 w-14 shrink-0 rounded-xl p-1"
                />
                <span className="font-mono text-xs uppercase text-muted-foreground">
                  {formData.primary_color}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary_color">Color secundario</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="secondary_color"
                  name="secondary_color"
                  type="color"
                  value={formData.secondary_color}
                  onChange={handleChange}
                  className="h-11 w-14 shrink-0 rounded-xl p-1"
                />
                <span className="font-mono text-xs uppercase text-muted-foreground">
                  {formData.secondary_color}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Después vas a poder cargar tus servicios y horarios.
          </p>
          <Button
            type="submit"
            className="h-11 rounded-xl px-5 text-sm font-semibold shadow-lg shadow-primary/20 transition-shadow hover:shadow-primary/30"
            disabled={createBusiness.isPending}
          >
            {createBusiness.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Guardando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Continuar
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </OnboardingLayout>
  )
}
