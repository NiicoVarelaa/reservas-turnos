import { cn } from '../../lib/utils'

export default function TimeSlots({ slots, selectedSlot, onSelect, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-10 rounded-md bg-muted animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay horarios disponibles para esta fecha.</p>
        <p className="text-sm mt-2">Selecciona otra fecha.</p>
      </div>
    )
  }

  const formatTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {slots.map((slot, index) => (
        <button
          key={index}
          onClick={() => onSelect(slot)}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            selectedSlot?.start === slot.start
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border border-border hover:bg-accent hover:border-primary/50'
          )}
          aria-label={`Select ${formatTime(slot.start)}`}
          aria-pressed={selectedSlot?.start === slot.start}
        >
          {formatTime(slot.start)}
        </button>
      ))}
    </div>
  )
}
