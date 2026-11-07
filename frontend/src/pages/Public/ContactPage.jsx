import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Reveal from '@/components/ui/Reveal'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'
import { useBusinessBySlug } from '@/hooks/useBusiness'
import { cn } from '@/lib/utils'
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { CTA } from '@/constants/copy'

const HOURS = [
  { days: 'Lunes a viernes', time: '9:00 – 18:00' },
  { days: 'Sábados', time: '9:00 – 14:00' },
]

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  message: '',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function ContactRow({ icon: Icon, label, children, hint }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary ring-1 ring-inset ring-primary/10">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <div className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{children}</div>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground/80">{hint}</p>}
      </div>
    </li>
  )
}

export default function ContactPage() {
  const { data: business } = useBusinessBySlug('clinica-dental-sonrisa')
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [sentLink, setSentLink] = useState('')

  const contactPhone = business?.whatsapp_number || '+54 9 11 1234-5678'
  const contactEmail = business?.email || 'hola@smilebook.com'
  const contactAddress = business?.address || 'Av. Siempre Viva 123, Buenos Aires'
  const waNumber = contactPhone.replace(/\D/g, '')
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    'Hola Smile Book! Quiero hacer una consulta.'
  )}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    contactAddress
  )}`

  const updateField = (field) => (event) => {
    const { value } = event.target
    setForm((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => (previous[field] ? { ...previous, [field]: undefined } : previous))
    if (sent) setSent(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Ingresá tu nombre y apellido.'
    if (!form.email.trim()) nextErrors.email = 'Ingresá tu email.'
    else if (!EMAIL_REGEX.test(form.email.trim())) nextErrors.email = 'Ingresá un email válido.'
    if (form.message.trim().length < 10) {
      nextErrors.message = 'Contanos un poco más sobre tu consulta (mínimo 10 caracteres).'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      const firstInvalid = ['name', 'email', 'message'].find((field) => nextErrors[field])
      document.getElementById(`contact-${firstInvalid}`)?.focus()
      return
    }

    const text = `Hola Smile Book! Soy ${form.name.trim()}. ${form.message.trim()}${
      form.phone.trim() ? ` Mi teléfono es ${form.phone.trim()}.` : ''
    } Mi email es ${form.email.trim()}.`
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`

    setSentLink(url)
    setSent(true)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const inputClass = (field) =>
    errors[field] ? 'border-destructive focus-visible:ring-destructive' : undefined

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-muted/70 via-muted/30 to-background">
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-teal/10 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)',
              backgroundSize: '28px 28px',
              maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 85%)',
            }}
          />
        </div>

        <div className="container relative mx-auto px-4 py-14 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
                Estamos para ayudarte
              </span>

              <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-balance sm:text-5xl">
                <span className="relative whitespace-nowrap text-primary">
                  Contacto
                  <svg
                    className="absolute -bottom-1 left-0 h-2 w-full text-teal/60"
                    viewBox="0 0 200 8"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d="M0 6 Q 50 1 100 4 T 200 3" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                ¿Tenés una consulta sobre turnos, tratamientos o pagos? Escribinos y te
                respondemos a la brevedad.
              </p>

              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {['Respuesta el mismo día', 'Atención personalizada', 'Sin compromiso'].map(
                  (item) => (
                    <li key={item} className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-teal" aria-hidden="true" />
                      {item}
                    </li>
                  )
                )}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto">
                    <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
                    Escribir por WhatsApp
                  </Button>
                </a>
                <a href="#formulario">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-border/70 bg-background/80 sm:w-auto"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    Completar formulario
                  </Button>
                </a>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="relative">
                <div
                  className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-teal/20 via-transparent to-primary/15 blur-2xl"
                  aria-hidden="true"
                />
                <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-muted shadow-2xl shadow-primary/10">
                  <img
                    src="/images/Clinica.jpg"
                    alt="Recepción de Smile Book"
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent"
                    aria-hidden="true"
                  />

                  <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/30 bg-white/95 p-4 shadow-lg backdrop-blur">
                    <p className="flex items-center gap-2 text-sm font-semibold text-navy">
                      <MapPin className="h-4 w-4 text-teal" aria-hidden="true" />
                      Visitanos
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{contactAddress}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                      <Clock className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
                      Lun a Vie 9:00–18:00 · Sáb 9:00–14:00
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Formulario + información */}
      <section id="formulario" className="scroll-mt-24 py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
            <Reveal>
              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8 lg:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Formulario de contacto
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                  Contanos en qué podemos ayudarte
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Completá tus datos y te va a redirigir a WhatsApp con el mensaje listo para
                  enviar.
                </p>

                <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Nombre y apellido *</Label>
                      <Input
                        id="contact-name"
                        name="name"
                        value={form.name}
                        onChange={updateField('name')}
                        placeholder="Tu nombre"
                        autoComplete="name"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'contact-name-error' : undefined}
                        className={inputClass('name')}
                      />
                      {errors.name && (
                        <p id="contact-name-error" role="alert" className="text-xs text-destructive">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email *</Label>
                      <Input
                        id="contact-email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={updateField('email')}
                        placeholder="vos@email.com"
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'contact-email-error' : undefined}
                        className={inputClass('email')}
                      />
                      {errors.email && (
                        <p id="contact-email-error" role="alert" className="text-xs text-destructive">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Teléfono (opcional)</Label>
                    <Input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={updateField('phone')}
                      placeholder="+54 9 11 1234-5678"
                      autoComplete="tel"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Mensaje *</Label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={updateField('message')}
                      placeholder="Contanos qué necesitás y te ayudamos a resolverlo."
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? 'contact-message-error' : undefined}
                      className={cn(
                        'flex min-h-[130px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm',
                        errors.message && 'border-destructive focus-visible:ring-destructive'
                      )}
                    />
                    {errors.message && (
                      <p
                        id="contact-message-error"
                        role="alert"
                        className="text-xs text-destructive"
                      >
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <p className="flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                    Al enviar, se abrirá WhatsApp con tu consulta. Usamos tus datos únicamente
                    para responderte y no los compartimos con terceros.
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button type="submit" size="lg" className="w-full sm:w-auto">
                      <Send className="h-4 w-4" aria-hidden="true" />
                      Enviar consulta
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      También podés escribirnos a{' '}
                      <a
                        href={`mailto:${contactEmail}`}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {contactEmail}
                      </a>
                    </p>
                  </div>

                  {sent && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="rounded-xl border border-teal/30 bg-teal/5 p-4"
                    >
                      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-teal" aria-hidden="true" />
                        ¡Listo! Abrimos WhatsApp con tu consulta.
                      </p>
                      <p className="mt-1 pl-6 text-xs leading-relaxed text-muted-foreground">
                        Si la ventana no se abrió,{' '}
                        <a
                          href={sentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                          hacé clic acá para enviarla
                        </a>
                        .
                      </p>
                    </div>
                  )}
                </form>
              </div>
            </Reveal>

            <Reveal delay={100} className="space-y-6">
              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-7">
                <h2 className="text-lg font-semibold tracking-tight">Información de contacto</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Elegí el canal que te resulte más cómodo.
                </p>

                <ul className="mt-6 space-y-5">
                  <ContactRow
                    icon={WhatsAppIcon}
                    label="WhatsApp"
                    hint="La forma más rápida de contactarnos."
                  >
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {contactPhone}
                    </a>
                  </ContactRow>

                  <ContactRow icon={Mail} label="Email" hint="Respondemos dentro del día hábil.">
                    <a
                      href={`mailto:${contactEmail}`}
                      className="font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {contactEmail}
                    </a>
                  </ContactRow>

                  <ContactRow icon={MapPin} label="Dirección">
                    <p>{contactAddress}</p>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Cómo llegar
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </ContactRow>

                  <ContactRow icon={Clock} label="Horarios">
                    <ul className="space-y-1">
                      {HOURS.map(({ days, time }) => (
                        <li key={days} className="flex items-center justify-between gap-3 text-sm">
                          <span>{days}</span>
                          <span className="font-medium text-foreground">{time}</span>
                        </li>
                      ))}
                    </ul>
                  </ContactRow>
                </ul>
              </div>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="relative h-36 bg-gradient-to-br from-primary/10 via-muted to-teal/10">
                  <div
                    className="absolute inset-0 opacity-60"
                    aria-hidden="true"
                    style={{
                      backgroundImage:
                        'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
                      backgroundSize: '26px 26px',
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background text-primary shadow-lg ring-1 ring-inset ring-primary/15">
                      <MapPin className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Cómo llegar</p>
                    <p className="truncate text-xs text-muted-foreground">{contactAddress}</p>
                  </div>
                  <ExternalLink
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                    aria-hidden="true"
                  />
                </div>
              </a>

              <Link
                to="/faq"
                className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary ring-1 ring-inset ring-primary/10">
                  <HelpCircle className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">¿Buscás una respuesta rápida?</p>
                  <p className="text-xs text-muted-foreground">
                    Mirá las preguntas frecuentes
                  </p>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                  aria-hidden="true"
                />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="pb-16 lg:pb-24">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-navy p-7 shadow-xl sm:p-9">
              <div aria-hidden="true" className="absolute inset-0">
                <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-teal/20 blur-3xl" />
                <div className="absolute -bottom-20 -right-10 h-52 w-52 rounded-full bg-teal/10 blur-3xl" />
                <div
                  className="absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
                    backgroundSize: '24px 24px',
                  }}
                />
              </div>

              <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
                    Sin esperas
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Reservá tu turno online
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-300">
                    Elegí el servicio, la fecha y el horario que mejor te queden. Confirmación
                    inmediata y pago seguro.
                  </p>
                </div>

                <Link to="/book" className="shrink-0">
                  <Button size="lg" className="bg-white text-navy hover:bg-slate-100">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    {CTA.primary}
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}
