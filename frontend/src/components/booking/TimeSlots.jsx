import { Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const formatTime = (isoString) =>
  new Date(isoString).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })

function SlotButton({ slot, selected, onSelect }) {
  const isSelected = selected?.start === slot.start
  return (
    <button
      type="button"
      onClick={() => onSelect(slot)}
      aria-pressed={isSelected}
      className={cn(
        'flex h-11 items-center justify-center rounded-xl border text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isSelected
          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
          : 'border-border bg-background text-foreground hover:border-primary/30 hover:bg-secondary'
      )}
    >
      {formatTime(slot.start)}
    </button>
  )
}

export default function TimeSlots({ slots, selectedSlot, onSelect, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-11 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-background text-muted-foreground ring-1 ring-inset ring-border">
          <Clock className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-medium">No hay horarios disponibles para esta fecha.</p>
        <p className="mt-1 text-xs text-muted-foreground">Volvé y seleccioná otro día.</p>
      </div>
    )
  }

  const morning = slots.filter((slot) => new Date(slot.start).getHours() < 12)
  const afternoon = slots.filter((slot) => new Date(slot.start).getHours() >= 12)
  const groups = [
    { label: 'Mañana', items: morning },
    { label: 'Tarde', items: afternoon },
  ].filter((group) => group.items.length > 0)

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.label}>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {group.label}
          </h4>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {group.items.map((slot, index) => (
              <SlotButton
                key={`${group.label}-${slot.start}-${index}`}
                slot={slot}
                selected={selectedSlot}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
