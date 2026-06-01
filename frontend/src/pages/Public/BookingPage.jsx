import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import Calendar from '@/components/booking/Calendar'
import TimeSlots from '@/components/booking/TimeSlots'
import BookingForm from '@/components/booking/BookingForm'
import { useBookingStore } from '@/store/bookingStore'
import { useAvailableSlots } from '@/hooks/useAvailableSlots'
import { servicesApi, bookingsApi, paymentsApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react'

export default function BookingPage() {
  const { serviceId } = useParams()
  const [searchParams] = useSearchParams()
  const [service, setService] = useState(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { selectedDate, selectedSlot, setSelectedDate, setSelectedSlot, setSelectedService, reset } = useBookingStore()
  const { slots, loading: slotsLoading, refetch: refetchSlots } = useAvailableSlots(
    serviceId,
    selectedDate ? selectedDate.toISOString().split('T')[0] : null
  )

  useEffect(() => {
    const fetchService = async () => {
      try {
        const { data } = await servicesApi.getById(serviceId)
        setService(data.service)
        setSelectedService(data.service)
      } catch (err) {
        setError('Service not found')
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

  const handleBookingSubmit = async (clientInfo) => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await bookingsApi.create({
        serviceId,
        professionalId: service.professional_id,
        date: selectedDate.toISOString().split('T')[0],
        startTime: new Date(selectedSlot.start).toTimeString().slice(0, 5),
        endTime: new Date(selectedSlot.end).toTimeString().slice(0, 5),
        clientName: clientInfo.name,
        clientEmail: clientInfo.email,
        clientPhone: clientInfo.phone
      })

      const paymentResponse = await paymentsApi.createSession({
        appointmentId: data.appointment.id,
        amount: service.price_cents,
        currency: service.currency?.toLowerCase() || 'usd'
      })

      window.location.href = paymentResponse.checkoutUrl
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking')
      setLoading(false)
    }
  }

  if (error && !service) {
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
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
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
      </main>
    </div>
  )
}
