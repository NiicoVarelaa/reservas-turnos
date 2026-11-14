import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateSchedule } from '@/hooks/useSchedules'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import OnboardingLayout, { OnboardingErrorMessage } from '@/components/onboarding/OnboardingLayout'
import { cn } from '@/lib/utils'
import { minutesFromTime } from '@/lib/format'
import { CheckCircle2, Clock, Loader2 } from 'lucide-react'

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

const DAYS = {
  0: { label: 'Domingo', short: 'Dom' },
  1: { label: 'Lunes', short: 'Lun' },
  2: { label: 'Martes', short: 'Mar' },
  3: { label: 'Miércoles', short: 'Mié' },
  4: { label: 'Jueves', short: 'Jue' },
  5: { label: 'Viernes', short: 'Vie' },
  6: { label: 'Sábado', short: 'Sáb' },
}

const DEFAULT_TIMES = {
  1: { start_time: '09:00', end_time: '18:00' },
  2: { start_time: '09:00', end_time: '18:00' },
  3: { start_time: '09:00', end_time: '18:00' },
  4: { start_time: '09:00', end_time: '18:00' },
  5: { start_time: '09:00', end_time: '14:00' },
  6: { start_time: '09:00', end_time: '13:00' },
  0: { start_time: '09:00', end_time: '13:00' },
}

const createInitialSchedules = () =>
  DAY_ORDER.map((day) => ({
    day_of_week: day,
    ...DEFAULT_TIMES[day],
    is_active: day >= 1 && day <= 5,
  }))

function formatHours(minutes) {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (rest === 0) return `${hours} h`
  return `${hours} h ${rest} min`
}

export default function SetupSchedule() {
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState(createInitialSchedules)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const createSchedule = useCreateSchedule()

  const toggleDay = (day) => {
    setSchedules((previous) =>
      previous.map((schedule) =>
        schedule.day_of_week === day ? { ...schedule, is_active: !schedule.is_active } : schedule
      )
    )
    setErrors((previous) => {
      if (!previous[day]) return previous
      const next = { ...previous }
      delete next[day]
      return next
    })
    if (error) setError('')
  }

  const updateTime = (day, field, value) => {
    setSchedules((previous) =>
      previous.map((schedule) =>
        schedule.day_of_week === day ? { ...schedule, [field]: value } : schedule
      )
    )
    setErrors((previous) => {
      if (!previous[day]) return previous
      const next = { ...previous }
      delete next[day]
      return next
    })
    if (error) setError('')
  }

  const activeSchedules = schedules.filter((schedule) => schedule.is_active)

  const weeklyMinutes = activeSchedules.reduce((total, schedule) => {
    const start = minutesFromTime(schedule.start_time)
    const end = minutesFromTime(schedule.end_time)
    return start !== null && end !== null && end > start ? total + (end - start) : total
  }, 0)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (activeSchedules.length === 0) {
      setError('Activá al menos un día de atención para continuar.')
      return
    }

    const nextErrors = {}
    activeSchedules.forEach((schedule) => {
      const start = minutesFromTime(schedule.start_time)
      const end = minutesFromTime(schedule.end_time)
      if (start === null || end === null || end <= start) {
        nextErrors[schedule.day_of_week] = 'La hora de cierre debe ser posterior a la de apertura.'
      }
    })

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setError('Revisá los horarios marcados antes de continuar.')
      return
    }

    setErrors({})

    try {
      for (const schedule of activeSchedules) {
        await createSchedule.mutateAsync({
          day_of_week: schedule.day_of_week,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          is_active: true,
        })
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'No pudimos guardar tus horarios.')
    }
  }

  return (
    <OnboardingLayout
      step="schedule"
      title="Configurá tus horarios"
      description="Elegí los días que atendés y el rango horario de cada uno. Es el último paso."
    >
      <OnboardingErrorMessage message={error} />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-teal/20 bg-teal/[0.06] px-4 py-3 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
          <span>
            <span className="font-semibold text-foreground">{activeSchedules.length}</span>{' '}
            {activeSchedules.length === 1 ? 'día activo' : 'días activos'}
            {' · '}
            <span className="font-semibold text-foreground">{formatHours(weeklyMinutes)}</span> por
            semana
          </span>
        </div>

        <div className="space-y-2">
          {schedules.map((schedule) => {
            const day = DAYS[schedule.day_of_week]
            const dayError = errors[schedule.day_of_week]

            return (
              <div
                key={schedule.day_of_week}
                className={cn(
                  'rounded-2xl border px-4 py-3 transition-colors',
                  schedule.is_active
                    ? 'border-border/70 bg-background/60'
                    : 'border-border/50 bg-muted/30',
                  dayError && 'border-destructive/40 bg-destructive/5'
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={schedule.is_active}
                      onCheckedChange={() => toggleDay(schedule.day_of_week)}
                      id={`day-${schedule.day_of_week}`}
                      aria-describedby={dayError ? `day-${schedule.day_of_week}-error` : undefined}
                    />
                    <Label
                      htmlFor={`day-${schedule.day_of_week}`}
                      className={cn(
                        'cursor-pointer text-sm font-semibold',
                        !schedule.is_active && 'text-muted-foreground'
                      )}
                    >
                      <span className="sm:hidden">{day.short}</span>
                      <span className="hidden sm:inline">{day.label}</span>
                    </Label>
                  </div>

                  {schedule.is_active ? (
                    <div className="flex items-center gap-2 pl-0 sm:pl-3">
                      <div className="relative">
                        <Clock
                          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <Input
                          type="time"
                          value={schedule.start_time}
                          onChange={(event) =>
                            updateTime(schedule.day_of_week, 'start_time', event.target.value)
                          }
                          aria-label={`Hora de apertura del ${day.label.toLowerCase()}`}
                          className="h-10 w-[7.5rem] rounded-xl pl-8"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">a</span>
                      <div className="relative">
                        <Clock
                          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <Input
                          type="time"
                          value={schedule.end_time}
                          onChange={(event) =>
                            updateTime(schedule.day_of_week, 'end_time', event.target.value)
                          }
                          aria-label={`Hora de cierre del ${day.label.toLowerCase()}`}
                          className="h-10 w-[7.5rem] rounded-xl pl-8"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="pl-0 text-xs font-medium text-muted-foreground sm:pl-3">
                      Cerrado
                    </span>
                  )}
                </div>

                {dayError && (
                  <p
                    id={`day-${schedule.day_of_week}-error`}
                    role="alert"
                    className="mt-2 text-xs text-destructive"
                  >
                    {dayError}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Podés ajustar estos horarios desde la sección Horarios de tu panel.
          </p>
          <Button
            type="submit"
            className="h-11 rounded-xl px-5 text-sm font-semibold shadow-lg shadow-primary/20 transition-shadow hover:shadow-primary/30"
            disabled={createSchedule.isPending}
          >
            {createSchedule.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Guardando...
              </span>
            ) : (
              'Finalizar configuración'
            )}
          </Button>
        </div>
      </form>
    </OnboardingLayout>
  )
}
