import { useState } from 'react'
import { useAppointments } from '../../hooks/useAppointments'
import { Calendar, Clock, Mail, Phone, Search } from 'lucide-react'

export default function BookingsPage() {
  const { appointments, loading, refetch } = useAppointments()
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = appointments.filter(apt => {
    const matchesSearch = apt.client_name?.toLowerCase().includes(filter.toLowerCase()) ||
                         apt.client_email?.toLowerCase().includes(filter.toLowerCase())
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reservas</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Todos</option>
          <option value="pending">Pendiente</option>
          <option value="confirmed">Confirmado</option>
          <option value="paid">Pagado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No se encontraron reservas.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((apt) => (
            <div key={apt.id} className="p-4 border rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{apt.client_name}</p>
                  <p className="text-sm text-muted-foreground">{apt.services?.name}</p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(apt.start_at).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(apt.start_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{apt.client_email}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{apt.client_phone}</span>
                  </div>
                </div>

                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  apt.status === 'paid' ? 'bg-green-100 text-green-800' :
                  apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  apt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                  apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
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
  )
}
