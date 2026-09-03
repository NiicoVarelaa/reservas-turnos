import { useState, useCallback, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { servicesApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, Plus, Pencil, Trash2, Clock, DollarSign, StickyNote, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

const emptyForm = { id: null, name: '', description: '', duration_min: 30, price_cents: 5000 }

export default function ServicesPage() {
  const user = useAuthStore((s) => s.user)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await servicesApi.getAll({ professionalId: user.id })
      setServices((data.services || []).filter(s => s?.id))
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudieron cargar los servicios', variant: 'destructive' })
      setServices([])
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => { fetchServices() }, [fetchServices])

  const handleRefresh = async () => {
    toast({ title: 'Actualizando...' })
    await fetchServices()
    toast({ title: 'Servicios actualizados', variant: 'success' })
  }

  const openCreate = () => {
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (svc) => {
    setForm({
      id: svc.id,
      name: svc.name || '',
      description: svc.description || '',
      duration_min: svc.duration_min,
      price_cents: svc.price_cents
    })
    setShowForm(true)
  }

  const handleField = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === 'name' || name === 'description' ? value : parseInt(value) || 0 }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast({ title: 'El nombre es requerido', variant: 'destructive' })
      return
    }
    if (form.duration_min < 5) {
      toast({ title: 'La duración mínima es 5 minutos', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const payload = { name: form.name, description: form.description, duration_min: form.duration_min, price_cents: form.price_cents }
      if (form.id) {
        await servicesApi.update(form.id, payload)
        toast({ title: 'Servicio actualizado', variant: 'success' })
      } else {
        await servicesApi.create(payload)
        toast({ title: 'Servicio creado', variant: 'success' })
      }
      setShowForm(false)
      setForm(emptyForm)
      await fetchServices()
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.error || 'No se pudo guardar el servicio', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este servicio? Esta acción no se puede deshacer.')) return
    setDeleting(id)
    try {
      await servicesApi.remove(id)
      toast({ title: 'Servicio eliminado', variant: 'success' })
      await fetchServices()
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.error || 'No se pudo eliminar el servicio', variant: 'destructive' })
    } finally {
      setDeleting(null)
    }
  }

  const currency = 'ARS'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Servicios</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo servicio
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">{form.id ? 'Editar servicio' : 'Nuevo servicio'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} aria-label="Cerrar">
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del servicio *</Label>
                <Input id="name" name="name" value={form.name} onChange={handleField} placeholder="Consulta General" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" name="description" value={form.description} onChange={handleField} placeholder="Descripción del servicio (opcional)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration_min">Duración (minutos) *</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Input id="duration_min" name="duration_min" type="number" value={form.duration_min} onChange={handleField} min="5" step="5" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_cents">Precio *</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <Input id="price_cents" name="price_cents" type="number" value={form.price_cents} onChange={handleField} min="0" step="100" required />
                  </div>
                  {form.price_cents > 0 && (
                    <p className="text-xs text-muted-foreground">{formatCurrency(form.price_cents, currency)}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : (form.id ? 'Guardar cambios' : 'Crear servicio')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No tenés servicios cargados.</p>
          <p className="text-sm mt-1">Creá tu primer servicio para poder recibir reservas.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {services.map((svc) => (
            <Card key={svc.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium">{svc.name}</p>
                    {svc.description && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <StickyNote className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{svc.description}</span>
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {svc.duration_min} min · {formatCurrency(svc.price_cents, currency)}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(svc)} aria-label={`Editar ${svc.name}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(svc.id)} disabled={deleting === svc.id} aria-label={`Eliminar ${svc.name}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
