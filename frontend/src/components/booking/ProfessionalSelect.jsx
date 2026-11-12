import { CheckCircle2, UserRound } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
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
    <div className={cn('flex items-center justify-center rounded-full font-semibold', bg, text, className)}>
      {initials ? (
        <span className="text-base">{initials}</span>
      ) : (
        <UserRound className="h-5 w-5" aria-hidden="true" />
      )}
    </div>
  )
}

export default function ProfessionalSelect({ professionals = [], selected, onSelect, loading }) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (!professionals.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-background text-muted-foreground ring-1 ring-inset ring-border">
          <UserRound className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-medium">No hay profesionales disponibles para este servicio.</p>
        <p className="mt-1 text-xs text-muted-foreground">Probá con otro servicio o volvé más tarde.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Seleccioná un profesional">
      {professionals.map((professional) => {
        const profile = professional.profiles || {}
        const user = professional.users || {}
        const fullName = profile.full_name || user.full_name || 'Profesional'
        const title = profile.title || 'Profesional'
        const specialty = profile.specialty
        const bio = profile.bio
        const isSelected = selected?.professional_id === professional.professional_id

        return (
          <button
            key={professional.professional_id}
            type="button"
            onClick={() => onSelect(professional.professional_id)}
            aria-pressed={isSelected}
            className={cn(
              'relative flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isSelected
                ? 'border-primary/40 bg-primary/5 ring-1 ring-inset ring-primary/20'
                : 'border-border bg-background hover:border-primary/25 hover:bg-muted/40'
            )}
          >
            <div className="flex w-full items-start gap-3">
              <Avatar professional={professional} className="h-12 w-12 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold leading-tight">{fullName}</p>
                <p className="mt-0.5 text-xs text-primary">
                  {specialty ? `${title} · ${specialty}` : title}
                </p>
              </div>
              {isSelected && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              )}
            </div>
            {bio && (
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{bio}</p>
            )}
          </button>
        )
      })}
    </div>
  )
}
