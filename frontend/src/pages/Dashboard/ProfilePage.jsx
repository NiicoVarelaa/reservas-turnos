import { useEffect, useState } from 'react'
import {
  AlertCircle,
  BadgeCheck,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Save,
  User,
  UserCircle,
} from 'lucide-react'
import { useProfile, useUpdateProfile, useAuthUser } from '@/hooks/useAuth'
import PageHeader from '@/components/dashboard/PageHeader'
import DashboardPanel from '@/components/dashboard/DashboardPanel'
import EmptyState from '@/components/dashboard/EmptyState'
import InitialsAvatar from '@/components/ui/InitialsAvatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

const PHONE_PATTERN = /^\+?[1-9]\d{6,14}$/
const AVATAR_PATTERN = /^(https?:\/\/|\/)/

const EMPTY_FORM = { full_name: '', phone: '', bio: '', avatar_url: '' }

export default function ProfilePage() {
  const sessionUser = useAuthUser()
  const { data: profileUser, isLoading: loading, refetch, isError, error } = useProfile()
  const updateProfile = useUpdateProfile()

  const [form, setForm] = useState(EMPTY_FORM)
  const [avatarError, setAvatarError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const user = profileUser || sessionUser
  const profile = user?.profile || {}

  useEffect(() => {
    if (isError) {
      toast({
        title: 'No pudimos cargar tu perfil',
        description: error?.response?.data?.error || 'Probá de nuevo en unos segundos.',
        variant: 'destructive',
      })
    }
  }, [isError, error])

  useEffect(() => {
    setForm({
      full_name: profile.full_name || user?.full_name || '',
      phone: profile.phone || '',
      bio: profile.bio || '',
      avatar_url: profile.avatar_url || user?.avatar_url || '',
    })
  }, [profile.full_name, profile.phone, profile.bio, profile.avatar_url, user?.full_name, user?.avatar_url])

  useEffect(() => {
    setAvatarError(false)
  }, [form.avatar_url])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
      toast({ title: 'Perfil actualizado', variant: 'success' })
    } catch {
      toast({
        title: 'No pudimos actualizar tu perfil',
        description: 'Revisá tu conexión e intentá de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setRefreshing(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const updates = {}
    const fullName = form.full_name.trim()
    const phone = form.phone.trim()
    const bio = form.bio.trim()
    const avatarUrl = form.avatar_url.trim()

    if (fullName !== (profile.full_name || user?.full_name || '')) {
      if (fullName.length < 2) {
        toast({
          title: 'El nombre completo debe tener al menos 2 caracteres',
          variant: 'destructive',
        })
        return
      }
      updates.full_name = fullName
    }

    if (phone && phone !== (profile.phone || '')) {
      if (!PHONE_PATTERN.test(phone)) {
        toast({
          title: 'El teléfono no es válido',
          description: 'Usá el formato internacional, por ejemplo +5491112345678.',
          variant: 'destructive',
        })
        return
      }
      updates.phone = phone
    }

    if (bio !== (profile.bio || '')) {
      updates.bio = bio
    }

    if (avatarUrl && avatarUrl !== (profile.avatar_url || '')) {
      if (!AVATAR_PATTERN.test(avatarUrl)) {
        toast({
          title: 'La URL de la foto no es válida',
          description: 'Usá una URL que empiece con https:// o una ruta interna como /images/...',
          variant: 'destructive',
        })
        return
      }
      updates.avatar_url = avatarUrl
    }

    if (Object.keys(updates).length === 0) {
      toast({ title: 'No hay cambios para guardar' })
      return
    }

    try {
      await updateProfile.mutateAsync(updates)
      toast({ title: 'Perfil actualizado', variant: 'success' })
    } catch (err) {
      toast({
        title: 'No pudimos actualizar el perfil',
        description: err.response?.data?.error || 'Revisá los datos e intentá de nuevo.',
        variant: 'destructive',
      })
    }
  }

  const avatarSrc = form.avatar_url.trim()
  const showAvatarImage = Boolean(avatarSrc) && !avatarError
  const displayName = form.full_name.trim() || user?.email || 'Tu perfil'
  const roleLabel = user?.role === 'professional' ? 'Profesional' : user?.role || 'Usuario'

  return (
    <div>
      <PageHeader
        eyebrow="Cuenta"
        title="Mi perfil"
        description="Actualizá tus datos personales y profesionales. Tu nombre y tu foto se muestran a tus clientes."
        icon={UserCircle}
        actions={
          <Button
            variant="outline"
            className="h-10 rounded-xl"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={cn('h-4 w-4', refreshing && 'animate-spin')}
              aria-hidden="true"
            />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
        }
      />

      {loading ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <Skeleton className="h-80 rounded-3xl" />
            <Skeleton className="h-56 rounded-3xl" />
          </div>
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      ) : isError && !user?.email ? (
        <EmptyState
          className="mt-6"
          tone="destructive"
          icon={AlertCircle}
          title="No pudimos cargar tu perfil"
          description={error?.response?.data?.error || 'Probá de nuevo en unos segundos.'}
          action={<Button onClick={() => refetch()}>Reintentar</Button>}
        />
      ) : (
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
              <DashboardPanel
                title="Datos personales"
                description="Tu información básica de contacto"
                icon={User}
              >
                <div className="space-y-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="shrink-0">
                      {showAvatarImage ? (
                        <img
                          src={avatarSrc}
                          alt=""
                          onError={() => setAvatarError(true)}
                          className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
                        />
                      ) : (
                        <InitialsAvatar
                          name={form.full_name || user?.email}
                          className="h-16 w-16 text-lg"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <Label htmlFor="profile-avatar">Foto de perfil (URL)</Label>
                      <Input
                        id="profile-avatar"
                        name="avatar_url"
                        value={form.avatar_url}
                        onChange={handleChange}
                        placeholder="https://... o /images/doctors/maria-garcia.jpg"
                        className="h-11 rounded-xl"
                      />
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Podés usar una URL pública o una ruta interna. Si la imagen no carga, se
                        muestran tus iniciales.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="profile-name">Nombre completo</Label>
                      <Input
                        id="profile-name"
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        placeholder="Tu nombre y apellido"
                        className="h-11 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile-phone">Teléfono</Label>
                      <Input
                        id="profile-phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+5491112345678"
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-email">Email</Label>
                    <Input
                      id="profile-email"
                      value={user?.email || ''}
                      disabled
                      className="h-11 rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      El email de la cuenta no se puede cambiar desde acá.
                    </p>
                  </div>
                </div>
              </DashboardPanel>

              <DashboardPanel
                title="Sobre vos"
                description="Una breve presentación para tus clientes"
                icon={BadgeCheck}
              >
                <div className="space-y-2">
                  <Label htmlFor="profile-bio">Bio profesional</Label>
                  <Textarea
                    id="profile-bio"
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Contá tu especialidad, años de experiencia o cómo trabajás."
                    maxLength={500}
                    className="min-h-[130px]"
                  />
                  <p className="text-right text-[11px] text-muted-foreground">
                    {form.bio.length}/500
                  </p>
                </div>
              </DashboardPanel>

              <div className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Los cambios se guardan en tu cuenta y se muestran en tu perfil público.
                </p>
                <Button
                  type="submit"
                  className="h-11 rounded-xl"
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Save className="h-4 w-4" aria-hidden="true" />
                  )}
                  {updateProfile.isPending ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </div>

            <aside className="space-y-6">
              <DashboardPanel title="Vista previa" description="Así te ven tus clientes" icon={User}>
                <div className="flex flex-col items-center text-center">
                  {showAvatarImage ? (
                    <img
                      src={avatarSrc}
                      alt=""
                      onError={() => setAvatarError(true)}
                      className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
                    />
                  ) : (
                    <InitialsAvatar
                      name={form.full_name || user?.email}
                      className="h-20 w-20 text-xl"
                    />
                  )}

                  <p className="mt-3 text-base font-semibold">{displayName}</p>
                  <Badge variant="secondary" className="mt-1.5">
                    {roleLabel}
                  </Badge>
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {form.bio || 'Agregá una bio para presentarte ante tus clientes.'}
                  </p>
                </div>

                <dl className="mt-4 space-y-2.5 border-t border-border/70 pt-4 text-xs">
                  <div className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
                    <div className="min-w-0">
                      <dt className="text-muted-foreground">Email</dt>
                      <dd className="truncate font-medium">{user?.email || '—'}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
                    <div className="min-w-0">
                      <dt className="text-muted-foreground">Teléfono</dt>
                      <dd className="truncate font-medium">{form.phone || '—'}</dd>
                    </div>
                  </div>
                </dl>
              </DashboardPanel>

              <DashboardPanel title="Checklist" icon={BadgeCheck}>
                <ul className="space-y-2.5 text-xs leading-relaxed text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
                    Usá tu nombre completo para generar confianza.
                  </li>
                  <li className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
                    Sumá una foto clara y profesional.
                  </li>
                  <li className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
                    Contá en tu bio qué te diferencia.
                  </li>
                </ul>
              </DashboardPanel>
            </aside>
          </div>
        </form>
      )}
    </div>
  )
}
