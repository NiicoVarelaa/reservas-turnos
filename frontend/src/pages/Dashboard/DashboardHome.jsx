import { useAppointments } from '@/hooks/useAppointments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-3xl font-bold">{stats.total}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Próximos</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-3xl font-bold">{stats.today}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-3xl font-bold">{stats.pending}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-3xl font-bold">${(revenue / 100).toFixed(2)}</p></CardContent>
          </Card>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Próximas Reservas</h2>
        {appointments.length === 0 ? (
          <p className="text-muted-foreground">No hay reservas próximas.</p>
        ) : (
          <div className="space-y-2">
            {appointments.slice(0, 5).map((apt) => (
              <Card key={apt.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{apt.client_name}</p>
                    <p className="text-sm text-muted-foreground">{apt.services?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{new Date(apt.start_at).toLocaleDateString('es-ES')}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(apt.start_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div className="mt-1">{statusBadge(apt.status)}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
