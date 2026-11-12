import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Calendar from '@/components/booking/Calendar'
import TimeSlots from '@/components/booking/TimeSlots'
import BookingForm from '@/components/booking/BookingForm'
import ProfessionalSelect from '@/components/booking/ProfessionalSelect'
import BookingHeader from '@/components/booking/BookingHeader'
import SecurePaymentBadge from '@/components/booking/SecurePaymentBadge'
import AuthModal from '@/components/auth/AuthModal'
import { useBookingStore } from '@/store/bookingStore'
import { useAvailableSlots } from '@/hooks/useAvailableSlots'
import { useProfessionals } from '@/hooks/useProfessionals'
import { useService } from '@/hooks/useServiceMutations'
import {
  useCreateBooking,
  useCreatePaymentSession,
  getBookingErrorMessage,
} from '@/hooks/useBookingMutations'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrency } from '@/lib/utils'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Stethoscope,
  UserRound,
  Wallet,
} from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Profesional', icon: Stethoscope },
  { id: 2, label: 'Fecha', icon: CalendarDays },
  { id: 3, label: 'Horario', icon: Clock },
  { id: 4, label: 'Tus datos', icon: UserRound },
]

const STEP_COPY = {
  1: {
    title: '¿Con qué profesional querés atenderte?',
    description: 'Elegí quién va a realizar tu tratamiento.',
  },
  2: {
    title: 'Elegí una fecha',
    description: 'Seleccioná el día que mejor te quede.',
  },
  3: {
    title: 'Elegí un horario',
    description: 'Estos son los turnos disponibles para esa fecha.',
  },
  4: {
    title: 'Completá tus datos',
    description: 'Los usamos para confirmar tu reserva y enviarte el recordatorio.',
  },
}

const toDateKey = (date) => (date ? date.toISOString().split('T')[0] : null)
const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text)

function formatLongDate(date) {
  if (!date) return null
  return capitalize(
    new Date(date).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  )
}

function formatSlotTime(slot) {
  if (!slot?.start) return null
  return `${new Date(slot.start).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })} hs`
}

function BookingScreen({ icon: Icon = AlertCircle, title, description, children }) {
  return (
    <div className="min-h-screen bg-background">
      <BookingHeader backTo="/book" backLabel="Cambiar servicio" badge="Reserva segura" />
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

function BookingStepper({ current }) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-2" aria-label="Progreso de la reserva">
      {STEPS.map(({ id, label, icon: Icon }, index) => {
        const complete = current > id
        const active = current === id

        return (
          <li
            key={id}
            className="flex flex-1 items-center gap-1.5 last:flex-none sm:gap-2"
            aria-current={active ? 'step' : undefined}
          >
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
                complete && 'border-teal bg-teal text-white',
                active && 'border-primary bg-primary text-primary-foreground',
                !active && !complete && 'border-border bg-background text-muted-foreground'
              )}
            >
              {complete ? (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Icon className="h-4 w-4" aria-hidden="true" />
              )}
            </div>
            <span
              className={cn(
                'hidden whitespace-nowrap text-xs font-medium sm:block',
                active ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {label}
            </span>
            {active && <span className="sr-only">Paso actual: {label}</span>}
            {index < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={cn('mx-0.5 h-px flex-1', complete ? 'bg-teal' : 'bg-border')}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function SummaryRow({ icon: Icon, label, value, placeholder }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd
          className={cn(
            'break-words text-sm font-medium',
            !value && 'font-normal text-muted-foreground/70'
          )}
        >
          {value || placeholder}
        </dd>
      </div>
    </div>
  )
}

function BookingSummary({
  className,
  service,
  professionalName,
  date,
  slot,
  currency,
}) {
  const priceLabel =
    service && service.price_cents != null ? formatCurrency(service.price_cents, currency) : '—'

  return (
    <div className={cn('rounded-3xl border border-border/70 bg-card p-5 shadow-sm', className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Resumen de tu reserva</h2>
        <Link
          to="/book"
          className="rounded text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Cambiar
        </Link>
      </div>

      <div className="mt-3 rounded-2xl bg-muted/40 p-3">
        <p className="text-sm font-semibold">{service?.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {service?.duration_min} min · {priceLabel}
        </p>
      </div>

      <dl className="mt-4 space-y-3">
        <SummaryRow
          icon={Stethoscope}
          label="Profesional"
          value={professionalName}
          placeholder="Elegí un profesional"
        />
        <SummaryRow
          icon={CalendarDays}
          label="Fecha"
          value={formatLongDate(date)}
          placeholder="Elegí una fecha"
        />
        <SummaryRow
          icon={Clock}
          label="Horario"
          value={formatSlotTime(slot)}
          placeholder="Elegí un horario"
        />
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-4">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="text-lg font-semibold text-primary">{priceLabel}</span>
      </div>

      <div className="mt-4 space-y-2">
        <SecurePaymentBadge />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Reservá ahora y pagá online de forma segura. Te confirmamos por WhatsApp.
        </p>
      </div>
    </div>
  )
}

export default function BookingPage() {
  const { serviceId } = useParams()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(1)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const stepHeadingRef = useRef(null)

  const {
    selectedDate,
    selectedSlot,
    selectedProfessional,
    setSelectedDate,
    setSelectedSlot,
    setSelectedService,
    setSelectedProfessional,
  } = useBookingStore()

  const hasValidServiceId = Boolean(serviceId) && serviceId !== 'undefined'

  const {
    data: service,
    isLoading: serviceLoading,
    isError: serviceFailed,
  } = useService(hasValidServiceId ? serviceId : null)

  useEffect(() => {
    if (service) setSelectedService(service)
  }, [service, setSelectedService])

  const { professionals, loading: professionalsLoading } = useProfessionals(serviceId)

  const {
    slots,
    loading: slotsLoading,
    error: slotsError,
    refetch: refetchSlots,
  } = useAvailableSlots(serviceId, toDateKey(selectedDate), selectedProfessional?.professional_id)

  useEffect(() => {
    if (selectedDate) setSelectedSlot(null)
  }, [selectedDate, setSelectedSlot])

  const createBooking = useCreateBooking()
  const createPaymentSession = useCreatePaymentSession()

  const error = createBooking.error
    ? getBookingErrorMessage(createBooking.error)
    : createPaymentSession.error
      ? getBookingErrorMessage(createPaymentSession.error)
      : null

  const cancelled = searchParams.get('cancelled')
  const alertMessage = error || (cancelled ? 'El pago fue cancelado. Podés intentar de nuevo.' : null)

  const selectedProfessionalData = professionals.find(
    (professional) => professional.professional_id === selectedProfessional?.professional_id
  )
  const professionalName =
    selectedProfessionalData?.profiles?.full_name ||
    selectedProfessionalData?.users?.full_name ||
    ''

  const currency = service?.currency || service?.businesses?.currency || 'ARS'
  const businessName = service?.businesses?.name

  const changeStep = useCallback((nextStep) => {
    setStep(nextStep)
    window.requestAnimationFrame(() => {
      stepHeadingRef.current?.focus({ preventScroll: true })
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
    })
  }, [])

  const handleSelectProfessional = useCallback((professionalId) => {
    setSelectedProfessional({ professional_id: professionalId })
    setSelectedDate(null)
    setSelectedSlot(null)
  }, [setSelectedProfessional, setSelectedDate, setSelectedSlot])

  const handleBookingSubmit = useCallback(async (clientInfo) => {
    if (!selectedSlot || !selectedProfessional) return

    if (createBooking.data?.appointment) {
      setShowAuthModal(true)
      return
    }

    const startDate = new Date(selectedSlot.start)
    const endDate = new Date(selectedSlot.end)

    try {
      await createBooking.mutateAsync({
        serviceId,
        professionalId: selectedProfessional.professional_id,
        date: toDateKey(startDate),
        startTime: startDate.toISOString().split('T')[1].slice(0, 5),
        endTime: endDate.toISOString().split('T')[1].slice(0, 5),
        clientName: clientInfo.name,
        clientEmail: clientInfo.email,
        clientPhone: clientInfo.phone,
      })
      setShowAuthModal(true)
    } catch {
      refetchSlots()
    }
  }, [serviceId, selectedSlot, selectedProfessional, createBooking, refetchSlots])

  const handlePayment = useCallback(async () => {
    const appointment = createBooking.data?.appointment
    if (!appointment) return

    try {
      const { data } = await createPaymentSession.mutateAsync({ appointmentId: appointment.id })
      window.location.href = data.checkoutUrl
    } catch {
      // El error queda expuesto en createPaymentSession.error
    }
  }, [createBooking.data, createPaymentSession])

  const handleAuthContinue = useCallback(() => {
    setShowAuthModal(false)
    handlePayment()
  }, [handlePayment])

  const handleAuthLogin = useCallback(() => {
    setShowAuthModal(false)
    handlePayment()
  }, [handlePayment])

  const canContinue =
    step === 1
      ? Boolean(selectedProfessional)
      : step === 2
        ? Boolean(selectedDate)
        : step === 3
          ? Boolean(selectedSlot)
          : true

  const goNext = () => {
    if (step < 4 && canContinue) changeStep(step + 1)
  }

  if (!hasValidServiceId) {
    return (
      <BookingScreen
        icon={Stethoscope}
        title="Elegí un servicio primero"
        description="Para reservar un turno necesitás seleccionar uno de los servicios disponibles."
      >
        <Link to="/book">
          <Button size="lg" className="w-full rounded-xl sm:w-auto">Ver servicios</Button>
        </Link>
        <Link to="/">
          <Button variant="ghost" size="lg" className="w-full rounded-xl sm:w-auto">Volver al inicio</Button>
        </Link>
      </BookingScreen>
    )
  }

  if (serviceFailed || (service === null && !serviceLoading)) {
    return (
      <BookingScreen
        title="No encontramos este servicio"
        description="Puede que ya no esté disponible. Probá eligiendo otro tratamiento."
      >
        <Link to="/book">
          <Button size="lg" className="w-full rounded-xl sm:w-auto">Ver otros servicios</Button>
        </Link>
      </BookingScreen>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <BookingHeader backTo="/book" backLabel="Cambiar servicio" badge="Reserva segura" />
        <main className="container mx-auto max-w-6xl px-4 py-8 lg:py-10" aria-busy="true" aria-label="Cargando servicio">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl" />
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-80 rounded-3xl" />
            </div>
            <Skeleton className="hidden h-80 rounded-3xl lg:block" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <BookingHeader backTo="/book" backLabel="Cambiar servicio" badge="Reserva segura" />

      <main className="container mx-auto max-w-6xl px-4 py-8 lg:py-10">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{service.name}</h1>
          {service.description && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
              {service.duration_min} min
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs text-muted-foreground">
              <Wallet className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
              {formatCurrency(service.price_cents ?? 0, currency)}
            </span>
            {businessName && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
                {businessName}
              </span>
            )}
          </div>
        </div>

        {alertMessage && (
          <div
            className="mt-6 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{alertMessage}</p>
          </div>
        )}

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
          <div>
            <BookingStepper current={step} />
            <p className="sr-only" aria-live="polite">
              Paso {step} de 4: {STEP_COPY[step].title}
            </p>

            <section className="mt-5 rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Paso {step} de 4
              </p>
              <h2
                ref={stepHeadingRef}
                tabIndex={-1}
                className="mt-2 text-xl font-semibold tracking-tight text-balance focus:outline-none sm:text-2xl"
              >
                {STEP_COPY[step].title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {STEP_COPY[step].description}
              </p>

              <div className="mt-6">
                {step === 1 && (
                  <ProfessionalSelect
                    professionals={professionals}
                    selected={selectedProfessional}
                    onSelect={handleSelectProfessional}
                    loading={professionalsLoading}
                  />
                )}

                {step === 2 && (
                  <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} />
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    {slotsError && (
                      <div
                        className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
                        role="alert"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        <p>No pudimos cargar los horarios disponibles. Probá de nuevo.</p>
                      </div>
                    )}
                    <TimeSlots
                      slots={slots}
                      selectedSlot={selectedSlot}
                      onSelect={setSelectedSlot}
                      loading={slotsLoading}
                    />
                  </div>
                )}

                {step === 4 && (
                  <BookingForm onSubmit={handleBookingSubmit} loading={createBooking.isPending} />
                )}
              </div>

              {step < 4 ? (
                <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl"
                    onClick={() => changeStep(step - 1)}
                    disabled={step === 1}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Atrás
                  </Button>
                  <Button
                    type="button"
                    className="h-11 rounded-xl px-6"
                    onClick={goNext}
                    disabled={!canContinue}
                  >
                    Continuar
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              ) : (
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-xl"
                    onClick={() => changeStep(3)}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Volver a elegir horario
                  </Button>
                </div>
              )}
            </section>

            <BookingSummary
              className="mt-6 lg:hidden"
              service={service}
              professionalName={professionalName}
              date={selectedDate}
              slot={selectedSlot}
              currency={currency}
            />
          </div>

          <aside className="hidden lg:block">
            <div className="lg:sticky lg:top-24">
              <BookingSummary
                service={service}
                professionalName={professionalName}
                date={selectedDate}
                slot={selectedSlot}
                currency={currency}
              />
              <p className="mt-3 px-1 text-[11px] leading-relaxed text-muted-foreground">
                Vas a poder revisar todo antes de pagar. Si el horario se ocupa, te avisamos al instante.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onContinue={handleAuthContinue}
        onLogin={handleAuthLogin}
      />
    </div>
  )
}
