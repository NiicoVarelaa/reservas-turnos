import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Reveal from '@/components/ui/Reveal'
import {
  ArrowRight,
  ArrowUp,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copyright,
  CreditCard,
  FileText,
  Landmark,
  Lock,
  Mail,
  MessageSquare,
  RefreshCw,
  Scale,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { CTA } from '@/constants/copy'

const LAST_UPDATED = 'Agosto de 2026'
const READING_TIME = '5 min de lectura'
const VERSION = 'Versión 2.0'

const HIGHLIGHTS = [
  {
    icon: Clock,
    title: 'Cancelá con 24 h',
    text: 'Avisanos con anticipación para liberar el turno a otro paciente.',
  },
  {
    icon: ShieldCheck,
    title: 'Pagos protegidos',
    text: 'Las transacciones se procesan de forma segura mediante Stripe.',
  },
  {
    icon: Lock,
    title: 'Datos seguros',
    text: 'Tratamos tu información conforme a la Ley 25.326.',
  },
]

const SECTIONS = [
  {
    id: 'aceptacion',
    icon: CheckCircle2,
    title: 'Aceptación de los Términos',
    content: `Al acceder y utilizar la plataforma Smile Book (en adelante, "el Servicio"), el usuario acepta estos Términos y Condiciones en su totalidad. Si no está de acuerdo con alguno de ellos, le solicitamos que no utilice el Servicio. El uso continuado del Servicio implica la aceptación de cualquier modificación a los presentes términos.`,
  },
  {
    id: 'descripcion',
    icon: CalendarCheck,
    title: 'Descripción del Servicio',
    content: `Smile Book es una plataforma de reservas online que permite a los pacientes agendar turnos con profesionales de la salud de forma rápida y segura. A través del Servicio, el usuario podrá consultar servicios disponibles, seleccionar fecha y horario, y confirmar su reserva, la cual será confirmada por WhatsApp y/o correo electrónico.`,
  },
  {
    id: 'reservas',
    icon: Clock,
    title: 'Reservas y Cancelaciones',
    content: `Las reservas realizadas a través de la plataforma están sujetas a disponibilidad. El paciente se compromete a asistir al turno reservado o a cancelarlo con al menos 24 horas de anticipación para permitir que otro paciente pueda ocupar ese espacio. Las cancelaciones tardías o las inasistencias sin aviso podrán estar sujetas a una penalización según el criterio del profesional.`,
  },
  {
    id: 'pagos',
    icon: CreditCard,
    title: 'Pagos',
    content: `Para aquellos servicios que lo requieran, el pago se procesará mediante Stripe de forma segura. El paciente autoriza el cargo por el monto correspondiente al servicio seleccionado. Los reembolsos serán gestionados según la política de cada establecimiento y las condiciones de Stripe aplicables.`,
  },
  {
    id: 'responsabilidad-usuario',
    icon: UserCheck,
    title: 'Responsabilidad del Usuario',
    content: `El usuario es responsable de proporcionar información veraz y completa al momento de realizar una reserva. Smile Book no se hace responsable por los datos incorrectos o incompletos proporcionados por el usuario, ni por las consecuencias derivadas de los mismos.`,
  },
  {
    id: 'comunicaciones',
    icon: MessageSquare,
    title: 'Comunicaciones',
    content: `Al realizar una reserva, el usuario acepta recibir comunicaciones por WhatsApp, correo electrónico o teléfono relacionadas con su turno: confirmaciones, recordatorios, reprogramaciones o cancelaciones. Estas comunicaciones son esenciales para el correcto funcionamiento del Servicio.`,
  },
  {
    id: 'propiedad-intelectual',
    icon: Copyright,
    title: 'Propiedad Intelectual',
    content: `Todo el contenido de la plataforma, incluyendo textos, imágenes, logotipos y diseño, es propiedad de Smile Book o de sus licenciantes y está protegido por las leyes de propiedad intelectual. Queda prohibida su reproducción, distribución o modificación sin autorización expresa.`,
  },
  {
    id: 'privacidad',
    icon: Lock,
    title: 'Privacidad de los Datos',
    content: `El tratamiento de los datos personales se realiza conforme a nuestra Política de Privacidad. Al utilizar el Servicio, el usuario acepta el tratamiento de sus datos de acuerdo con dicha política.`,
  },
  {
    id: 'limitacion',
    icon: Scale,
    title: 'Limitación de Responsabilidad',
    content: `Smile Book actúa como intermediario tecnológico entre pacientes y profesionales. No se hace responsable por el resultado de los tratamientos o servicios profesionales prestados. La responsabilidad por la prestación del servicio es exclusiva del profesional y del establecimiento que lo brinda.`,
  },
  {
    id: 'modificaciones',
    icon: RefreshCw,
    title: 'Modificaciones',
    content: `Smile Book se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios serán publicados en esta página y entrarán en vigencia desde su publicación. El uso continuado del Servicio después de dichos cambios constituye la aceptación de los mismos.`,
  },
  {
    id: 'ley-aplicable',
    icon: Landmark,
    title: 'Ley Aplicable y Jurisdicción',
    content: `Estos Términos y Condiciones se rigen por las leyes de la República Argentina. Para cualquier controversia que surja en relación con el Servicio, las partes se someten a los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.`,
  },
  {
    id: 'contacto',
    icon: Mail,
    title: 'Contacto',
    content: `Ante cualquier consulta sobre estos Términos y Condiciones, podés comunicarte con nosotros a través del formulario de contacto de la página principal o escribiendo a hola@smilebook.com.`,
  },
]

function useActiveSection() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const elements = SECTIONS.map((section) => document.getElementById(section.id)).filter(Boolean)
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-120px 0px -55% 0px', threshold: 0 }
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return activeId
}

function TableOfContents({ activeId, compact = false }) {
  return (
    <ol className={compact ? 'grid gap-x-4 gap-y-1 sm:grid-cols-2' : 'space-y-1'}>
      {SECTIONS.map((section, index) => {
        const isActive = activeId === section.id
        return (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={isActive ? 'location' : undefined}
              className={[
                'group flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm leading-snug transition-colors',
                isActive
                  ? 'bg-primary/5 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              ].join(' ')}
            >
              <span
                className={[
                  'mt-px w-5 shrink-0 text-right text-xs font-semibold tabular-nums',
                  isActive ? 'text-teal' : 'text-muted-foreground/60',
                ].join(' ')}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{section.title}</span>
            </a>
          </li>
        )
      })}
    </ol>
  )
}

function SectionBlock({ section, index }) {
  const Icon = section.icon

  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-title`}
      className="scroll-mt-28 py-8 first:pt-0 last:pb-0"
    >
      <div className="flex items-start gap-4">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary ring-1 ring-inset ring-primary/10">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h2 id={`${section.id}-title`} className="text-lg font-semibold tracking-tight sm:text-xl">
              {section.title}
            </h2>
          </div>
          <p className="mt-3 leading-relaxed text-muted-foreground">{section.content}</p>
        </div>
      </div>
    </section>
  )
}

export default function TermsPage() {
  const activeId = useActiveSection()

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
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
                <FileText className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
                Documento legal
              </span>

              <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-balance sm:text-5xl">
                Términos y{' '}
                <span className="relative whitespace-nowrap text-primary">
                  Condiciones
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
                Las reglas claras de uso de Smile Book. Conocé cómo funcionan las reservas, los
                pagos y cómo cuidamos tus datos personales.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-teal" aria-hidden="true" />
                  Actualizado en {LAST_UPDATED.toLowerCase()}
                </span>
                <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
                <span className="inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-teal" aria-hidden="true" />
                  {READING_TIME}
                </span>
                <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
                <span className="inline-flex items-center gap-2 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                  {VERSION}
                </span>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/book">
                  <Button size="lg" className="w-full sm:w-auto">
                    {CTA.primary}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
                <Link to="/contacto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-border/70 bg-background/80 sm:w-auto"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Hacer una consulta
                  </Button>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={120} className="lg:pl-4">
              <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-background/80 p-6 shadow-xl shadow-primary/5 backdrop-blur sm:p-7">
                <div
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal via-teal/40 to-transparent"
                  aria-hidden="true"
                />

                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-foreground">
                    Lo esencial
                  </h2>
                  <span className="rounded-full bg-teal/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-teal">
                    Resumen
                  </span>
                </div>

                <ul className="mt-5 space-y-4">
                  {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
                    <li key={title} className="flex items-start gap-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary ring-1 ring-inset ring-primary/10">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{title}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <p className="mt-5 border-t border-border/70 pt-4 text-xs leading-relaxed text-muted-foreground">
                  Este resumen es informativo. Las secciones completas del documento son las que
                  rigen el uso del Servicio.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[290px_minmax(0,1fr)]">
            {/* Índice escritorio */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <nav aria-label="Índice de contenidos">
                  <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Contenido
                  </p>
                  <div className="relative">
                    <span
                      className="absolute inset-y-1 left-0 w-px bg-border/70"
                      aria-hidden="true"
                    />
                    <TableOfContents activeId={activeId} />
                  </div>
                </nav>

                <div className="mt-8 rounded-xl border border-border/70 bg-muted/40 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ShieldCheck className="h-4 w-4 text-teal" aria-hidden="true" />
                    ¿Tenés dudas?
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Escribinos y te respondemos a la brevedad.
                  </p>
                  <a
                    href="mailto:hola@smilebook.com"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    hola@smilebook.com
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </aside>

            <div className="min-w-0">
              {/* Índice móvil */}
              <details className="group mb-6 rounded-xl border border-border/70 bg-card lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-teal" aria-hidden="true" />
                    Índice de contenidos
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    12 secciones
                    <ChevronDown
                      className="h-4 w-4 transition-transform duration-200 group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </span>
                </summary>
                <div className="border-t border-border/70 p-3">
                  <TableOfContents activeId={activeId} compact />
                </div>
              </details>

              <Reveal>
                <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8 lg:p-10">
                  <div className="divide-y divide-border/70">
                    {SECTIONS.map((section, index) => (
                      <SectionBlock key={section.id} section={section} index={index} />
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* CTA final */}
              <Reveal className="mt-8">
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
                        Todo listo
                      </p>
                      <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Reservá tu turno en minutos
                      </h2>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-300">
                        Elegí el servicio, la fecha y el horario que mejor te queden. Confirmación
                        inmediata y pago seguro.
                      </p>
                    </div>

                    <Link to="/book" className="shrink-0">
                      <Button size="lg" className="bg-white text-navy hover:bg-slate-100">
                        {CTA.primary}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Reveal>

              <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
                <p>
                  Última actualización: {LAST_UPDATED}. {VERSION}.
                </p>
                <a
                  href="#aceptacion"
                  className="group inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-inset ring-border transition-colors group-hover:bg-muted">
                    <ArrowUp className="h-3 w-3" aria-hidden="true" />
                  </span>
                  Volver al inicio del documento
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
