import { useAppointments } from '../../hooks/useAppointments'
import { Calendar, Clock, DollarSign, TrendingUp } from 'lucide-react'

export default function DashboardHome() {
  const { appointments, loading } = useAppointments()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const stats = {
    total: appointments.length,
    today: appointments.filter(a => new Date(a.start_at) >= today).length,
    pending: appointments.filter(a => a.status === 'pending').length,
    paid: appointments.filter(a => a.status === 'paid').length,
  }

  const revenue = appointments
    .filter(a => a.status === 'paid')
    .reduce((sum, a) => sum + (a.services?.price_cents || 0), 0)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-6 border rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Total</span>
            </div>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>

          <div className="p-6 border rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Próximos</span>
            </div>
            <p className="text-3xl font-bold">{stats.today}</p>
          </div>

          <div className="p-6 border rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Pendientes</span>
            </div>
            <p className="text-3xl font-bold">{stats.pending}</p>
          </div>

          <div className="p-6 border rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Ingresos</span>
            </div>
            <p className="text-3xl font-bold">
              ${(revenue / 100).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Próximas Reservas</h2>
        {appointments.length === 0 ? (
          <p className="text-muted-foreground">No hay reservas próximas.</p>
        ) : (
          <div className="space-y-2">
            {appointments.slice(0, 5).map((apt) => (
              <div key={apt.id} className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium">{apt.client_name}</p>
                  <p className="text-sm text-muted-foreground">{apt.services?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    {new Date(apt.start_at).toLocaleDateString('es-ES')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(apt.start_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                    apt.status === 'paid' ? 'bg-green-100 text-green-800' :
                    apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    apt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
