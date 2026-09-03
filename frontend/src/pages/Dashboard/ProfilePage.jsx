import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import InitialsAvatar from '@/components/ui/InitialsAvatar'
import { Save, RefreshCw, User } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const refreshProfile = useAuthStore((s) => s.refreshProfile)
  const [form, setForm] = useState({ full_name: '', phone: '', bio: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const data = await authService.getProfile()
      const profile = data.user?.profile || {}
      setForm({
        full_name: profile.full_name || user?.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
      })
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudo cargar tu perfil', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [user?.full_name])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updates = {}
      if (form.full_name !== (user?.full_name || '')) updates.full_name = form.full_name
      if (form.phone) updates.phone = form.phone
      if (form.bio) updates.bio = form.bio
      await authService.updateProfile(updates)
      await refreshProfile()
      toast({ title: 'Perfil actualizado', variant: 'success' })
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.error || 'No se pudo actualizar el perfil', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <Button variant="outline" size="sm" onClick={fetchProfile}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <InitialsAvatar name={form.full_name || user?.email} className="w-14 h-14 text-lg" />
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {form.full_name || 'Mi perfil'}
              </CardTitle>
              <CardDescription>Actualizá tus datos personales y profesionales</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40" />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ''} disabled />
                <p className="text-xs text-muted-foreground">El email no se puede cambiar.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre completo</Label>
                <Input id="full_name" name="full_name" value={form.full_name} onChange={handleChange} placeholder="Tu nombre" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+5491112345678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" name="bio" value={form.bio} onChange={handleChange} placeholder="Tu especialidad o descripción profesional" />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
