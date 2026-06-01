import { useServices } from '../../hooks/useServices'
import ServiceCard from '../../components/booking/ServiceCard'

export default function LandingPage() {
  const { services, loading, error } = useServices()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Reservas & Turnos</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <section className="text-center py-8 mb-8">
          <h2 className="text-4xl font-bold mb-4">Reservá tu Turno</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Elegí un servicio, seleccioná fecha y hora, y confirmá tu reserva en segundos.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">Servicios Disponibles</h3>

          {loading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-destructive" role="alert">
              <p>Error al cargar los servicios.</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          )}

          {!loading && !error && services.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay servicios disponibles en este momento.</p>
            </div>
          )}

          {!loading && services.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
