import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import Calendar from '@/components/booking/Calendar'
import TimeSlots from '@/components/booking/TimeSlots'
import BookingForm from '@/components/booking/BookingForm'
import AuthModal from '@/components/auth/AuthModal'
import { useBookingStore } from '@/store/bookingStore'
import { useAuthStore } from '@/store/authStore'
import { useAvailableSlots } from '@/hooks/useAvailableSlots'
import { servicesApi, bookingsApi, paymentsApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle, User } from 'lucide-react'

export default function BookingPage() {
  const { serviceId: paramServiceId } = useParams()
  const [searchParams] = useSearchParams()

  // Persistir serviceId en ref para que no se pierda durante re-renders
  const serviceIdRef = useRef(paramServiceId)
  if (paramServiceId) {
    serviceIdRef.current = paramServiceId
  }
  const serviceId = serviceIdRef.current

  // Cleanup al montar
  useEffect(() => {
    sessionStorage.removeItem('booking-response')
    sessionStorage.removeItem('booking-appointment')
    sessionStorage.removeItem('booking-service')
    sessionStorage.removeItem('booking-logs')
  }, [])

  // Persistent debug log
  useEffect(() => {
    const logs = JSON.parse(sessionStorage.getItem('booking-logs') || '[]')
    logs.push({ time: new Date().toISOString(), event: 'render', serviceId })
    sessionStorage.setItem('booking-logs', JSON.stringify(logs.slice(-20)))
  }, [serviceId])

  const [service, setService] = useState(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const currentAppointmentRef = useRef(null)

  const { selectedDate, selectedSlot, setSelectedDate, setSelectedSlot, setSelectedService, reset } = useBookingStore()
  const { isAuthenticated, isGuest } = useAuthStore()
  const { slots, loading: slotsLoading, refetch: refetchSlots } = useAvailableSlots(
    serviceId,
    selectedDate ? selectedDate.toISOString().split('T')[0] : null
  )

  useEffect(() => {
    if (!serviceId || serviceId === 'undefined') {
      setError('ID de servicio no válido')
      return
    }

    const fetchService = async () => {
      try {
        const { data } = await servicesApi.getById(serviceId)
        if (!data?.service) {
          setError('Servicio no encontrado')
          return
        }
        setService(data.service)
        setSelectedService(data.service)
      } catch (err) {
        console.error('Error fetching service:', err)
        setError('Error al cargar el servicio. Verificá que existan servicios en la base de datos.')
      }
    }
    fetchService()
  }, [serviceId, setSelectedService])

  useEffect(() => {
    if (selectedDate) {
      refetchSlots()
      setSelectedSlot(null)
    }
  }, [selectedDate, refetchSlots, setSelectedSlot])

  const handleBookingSubmit = useCallback(async (clientInfo) => {
    setLoading(true)
    setError(null)

    const startDate = new Date(selectedSlot.start)
    const endDate = new Date(selectedSlot.end)

    try {
      const { data } = await bookingsApi.create({
        serviceId,
        professionalId: service.professional_id,
        date: startDate.toISOString().split('T')[0],
        startTime: startDate.toISOString().split('T')[1].slice(0, 5),
        endTime: endDate.toISOString().split('T')[1].slice(0, 5),
        clientName: clientInfo.name,
        clientEmail: clientInfo.email,
        clientPhone: clientInfo.phone
      })

      if (!data?.appointment) {
        setError('Error: la reserva no se creó correctamente.')
        setLoading(false)
        return
      }

      // Guardar en ref y sessionStorage inmediatamente (síncrono)
      currentAppointmentRef.current = data.appointment
      sessionStorage.setItem('booking-appointment', JSON.stringify(data.appointment))
      sessionStorage.setItem('booking-service', JSON.stringify(service))

      // Abrir modal en el siguiente tick para asegurar que el estado se actualizó
      requestAnimationFrame(() => {
        setShowAuthModal(true)
      })
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.error?.message || err.message || 'Error al crear la reserva'
      let translatedMsg = typeof errorMsg === 'string' ? errorMsg : 'Error al crear la reserva'
      if (translatedMsg === 'This time slot is already booked') {
        translatedMsg = 'Este horario ya fue reservado. Por favor, elegí otro horario.'
      }
      setError(translatedMsg)
      refetchSlots()
    } finally {
      setLoading(false)
    }
  }, [serviceId, service, selectedSlot, refetchSlots])

  const handlePayment = useCallback(async (appointmentId) => {
    // Usar ref y sessionStorage como fuente principal
    const appt = currentAppointmentRef.current || JSON.parse(sessionStorage.getItem('booking-appointment') || 'null')
    const svc = service || JSON.parse(sessionStorage.getItem('booking-service') || 'null')

    if (!svc) {
      setError('Error: servicio no disponible. Volvé a intentar.')
      return
    }

    try {
      const paymentResponse = await paymentsApi.createSession({
        appointmentId: appt?.id || appointmentId,
        amount: svc.price_cents,
        currency: svc.currency?.toLowerCase() || 'usd'
      })
      window.location.href = paymentResponse.checkoutUrl
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.response?.data?.error || err.message || 'Error al procesar el pago'
      setError(typeof errorMsg === 'string' ? errorMsg : 'Error al procesar el pago')
    }
  }, [service])

  const handleAuthContinue = useCallback(() => {
    setShowAuthModal(false)
    const appt = currentAppointmentRef.current
    if (appt?.id) {
      handlePayment(appt.id)
    } else {
      setError('Error: no se encontró la reserva. Volvé a intentar.')
    }
  }, [handlePayment])

  const handleAuthLogin = useCallback(() => {
    setShowAuthModal(false)
    const appt = currentAppointmentRef.current
    if (appt?.id) {
      handlePayment(appt.id)
    } else {
      setError('Error: no se encontró la reserva. Volvé a intentar.')
    }
  }, [handlePayment])

  // Guard: solo mostrar error si no hay serviceId válido Y no hay datos en sessionStorage
  const hasValidServiceId = serviceId && serviceId !== 'undefined'
  const hasSavedData = sessionStorage.getItem('booking-appointment')

  if (!hasValidServiceId && !hasSavedData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Seleccioná un servicio primero</h1>
          <Link to="/book" className="text-primary hover:underline">Ver servicios disponibles</Link>
        </div>
      </div>
    )
  }

  if (error && !service && !hasSavedData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Servicio no encontrado</h1>
          <Link to="/" className="text-primary hover:underline">Volver al inicio</Link>
        </div>
      </div>
    )
  }

  if (!service && !hasSavedData) {
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
            <h1 className="text-xl font-bold">{service?.name || 'Reserva'}</h1>
            {service && <p className="text-sm text-muted-foreground">{service.duration_min} min</p>}
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
                {step > s ? <CheckCircle className="w-4 h-4" /> : s === 4 ? <User className="w-4 h-4" /> : s}
              </div>
              {s < 4 && <div className={`w-12 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Select Date */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Seleccioná una fecha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} />
              <Button className="w-full" onClick={() => setStep(2)} disabled={!selectedDate}>
                Continuar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Time */}
        {step === 2 && (
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
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Atrás</Button>
                <Button className="flex-1" onClick={() => setStep(3)} disabled={!selectedSlot}>Continuar</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Client Info */}
        {step === 3 && (
          <div className="space-y-4">
            <BookingForm onSubmit={handleBookingSubmit} loading={loading} />
            <Button variant="outline" className="w-full" onClick={() => setStep(2)}>Atrás</Button>
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
