import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  CalendarDays,
  CalendarX2,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  StickyNote,
  UserRound,
  Wallet,
  X,
  XCircle,
} from 'lucide-react'
import { useAppointments, useUpdateAppointment, useCancelAppointment } from '@/hooks/useAppointments'
import PageHeader from '@/components/dashboard/PageHeader'
import StatCard from '@/components/dashboard/StatCard'
import EmptyState from '@/components/dashboard/EmptyState'
import InitialsAvatar from '@/components/ui/InitialsAvatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { cn, formatCurrency, getStatusBadge } from '@/lib/utils'
import {
  formatDate,
  formatLongDate,
  formatTimeWithSuffix,
  resolveCurrency,
} from '@/lib/format'
import { toast } from '@/hooks/use-toast'

const STATUS_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'paid', label: 'Pagadas' },
  { value: 'cancelled', label: 'Canceladas' },
]

function DetailItem({ icon: Icon, label, children, className }) {
  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-inset ring-border">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] text-muted-foreground">{label}</dt>
        <dd className="break-words text-sm font-medium">{children || '—'}</dd>
      </div>
    </div>
  )
}

export default function BookingsPage() {
  const { appointments, loading, error, refetch } = useAppointments()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const updateAppointment = useUpdateAppointment()
  const cancelAppointment = useCancelAppointment()

  const actionLoading = updateAppointment.isPending
    ? updateAppointment.variables?.id
    : cancelAppointment.isPending
      ? cancelAppointment.variables
      : null

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refetch()
      toast({ title: 'Reservas actualizadas', variant: 'success' })
    } catch {
      toast({
        title: 'No pudimos actualizar las reservas',
        description: 'Revisá tu conexión e intentá de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setRefreshing(false)
    }
  }, [refetch])

  const runAction = async (id, updates, successMessage) => {
    if (actionLoading) return
    try {
      await updateAppointment.mutateAsync({ id, updates })
      toast({ title: successMessage, variant: 'success' })
    } catch (err) {
      toast({
        title: 'No pudimos actualizar la reserva',
        description: err.response?.data?.error || 'Probá de nuevo en unos segundos.',
        variant: 'destructive',
      })
    }
  }

  const handleConfirm = (id) =>
    runAction(id, { status: 'confirmed' }, 'Reserva confirmada')

  const handleMarkPaid = (id) =>
    runAction(id, { status: 'paid' }, 'Reserva marcada como pagada')

  const getCancelMessage = (id) => {
    const isPaid = appointments.find((appointment) => appointment.id === id)?.status === 'paid'
    return isPaid
      ? 'Esta reserva ya fue pagada. ¿Confirmás la cancelación? El reembolso debe gestionarse por separado.'
      : '¿Seguro que querés cancelar esta reserva? Esta acción no se puede deshacer.'
  }

  const handleCancel = async (id) => {
    if (actionLoading) return
    try {
      await cancelAppointment.mutateAsync(id)
      toast({ title: 'Reserva cancelada', variant: 'success' })
    } catch (err) {
      toast({
        title: 'No pudimos cancelar la reserva',
        description: err.response?.data?.error || 'Probá de nuevo en unos segundos.',
        variant: 'destructive',
      })
    } finally {
      setCancelTarget(null)
    }
  }

  const counts = useMemo(
    () =>
      appointments.reduce(
        (accumulator, appointment) => {
          accumulator[appointment.status] = (accumulator[appointment.status] || 0) + 1
          return accumulator
        },
        { all: appointments.length }
      ),
    [appointments]
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()

    return appointments.filter((appointment) => {
      const haystack = [
        appointment.client_name,
        appointment.client_email,
        appointment.client_phone,
        appointment.services?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch = !term || haystack.includes(term)
      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [appointments, search, statusFilter])

  const revenue = useMemo(
    () =>
      appointments
        .filter((appointment) => appointment.status === 'paid')
        .reduce((sum, appointment) => sum + (appointment.services?.price_cents || 0), 0),
    [appointments]
  )

  const fallbackCurrency = resolveCurrency(
    appointments[0]?.services?.currency,
    appointments[0]?.businesses?.currency
  )
  const currencyFor = (appointment) =>
    resolveCurrency(
      appointment.services?.currency,
      appointment.businesses?.currency,
      fallbackCurrency
    )

  const hasFilters = search.trim().length > 0 || statusFilter !== 'all'
  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
  }

  const renderActions = (appointment) => {
    const busy = actionLoading === appointment.id

    if (appointment.status === 'cancelled') {
      return (
        <p className="mt-4 border-t border-border/70 pt-4 text-xs text-muted-foreground">
          Esta reserva fue cancelada y ya no está activa.
        </p>
      )
    }

    return (
      <div className="mt-4 flex flex-wrap gap-2 border-t border-border/70 pt-4">
        {appointment.status === 'pending' && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => handleConfirm(appointment.id)}
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            )}
            Confirmar
          </Button>
        )}

        {appointment.status !== 'paid' && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => handleMarkPaid(appointment.id)}
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <CreditCard className="h-4 w-4" aria-hidden="true" />
            )}
            Marcar pagado
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setCancelTarget(appointment.id)}
          disabled={busy}
        >
          <XCircle className="h-4 w-4" aria-hidden="true" />
          Cancelar
        </Button>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Agenda"
        title="Reservas"
        description="Revisá los turnos de tus clientes, confirmá asistencias y registrá pagos."
        icon={CalendarDays}
        actions={
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
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total"
          value={appointments.length}
          hint="Reservas registradas"
          icon={CalendarDays}
          tone="primary"
          loading={loading}
        />
        <StatCard
          label="Pendientes"
          value={counts.pending || 0}
          hint={counts.pending ? 'Esperan confirmación' : 'Nada por confirmar'}
          icon={Clock}
          tone="amber"
          loading={loading}
        />
        <StatCard
          label="Cobrado"
          value={formatCurrency(revenue, fallbackCurrency)}
          hint={`${counts.paid || 0} ${counts.paid === 1 ? 'reserva pagada' : 'reservas pagadas'}`}
          icon={Wallet}
          tone="rose"
          loading={loading}
        />
      </div>

      <div className="mt-6 rounded-3xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por cliente, email, teléfono o servicio..."
              aria-label="Buscar reservas"
              className="h-11 rounded-xl pl-10 pr-10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <p className="text-xs text-muted-foreground lg:text-right" aria-live="polite">
            {loading
              ? 'Cargando reservas...'
              : `${filtered.length} de ${appointments.length} ${
                  appointments.length === 1 ? 'reserva' : 'reservas'
                }`}
          </p>
        </div>

        <div
          className="mt-4 flex flex-wrap gap-1.5"
          role="group"
          aria-label="Filtrar reservas por estado"
        >
          {STATUS_FILTERS.map((filter) => {
            const active = statusFilter === filter.value
            const count = filter.value === 'all' ? counts.all || 0 : counts[filter.value] || 0

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                aria-pressed={active}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border/70 bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {filter.label}
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[10px] font-semibold',
                    active ? 'bg-primary-foreground/20' : 'bg-muted'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5">
        {error ? (
          <EmptyState
            tone="destructive"
            icon={AlertCircle}
            title="No pudimos cargar las reservas"
            description={error}
            action={<Button onClick={() => refetch()}>Reintentar</Button>}
          />
        ) : loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-[92px] rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={hasFilters ? Search : CalendarX2}
            title={hasFilters ? 'No encontramos reservas' : 'Todavía no tenés reservas'}
            description={
              hasFilters
                ? 'Probá con otro nombre, servicio o cambiá el filtro de estado.'
                : 'Cuando un cliente reserve un turno, va a aparecer acá para que puedas gestionarlo.'
            }
            action={
              hasFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/book" target="_blank" rel="noreferrer">
                    Ver página de reservas
                  </Link>
                </Button>
              )
            }
          />
        ) : (
          <ul className="space-y-3">
            {filtered.map((appointment) => {
              const isExpanded = expandedId === appointment.id
              const status = getStatusBadge(appointment.status)
              const priceCents = appointment.services?.price_cents
              const priceLabel =
                priceCents != null ? formatCurrency(priceCents, currencyFor(appointment)) : null
              const detailId = `booking-detail-${appointment.id}`

              return (
                <li
                  key={appointment.id}
                  className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="flex min-w-0 items-start gap-3">
                      <InitialsAvatar
                        name={appointment.client_name}
                        className="h-11 w-11 text-sm"
                      />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold sm:text-base">
                            {appointment.client_name || 'Cliente'}
                          </p>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>

                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {appointment.services?.name || 'Servicio sin especificar'}
                        </p>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
                            {formatDate(appointment.start_at)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
                            {formatTimeWithSuffix(appointment.start_at)}
                          </span>
                          {priceLabel && (
                            <span className="inline-flex items-center gap-1">
                              <Wallet className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
                              {priceLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="self-end rounded-lg sm:self-center"
                      onClick={() => setExpandedId(isExpanded ? null : appointment.id)}
                      aria-expanded={isExpanded}
                      aria-controls={detailId}
                    >
                      {isExpanded ? 'Ocultar' : 'Detalle'}
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-200',
                          isExpanded && 'rotate-180'
                        )}
                        aria-hidden="true"
                      />
                    </Button>
                  </div>

                  {isExpanded && (
                    <div
                      id={detailId}
                      className="border-t border-border/70 bg-muted/20 px-4 py-4 sm:px-5"
                    >
                      <dl className="grid gap-4 sm:grid-cols-2">
                        <DetailItem icon={CalendarDays} label="Fecha">
                          {formatLongDate(appointment.start_at)}
                        </DetailItem>
                        <DetailItem icon={Clock} label="Horario">
                          {formatTimeWithSuffix(appointment.start_at)}
                          {appointment.services?.duration_min
                            ? ` · ${appointment.services.duration_min} min`
                            : ''}
                        </DetailItem>
                        <DetailItem icon={Mail} label="Email">
                          {appointment.client_email ? (
                            <a
                              href={`mailto:${appointment.client_email}`}
                              className="text-primary underline-offset-4 hover:underline"
                            >
                              {appointment.client_email}
                            </a>
                          ) : null}
                        </DetailItem>
                        <DetailItem icon={Phone} label="Teléfono">
                          {appointment.client_phone ? (
                            <a
                              href={`tel:${appointment.client_phone}`}
                              className="text-primary underline-offset-4 hover:underline"
                            >
                              {appointment.client_phone}
                            </a>
                          ) : null}
                        </DetailItem>
                        <DetailItem icon={Wallet} label="Precio del servicio">
                          {priceLabel}
                        </DetailItem>
                        <DetailItem icon={UserRound} label="Cliente">
                          {appointment.client_name}
                        </DetailItem>
                        {appointment.notes && (
                          <DetailItem icon={StickyNote} label="Notas" className="sm:col-span-2">
                            {appointment.notes}
                          </DetailItem>
                        )}
                      </dl>

                      {renderActions(appointment)}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null)
        }}
        title="Cancelar reserva"
        description={cancelTarget ? getCancelMessage(cancelTarget) : ''}
        confirmLabel="Confirmar cancelación"
        cancelLabel="Volver"
        confirmVariant="destructive"
        loading={Boolean(actionLoading)}
        onConfirm={() => cancelTarget && handleCancel(cancelTarget)}
      />
    </>
  )
}
