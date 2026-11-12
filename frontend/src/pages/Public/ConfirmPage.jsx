import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  UserRound,
  Wallet,
} from 'lucide-react'
import { useBooking } from '@/hooks/useBookingMutations'
import BookingHeader from '@/components/booking/BookingHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, getStatusBadge } from '@/lib/utils'

const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text)

function formatDateParts(value) {
  if (!value) return { date: null, time: null }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { date: null, time: null }

  return {
    date: capitalize(
      date.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    ),
    time: date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }),
  }
}

function formatRange(startAt, endAt) {
  const start = formatDateParts(startAt)
  const end = formatDateParts(endAt)
  if (!start.time || !end.time) return start.time
  return `${start.time} a ${end.time} hs`
}

function toCalendarStamp(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function buildGoogleCalendarUrl(appointment) {
  const start = toCalendarStamp(appointment?.start_at)
  const end = toCalendarStamp(appointment?.end_at)
  if (!start || !end) return null

  const serviceName = appointment.services?.name || 'Turno'
  const businessName = appointment.businesses?.name
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: businessName ? `${serviceName} en ${businessName}` : serviceName,
    dates: `${start}/${end}`,
    details: `Reserva de ${appointment.client_name || 'un cliente'} a través de Smile Book.`,
  })

  if (businessName) params.set('location', businessName)

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function buildWhatsAppUrl(appointment) {
  const rawNumber = appointment.businesses?.whatsapp_number
  if (!rawNumber) return null

  const number = String(rawNumber).replace(/\D/g, '')
  if (!number) return null

  const { date, time } = formatDateParts(appointment.start_at)
  const businessName = appointment.businesses?.name || 'el negocio'
  const serviceName = appointment.services?.name || 'un turno'
  const message = `Hola ${businessName}, reservé ${serviceName} para el ${date || 'día acordado'} a las ${time || 'horario acordado'} hs. Mi nombre es ${appointment.client_name || ''}.`

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="break-words text-sm font-medium">{value || '—'}</dd>
      </div>
    </div>
  )
}

function StateScreen({ icon: Icon = AlertCircle, title, description, children }) {
  return (
    <div className="min-h-screen bg-background">
      <BookingHeader backTo="/" backLabel="Volver al inicio" badge="Reserva segura" />
      <main className="container mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary ring-1 ring-inset ring-primary/10">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-balance">{title}</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-6 flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function ConfirmPage() {
  const { sessionId } = useParams()
  const { data: appointment, isLoading, isError } = useBooking(sessionId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <BookingHeader backTo="/" backLabel="Volver al inicio" badge="Reserva segura" />
        <main
          className="container mx-auto max-w-3xl px-4 py-10 lg:py-14"
          aria-busy="true"
          aria-label="Verificando tu reserva"
        >
          <div className="mx-auto max-w-md space-y-4 text-center">
            <Skeleton className="mx-auto h-16 w-16 rounded-full" />
            <Skeleton className="mx-auto h-8 w-56" />
            <Skeleton className="mx-auto h-4 w-72" />
          </div>
          <Skeleton className="mt-10 h-72 rounded-3xl" />
        </main>
      </div>
    )
  }

  if (isError || !appointment) {
    return (
      <StateScreen
        title="No pudimos encontrar tu reserva"
        description="Es posible que el enlace haya expirado o que la reserva se haya eliminado. Si ya realizaste el pago, contactanos y lo revisamos."
      >
        <Button asChild size="lg" className="w-full rounded-xl sm:w-auto">
          <Link to="/book">Reservar un turno</Link>
        </Button>
        <Button asChild variant="ghost" size="lg" className="w-full rounded-xl sm:w-auto">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </StateScreen>
    )
  }

  const { date, time } = formatDateParts(appointment.start_at)
  const status = getStatusBadge(appointment.status)
  const isCancelled = appointment.status === 'cancelled'
  const isPaid = appointment.status === 'paid'
  const isPending = appointment.status === 'pending'
  const serviceName = appointment.services?.name || 'Tu turno'
  const businessName = appointment.businesses?.name
  const currency = appointment.services?.currency || appointment.businesses?.currency || 'ARS'
  const priceLabel =
    appointment.services?.price_cents != null
      ? formatCurrency(appointment.services.price_cents, currency)
      : null
  const calendarUrl = buildGoogleCalendarUrl(appointment)
  const whatsappUrl = buildWhatsAppUrl(appointment)

  const heading = isCancelled
    ? 'Tu reserva fue cancelada'
    : isPaid || appointment.status === 'confirmed'
      ? '¡Reserva confirmada!'
      : '¡Reserva recibida!'

  const subheading = isCancelled
    ? 'Este turno ya no está activo. Podés reservar uno nuevo cuando quieras.'
    : isPending
      ? 'Estamos confirmando tu pago. Te avisaremos por WhatsApp en cuanto se acredite.'
      : 'Tu turno quedó reservado. Te enviamos los detalles por email y WhatsApp.'

  return (
    <div className="min-h-screen bg-background">
      <BookingHeader backTo="/" backLabel="Volver al inicio" badge="Reserva segura" />

      <main className="container mx-auto max-w-3xl px-4 py-10 lg:py-14">
        <div className="text-center">
          <div
            className={
              isCancelled
                ? 'mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive'
                : 'mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal/10 text-teal'
            }
          >
            {isCancelled ? (
              <AlertCircle className="h-8 w-8" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            )}
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {heading}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {subheading}
          </p>

          <div className="mt-4 flex justify-center">
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </div>

        <section
          className="mt-9 overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm"
          aria-labelledby="booking-detail-heading"
        >
          <div className="border-b border-border/70 bg-muted/30 p-5 sm:p-6">
            <h2 id="booking-detail-heading" className="text-sm font-semibold">
              Detalle de tu reserva
            </h2>
            <p className="mt-1 text-lg font-semibold">{serviceName}</p>
            {businessName && (
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
                {businessName}
              </p>
            )}
          </div>

          <div className="p-5 sm:p-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailRow icon={CalendarDays} label="Fecha" value={date} />
              <DetailRow icon={Clock} label="Horario" value={formatRange(appointment.start_at, appointment.end_at)} />
              <DetailRow
                icon={Clock}
                label="Duración"
                value={appointment.services?.duration_min ? `${appointment.services.duration_min} min` : null}
              />
              <DetailRow icon={UserRound} label="A nombre de" value={appointment.client_name} />
              <DetailRow icon={Mail} label="Email" value={appointment.client_email} />
              <DetailRow icon={Phone} label="Teléfono" value={appointment.client_phone} />
            </dl>

            {priceLabel && (
              <div className="mt-6 flex items-center justify-between rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4" aria-hidden="true" />
                  Total
                </span>
                <span className="text-lg font-semibold text-primary">{priceLabel}</span>
              </div>
            )}

            {!isCancelled && (
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                {calendarUrl && (
                  <Button asChild className="h-11 flex-1 rounded-xl">
                    <a href={calendarUrl} target="_blank" rel="noreferrer">
                      <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                      Agregar al calendario
                    </a>
                  </Button>
                )}
                {whatsappUrl && (
                  <Button asChild variant="outline" className="h-11 flex-1 rounded-xl">
                    <a href={whatsappUrl} target="_blank" rel="noreferrer">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      Escribir por WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 rounded-2xl border border-border/70 bg-muted/20 p-4 text-xs leading-relaxed text-muted-foreground">
          <p>
            Guardá este enlace para consultar los detalles de tu turno. Si necesitás reprogramar o
            cancelar, escribinos{whatsappUrl ? ' por WhatsApp' : ' a la brevedad'}.
          </p>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild size="lg" className="w-full rounded-xl sm:w-auto">
            <Link to="/book">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reservar otro turno
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="w-full rounded-xl sm:w-auto">
            <Link to="/">
              Volver al inicio
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
