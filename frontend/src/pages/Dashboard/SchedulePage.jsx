import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Clock, Plus, Trash2 } from 'lucide-react'

const DAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
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
    setSchedules(prev => prev.map(s => s.day_of_week === day ? { ...s, is_active: !s.is_active } : s))
  }

  const updateTime = (day, field, value) => {
    setSchedules(prev => prev.map(s => s.day_of_week === day ? { ...s, [field]: value } : s))
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Horarios</h1>
      <p className="text-muted-foreground mb-8">Configurá tu disponibilidad semanal.</p>

      <Card>
        <CardHeader>
          <CardTitle>Disponibilidad semanal</CardTitle>
          <CardDescription>Activá los días que trabajás y ajustá tus horarios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={schedule?.start_time || '09:00'}
                        onChange={(e) => updateTime(day.value, 'start_time', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">a</span>
                      <Input
                        type="time"
                        value={schedule?.end_time || '18:00'}
                        onChange={(e) => updateTime(day.value, 'end_time', e.target.value)}
                        className="w-32"
                      />
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-end">
        <Button>Guardar Cambios</Button>
      </div>
    </div>
  )
}
