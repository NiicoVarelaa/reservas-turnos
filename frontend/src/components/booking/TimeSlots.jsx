import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export default function TimeSlots({ slots, selectedSlot, onSelect, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    )
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay horarios disponibles para esta fecha.</p>
        <p className="text-sm mt-2">Seleccioná otra fecha.</p>
      </div>
    )
  }

  const formatTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {slots.map((slot, index) => (
        <Button
          key={index}
          variant={selectedSlot?.start === slot.start ? 'default' : 'outline'}
          onClick={() => onSelect(slot)}
          className={cn(
            'transition-all',
            selectedSlot?.start === slot.start && 'shadow-md'
          )}
          aria-label={`Seleccionar ${formatTime(slot.start)}`}
          aria-pressed={selectedSlot?.start === slot.start}
        >
          {formatTime(slot.start)}
        </Button>
      ))}
    </div>
  )
}
