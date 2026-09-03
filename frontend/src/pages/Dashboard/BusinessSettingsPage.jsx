import { useState, useEffect, useCallback } from 'react'
import { businessApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2, Save, RefreshCw, Link } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const CATEGORIES = [
  { value: 'odontologia', label: 'Odontología', icon: '🦷' },
  { value: 'medicina', label: 'Medicina', icon: '🏥' },
  { value: 'belleza', label: 'Belleza y Estética', icon: '💅' },
  { value: 'peluqueria', label: 'Peluquería', icon: '💇' },
  { value: 'psicologia', label: 'Psicología', icon: '🧠' },
  { value: 'veterinaria', label: 'Veterinaria', icon: '🐾' },
  { value: 'fitness', label: 'Fitness y Deporte', icon: '💪' },
  { value: 'educacion', label: 'Educación', icon: '📚' },
  { value: 'legal', label: 'Legal', icon: '⚖️' },
  { value: 'consultoria', label: 'Consultoría', icon: '💼' },
  { value: 'general', label: 'Otro', icon: '📋' },
]

const emptyForm = {
  name: '',
  tagline: '',
  category: 'general',
  whatsapp_number: '',
  address: '',
  city: '',
  primary_color: '#0f172a',
  secondary_color: '#3b82f6',
  slug: '',
}

export default function BusinessSettingsPage() {
  const [form, setForm] = useState(emptyForm)
  const [businessId, setBusinessId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchBusiness = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await businessApi.getMyBusiness()
      const b = data.business
      setBusinessId(b.id)
      setForm({
        name: b.name || '',
        tagline: b.tagline || '',
        category: b.category || 'general',
        whatsapp_number: b.whatsapp_number || '',
        address: b.address || '',
        city: b.city || '',
        primary_color: b.primary_color || '#0f172a',
        secondary_color: b.secondary_color || '#3b82f6',
        slug: b.slug || '',
      })
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudo cargar tu negocio. Completá el onboarding primero.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBusiness() }, [fetchBusiness])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast({ title: 'El nombre del negocio es requerido', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const { category, slug, ...updates } = form
      updates.category = category
      await businessApi.update(businessId, updates)
      toast({ title: 'Negocio actualizado', variant: 'success' })
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.error || 'No se pudo actualizar el negocio', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const publicLink = form.slug ? `${window.location.origin}/business/${form.slug}` : null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Mi Negocio</h1>
        <Button variant="outline" size="sm" onClick={fetchBusiness}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-40" />
        </div>
      ) : (
        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{form.name || 'Tu negocio'}</CardTitle>
                <CardDescription>Editá la información pública de tu negocio</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {publicLink && (
              <div className="mb-4 p-3 rounded-md bg-muted/50 text-sm flex flex-wrap items-center gap-2">
                <Link className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Tu página pública:</span>
                <a href={publicLink} target="_blank" rel="noreferrer" className="text-primary font-medium underline truncate">{publicLink}</a>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del negocio *</Label>
                <Input id="name" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Descripción corta</Label>
                <Input id="tagline" name="tagline" value={form.tagline} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Rubro</Label>
                <Select value={form.category} onValueChange={(v) => setForm(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Seleccioná un rubro" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.icon} {cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp_number">WhatsApp del negocio</Label>
                <Input id="whatsapp_number" name="whatsapp_number" type="tel" value={form.whatsapp_number} onChange={handleChange} placeholder="+5491112345678" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" name="address" value={form.address} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input id="city" name="city" value={form.city} onChange={handleChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Color principal</Label>
                  <div className="flex items-center gap-2">
                    <Input id="primary_color" name="primary_color" type="color" value={form.primary_color} onChange={handleChange} className="w-12 h-10 p-1" />
                    <span className="text-sm text-muted-foreground">{form.primary_color}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Color secundario</Label>
                  <div className="flex items-center gap-2">
                    <Input id="secondary_color" name="secondary_color" type="color" value={form.secondary_color} onChange={handleChange} className="w-12 h-10 p-1" />
                    <span className="text-sm text-muted-foreground">{form.secondary_color}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
