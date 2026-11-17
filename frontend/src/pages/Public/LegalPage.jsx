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
  CalendarDays,
  ChevronDown,
  Cookie,
  Copyright,
  FileText,
  Landmark,
  Lock,
  Mail,
  RefreshCw,
  Scale,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { CTA } from '@/constants/copy'

const LAST_UPDATED = 'Agosto de 2026'
const READING_TIME = '4 min de lectura'
const VERSION = 'Versión 2.0'

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: 'Tus datos, protegidos',
    text: 'Tratamos la información personal según la Ley 25.326.',
  },
  {
    icon: Cookie,
    title: 'Cookies bajo control',
    text: 'Podés desactivarlas desde la configuración de tu navegador.',
  },
  {
    icon: Lock,
    title: 'Pagos seguros',
    text: 'Stripe procesa las transacciones; no guardamos datos de tarjetas.',
  },
]

const SECTIONS = [
  {
    id: 'informacion-legal',
    icon: Scale,
    title: 'Información Legal',
    content: `Smile Book es una plataforma digital de reservas de turnos para profesionales de la salud, operada por Clínica Dental Sonrisa, con domicilio en Av. Siempre Viva 123, Buenos Aires, Argentina, e-mail de contacto: hola@smilebook.com. El acceso y uso de este sitio web implica la aceptación de las presentes condiciones legales.`,
  },
  {
    id: 'objeto',
    icon: BookOpen,
    title: 'Objeto',
    content: `El presente documento regula el uso del sitio web y de los servicios de reserva online ofrecidos por Smile Book. A través de la plataforma, los pacientes pueden consultar servicios, seleccionar profesionales, fecha y horario, y gestionar sus turnos de manera segura.`,
  },
  {
    id: 'privacidad',
    icon: Lock,
    title: 'Política de Privacidad',
    content: `En cumplimiento de la Ley N° 25.326 de Protección de los Datos Personales de la República Argentina, le informamos que los datos personales que nos proporciona al registrarse o reservar un turno son incorporados a una base de datos cuyo responsable es Clínica Dental Sonrisa. Sus datos serán utilizados exclusivamente para: gestionar las reservas solicitadas, enviar confirmaciones y recordatorios de turnos, y comunicar novedades relevantes del servicio si usted lo autoriza.`,
  },
  {
    id: 'finalidad',
    icon: UserCheck,
    title: 'Finalidad y Cesión de Datos',
    content: `Los datos recolectados no serán cedidos, vendidos ni compartidos con terceros, salvo cuando sea necesario para la prestación del servicio (por ejemplo, la pasarela de pago Stripe para procesar transacciones) o cuando exista obligación legal. El usuario podrá ejercer los derechos de acceso, rectificación, actualización y supresión de sus datos personales comunicándose a hola@smilebook.com o a través de los canales de contacto de la plataforma.`,
  },
  {
    id: 'cookies',
    icon: Cookie,
    title: 'Política de Cookies',
    content: `Este sitio web utiliza cookies propias y de terceros con el fin de garantizar el correcto funcionamiento de la plataforma, recordar las preferencias de navegación y analizar el uso del sitio de forma anónima para mejorar la experiencia. Podrá configurar o deshabilitar las cookies desde la configuración de su navegador. La desactivación de cookies técnicas puede afectar el correcto funcionamiento del proceso de reserva.`,
  },
  {
    id: 'seguridad',
    icon: ShieldCheck,
    title: 'Seguridad de los Datos',
    content: `Adoptamos medidas técnicas y organizativas adecuadas para proteger sus datos personales contra accesos no autorizados, pérdida o alteración. Los pagos realizados a través de la plataforma son procesados por Stripe bajo estándares de seguridad PCI-DSS; Smile Book no almacena datos de tarjetas de crédito.`,
  },
  {
    id: 'propiedad-intelectual',
    icon: Copyright,
    title: 'Propiedad Intelectual',
    content: `Los contenidos del sitio, incluyendo textos, imágenes, logotipos, gráficos y software, son propiedad de Smile Book o de sus titulares legítimos y están protegidos por la normativa de propiedad intelectual. Queda prohibida su reproducción total o parcial sin autorización expresa.`,
  },
  {
    id: 'responsabilidad',
    icon: Scale,
    title: 'Responsabilidad',
    content: `Smile Book no se hace responsable por la información proporcionada por los pacientes al momento de la reserva ni por los resultados clínicos de los tratamientos, siendo el profesional interviniente el responsable de la práctica profesional. El sitio podría contener enlaces a sitios externos cuya política de privacidad es ajena a la presente.`,
  },
  {
    id: 'modificaciones',
    icon: RefreshCw,
    title: 'Modificaciones',
    content: `Nos reservamos el derecho de actualizar el presente aviso legal y la política de privacidad en función de cambios normativos o de la evolución de la plataforma. Las modificaciones serán publicadas en esta página y entrarán en vigencia desde su publicación.`,
  },
  {
    id: 'legislacion',
    icon: Landmark,
    title: 'Legislación Aplicable',
    content: `Estos términos legales se rigen por la legislación de la República Argentina. Para cualquier controversia que pudiera derivarse del uso del sitio, las partes se someten a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.`,
  },
  {
    id: 'contacto',
    icon: Mail,
    title: 'Contacto',
    content: `Ante cualquier consulta sobre este aviso legal, la política de privacidad o el tratamiento de sus datos personales, podrá escribirnos a hola@smilebook.com o utilizar el formulario de contacto disponible en la página principal.`,
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

export default function LegalPage() {
  const activeId = useActiveSection()

  return (
    <div className="min-h-screen bg-background">
      <Header />

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
                Aviso legal y{' '}
                <span className="relative whitespace-nowrap text-primary">
                  privacidad
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
                Cómo tratamos tus datos, qué cookies usamos y cuáles son las condiciones de uso de
                Smile Book. Todo claro y en un solo lugar.
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
                <Link to="/contacto">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Hacer una consulta
                  </Button>
                </Link>
                <Link to="/terms">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-border/70 bg-background/80 sm:w-auto"
                  >
                    Ver términos y condiciones
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
                  rigen el tratamiento de tus datos.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[290px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <nav aria-label="Índice de contenidos">
                  <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Contenido
                  </p>
                  <div className="relative">
                    <span className="absolute inset-y-1 left-0 w-px bg-border/70" aria-hidden="true" />
                    <TableOfContents activeId={activeId} />
                  </div>
                </nav>

                <div className="mt-8 rounded-xl border border-border/70 bg-muted/40 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ShieldCheck className="h-4 w-4 text-teal" aria-hidden="true" />
                    Tus derechos
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Podés pedir acceso, rectificación o supresión de tus datos escribiéndonos.
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
              <details className="group mb-6 rounded-xl border border-border/70 bg-card lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-teal" aria-hidden="true" />
                    Índice de contenidos
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {SECTIONS.length} secciones
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
                  href="#informacion-legal"
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
