import { useCallback } from 'react'
import { useAppointments } from '@/hooks/useAppointments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, DollarSign, TrendingUp, RefreshCw } from 'lucide-react'
import { getStatusBadge } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

export default function DashboardHome() {
  const { appointments, loading, refetch } = useAppointments()

  const handleRefresh = useCallback(async () => {
    toast({ title: 'Actualizando...', description: 'Cargando datos del panel' })
    await refetch()
    toast({ title: 'Datos actualizados', variant: 'success' })
  }, [refetch])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const stats = {
    total: appointments.length,
    today: appointments.filter(a => {
      const start = new Date(a.start_at)
      return start >= today && start < tomorrow
    }).length,
    pending: appointments.filter(a => a.status === 'pending').length,
    paid: appointments.filter(a => a.status === 'paid').length,
  }

  const revenue = appointments
    .filter(a => a.status === 'paid')
    .reduce((sum, a) => sum + (a.services?.price_cents || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

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
              <CardTitle className="text-sm font-medium text-muted-foreground">Hoy</CardTitle>
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
            <CardContent><p className="text-3xl font-bold">{formatCurrency(revenue, 'ARS')}</p></CardContent>
          </Card>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Próximas Reservas</h2>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : appointments.length === 0 ? (
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
                    <div className="mt-1">
                      <Badge variant={getStatusBadge(apt.status).variant}>{getStatusBadge(apt.status).label}</Badge>
                    </div>
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
