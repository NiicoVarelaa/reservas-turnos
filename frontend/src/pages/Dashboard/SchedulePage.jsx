import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CalendarDays,
  Check,
  Clock,
  Loader2,
  RefreshCw,
  RotateCcw,
  Save,
  Sun,
} from 'lucide-react'
import { useSchedules, useReplaceSchedules } from '@/hooks/useSchedules'
import PageHeader from '@/components/dashboard/PageHeader'
import StatCard from '@/components/dashboard/StatCard'
import DashboardPanel from '@/components/dashboard/DashboardPanel'
import EmptyState from '@/components/dashboard/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { minutesFromTime } from '@/lib/format'
import { toast } from '@/hooks/use-toast'

const DAYS = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
]

const DEFAULT_SCHEDULES = [
  { day_of_week: 0, start_time: '09:00', end_time: '18:00', is_active: false },
  { day_of_week: 1, start_time: '09:00', end_time: '18:00', is_active: true },
  { day_of_week: 2, start_time: '09:00', end_time: '18:00', is_active: true },
  { day_of_week: 3, start_time: '09:00', end_time: '18:00', is_active: true },
  { day_of_week: 4, start_time: '09:00', end_time: '18:00', is_active: true },
  { day_of_week: 5, start_time: '09:00', end_time: '14:00', is_active: true },
  { day_of_week: 6, start_time: '09:00', end_time: '18:00', is_active: false },
]

function buildDraft(savedSchedules = []) {
  return DEFAULT_SCHEDULES.map((fallback) => {
    const saved = savedSchedules.find(
      (schedule) => schedule.day_of_week === fallback.day_of_week
    )
    if (!saved) return { ...fallback }

    return {
      day_of_week: fallback.day_of_week,
      start_time: (saved.start_time || fallback.start_time).slice(0, 5),
      end_time: (saved.end_time || fallback.end_time).slice(0, 5),
      is_active: Boolean(saved.is_active),
    }
  })
}

const cloneDefault = () => DEFAULT_SCHEDULES.map((schedule) => ({ ...schedule }))

export default function SchedulePage() {
  const { schedules: savedSchedules, loading, error, refetch } = useSchedules()
  const replaceSchedules = useReplaceSchedules()

  const [draft, setDraft] = useState(cloneDefault)
  const [baseline, setBaseline] = useState(() => JSON.stringify(cloneDefault()))
  const [refreshing, setRefreshing] = useState(false)

  const savedSignature = JSON.stringify(savedSchedules)

  useEffect(() => {
    const next = buildDraft(JSON.parse(savedSignature))
    setDraft(next)
    setBaseline(JSON.stringify(next))
  }, [savedSignature])

  const dirty = JSON.stringify(draft) !== baseline

  const activeDays = useMemo(
    () =>
      draft
        .filter((day) => day.is_active)
        .sort((a, b) => a.day_of_week - b.day_of_week),
    [draft]
  )

  const totalHours = useMemo(() => {
    const minutes = activeDays.reduce((sum, day) => {
      const start = minutesFromTime(day.start_time)
      const end = minutesFromTime(day.end_time)
      if (start === null || end === null || end <= start) return sum
      return sum + (end - start)
    }, 0)

    return Math.round((minutes / 60) * 10) / 10
  }, [activeDays])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
      toast({ title: 'Horarios actualizados', variant: 'success' })
    } catch {
      toast({
        title: 'No pudimos actualizar los horarios',
        description: 'Revisá tu conexión e intentá de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setRefreshing(false)
    }
  }

  const toggleDay = (dayOfWeek) => {
    setDraft((previous) =>
      previous.map((schedule) =>
        schedule.day_of_week === dayOfWeek
          ? { ...schedule, is_active: !schedule.is_active }
          : schedule
      )
    )
  }

  const updateTime = (dayOfWeek, field, value) => {
    setDraft((previous) =>
      previous.map((schedule) =>
        schedule.day_of_week === dayOfWeek ? { ...schedule, [field]: value } : schedule
      )
    )
  }

  const activateWeekdays = () => {
    setDraft((previous) =>
      previous.map((schedule) => ({
        ...schedule,
        is_active: schedule.day_of_week >= 1 && schedule.day_of_week <= 5,
      }))
    )
  }

  const deactivateAll = () => {
    setDraft((previous) => previous.map((schedule) => ({ ...schedule, is_active: false })))
  }

  const resetDraft = () => {
    setDraft(JSON.parse(baseline))
  }

  const saveSchedules = async () => {
    const invalid = activeDays.find((day) => {
      const start = minutesFromTime(day.start_time)
      const end = minutesFromTime(day.end_time)
      return start === null || end === null || end <= start
    })

    if (invalid) {
      const label = DAYS.find((day) => day.value === invalid.day_of_week)?.label || 'Ese día'
      toast({
        title: `${label}: horario inválido`,
        description: 'La hora de cierre debe ser posterior a la hora de apertura.',
        variant: 'destructive',
      })
      return
    }

    try {
      await replaceSchedules.mutateAsync(draft)
      setBaseline(JSON.stringify(draft))
      toast({
        title: 'Horarios guardados',
        description: 'Tu disponibilidad semanal fue actualizada.',
        variant: 'success',
      })
    } catch (err) {
      toast({
        title: 'No pudimos guardar los horarios',
        description: err.response?.data?.error || 'Probá de nuevo en unos segundos.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader
          eyebrow="Disponibilidad"
          title="Horarios"
          description="Configurá los días y horarios en los que tus clientes pueden reservar."
          icon={Clock}
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[124px] rounded-3xl" />
          ))}
        </div>
        <div className="mt-6 space-y-2">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-[78px] rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <PageHeader
          eyebrow="Disponibilidad"
          title="Horarios"
          description="Configurá los días y horarios en los que tus clientes pueden reservar."
          icon={Clock}
        />
        <EmptyState
          className="mt-6"
          tone="destructive"
          icon={AlertCircle}
          title="No pudimos cargar tus horarios"
          description={error}
          action={<Button onClick={() => refetch()}>Reintentar</Button>}
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Disponibilidad"
        title="Horarios"
        description="Configurá los días y horarios en los que tus clientes pueden reservar. Los cambios se aplican a las nuevas reservas."
        icon={Clock}
        actions={
          <>
            <Button
              variant="outline"
              className="h-10 rounded-xl"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={cn('h-4 w-4', refreshing && 'animate-spin')}
                aria-hidden="true"
              />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
            <Button
              className="h-10 rounded-xl"
              onClick={saveSchedules}
              disabled={!dirty || replaceSchedules.isPending}
            >
              {replaceSchedules.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4" aria-hidden="true" />
              )}
              {replaceSchedules.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Días activos"
          value={`${activeDays.length} de 7`}
          hint="Días con atención al público"
          icon={CalendarDays}
          tone="primary"
        />
        <StatCard
          label="Horas semanales"
          value={`${totalHours} h`}
          hint="Suma de tus franjas horarias"
          icon={Clock}
          tone="teal"
        />
        <StatCard
          label="Estado"
          value={dirty ? 'Sin guardar' : 'Guardado'}
          hint={dirty ? 'Tenés cambios pendientes' : 'Tus horarios están al día'}
          icon={dirty ? AlertCircle : Check}
          tone={dirty ? 'amber' : 'teal'}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <DashboardPanel
          title="Disponibilidad semanal"
          description="Activá los días que trabajás y ajustá tus franjas horarias"
          icon={CalendarDays}
          actions={
            <div className="flex flex-wrap gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg text-xs"
                onClick={activateWeekdays}
              >
                Lunes a viernes
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg text-xs"
                onClick={deactivateAll}
              >
                Cerrar todo
              </Button>
            </div>
          }
          bodyClassName="p-4 sm:p-5"
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground" aria-live="polite">
                {dirty ? 'Tenés cambios sin guardar.' : 'Todos los cambios están guardados.'}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="ghost"
                  className="rounded-xl"
                  onClick={resetDraft}
                  disabled={!dirty || replaceSchedules.isPending}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Descartar
                </Button>
                <Button
                  className="rounded-xl"
                  onClick={saveSchedules}
                  disabled={!dirty || replaceSchedules.isPending}
                >
                  {replaceSchedules.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Save className="h-4 w-4" aria-hidden="true" />
                  )}
                  {replaceSchedules.isPending ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-2">
            {DAYS.map((day) => {
              const schedule = draft.find((item) => item.day_of_week === day.value)
              const isActive = Boolean(schedule?.is_active)

              return (
                <div
                  key={day.value}
                  className={cn(
                    'flex flex-col gap-3 rounded-2xl border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between',
                    isActive
                      ? 'border-border/70 bg-background'
                      : 'border-border/50 bg-muted/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Switch
                      id={`schedule-day-${day.value}`}
                      checked={isActive}
                      onCheckedChange={() => toggleDay(day.value)}
                      aria-label={`${isActive ? 'Desactivar' : 'Activar'} ${day.label.toLowerCase()}`}
                    />
                    <div>
                      <Label
                        htmlFor={`schedule-day-${day.value}`}
                        className={cn(
                          'cursor-pointer font-medium',
                          !isActive && 'text-muted-foreground'
                        )}
                      >
                        {day.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {isActive
                          ? `${schedule?.start_time || '—'} a ${schedule?.end_time || '—'} hs`
                          : 'Cerrado'}
                      </p>
                    </div>
                  </div>

                  {isActive ? (
                    <div className="flex items-center gap-2 pl-12 sm:pl-0">
                      <Input
                        type="time"
                        step="900"
                        value={schedule?.start_time || '09:00'}
                        onChange={(event) =>
                          updateTime(day.value, 'start_time', event.target.value)
                        }
                        aria-label={`Hora de apertura del ${day.label.toLowerCase()}`}
                        className="h-10 w-[7.5rem] rounded-xl"
                      />
                      <span className="text-xs text-muted-foreground">a</span>
                      <Input
                        type="time"
                        step="900"
                        value={schedule?.end_time || '18:00'}
                        onChange={(event) =>
                          updateTime(day.value, 'end_time', event.target.value)
                        }
                        aria-label={`Hora de cierre del ${day.label.toLowerCase()}`}
                        className="h-10 w-[7.5rem] rounded-xl"
                      />
                    </div>
                  ) : (
                    <span className="pl-12 text-xs font-medium text-muted-foreground sm:pl-0">
                      No disponible
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </DashboardPanel>

        <div className="space-y-6">
          <DashboardPanel title="Resumen semanal" icon={Sun}>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Días activos</dt>
                <dd className="font-semibold">{activeDays.length} de 7</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Horas semanales</dt>
                <dd className="font-semibold">{totalHours} h</dd>
              </div>
            </dl>

            <div className="mt-4 space-y-2 border-t border-border/70 pt-4">
              {activeDays.length === 0 ? (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  No tenés días activos. Tus clientes no van a poder reservar turnos.
                </p>
              ) : (
                activeDays.map((day) => {
                  const label = DAYS.find((item) => item.value === day.day_of_week)
                  return (
                    <div
                      key={day.day_of_week}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Clock className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
                        {label?.short || day.day_of_week}
                      </span>
                      <span className="text-muted-foreground">
                        {day.start_time} a {day.end_time} hs
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </DashboardPanel>

          <DashboardPanel title="Buenas prácticas" icon={Check}>
            <ul className="space-y-2.5 text-xs leading-relaxed text-muted-foreground">
              <li>Dejá una pausa entre turnos si necesitás preparar el espacio.</li>
              <li>Actualizá tus horarios si tomás vacaciones o feriados.</li>
              <li>Los turnos ya reservados no se modifican al cambiar la disponibilidad.</li>
            </ul>
          </DashboardPanel>
        </div>
      </div>
    </div>
  )
}
