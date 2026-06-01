import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { schedulesApi } from '../../services/api'
import { Clock, CheckCircle } from 'lucide-react'

const DAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
]

const DEFAULT_SCHEDULE = [
  { day_of_week: 1, start_time: '09:00', end_time: '18:00', is_active: true },
  { day_of_week: 2, start_time: '09:00', end_time: '18:00', is_active: true },
  { day_of_week: 3, start_time: '09:00', end_time: '18:00', is_active: true },
  { day_of_week: 4, start_time: '09:00', end_time: '18:00', is_active: true },
  { day_of_week: 5, start_time: '09:00', end_time: '14:00', is_active: true },
]

export default function SetupSchedule() {
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState(DEFAULT_SCHEDULE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleDay = (day) => {
    setSchedules(prev =>
      prev.map(s =>
        s.day_of_week === day ? { ...s, is_active: !s.is_active } : s
      )
    )
  }

  const updateTime = (day, field, value) => {
    setSchedules(prev =>
      prev.map(s =>
        s.day_of_week === day ? { ...s, [field]: value } : s
      )
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const activeSchedules = schedules.filter(s => s.is_active)

      await Promise.all(
        activeSchedules.map(schedule => schedulesApi.create(schedule))
      )

      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Configurá tu Horario</h1>
          <p className="text-muted-foreground mt-2">
            Paso 3 de 3: ¿Cuándo atendés?
          </p>
        </div>

        <div className="w-full bg-muted rounded-full h-2 mb-8">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: '100%' }} />
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive text-sm" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
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
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className="flex items-center gap-3"
                    aria-pressed={isActive}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isActive ? 'bg-primary border-primary' : 'border-muted-foreground'
                    }`}>
                      {isActive && <CheckCircle className="w-4 h-4 text-primary-foreground" />}
                    </div>
                    <span className="font-medium">{day.label}</span>
                  </button>

                  {isActive && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={schedule?.start_time || '09:00'}
                        onChange={(e) => updateTime(day.value, 'start_time', e.target.value)}
                        className="px-2 py-1 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-muted-foreground">a</span>
                      <input
                        type="time"
                        value={schedule?.end_time || '18:00'}
                        onChange={(e) => updateTime(day.value, 'end_time', e.target.value)}
                        className="px-2 py-1 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Guardando...' : '¡Listo! Empezar a Usar'}
          </button>
        </form>
      </div>
    </div>
  )
}
