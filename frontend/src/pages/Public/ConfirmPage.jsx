import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Calendar, Clock, Mail, Phone, ArrowLeft } from 'lucide-react'
import { bookingsApi } from '../../services/api'

export default function ConfirmPage() {
  const { sessionId } = useParams()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        // In a real app, you'd fetch by sessionId or use a dedicated endpoint
        // For now, we'll show a success message
        setLoading(false)
      } catch (err) {
        setError('No se pudo verificar la reserva')
        setLoading(false)
      }
    }

    fetchAppointment()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Verificando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link to="/" className="text-primary hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">¡Reserva Confirmada!</h1>
          <p className="text-muted-foreground">
            Tu turno ha sido reservado exitosamente.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Detalles de la Reserva</h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Fecha: {appointment?.start_at ? new Date(appointment.start_at).toLocaleDateString('es-ES') : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Hora: {appointment?.start_at ? new Date(appointment.start_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>Email: {appointment?.client_email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>Teléfono: {appointment?.client_phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Recibirás un mensaje de WhatsApp con la confirmación.</p>
        </div>

        <div className="mt-6">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
