import { useMemo } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import StatCard from '@/components/dashboard/StatCard'
import EmptyState from '@/components/dashboard/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthUser, useIsAuthenticated } from '@/hooks/useAuth'
import { useMyAppointments } from '@/hooks/useAppointments'
import { cn, formatCurrency, getStatusBadge } from '@/lib/utils'
import {
  formatLongDate,
  formatTimeWithSuffix,
  parseDate,
  resolveCurrency,
} from '@/lib/format'
import {
  AlertCircle,
  CalendarCheck2,
  CalendarDays,
  CalendarPlus,
  CalendarX2,
  Clock,
  LayoutDashboard,
  RefreshCw,
  Timer,
} from 'lucide-react'

function getDateParts(value) {
  const date = parseDate(value)
  if (!date) return { day: '--', month: '---' }
  return {
    day: date.toLocaleDateString('es-AR', { day: '2-digit' }),
    month: date
      .toLocaleDateString('es-AR', { month: 'short' })
      .replace('.', '')
      .toUpperCase(),
  }
}

function AppointmentCard({ appointment }) {
  const { day, month } = getDateParts(appointment.start_at)
  const status = getStatusBadge(appointment.status)
  const currency = resolveCurrency(
    appointment.services?.currency,
    appointment.businesses?.currency
  )
  const hasPrice = appointment.services?.price_cents != null
  const price = hasPrice
    ? formatCurrency(appointment.services.price_cents, currency)
    : null
  const duration = appointment.services?.duration_min
  const isCancelled = appointment.status === 'cancelled'

  return (
    <article
      className={cn(
        'rounded-3xl border border-border/70 bg-card p-5 shadow-sm transition-shadow hover:shadow-md',
        isCancelled && 'opacity-80'
      )}
    >
      <div className="flex gap-4">
        <div
          className={cn(
            'flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl ring-1 ring-inset',
            isCancelled
              ? 'bg-muted text-muted-foreground ring-border'
              : 'bg-primary/5 text-primary ring-primary/10'
          )}
          aria-hidden="true"
        >
          <span className="text-xl font-bold leading-none">{day}</span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide">{month}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
            <div className="min-w-0">
              {appointment.businesses?.name && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal">
                  {appointment.businesses.name}
                </p>
              )}
              <h3 className="mt-0.5 truncate text-base font-semibold">
                {appointment.services?.name || 'Turno reservado'}
              </h3>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
              {formatLongDate(appointment.start_at)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
              {formatTimeWithSuffix(appointment.start_at)}
            </span>
            {duration && (
              <span className="inline-flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
                {duration} min
              </span>
            )}
            {price && (
              <span className="font-medium text-foreground">{price}</span>
            )}
          </div>

          {!isCancelled && appointment.service_id && (
            <div className="mt-4 flex justify-end">
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <Link to={`/book/${appointment.service_id}`}>Reservar de nuevo</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5">
      <div className="flex gap-4">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    </div>
  )
}

export default function MyAppointmentsPage() {
  const isAuthenticated = useIsAuthenticated()
  const user = useAuthUser()
  const { appointments, loading, error, refetch } = useMyAppointments({
    enabled: isAuthenticated,
  })

  const { upcoming, past, cancelled } = useMemo(() => {
    const now = Date.now()
    const withTime = appointments.map((appointment) => ({
      appointment,
      time: new Date(appointment.start_at).getTime(),
    }))

    const upcomingItems = withTime
      .filter(({ appointment, time }) => time >= now && appointment.status !== 'cancelled')
      .sort((a, b) => a.time - b.time)
      .map(({ appointment }) => appointment)

    const pastItems = withTime
      .filter(({ appointment, time }) => time < now || appointment.status === 'cancelled')
      .sort((a, b) => b.time - a.time)
      .map(({ appointment }) => appointment)

    return {
      upcoming: upcomingItems,
      past: pastItems,
      cancelled: pastItems.filter((appointment) => appointment.status === 'cancelled'),
    }
  }, [appointments])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const firstName = user?.full_name?.trim().split(/\s+/)[0]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-muted/70 via-muted/30 to-background">
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-teal/10 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)',
              backgroundSize: '28px 28px',
              maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 85%)',
            }}
          />
        </div>

        <div className="container relative mx-auto px-4 py-10 lg:py-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
                <CalendarCheck2 className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
                Mi cuenta
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Mis turnos</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {firstName ? `Hola, ${firstName}. ` : ''}
                Acá están tus reservas en Smile Book: próximos turnos, historial y accesos para
                reservar de nuevo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {user?.role === 'professional' && (
                <Button asChild variant="ghost" className="rounded-xl">
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                    Ir a mi panel
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={loading}
                className="rounded-xl bg-background/80"
              >
                <RefreshCw
                  className={cn('h-4 w-4', loading && 'animate-spin')}
                  aria-hidden="true"
                />
                Actualizar
              </Button>
              <Button asChild className="rounded-xl">
                <Link to="/book">
                  <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                  Reservar turno
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="mx-auto max-w-5xl space-y-8">
          <section aria-label="Resumen de tus turnos" className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Próximos"
              value={upcoming.length}
              hint="Turnos que todavía no pasaron"
              icon={CalendarDays}
              tone="teal"
              loading={loading}
            />
            <StatCard
              label="Realizados"
              value={past.length - cancelled.length}
              hint="Turnos en tu historial"
              icon={CalendarCheck2}
              tone="primary"
              loading={loading}
            />
            <StatCard
              label="Cancelados"
              value={cancelled.length}
              hint="Reservas que no siguieron"
              icon={CalendarX2}
              tone="muted"
              loading={loading}
            />
          </section>

          {error ? (
            <EmptyState
              icon={AlertCircle}
              tone="destructive"
              title="No pudimos cargar tus turnos"
              description={error}
              action={
                <>
                  <Button onClick={() => refetch()} className="rounded-xl">
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Reintentar
                  </Button>
                  <Button asChild variant="ghost" className="rounded-xl">
                    <Link to="/book">Reservar un turno</Link>
                  </Button>
                </>
              }
            />
          ) : (
            <>
              <section aria-labelledby="upcoming-title">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 id="upcoming-title" className="text-lg font-semibold tracking-tight">
                    Próximos turnos
                  </h2>
                  {upcoming.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {upcoming.length} {upcoming.length === 1 ? 'turno' : 'turnos'}
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="space-y-3">
                    <CardSkeleton />
                    <CardSkeleton />
                  </div>
                ) : upcoming.length > 0 ? (
                  <div className="space-y-3">
                    {upcoming.map((appointment) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={CalendarPlus}
                    title="No tenés turnos próximos"
                    description="Cuando reserves un turno, va a aparecer acá con todos los detalles."
                    action={
                      <Button asChild className="rounded-xl">
                        <Link to="/book">Reservar un turno</Link>
                      </Button>
                    }
                  />
                )}
              </section>

              {!loading && past.length > 0 && (
                <section aria-labelledby="history-title">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 id="history-title" className="text-lg font-semibold tracking-tight">
                      Historial
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {past.length} {past.length === 1 ? 'turno' : 'turnos'}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {past.map((appointment) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
