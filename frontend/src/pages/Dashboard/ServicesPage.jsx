import { useMemo, useState } from 'react'
import {
  AlertCircle,
  Clock,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Scissors,
  Trash2,
  Wallet,
} from 'lucide-react'
import { useAuthUser } from '@/hooks/useAuth'
import { useServices } from '@/hooks/useServices'
import { useMyBusiness } from '@/hooks/useBusiness'
import { useCreateService, useUpdateService, useDeleteService } from '@/hooks/useServiceMutations'
import PageHeader from '@/components/dashboard/PageHeader'
import StatCard from '@/components/dashboard/StatCard'
import EmptyState from '@/components/dashboard/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import ResponsiveModal from '@/components/ui/responsive-modal'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn, formatCurrency } from '@/lib/utils'
import {
  centsToPriceInput,
  priceToCents,
  resolveCurrency,
} from '@/lib/format'
import { toast } from '@/hooks/use-toast'

const CURRENCIES = ['ARS', 'USD', 'EUR', 'BRL', 'CLP', 'MXN', 'UYU', 'COP', 'PEN']
const DURATION_PRESETS = [15, 30, 45, 60, 90]

const makeEmptyForm = (currency = 'ARS') => ({
  id: null,
  name: '',
  description: '',
  duration_min: '30',
  price: '',
  currency,
})

export default function ServicesPage() {
  const user = useAuthUser()
  const filters = useMemo(() => ({ professionalId: user?.id }), [user?.id])
  const { services, loading, error, refetch } = useServices(filters)
  const { data: business } = useMyBusiness()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(makeEmptyForm())
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const createService = useCreateService()
  const updateService = useUpdateService()
  const deleteService = useDeleteService()

  const saving = createService.isPending || updateService.isPending
  const deleting = deleteService.isPending ? deleteService.variables : null

  const businessCurrency = resolveCurrency(
    business?.currency,
    services[0]?.currency,
    services[0]?.businesses?.currency
  )

  const stats = useMemo(() => {
    const total = services.length
    const avgDuration = total
      ? Math.round(services.reduce((sum, service) => sum + (service.duration_min || 0), 0) / total)
      : 0
    const avgPrice = total
      ? Math.round(services.reduce((sum, service) => sum + (service.price_cents || 0), 0) / total)
      : 0

    return { total, avgDuration, avgPrice }
  }, [services])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
      toast({ title: 'Servicios actualizados', variant: 'success' })
    } catch {
      toast({
        title: 'No pudimos actualizar los servicios',
        description: 'Revisá tu conexión e intentá de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setRefreshing(false)
    }
  }

  const openCreate = () => {
    setForm(makeEmptyForm(businessCurrency))
    setShowForm(true)
  }

  const openEdit = (service) => {
    setForm({
      id: service.id,
      name: service.name || '',
      description: service.description || '',
      duration_min: String(service.duration_min || 30),
      price: centsToPriceInput(service.price_cents),
      currency: resolveCurrency(service.currency, businessCurrency),
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setForm(makeEmptyForm(businessCurrency))
  }

  const handleField = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const name = form.name.trim()
    const duration = Number.parseInt(form.duration_min, 10)
    const priceCents = priceToCents(form.price)

    if (name.length < 2) {
      toast({ title: 'El nombre debe tener al menos 2 caracteres', variant: 'destructive' })
      return
    }
    if (!Number.isFinite(duration) || duration < 5 || duration > 480) {
      toast({
        title: 'La duración debe estar entre 5 y 480 minutos',
        variant: 'destructive',
      })
      return
    }
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      toast({ title: 'Ingresá un precio válido', variant: 'destructive' })
      return
    }

    const payload = {
      name,
      description: form.description.trim(),
      duration_min: duration,
      price_cents: priceCents,
      currency: form.currency || businessCurrency,
    }

    try {
      if (form.id) {
        await updateService.mutateAsync({ id: form.id, updates: payload })
        toast({ title: 'Servicio actualizado', variant: 'success' })
      } else {
        await createService.mutateAsync(payload)
        toast({ title: 'Servicio creado', variant: 'success' })
      }
      closeForm()
    } catch (err) {
      toast({
        title: 'No pudimos guardar el servicio',
        description: err.response?.data?.error || 'Revisá los datos e intentá de nuevo.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteConfirm = async () => {
    const id = deleteTarget
    if (!id) return

    try {
      await deleteService.mutateAsync(id)
      toast({ title: 'Servicio eliminado', variant: 'success' })
      setDeleteTarget(null)
    } catch (err) {
      toast({
        title: 'No pudimos eliminar el servicio',
        description: err.response?.data?.error || 'Probá de nuevo en unos segundos.',
        variant: 'destructive',
      })
    }
  }

  const previewCents = priceToCents(form.price)
  const previewCurrency = form.currency || businessCurrency

  return (
    <div>
      <PageHeader
        eyebrow="Catálogo"
        title="Servicios"
        description="Definí qué ofrecés, cuánto dura cada turno y cuánto cuesta. Estos datos se muestran en tu página de reservas."
        icon={Scissors}
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
            <Button className="h-10 rounded-xl" onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nuevo servicio
            </Button>
          </>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Servicios"
          value={stats.total}
          hint="Publicados en tu catálogo"
          icon={Scissors}
          tone="primary"
          loading={loading}
        />
        <StatCard
          label="Duración promedio"
          value={`${stats.avgDuration} min`}
          hint="Tiempo medio por turno"
          icon={Clock}
          tone="teal"
          loading={loading}
        />
        <StatCard
          label="Precio promedio"
          value={formatCurrency(stats.avgPrice, businessCurrency)}
          hint="Calculado sobre tus servicios"
          icon={Wallet}
          tone="rose"
          loading={loading}
        />
      </div>

      <div className="mt-6">
        {error ? (
          <EmptyState
            tone="destructive"
            icon={AlertCircle}
            title="No pudimos cargar los servicios"
            description={error}
            action={<Button onClick={() => refetch()}>Reintentar</Button>}
          />
        ) : loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-52 rounded-3xl" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            icon={Scissors}
            title="Todavía no tenés servicios"
            description="Creá tu primer servicio para empezar a recibir reservas. Podés definir duración, precio y una descripción."
            action={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Crear primer servicio
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => {
              const currency = resolveCurrency(service.currency, businessCurrency)

              return (
                <li
                  key={service.id}
                  className="flex h-full flex-col rounded-3xl border border-border/70 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary ring-1 ring-inset ring-primary/10">
                      <Scissors className="h-5 w-5" aria-hidden="true" />
                    </span>

                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                        onClick={() => openEdit(service)}
                        aria-label={`Editar ${service.name}`}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteTarget(service.id)}
                        disabled={deleting === service.id}
                        aria-label={`Eliminar ${service.name}`}
                      >
                        {deleting === service.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <h2 className="mt-4 text-base font-semibold tracking-tight">{service.name}</h2>
                  <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-muted-foreground">
                    {service.description || 'Sin descripción.'}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
                      {service.duration_min} min
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                      <Wallet className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
                      {formatCurrency(service.price_cents || 0, currency)}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <ResponsiveModal
        open={showForm}
        onOpenChange={(open) => (open ? setShowForm(true) : closeForm())}
        title={form.id ? 'Editar servicio' : 'Nuevo servicio'}
        description="Los cambios se reflejan en tu página pública de reservas."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="service-name">Nombre del servicio *</Label>
            <Input
              id="service-name"
              name="name"
              value={form.name}
              onChange={handleField}
              placeholder="Ej. Consulta general"
              className="h-11 rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-description">Descripción</Label>
            <Textarea
              id="service-description"
              name="description"
              value={form.description}
              onChange={handleField}
              placeholder="Contá brevemente en qué consiste el servicio (opcional)."
              maxLength={500}
            />
            <p className="text-right text-[11px] text-muted-foreground">
              {form.description.length}/500
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="service-duration">Duración (minutos) *</Label>
              <div className="relative">
                <Clock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="service-duration"
                  name="duration_min"
                  type="number"
                  min="5"
                  max="480"
                  step="5"
                  value={form.duration_min}
                  onChange={handleField}
                  className="h-11 rounded-xl pl-10"
                  required
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {DURATION_PRESETS.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        duration_min: String(minutes),
                      }))
                    }
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      Number(form.duration_min) === minutes
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {minutes} min
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-price">Precio *</Label>
              <div className="flex gap-2">
                <Select
                  value={form.currency}
                  onValueChange={(value) =>
                    setForm((previous) => ({ ...previous, currency: value }))
                  }
                >
                  <SelectTrigger
                    className="h-11 w-[88px] shrink-0 rounded-xl"
                    aria-label="Moneda del servicio"
                  >
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

                <Input
                  id="service-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={form.price}
                  onChange={handleField}
                  placeholder="50"
                  className="h-11 flex-1 rounded-xl"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {previewCents > 0
                  ? `Se mostrará como ${formatCurrency(previewCents, previewCurrency)}`
                  : 'Ingresá el precio en unidades, no en centavos.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" className="rounded-xl" onClick={closeForm}>
              Cancelar
            </Button>
            <Button type="submit" className="rounded-xl" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {saving ? 'Guardando...' : form.id ? 'Guardar cambios' : 'Crear servicio'}
            </Button>
          </div>
        </form>
      </ResponsiveModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Eliminar servicio"
        description="¿Seguro que querés eliminar este servicio? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        confirmVariant="destructive"
        loading={deleting !== null}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
