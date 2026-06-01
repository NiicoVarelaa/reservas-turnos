import { useState } from 'react'
import { Clock, Plus, Trash2 } from 'lucide-react'

const DAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' }
]

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([
    { day_of_week: 1, start_time: '09:00', end_time: '18:00', is_active: true },
    { day_of_week: 2, start_time: '09:00', end_time: '18:00', is_active: true },
    { day_of_week: 3, start_time: '09:00', end_time: '18:00', is_active: true },
    { day_of_week: 4, start_time: '09:00', end_time: '18:00', is_active: true },
    { day_of_week: 5, start_time: '09:00', end_time: '14:00', is_active: true },
  ])

  const toggleDay = (day) => {
    setSchedules(prev =>
      prev.map(s =>
        s.day_of_week === day
          ? { ...s, is_active: !s.is_active }
          : s
      )
    )
  }

  const updateTime = (day, field, value) => {
    setSchedules(prev =>
      prev.map(s =>
        s.day_of_week === day
          ? { ...s, [field]: value }
          : s
      )
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Horarios</h1>
      <p className="text-muted-foreground mb-8">Configurá tu disponibilidad semanal.</p>

      <div className="space-y-4">
        {DAYS.map((day) => {
          const schedule = schedules.find(s => s.day_of_week === day.value)
          const isActive = schedule?.is_active || false

          return (
            <div
              key={day.value}
              className={`p-4 rounded-lg border transition-colors ${
                isActive ? 'bg-card' : 'bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleDay(day.value)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      isActive ? 'bg-primary' : 'bg-muted'
                    }`}
                    aria-label={`Toggle ${day.label}`}
                    aria-pressed={isActive}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        isActive ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="font-medium">{day.label}</span>
                </div>
                {isActive && (
                  <button className="p-2 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isActive && (
                <div className="flex items-center gap-4 ml-15">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="time"
                      value={schedule?.start_time || '09:00'}
                      onChange={(e) => updateTime(day.value, 'start_time', e.target.value)}
                      className="px-3 py-1 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-muted-foreground">a</span>
                    <input
                      type="time"
                      value={schedule?.end_time || '18:00'}
                      onChange={(e) => updateTime(day.value, 'end_time', e.target.value)}
                      className="px-3 py-1 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
          Guardar Cambios
        </button>
      </div>
    </div>
  )
}
