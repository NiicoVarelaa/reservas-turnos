import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CalendarDays,
  CalendarPlus,
  Clock,
  ExternalLink,
  Hourglass,
  LayoutDashboard,
  RefreshCw,
  Scissors,
  UserCircle,
  Wallet,
} from 'lucide-react'
import { useAppointments } from '@/hooks/useAppointments'
import { useMyBusiness } from '@/hooks/useBusiness'
import { useAuthUser } from '@/hooks/useAuth'
import PageHeader from '@/components/dashboard/PageHeader'
import StatCard from '@/components/dashboard/StatCard'
import DashboardPanel from '@/components/dashboard/DashboardPanel'
import EmptyState from '@/components/dashboard/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrency, getStatusBadge } from '@/lib/utils'
import {
  formatLongDate,
  formatTime,
  isSameDay,
  parseDate,
  relativeDayLabel,
  resolveCurrency,
} from '@/lib/format'
import { toast } from '@/hooks/use-toast'

const CATEGORY_LABELS = {
  odontologia: 'Odontología',
  medicina: 'Medicina',
  belleza: 'Belleza y estética',
  peluqueria: 'Peluquería',
  psicologia: 'Psicología',
  veterinaria: 'Veterinaria',
  fitness: 'Fitness y deporte',
  educacion: 'Educación',
  legal: 'Legal',
  consultoria: 'Consultoría',
  general: 'Otro',
}

const QUICK_LINKS = [
  {
    to: '/dashboard/bookings',
    label: 'Gestionar reservas',
    description: 'Confirmá, cobrá o cancelá turnos',
    icon: CalendarDays,
  },
  {
    to: '/dashboard/services',
    label: 'Editar servicios',
    description: 'Precios, duración y descripciones',
    icon: Scissors,
  },
  {
    to: '/dashboard/schedule',
    label: 'Ajustar horarios',
    description: 'Definí tu disponibilidad semanal',
    icon: Clock,
  },
  {
    to: '/dashboard/profile',
    label: 'Completar perfil',
    description: 'Tus datos profesionales',
    icon: UserCircle,
  },
]

function DateBadge({ value }) {
  const date = parseDate(value)
  if (!date) return null

  const month = date.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '')

  return (
    <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary text-primary ring-1 ring-inset ring-primary/10">
      <span className="text-[10px] font-semibold uppercase leading-none">{month}</span>
      <span className="mt-0.5 text-lg font-bold leading-none">{date.getDate()}</span>
    </span>
  )
}

function UpcomingRow({ appointment }) {
  const status = getStatusBadge(appointment.status)

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background p-4">
      <DateBadge value={appointment.start_at} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold">{appointment.client_name || 'Cliente'}</p>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {appointment.services?.name || 'Servicio sin especificar'}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold">{formatTime(appointment.start_at)} hs</p>
        <p className="text-[11px] text-muted-foreground">{relativeDayLabel(appointment.start_at)}</p>
      </div>
    </li>
  )
}

export default function DashboardHome() {
  const user = useAuthUser()
  const { appointments, loading, error, refetch } = useAppointments()
  const {
    data: business,
    isLoading: businessLoading,
  } = useMyBusiness()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refetch()
      toast({ title: 'Panel actualizado', variant: 'success' })
    } catch {
      toast({
        title: 'No pudimos actualizar el panel',
        description: 'Revisá tu conexión e intentá de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setRefreshing(false)
    }
  }, [refetch])

  const summary = useMemo(() => {
    const now = new Date()

    const paidAppointments = appointments.filter((appointment) => appointment.status === 'paid')
    const upcoming = appointments
      .filter((appointment) => {
        if (appointment.status === 'cancelled') return false
        const start = parseDate(appointment.start_at)
        return start ? start >= now : false
      })
      .sort((a, b) => new Date(a.start_at) - new Date(b.start_at))

    return {
      total: appointments.length,
      monthCount: appointments.filter((appointment) => {
        const date = parseDate(appointment.start_at)
        return (
          date &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        )
      }).length,
      today: appointments.filter((appointment) => isSameDay(appointment.start_at, now)).length,
      pending: appointments.filter((appointment) => appointment.status === 'pending').length,
      paidCount: paidAppointments.length,
      revenue: paidAppointments.reduce(
        (sum, appointment) => sum + (appointment.services?.price_cents || 0),
        0
      ),
      upcoming: upcoming.slice(0, 5),
    }
  }, [appointments])

  const currency = resolveCurrency(
    business?.currency,
    appointments[0]?.services?.currency,
    appointments[0]?.businesses?.currency
  )

  const displayName =
    user?.profile?.full_name || user?.full_name || user?.email?.split('@')[0] || ''
  const honorifics = ['dr.', 'dra.', 'lic.', 'mg.', 'prof.']
  const nameWithoutHonorific = displayName
    .split(' ')
    .filter(Boolean)
    .filter((word, index) => !(index === 0 && honorifics.includes(word.toLowerCase())))
    .join(' ')
  const firstName = nameWithoutHonorific.split(' ').filter(Boolean)[0] || displayName
  const todayLabel = formatLongDate(new Date())
  const publicBookingUrl = `${window.location.origin}/book`

  return (
    <div>
      <PageHeader
        eyebrow="Panel de control"
        title={firstName ? `Hola, ${firstName}` : 'Tu panel'}
        description={`${todayLabel}. Este es el resumen de la actividad de tu negocio.`}
        icon={LayoutDashboard}
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
            <Button asChild className="h-10 rounded-xl">
              <Link to="/dashboard/bookings">
                Ver reservas
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </>
        }
      />

      {error ? (
        <EmptyState
          className="mt-6"
          tone="destructive"
          icon={AlertCircle}
          title="No pudimos cargar tu panel"
          description={error}
          action={<Button onClick={() => refetch()}>Reintentar</Button>}
        />
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Reservas"
              value={summary.total}
              hint={`${summary.monthCount} este mes`}
              icon={CalendarDays}
              tone="primary"
              loading={loading}
            />
            <StatCard
              label="Hoy"
              value={summary.today}
              hint={todayLabel}
              icon={Clock}
              tone="teal"
              loading={loading}
            />
            <StatCard
              label="Pendientes"
              value={summary.pending}
              hint={summary.pending ? 'Requieren tu confirmación' : 'Todo al día'}
              icon={Hourglass}
              tone="amber"
              loading={loading}
            />
            <StatCard
              label="Ingresos"
              value={formatCurrency(summary.revenue, currency)}
              hint={`${summary.paidCount} ${
                summary.paidCount === 1 ? 'reserva pagada' : 'reservas pagadas'
              }`}
              icon={Wallet}
              tone="rose"
              loading={loading}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <DashboardPanel
              title="Próximos turnos"
              description="Los siguientes turnos agendados con tus clientes"
              icon={CalendarDays}
              actions={
                <Button asChild variant="ghost" size="sm" className="rounded-lg">
                  <Link to="/dashboard/bookings">
                    Ver todos
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </Button>
              }
              bodyClassName="p-4 sm:p-5"
            >
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-[76px] rounded-2xl" />
                  ))}
                </div>
              ) : summary.upcoming.length === 0 ? (
                <EmptyState
                  className="border-0 bg-transparent py-10"
                  icon={CalendarPlus}
                  title="No tenés turnos próximos"
                  description="Cuando tus clientes reserven, sus turnos van a aparecer acá."
                  action={
                    <Button asChild variant="outline" className="rounded-xl">
                      <Link to="/book" target="_blank" rel="noreferrer">
                        Ir a la página de reservas
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  }
                />
              ) : (
                <ul className="space-y-2">
                  {summary.upcoming.map((appointment) => (
                    <UpcomingRow key={appointment.id} appointment={appointment} />
                  ))}
                </ul>
              )}
            </DashboardPanel>

            <div className="space-y-6">
              <DashboardPanel
                title="Accesos rápidos"
                description="Atajos a las tareas más frecuentes"
                icon={Scissors}
                bodyClassName="p-2 sm:p-2"
              >
                <nav aria-label="Accesos rápidos" className="space-y-1">
                  {QUICK_LINKS.map(({ to, label, description, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-background group-hover:text-primary">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{label}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {description}
                        </span>
                      </span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                        aria-hidden="true"
                      />
                    </Link>
                  ))}
                </nav>
              </DashboardPanel>

              <DashboardPanel
                title="Tu negocio"
                description="Así te encuentran tus clientes"
                icon={Building2}
              >
                {businessLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-11 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                ) : business ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary text-primary ring-1 ring-inset ring-primary/10">
                        {business.logo_url ? (
                          <img
                            src={business.logo_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Building2 className="h-5 w-5" aria-hidden="true" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{business.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {business.tagline ||
                            CATEGORY_LABELS[business.category] ||
                            'Tu negocio'}
                        </p>
                      </div>
                    </div>

                    <p className="rounded-2xl bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                      {business.description ||
                        'Completá la descripción de tu negocio para que tus clientes sepan qué ofrecés.'}
                    </p>

                    <Button asChild variant="outline" className="w-full rounded-xl">
                      <Link to="/book" target="_blank" rel="noreferrer">
                        Ver página de reservas
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    <p className="truncate text-center text-[11px] text-muted-foreground">
                      {publicBookingUrl}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Todavía no configuraste los datos públicos de tu negocio.
                    </p>
                    <Button asChild className="w-full rounded-xl">
                      <Link to="/dashboard/settings/business">
                        Configurar negocio
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                )}
              </DashboardPanel>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
