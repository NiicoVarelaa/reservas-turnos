import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, Trash2, Save } from 'lucide-react'
import { schedulesApi } from '@/services/api'
import { toast } from '@/hooks/use-toast'

const DAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
]

const defaultSchedules = [
  { day_of_week: 0, start_time: '09:00', end_time: '18:00', is_active: false },
  { day_of_week: 1, start_time: '09:00', end_time: '18:00', is_active: true },
  { day_of_week: 2, start_time: '09:00', end_time: '18:00', is_active: true },
  { day_of_week: 3, start_time: '09:00', end_time: '18:00', is_active: true },
  { day_of_week: 4, start_time: '09:00', end_time: '18:00', is_active: true },
  { day_of_week: 5, start_time: '09:00', end_time: '14:00', is_active: true },
  { day_of_week: 6, start_time: '09:00', end_time: '18:00', is_active: false },
]

export default function SchedulePage() {
  const [schedules, setSchedules] = useState(defaultSchedules)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = async () => {
    try {
      const { data } = await schedulesApi.getAll()
      if (data?.schedules?.length) {
        const merged = defaultSchedules.map(def => {
          const existing = data.schedules.find(s => s.day_of_week === def.day_of_week)
          return existing || def
        })
        setSchedules(merged)
      }
    } catch {
      setSchedules(defaultSchedules)
    } finally {
      setLoading(false)
    }
  }

  const toggleDay = (day) => {
    setSchedules(prev => prev.map(s =>
      s.day_of_week === day ? { ...s, is_active: !s.is_active } : s
    ))
  }

  const updateTime = (day, field, value) => {
    setSchedules(prev => prev.map(s =>
      s.day_of_week === day ? { ...s, [field]: value } : s
    ))
  }

  const removeDay = (day) => {
    setSchedules(prev => prev.map(s =>
      s.day_of_week === day ? { ...s, is_active: false } : s
    ))
  }

  const saveSchedules = async () => {
    setSaving(true)
    try {
      for (const schedule of schedules) {
        await schedulesApi.create({
          day_of_week: schedule.day_of_week,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          is_active: schedule.is_active,
        })
      }
      toast({ title: 'Horarios guardados', description: 'Tu disponibilidad fue actualizada.', variant: 'success' })
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.error || 'No se pudieron guardar los horarios', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-2">Horarios</h1>
        <p className="text-muted-foreground mb-8">Cargando horarios...</p>
        <div className="space-y-4">
          {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      </div>
    )
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
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => toggleDay(day.value)}
                      id={`day-${day.value}`}
                    />
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeDay(day.value)}
                      >
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
        <Button onClick={saveSchedules} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  )
}
