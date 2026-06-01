import { useState } from 'react'
import { useAppointments } from '@/hooks/useAppointments'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
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

  const statusBadge = (status) => {
    const variants = {
      paid: 'success',
      pending: 'warning',
      confirmed: 'default',
      cancelled: 'destructive',
    }
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reservas</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No se encontraron reservas.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((apt) => (
            <Card key={apt.id}>
              <CardContent className="p-4">
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
                      <span>{new Date(apt.start_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
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
                  {statusBadge(apt.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
