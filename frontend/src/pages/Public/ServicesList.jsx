import { useServices } from '@/hooks/useServices'
import ServiceCard from '@/components/booking/ServiceCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ServicesList() {
  const { services, loading, error } = useServices()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="p-2 rounded-md hover:bg-accent">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Elegí un Servicio</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {loading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-destructive" role="alert">
            <p>Error al cargar los servicios.</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        )}

        {!loading && services.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>No hay servicios disponibles en este momento.</p>
            </CardContent>
          </Card>
        )}

        {!loading && services.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
