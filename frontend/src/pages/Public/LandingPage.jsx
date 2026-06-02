import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useServices } from '@/hooks/useServices'
import { businessApi } from '@/services/api'
import ServiceCard from '@/components/booking/ServiceCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, MapPin, Phone, Mail, Star, ChevronRight, Sparkles, Shield, Heart } from 'lucide-react'

const TESTIMONIALS = [
  { name: 'María López', text: 'Excelente atención, muy profesional y puntual. Mi familia y yo somos pacientes hace años.', rating: 5 },
  { name: 'Carlos García', text: 'El blanqueamiento quedó increíble. Super recomendable, el equipo es muy amable.', rating: 5 },
  { name: 'Ana Rodríguez', text: 'Llevé a mis hijos y fueron tratados con mucha paciencia. Ahora les encanta ir al dentista.', rating: 5 },
]

export default function LandingPage() {
  const { services, loading: servicesLoading } = useServices()
  const [business, setBusiness] = useState(null)

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const { data } = await businessApi.getBySlug('clnica-dental-sonrisa')
        setBusiness(data.business)
      } catch {
        setBusiness(null)
      }
    }
    fetchBusiness()
  }, [])

  const featuredServices = services.slice(0, 4)
  const businessName = business?.name || 'Clínica Dental Sonrisa'
  const tagline = business?.tagline || 'Tu sonrisa, nuestra prioridad'
  const description = business?.description || 'Centro odontológico especializado en tratamientos de estética, implantes y ortodoncia con más de 10 años de experiencia.'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">{businessName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Iniciar Sesión</Button>
            </Link>
            <Link to="/book">
              <Button size="sm">Reservar Turno</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Star className="w-3 h-3 mr-1" />
              Más de 10 años de experiencia
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              {tagline}
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/book">
                <Button size="lg" className="w-full sm:w-auto">
                  <Calendar className="w-4 h-4 mr-2" />
                  Reservar Turno
                </Button>
              </Link>
              <a href={`tel:${business?.whatsapp_number || ''}`}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Phone className="w-4 h-4 mr-2" />
                  Contactar
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Profesionalismo</h3>
                <p className="text-sm text-muted-foreground">Equipos de última generación y técnicas actualizadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Puntualidad</h3>
                <p className="text-sm text-muted-foreground">Respetamos tu tiempo con turnos puntuales</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Atención Personalizada</h3>
                <p className="text-sm text-muted-foreground">Cada paciente recibe un plan de tratamiento único</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nuestros Servicios</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ofrecemos una amplia gama de tratamientos para cuidar tu salud bucal
            </p>
          </div>

          {servicesLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {featuredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
              {services.length > 4 && (
                <div className="text-center mt-8">
                  <Link to="/book">
                    <Button variant="outline">
                      Ver todos los servicios
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Lo que dicen nuestros pacientes</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">"{testimonial.text}"</p>
                  <p className="font-medium text-sm">{testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para tu turno?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Reservá online en menos de 2 minutos. Elegí el servicio, fecha y horario que más te convenga.
          </p>
          <Link to="/book">
            <Button size="lg">
              <Calendar className="w-4 h-4 mr-2" />
              Reservar Ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold">{businessName}</span>
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                {business?.whatsapp_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{business.whatsapp_number}</span>
                  </div>
                )}
                {business?.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{business.address}{business.city ? `, ${business.city}` : ''}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Horarios</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Lunes a Viernes: 9:00 - 18:00</p>
                <p>Sábados: 9:00 - 14:00</p>
                <p>Domingos: Cerrado</p>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {businessName}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
