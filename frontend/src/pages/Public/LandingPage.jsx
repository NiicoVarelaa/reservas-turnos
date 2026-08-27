import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useServices } from '@/hooks/useServices'
import { businessApi } from '@/services/api'
import Header from '@/components/layout/Header'
import SecurePaymentBadge from '@/components/booking/SecurePaymentBadge'
import NextAvailableSlot from '@/components/booking/NextAvailableSlot'
import ServiceCard from '@/components/booking/ServiceCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Calendar, Clock, MapPin, Phone, Mail, Star, ChevronRight, Shield, Heart,
  Facebook, Instagram, CheckCircle2, MessageSquare, Stethoscope
} from 'lucide-react'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'
import { CTA } from '@/constants/copy'

const TESTIMONIALS = [
  { name: 'María López', text: 'Excelente atención, muy profesional y puntual. Mi familia y yo somos pacientes hace años.', rating: 5, service: 'Limpieza Dental' },
  { name: 'Carlos García', text: 'El blanqueamiento quedó increíble. Super recomendable, el equipo es muy amable.', rating: 5, service: 'Blanqueamiento' },
  { name: 'Ana Rodríguez', text: 'Llevé a mis hijos y fueron tratados con mucha paciencia. Ahora les encanta ir al dentista.', rating: 5, service: 'Odontopediatría' },
]

const STATS = [
  { value: '10+', label: 'años de experiencia' },
  { value: '+5000', label: 'pacientes atendidos' },
  { value: '4.9★', label: 'valoración en Google' },
]

const getInitials = (name) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()

export default function LandingPage() {
  const { services, loading: servicesLoading } = useServices()
  const [business, setBusiness] = useState(null)
  const [imgsReady, setImgsReady] = useState({ hero: false, clinic: false })
  const [contactForm, setContactForm] = useState({ name: '', contact: '', message: '' })
  const [contactError, setContactError] = useState('')

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

  useEffect(() => {
    const probe = (src, key) => {
      const img = new Image()
      img.onload = () => setImgsReady(prev => ({ ...prev, [key]: true }))
      img.src = src
    }
    probe('/images/Clinica.jpg', 'hero')
    probe('/images/clinica-interior.jpg', 'clinic')
  }, [])

  const featuredServices = services.slice(0, 4)
  const tagline = business?.tagline || 'Tu sonrisa, nuestra prioridad'
  const description = business?.description || 'Centro odontológico especializado en tratamientos de estética, implantes y ortodoncia con más de 10 años de experiencia.'
  const waNumber = (business?.whatsapp_number || '+5491112345678').replace(/\D/g, '')
  const contactPhone = business?.whatsapp_number || '+54 9 11 1234-5678'
  const contactEmail = business?.email || 'hola@smilebook.com'
  const contactAddress = business?.address || 'Av. Siempre Viva 123, Buenos Aires'

  const handleWhatsApp = () => {
    const text = encodeURIComponent('Hola Smile Book! Quiero información sobre sus servicios.')
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank')
  }

  const handleContactSubmit = (e) => {
    e.preventDefault()
    if (!contactForm.name.trim()) {
      setContactError('Ingresá tu nombre para continuar')
      return
    }
    const text = encodeURIComponent(
      `Hola Smile Book! Soy ${contactForm.name}${contactForm.contact ? ` (${contactForm.contact})` : ''}.${contactForm.message ? ` ${contactForm.message}` : ''}`
    )
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank')
    setContactError('')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        navLinks={[
          { label: 'Inicio', to: '/' },
          { label: 'Servicios', to: '/book' },
          { label: 'Escribinos', to: `https://wa.me/${waNumber}`, icon: WhatsAppIcon },
        ]}
      />

      {/* Hero */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                <Star className="w-3 h-3 mr-1" />
                Clínica dental con más de 10 años de experiencia
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                {tagline}
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                {description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/book">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Calendar className="w-4 h-4 mr-2" />
                    {CTA.primary}
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={handleWhatsApp}>
                  <WhatsAppIcon className="w-4 h-4 mr-2 text-[#25D366]" />
                  Escribinos por WhatsApp
                </Button>
              </div>
              <SecurePaymentBadge className="mt-4" />
              {business?.id && <NextAvailableSlot businessId={business.id} />}
              <div className="border-t mt-10 pt-6 grid grid-cols-3 gap-4">
                {STATS.map(stat => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/15 via-muted to-primary/10">
                {imgsReady.hero ? (
                  <img
                    src="/images/Clinica.jpg"
                    alt="Consultorio Smile Book"
                    className="absolute inset-0 w-full h-full"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-primary/30">
                    <Stethoscope className="w-14 h-14" />
                    <span className="text-sm">Imagen del consultorio</span>
                  </div>
                )}
              </div>
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

      {/* Why choose us */}
      {imgsReady.clinic && (
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
                <img
                  src="/images/clinica-interior.jpg"
                  alt="Interior de la clínica"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6">Por qué elegir Smile Book</h2>
                <ul className="space-y-4">
                  {[
                    'Equipo de especialistas en estética, implantes, ortodoncia y más',
                    'Tecnología de última generación en cada tratamiento',
                    'Reserva online rápida y confirmación por WhatsApp',
                    'Pagos seguros y planes de financiación'
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/book" className="mt-8 inline-block">
                  <Button size="lg">
                    Conocé nuestros tratamientos
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Star className="w-3 h-3 mr-1 fill-primary text-primary" />
              4.9 en Google · +200 reseñas
            </Badge>
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
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                      {getInitials(testimonial.name)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.service}</p>
                    </div>
                  </div>
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
              {CTA.urgent}
            </Button>
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section id="contacto" className="py-16 bg-muted/50 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Contacto</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ¿Tenés dudas? Escribinos por WhatsApp o dejá tu mensaje y te respondemos a la brevedad
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Teléfono / WhatsApp</p>
                    <p className="text-sm text-muted-foreground">{contactPhone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{contactEmail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Dirección</p>
                    <p className="text-sm text-muted-foreground">{contactAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Horarios</p>
                    <p className="text-sm text-muted-foreground">
                      Lun a Vie: 9:00 - 18:00<br />
                      Sábados: 9:00 - 14:00
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={handleWhatsApp}>
                  <WhatsAppIcon className="w-4 h-4 mr-2 text-[#25D366]" />
                  Abrir WhatsApp
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-5">
                  <p className="text-sm">
                    ¿Ya sabés qué servicio necesitás?{' '}
                    <Link to="/book" className="font-semibold text-primary hover:underline">
                      Reservá tu turno directamente →
                    </Link>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para dudas puntuales, escribinos acá.
                  </p>
                </div>
                <h3 className="font-semibold mb-1">Enviar consulta</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Completá el formulario y te va a redirigir a WhatsApp con tu mensaje listo para enviar
                </p>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Nombre *</Label>
                    <Input
                      id="contact-name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Teléfono o email (opcional)</Label>
                    <Input
                      id="contact-phone"
                      value={contactForm.contact}
                      onChange={(e) => setContactForm({ ...contactForm, contact: e.target.value })}
                      placeholder="+54 9 11 1234-5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Mensaje (opcional)</Label>
                    <textarea
                      id="contact-message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="¿En qué podemos ayudarte?"
                      className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  {contactError && (
                    <p className="text-sm text-destructive" role="alert">{contactError}</p>
                  )}
                  <Button type="submit" className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Enviar por WhatsApp
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#002a5e] text-slate-300">
        <div className="container mx-auto px-4 pt-16 pb-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">

            {/* Brand + CTA */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0">
                  <img src="/logo.png" alt="Smile Book" className="w-8 h-8 object-contain" />
                </div>
                <span className="font-bold text-lg text-white">Smile Book</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400 max-w-sm mb-6">
                {description}
              </p>
              <Link to="/book">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-5">
                  <Calendar className="w-4 h-4 mr-2" />
                  {CTA.primary}
                </Button>
              </Link>
              <div className="flex items-center gap-3 mt-6">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#0e9aa3] flex items-center justify-center text-slate-300 hover:text-white transition-all"
                >
                  <Facebook className="w-[18px] h-[18px]" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#0e9aa3] flex items-center justify-center text-slate-300 hover:text-white transition-all"
                >
                  <Instagram className="w-[18px] h-[18px]" />
                </a>
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#0e9aa3] flex items-center justify-center text-slate-300 hover:text-white transition-all"
                >
                  <WhatsAppIcon className="w-[18px] h-[18px] text-[#25D366]" />
                </a>
              </div>
            </div>

            {/* Navegación */}
            <div className="lg:col-span-3">
              <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Navegación</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
                </li>
                <li>
                  <Link to="/book" className="hover:text-white transition-colors">{CTA.primary}</Link>
                </li>
                <li>
                  <a href="#contacto" className="hover:text-white transition-colors">Contacto</a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">Acceso Profesional</Link>
                </li>
              </ul>
            </div>

            {/* Contacto */}
            <div className="lg:col-span-4">
              <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Contacto</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 mt-0.5 shrink-0 text-[#11b7c1]" />
                  <span>{contactPhone}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 mt-0.5 shrink-0 text-[#11b7c1]" />
                  <span>{contactEmail}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#11b7c1]" />
                  <span>{contactAddress}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 mt-0.5 shrink-0 text-[#11b7c1]" />
                  <span>
                    Lun a Vie: 9:00 - 18:00<br />
                    Sábados: 9:00 - 14:00
                  </span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <p>&copy; {new Date().getFullYear()} Smile Book. Todos los derechos reservados.</p>
            <div className="flex items-center gap-5">
              <Link to="/terms" className="hover:text-white transition-colors">Términos y Condiciones</Link>
              <Link to="/legal" className="hover:text-white transition-colors">Política de Privacidad</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}