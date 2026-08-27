import { UserRound } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn, getInitials, getAvatarColor } from '@/lib/utils'

function Avatar({ professional, className }) {
  const src = professional?.profiles?.avatar_url || professional?.users?.avatar_url
  const name = professional?.profiles?.full_name || professional?.users?.full_name || ''
  const initials = name ? getInitials(name) : ''
  const { bg, text } = getAvatarColor(name)

  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover', className)} />
  }

  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold', bg, text, className)}>
      {initials ? (
        <span className="text-lg">{initials}</span>
      ) : (
        <UserRound className="w-6 h-6" />
      )}
    </div>
  )
}

export default function ProfessionalSelect({ professionals, selected, onSelect, loading }) {
  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Cargando especialistas...</div>
  }

  if (!professionals.length) {
    return <p className="text-muted-foreground">No hay especialistas disponibles para este servicio.</p>
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {professionals.map(p => {
        const profile = p.profiles || {}
        const user = p.users || {}
        const fullName = profile.full_name || user.full_name || 'Odontólogo/a'
        const title = profile.title || 'Odontólogo/a'
        const specialty = profile.specialty
        const bio = profile.bio
        const isSelected = selected?.professional_id === p.professional_id

        return (
          <Card
            key={p.professional_id}
            onClick={() => onSelect(p.professional_id)}
            className={cn(
              'cursor-pointer transition-all hover:border-primary/50 hover:shadow-md',
              isSelected && 'border-primary bg-primary/5 ring-1 ring-primary'
            )}
          >
            <CardContent className="p-4 flex items-start gap-3">
              <Avatar professional={p} className="w-14 h-14 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium leading-tight">{fullName}</p>
                <p className="text-sm text-primary">{specialty ? `${title} · ${specialty}` : title}</p>
                {bio && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{bio}</p>}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}