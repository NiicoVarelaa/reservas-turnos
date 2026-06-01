import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function Calendar({ selectedDate, onSelect, minDate }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    return selectedDate ? new Date(selectedDate) : new Date()
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const minimumDate = minDate ? new Date(minDate) : today

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const isDateDisabled = (date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d < minimumDate
  }

  const isSelected = (date) => {
    if (!selectedDate) return false
    const d = new Date(date)
    const s = new Date(selectedDate)
    return (
      d.getFullYear() === s.getFullYear() &&
      d.getMonth() === s.getMonth() &&
      d.getDate() === s.getDate()
    )
  }

  const isToday = (date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime()
  }

  const handleSelect = (date) => {
    if (isDateDisabled(date)) return
    onSelect(date)
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)

  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold capitalize">{monthName}</h3>
        <button
          onClick={nextMonth}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {blanks.map((i) => (
          <div key={`blank-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
          const disabled = isDateDisabled(date)
          const selected = isSelected(date)
          const today = isToday(date)

          return (
            <button
              key={day}
              onClick={() => handleSelect(date)}
              disabled={disabled}
              className={cn(
                'aspect-square rounded-md text-sm font-medium transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                selected && 'bg-primary text-primary-foreground hover:bg-primary/90',
                !selected && !disabled && 'hover:bg-accent',
                today && !selected && 'border border-primary',
                disabled && 'text-muted-foreground/50 cursor-not-allowed'
              )}
              aria-label={date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              aria-selected={selected}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
