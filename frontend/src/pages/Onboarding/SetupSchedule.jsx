import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { schedulesApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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

  const toggleDay = (day) => setSchedules(prev => prev.map(s => s.day_of_week === day ? { ...s, is_active: !s.is_active } : s))
  const updateTime = (day, field, value) => setSchedules(prev => prev.map(s => s.day_of_week === day ? { ...s, [field]: value } : s))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const activeSchedules = schedules.filter(s => s.is_active)
      await Promise.all(activeSchedules.map(schedule => schedulesApi.create(schedule)))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Configurá tu Horario</CardTitle>
          <CardDescription>Paso 3 de 3: ¿Cuándo atendés?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-2 mb-6">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: '100%' }} />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm" role="alert">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {DAYS.map((day) => {
              const schedule = schedules.find(s => s.day_of_week === day.value)
              const isActive = schedule?.is_active || false

              return (
                <div key={day.value} className={`p-4 rounded-lg border transition-colors ${isActive ? 'bg-card' : 'bg-muted/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch checked={isActive} onCheckedChange={() => toggleDay(day.value)} id={`day-${day.value}`} />
                      <Label htmlFor={`day-${day.value}`} className="font-medium">{day.label}</Label>
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-2">
                        <Input type="time" value={schedule?.start_time || '09:00'} onChange={(e) => updateTime(day.value, 'start_time', e.target.value)} className="w-28" />
                        <span className="text-muted-foreground">a</span>
                        <Input type="time" value={schedule?.end_time || '18:00'} onChange={(e) => updateTime(day.value, 'end_time', e.target.value)} className="w-28" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? 'Guardando...' : '¡Listo! Empezar a Usar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
