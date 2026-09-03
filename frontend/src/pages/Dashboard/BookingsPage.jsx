import { useState, useCallback } from 'react'
import { useAppointments } from '@/hooks/useAppointments'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { appointmentsApi } from '@/services/api'
import { Calendar, Clock, Mail, Phone, Search, RefreshCw, ChevronDown, ChevronUp, StickyNote, CheckCircle2, CreditCard, XCircle, DollarSign } from 'lucide-react'
import { getStatusBadge, formatCurrency } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

export default function BookingsPage() {
  const { appointments, loading, refetch } = useAppointments()
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const handleRefresh = useCallback(async () => {
    toast({ title: 'Actualizando...', description: 'Cargando reservas' })
    await refetch()
    toast({ title: 'Reservas actualizadas', variant: 'success' })
  }, [refetch])

  const runAction = async (id, update, successMsg) => {
    if (actionLoading) return
    setActionLoading(id)
    try {
      await appointmentsApi.update(id, update)
      toast({ title: successMsg, variant: 'success' })
      await refetch()
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.error || 'No se pudo actualizar la reserva', variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleConfirm = (id) => runAction(id, { status: 'confirmed' }, 'Reserva confirmada')
  const handleMarkPaid = (id) => runAction(id, { status: 'paid' }, 'Reserva marcada como pagada')

  const handleCancel = async (id) => {
    const isPaid = appointments.find(a => a.id === id)?.status === 'paid'
    const msg = isPaid
      ? 'Esta reserva ya fue pagada. ¿Confirmás la cancelación? El reembolso debe gestionarse por separado.'
      : '¿Seguro que querés cancelar esta reserva?'
    if (!window.confirm(msg)) return
    if (actionLoading) return
    setActionLoading(id)
    try {
      await appointmentsApi.cancel(id)
      toast({ title: 'Reserva cancelada', variant: 'success' })
      await refetch()
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.error || 'No se pudo cancelar la reserva', variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  const currency = 'ARS'

  const filtered = appointments.filter(apt => {
    const matchesSearch = apt.client_name?.toLowerCase().includes(filter.toLowerCase()) ||
                         apt.client_email?.toLowerCase().includes(filter.toLowerCase())
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const renderActions = (apt) => {
    const isLoading = actionLoading === apt.id
    if (apt.status === 'cancelled') return null
    return (
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
        {apt.status === 'pending' && (
          <Button variant="outline" size="sm" onClick={() => handleConfirm(apt.id)} disabled={isLoading}>
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Confirmar
          </Button>
        )}
        {apt.status !== 'paid' && (
          <Button variant="outline" size="sm" onClick={() => handleMarkPaid(apt.id)} disabled={isLoading}>
            <CreditCard className="w-4 h-4 mr-1.5" />
            Marcar pagado
          </Button>
        )}
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleCancel(apt.id)} disabled={isLoading}>
          <XCircle className="w-4 h-4 mr-1.5" />
          Cancelar
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Reservas</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

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
          {filtered.map((apt) => {
            const isExpanded = expandedId === apt.id
            return (
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
                      <Badge variant={getStatusBadge(apt.status).variant}>{getStatusBadge(apt.status).label}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : apt.id)}
                      aria-label="Ver detalle"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      <span className="ml-1 hidden sm:inline">Detalle</span>
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4 shrink-0" />
                          <span className="truncate">{apt.client_email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4 shrink-0" />
                          <span>{apt.client_phone}</span>
                        </div>
                        {apt.services?.price_cents ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="w-4 h-4 shrink-0" />
                            <span>{formatCurrency(apt.services.price_cents, currency)}</span>
                          </div>
                        ) : null}
                        {apt.notes && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground sm:col-span-2">
                            <StickyNote className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{apt.notes}</span>
                          </div>
                        )}
                      </div>
                      {renderActions(apt)}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
