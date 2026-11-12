import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useServices } from '@/hooks/useServices'
import ServiceCard from '@/components/booking/ServiceCard'
import BookingHeader from '@/components/booking/BookingHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CalendarCheck,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'

const BENEFITS = [
  { icon: CalendarCheck, label: 'Turnos 24/7' },
  { icon: MessageSquare, label: 'Confirmación por WhatsApp' },
  { icon: ShieldCheck, label: 'Pago seguro con Stripe' },
]

export default function ServicesList() {
  const { services, loading, error, refetch } = useServices()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return services
    return services.filter((service) =>
      `${service.name || ''} ${service.description || ''}`.toLowerCase().includes(term)
    )
  }, [services, query])

  const hasQuery = query.trim().length > 0

  return (
    <div className="min-h-screen bg-background">
      <BookingHeader backTo="/" backLabel="Volver al inicio" badge="Reservá en menos de 2 minutos" />

      <main>
        <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-secondary/50 via-background to-background">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal/10 blur-3xl" />
            <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)',
                backgroundSize: '28px 28px',
              }}
            />
          </div>

          <div className="container relative mx-auto max-w-5xl px-4 py-12 lg:py-16">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-3.5 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Reservá online
              </span>

              <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl">
                Elegí el servicio que necesitás
              </h1>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Seleccioná un tratamiento, elegí profesional, fecha y horario, y confirmá tu turno en minutos.
              </p>

              <ul className="mt-6 flex flex-wrap gap-2">
                {BENEFITS.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur"
                  >
                    <Icon className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-4 py-8 lg:py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Servicios disponibles</h2>
              <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
                {loading
                  ? 'Cargando servicios...'
                  : hasQuery
                    ? `${filtered.length} ${filtered.length === 1 ? 'resultado' : 'resultados'} para “${query.trim()}”`
                    : `${services.length} ${services.length === 1 ? 'servicio disponible' : 'servicios disponibles'}`}
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar tratamiento..."
                aria-label="Buscar servicio"
                className="h-11 rounded-xl pl-10 pr-10"
              />
              {hasQuery && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-6">
            {error ? (
              <div
                className="flex flex-col items-start gap-4 rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
                role="alert"
              >
                <p>No pudimos cargar los servicios. Revisá tu conexión e intentá de nuevo.</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="border-destructive/30 text-destructive hover:bg-destructive/10">
                  Reintentar
                </Button>
              </div>
            ) : loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-64 rounded-2xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-background text-muted-foreground ring-1 ring-inset ring-border">
                  <Search className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-semibold">
                  {hasQuery ? 'No encontramos ese tratamiento' : 'Todavía no hay servicios publicados'}
                </h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                  {hasQuery
                    ? 'Probá con otro nombre o limpiá la búsqueda para ver todos los servicios.'
                    : 'Volvé en unos minutos o contactanos para coordinar tu turno.'}
                </p>
                <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                  {hasQuery ? (
                    <Button variant="outline" onClick={() => setQuery('')}>
                      Ver todos los servicios
                    </Button>
                  ) : (
                    <Button onClick={() => refetch()}>Actualizar</Button>
                  )}
                  <Link to="/">
                    <Button variant="ghost">Volver al inicio</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
