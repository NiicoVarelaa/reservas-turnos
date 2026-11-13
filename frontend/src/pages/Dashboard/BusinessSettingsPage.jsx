import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Building2,
  Check,
  ExternalLink,
  Eye,
  Globe,
  Loader2,
  MapPin,
  MessageCircle,
  Palette,
  RefreshCw,
  Save,
} from 'lucide-react'
import { useMyBusiness, useUpdateBusiness } from '@/hooks/useBusiness'
import PageHeader from '@/components/dashboard/PageHeader'
import DashboardPanel from '@/components/dashboard/DashboardPanel'
import EmptyState from '@/components/dashboard/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

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

const CURRENCIES = ['ARS', 'USD', 'EUR', 'BRL', 'CLP', 'MXN', 'UYU', 'COP', 'PEN']
const PHONE_PATTERN = /^\+?[1-9]\d{6,14}$/
const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/

const EMPTY_FORM = {
  name: '',
  tagline: '',
  description: '',
  category: 'general',
  whatsapp_number: '',
  address: '',
  city: '',
  primary_color: '#0f172a',
  secondary_color: '#14b8a6',
  currency: 'ARS',
  slug: '',
}

const categoryLabel = (value) =>
  CATEGORIES.find((category) => category.value === value)?.label || 'Otro'

export default function BusinessSettingsPage() {
  const { data: business, loading, isError, error, refetch } = useMyBusiness()
  const updateBusiness = useUpdateBusiness()

  const [form, setForm] = useState(EMPTY_FORM)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (isError) {
      toast({
        title: 'No pudimos cargar tu negocio',
        description:
          error?.response?.data?.error || 'Completá el onboarding para crear tu negocio.',
        variant: 'destructive',
      })
    }
  }, [isError, error])

  useEffect(() => {
    if (!business) return

    setForm({
      name: business.name || '',
      tagline: business.tagline || '',
      description: business.description || '',
      category: business.category || 'general',
      whatsapp_number: business.whatsapp_number || '',
      address: business.address || '',
      city: business.city || '',
      primary_color: business.primary_color || '#0f172a',
      secondary_color: business.secondary_color || '#14b8a6',
      currency: business.currency || 'ARS',
      slug: business.slug || '',
    })
  }, [business])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
      toast({ title: 'Datos actualizados', variant: 'success' })
    } catch {
      toast({
        title: 'No pudimos actualizar tu negocio',
        description: 'Revisá tu conexión e intentá de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setRefreshing(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!business) return

    if (form.name.trim().length < 2) {
      toast({
        title: 'El nombre del negocio es obligatorio',
        description: 'Debe tener al menos 2 caracteres.',
        variant: 'destructive',
      })
      return
    }

    if (form.whatsapp_number.trim() && !PHONE_PATTERN.test(form.whatsapp_number.trim())) {
      toast({
        title: 'El WhatsApp no es válido',
        description: 'Usá el formato internacional, por ejemplo +5491112345678.',
        variant: 'destructive',
      })
      return
    }

    if (!HEX_PATTERN.test(form.primary_color) || !HEX_PATTERN.test(form.secondary_color)) {
      toast({ title: 'Los colores deben ser hexadecimales válidos', variant: 'destructive' })
      return
    }

    const updates = {
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      category: form.category,
      whatsapp_number: form.whatsapp_number.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      primary_color: form.primary_color,
      secondary_color: form.secondary_color,
      currency: form.currency,
    }

    try {
      await updateBusiness.mutateAsync({ id: business.id, updates })
      toast({ title: 'Negocio actualizado', variant: 'success' })
    } catch (err) {
      toast({
        title: 'No pudimos actualizar el negocio',
        description: err.response?.data?.error || 'Revisá los datos e intentá de nuevo.',
        variant: 'destructive',
      })
    }
  }

  const publicLink = `${window.location.origin}/book`
  const selectedCategory = CATEGORIES.find((category) => category.value === form.category)

  return (
    <div>
      <PageHeader
        eyebrow="Configuración"
        title="Mi negocio"
        description="Editá la información pública de tu negocio, tus datos de contacto y la identidad visual que ven tus clientes."
        icon={Building2}
        actions={
          <>
            <Button
              variant="outline"
              className="h-10 rounded-xl"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={cn('h-4 w-4', refreshing && 'animate-spin')}
                aria-hidden="true"
              />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
            <Button asChild variant="outline" className="h-10 rounded-xl">
              <Link to="/book" target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Ver página
              </Link>
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <Skeleton className="h-72 rounded-3xl" />
            <Skeleton className="h-56 rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
          </div>
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      ) : isError || !business ? (
        <EmptyState
          className="mt-6"
          tone="destructive"
          icon={AlertCircle}
          title="No encontramos tu negocio"
          description="Para editar la información pública primero tenés que completar el onboarding y crear tu negocio."
          action={
            <Button asChild>
              <Link to="/onboarding/business">Configurar negocio</Link>
            </Button>
          }
        />
      ) : (
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
              <DashboardPanel
                title="Información pública"
                description="Estos datos aparecen en tu página de reservas"
                icon={Building2}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Nombre del negocio *</Label>
                    <Input
                      id="business-name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Ej. Clínica Dental Sonrisa"
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-tagline">Descripción corta</Label>
                    <Input
                      id="business-tagline"
                      name="tagline"
                      value={form.tagline}
                      onChange={handleChange}
                      placeholder="Una frase que resuma tu negocio"
                      maxLength={200}
                      className="h-11 rounded-xl"
                    />
                    <p className="text-right text-[11px] text-muted-foreground">
                      {form.tagline.length}/200
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-description">Descripción</Label>
                    <Textarea
                      id="business-description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Contá qué hacés, cómo trabajás y qué te diferencia."
                      maxLength={1000}
                      className="min-h-[120px]"
                    />
                    <p className="text-right text-[11px] text-muted-foreground">
                      {form.description.length}/1000
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-category">Rubro</Label>
                    <Select
                      value={form.category}
                      onValueChange={(value) =>
                        setForm((previous) => ({ ...previous, category: value }))
                      }
                    >
                      <SelectTrigger id="business-category" className="h-11 rounded-xl">
                        <SelectValue placeholder="Seleccioná un rubro" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.icon} {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DashboardPanel>

              <DashboardPanel
                title="Contacto y ubicación"
                description="Para que tus clientes puedan comunicarse con vos"
                icon={MapPin}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-whatsapp">WhatsApp del negocio</Label>
                    <Input
                      id="business-whatsapp"
                      name="whatsapp_number"
                      type="tel"
                      value={form.whatsapp_number}
                      onChange={handleChange}
                      placeholder="+5491112345678"
                      className="h-11 rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      Incluí el código de país. Se usa para los recordatorios de turnos.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="business-address">Dirección</Label>
                      <Input
                        id="business-address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Av. Siempre Viva 123"
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business-city">Ciudad</Label>
                      <Input
                        id="business-city"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Buenos Aires"
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </DashboardPanel>

              <DashboardPanel
                title="Marca y moneda"
                description="Personalizá los colores y la moneda de tus servicios"
                icon={Palette}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="business-primary-color">Color principal</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="business-primary-color"
                        name="primary_color"
                        type="color"
                        value={form.primary_color}
                        onChange={handleChange}
                        className="h-11 w-14 cursor-pointer rounded-xl p-1"
                      />
                      <Input
                        aria-label="Código del color principal"
                        value={form.primary_color}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            primary_color: event.target.value,
                          }))
                        }
                        className="h-11 rounded-xl font-mono text-xs uppercase"
                        maxLength={7}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-secondary-color">Color secundario</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="business-secondary-color"
                        name="secondary_color"
                        type="color"
                        value={form.secondary_color}
                        onChange={handleChange}
                        className="h-11 w-14 cursor-pointer rounded-xl p-1"
                      />
                      <Input
                        aria-label="Código del color secundario"
                        value={form.secondary_color}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            secondary_color: event.target.value,
                          }))
                        }
                        className="h-11 rounded-xl font-mono text-xs uppercase"
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="business-currency">Moneda</Label>
                    <Select
                      value={form.currency}
                      onValueChange={(value) =>
                        setForm((previous) => ({ ...previous, currency: value }))
                      }
                    >
                      <SelectTrigger id="business-currency" className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(new Set([form.currency, ...CURRENCIES]))
                          .filter(Boolean)
                          .map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Se usa como moneda predeterminada para nuevos servicios.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-slug">Identificador público</Label>
                    <Input
                      id="business-slug"
                      value={form.slug}
                      readOnly
                      disabled
                      className="h-11 rounded-xl font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Se genera automáticamente y no se puede editar.
                    </p>
                  </div>
                </div>
              </DashboardPanel>

              <div className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Los cambios se publican en tu página de reservas al guardar.
                </p>
                <Button
                  type="submit"
                  className="h-11 rounded-xl"
                  disabled={updateBusiness.isPending}
                >
                  {updateBusiness.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Save className="h-4 w-4" aria-hidden="true" />
                  )}
                  {updateBusiness.isPending ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </div>

            <aside className="space-y-6">
              <DashboardPanel
                title="Vista previa"
                description="Así se ve tu marca"
                icon={Eye}
              >
                <div className="overflow-hidden rounded-2xl border border-border/70">
                  <div
                    className="h-20"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${form.primary_color}, ${form.secondary_color})`,
                    }}
                  />

                  <div className="p-4">
                    <div className="-mt-10 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-card text-primary shadow-sm">
                      {business.logo_url ? (
                        <img
                          src={business.logo_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-6 w-6" aria-hidden="true" />
                      )}
                    </div>

                    <p className="mt-3 text-base font-semibold">
                      {form.name || 'Tu negocio'}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {form.tagline || 'Tu descripción corta'}
                    </p>

                    <Badge variant="secondary" className="mt-2">
                      {selectedCategory ? `${selectedCategory.icon} ${selectedCategory.label}` : 'Otro'}
                    </Badge>

                    <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {form.description ||
                        'Agregá una descripción para que tus clientes conozcan tu negocio.'}
                    </p>

                    <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                      {form.whatsapp_number && (
                        <p className="inline-flex items-center gap-1.5">
                          <MessageCircle className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
                          {form.whatsapp_number}
                        </p>
                      )}
                      {(form.address || form.city) && (
                        <p className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
                          {[form.address, form.city].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
                  <Globe className="h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                  <span className="truncate">{publicLink}</span>
                </div>

                <Button asChild variant="outline" className="mt-3 w-full rounded-xl">
                  <Link to="/book" target="_blank" rel="noreferrer">
                    Ver página de reservas
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </DashboardPanel>

              <DashboardPanel title="Checklist" icon={Check}>
                <ul className="space-y-2.5 text-xs leading-relaxed text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
                    Cargá una descripción clara de tus servicios.
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
                    Verificá que el WhatsApp tenga código de país.
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
                    Revisá que la moneda coincida con la de tus precios.
                  </li>
                </ul>
              </DashboardPanel>
            </aside>
          </div>
        </form>
      )}
    </div>
  )
}
