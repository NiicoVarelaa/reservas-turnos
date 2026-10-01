import { useState, useCallback, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import Calendar from '@/components/booking/Calendar'
import TimeSlots from '@/components/booking/TimeSlots'
import BookingForm from '@/components/booking/BookingForm'
import ProfessionalSelect from '@/components/booking/ProfessionalSelect'
import AuthModal from '@/components/auth/AuthModal'
import { useBookingStore } from '@/store/bookingStore'
import { useAvailableSlots } from '@/hooks/useAvailableSlots'
import { useProfessionals } from '@/hooks/useProfessionals'
import { useService } from '@/hooks/useServiceMutations'
import { useCreateBooking, useCreatePaymentSession, getBookingErrorMessage } from '@/hooks/useBookingMutations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle, User, Stethoscope } from 'lucide-react'

const toDateKey = (date) => (date ? date.toISOString().split('T')[0] : null)

export default function BookingPage() {
  const { serviceId } = useParams()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(1)
  const [showAuthModal, setShowAuthModal] = useState(false)

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

  const { slots, loading: slotsLoading, refetch: refetchSlots } = useAvailableSlots(
    serviceId,
    toDateKey(selectedDate),
    selectedProfessional?.professional_id
  )

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

  const handleSelectProfessional = useCallback((professionalId) => {
    setSelectedProfessional({ professional_id: professionalId })
    setSelectedDate(null)
    setSelectedSlot(null)
    setStep(2)
  }, [setSelectedProfessional, setSelectedDate, setSelectedSlot])

  const handleBookingSubmit = useCallback(async (clientInfo) => {
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
      // El error ya queda expuesto en createPaymentSession.error
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

  if (!hasValidServiceId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Seleccioná un servicio primero</h1>
          <Link to="/book" className="text-primary hover:underline">Ver servicios disponibles</Link>
        </div>
      </div>
    )
  }

  if (serviceFailed || (service === null && !serviceLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Servicio no encontrado</h1>
          <Link to="/" className="text-primary hover:underline">Volver al inicio</Link>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="p-2 rounded-md hover:bg-accent">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{service.name}</h1>
            <p className="text-sm text-muted-foreground">{service.duration_min} min</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {searchParams.get('cancelled') && (
          <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive" role="alert">
            <p>Pago cancelado. Podés intentar nuevamente.</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive" role="alert">
            <p>{error}</p>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s === 1 ? <Stethoscope className="w-4 h-4" /> : s === 4 ? <User className="w-4 h-4" /> : s}
              </div>
              {s < 4 && <div className={`w-12 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                ¿Con qué profesional querés tu turno?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfessionalSelect
                professionals={professionals}
                selected={selectedProfessional}
                onSelect={handleSelectProfessional}
                loading={professionalsLoading}
              />
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Date */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Seleccioná una fecha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Atrás</Button>
                <Button className="flex-1" onClick={() => setStep(3)} disabled={!selectedDate}>Continuar</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Select Time */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Seleccioná un horario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TimeSlots slots={slots} selectedSlot={selectedSlot} onSelect={setSelectedSlot} loading={slotsLoading} />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Atrás</Button>
                <Button className="flex-1" onClick={() => setStep(4)} disabled={!selectedSlot}>Continuar</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Client Info */}
        {step === 4 && (
          <div className="space-y-4">
            <BookingForm
              onSubmit={handleBookingSubmit}
              loading={createBooking.isPending}
            />
            <Button variant="outline" className="w-full" onClick={() => setStep(3)}>Atrás</Button>
          </div>
        )}

        {/* Auth Modal */}
        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          onContinue={handleAuthContinue}
          onLogin={handleAuthLogin}
        />
      </main>
    </div>
  )
}
