import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text)

export default function Calendar({ selectedDate, onSelect, minDate }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    return selectedDate ? new Date(selectedDate) : new Date()
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const minimumDate = minDate ? new Date(minDate) : today

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))

  const isDateDisabled = (date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d < minimumDate
  }

  const isSelected = (date) => {
    if (!selectedDate) return false
    const d = new Date(date)
    const s = new Date(selectedDate)
    return d.getFullYear() === s.getFullYear() && d.getMonth() === s.getMonth() && d.getDate() === s.getDate()
  }

  const isToday = (date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime()
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)
  const monthName = capitalize(currentMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }))
  const isCurrentMonth =
    currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth()

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={prevMonth}
          aria-label="Mes anterior"
          className="h-10 w-10 rounded-xl"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>

        <div className="text-center">
          <h3 className="text-base font-semibold" aria-live="polite">{monthName}</h3>
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={() => {
                setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
                if (!isDateDisabled(today)) onSelect(today)
              }}
              className="mt-0.5 text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Volver a hoy
            </button>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={nextMonth}
          aria-label="Mes siguiente"
          className="h-10 w-10 rounded-xl"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1" aria-hidden="true">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {blanks.map((i) => <div key={`blank-${i}`} className="aspect-square" aria-hidden="true" />)}

        {days.map((day) => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
          const disabled = isDateDisabled(date)
          const selected = isSelected(date)
          const isTodayDate = isToday(date)

          return (
            <button
              key={day}
              type="button"
              onClick={() => !disabled && onSelect(date)}
              disabled={disabled}
              aria-label={date.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              aria-pressed={selected}
              aria-current={isTodayDate ? 'date' : undefined}
              className={cn(
                'aspect-square rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                selected && 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
                !selected && !disabled && 'text-foreground hover:bg-secondary',
                isTodayDate && !selected && 'ring-1 ring-inset ring-teal/50 text-teal',
                disabled && 'cursor-not-allowed text-muted-foreground/40'
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
