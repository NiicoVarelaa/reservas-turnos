import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Reveal from '@/components/ui/Reveal'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'
import { useBusinessBySlug } from '@/hooks/useBusiness'
import { cn } from '@/lib/utils'
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  HelpCircle,
  Mail,
  MessageSquare,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  X,
} from 'lucide-react'
import { CTA } from '@/constants/copy'

const LAST_UPDATED = 'Noviembre de 2026'

const CATEGORIES = [
  {
    id: 'reservas',
    label: 'Reservas',
    icon: CalendarCheck,
    blurb: 'Cómo agendar y gestionar tu turno.',
    questions: [
      {
        q: '¿Cómo reservo un turno?',
        a: 'Entrá a Reservar Turno, elegí el servicio que necesitás, seleccioná la fecha y el horario disponibles y completá tus datos. Al confirmar, vas a recibir la confirmación del turno por WhatsApp y/o correo electrónico.',
      },
      {
        q: '¿Necesito crear una cuenta para reservar?',
        a: 'No. Podés reservar como invitado completando tus datos de contacto. Si querés gestionar tus turnos y ver tu historial, podés crear una cuenta cuando quieras.',
      },
      {
        q: '¿Puedo reservar para otra persona?',
        a: 'Sí. Al completar la reserva, ingresá los datos de la persona que va a asistir. Las confirmaciones y recordatorios se enviarán al contacto que indiques.',
      },
      {
        q: '¿Qué hago si no encuentro un horario disponible?',
        a: 'Los horarios se muestran según la agenda del profesional. Si no ves opciones para la fecha que buscás, probá con otro día o escribinos por WhatsApp para que te ayudemos a encontrar el mejor turno.',
      },
    ],
  },
  {
    id: 'pagos',
    label: 'Pagos',
    icon: CreditCard,
    blurb: 'Medios de pago, seguridad y reembolsos.',
    questions: [
      {
        q: '¿Qué medios de pago puedo usar?',
        a: 'Podés pagar online con tarjeta de crédito o débito a través de Stripe. Algunos servicios también permiten abonar en el establecimiento; esa opción se indica al momento de reservar.',
      },
      {
        q: '¿Es seguro pagar en la plataforma?',
        a: 'Sí. Los pagos se procesan mediante Stripe, que cumple con el estándar PCI-DSS. Smile Book no almacena los datos de tu tarjeta.',
      },
      {
        q: '¿Cuándo se realiza el cobro?',
        a: 'El cobro se efectúa al confirmar la reserva para los servicios que requieren pago online. Si el servicio se abona en el lugar, no se realizará ningún cargo en la plataforma.',
      },
      {
        q: '¿Cómo solicito un reembolso?',
        a: 'Los reembolsos se gestionan según la política de cada establecimiento y las condiciones de Stripe. Escribinos a hola@smilebook.com o por WhatsApp y te acompañamos en el proceso.',
      },
      {
        q: '¿Puedo pagar en cuotas?',
        a: 'Las opciones de cuotas dependen del emisor de tu tarjeta y del servicio seleccionado. Las alternativas disponibles se muestran al momento del pago.',
      },
    ],
  },
  {
    id: 'turnos',
    label: 'Turnos y cancelaciones',
    icon: Clock,
    blurb: 'Cambios, avisos y recordatorios.',
    questions: [
      {
        q: '¿Cómo cancelo mi turno?',
        a: 'Podés cancelarlo desde el enlace de gestión que recibís en la confirmación o escribiéndonos por WhatsApp. Te pedimos avisar con al menos 24 horas de anticipación para liberar el espacio.',
      },
      {
        q: '¿Qué pasa si cancelo con poca anticipación?',
        a: 'Las cancelaciones tardías o inasistencias sin aviso podrán estar sujetas a una penalización según el criterio del profesional. Si tenés un imprevisto, contactanos: vamos a buscar la mejor solución.',
      },
      {
        q: '¿Qué pasa si llego tarde?',
        a: 'Te recomendamos llegar 10 minutos antes. Si te demorás, avisanos por WhatsApp; el profesional evaluará si puede atenderte manteniendo el turno o si es necesario reprogramarlo.',
      },
      {
        q: '¿Voy a recibir recordatorios?',
        a: 'Sí. Al reservar aceptás recibir comunicaciones relacionadas con tu turno por WhatsApp, correo electrónico o teléfono: confirmación, recordatorio y cualquier cambio de fecha u horario.',
      },
    ],
  },
  {
    id: 'servicios',
    label: 'Servicios y profesionales',
    icon: Stethoscope,
    blurb: 'Tratamientos, especialistas y atención.',
    questions: [
      {
        q: '¿Qué servicios puedo reservar?',
        a: 'La plataforma muestra los servicios disponibles con su duración, precio y profesional a cargo. Podés verlos todos en la sección Reservar Turno.',
      },
      {
        q: '¿Cómo elijo el servicio correcto?',
        a: 'Si no estás seguro, elegí el servicio de consulta o evaluación. El profesional va a revisar tu caso y recomendarte el tratamiento adecuado.',
      },
      {
        q: '¿Quiénes realizan los tratamientos?',
        a: 'Los servicios son prestados por profesionales matriculados del establecimiento. Smile Book funciona como plataforma tecnológica de reservas y no interviene en la atención clínica.',
      },
      {
        q: '¿Atienden urgencias?',
        a: 'La disponibilidad para urgencias depende de la agenda de cada profesional. Si tenés una urgencia, escribinos por WhatsApp y te orientamos lo antes posible.',
      },
    ],
  },
  {
    id: 'cuenta',
    label: 'Cuenta y datos',
    icon: ShieldCheck,
    blurb: 'Tu información, privacidad y cookies.',
    questions: [
      {
        q: '¿Cómo actualizo mis datos?',
        a: 'Si reservaste como invitado, enviá la corrección por WhatsApp o a hola@smilebook.com. Si tenés una cuenta, podés actualizar tus datos desde tu perfil.',
      },
      {
        q: '¿Qué hacen con mis datos personales?',
        a: 'Usamos tus datos para gestionar la reserva, enviar confirmaciones y recordatorios y mejorar el servicio. Los tratamos conforme a la Ley 25.326 y nuestra Política de Privacidad.',
      },
      {
        q: '¿Puedo pedir la eliminación de mis datos?',
        a: 'Sí. Podés ejercer tus derechos de acceso, rectificación, actualización y supresión escribiendo a hola@smilebook.com. Vamos a responder tu solicitud a la brevedad.',
      },
      {
        q: '¿La plataforma usa cookies?',
        a: 'Sí, usamos cookies propias y de terceros para el funcionamiento del sitio, recordar preferencias y analizar el uso de forma anónima. Podés configurarlas desde tu navegador.',
      },
    ],
  },
]

const TOTAL_QUESTIONS = CATEGORIES.reduce((total, category) => total + category.questions.length, 0)
const POPULAR_TOPICS = ['reservas', 'pagos', 'turnos', 'cuenta']

const normalize = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

function FaqItem({ item, open, onToggle }) {
  const answerId = `${item.id}-answer`
  const questionId = `${item.id}-question`

  return (
    <div className="border-b border-border/70 last:border-0">
      <h4>
        <button
          type="button"
          id={questionId}
          aria-expanded={open}
          aria-controls={answerId}
          onClick={onToggle}
          className="group flex w-full items-start justify-between gap-4 rounded-lg py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span
            className={cn(
              'text-[15px] font-medium leading-snug transition-colors',
              open ? 'text-primary' : 'text-foreground group-hover:text-primary'
            )}
          >
            {item.q}
          </span>
          <span
            className={cn(
              'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-200',
              open
                ? 'border-primary/20 bg-primary/5 text-primary'
                : 'border-border text-muted-foreground group-hover:border-primary/30 group-hover:text-primary'
            )}
            aria-hidden="true"
          >
            {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </span>
        </button>
      </h4>
      <div
        id={answerId}
        role="region"
        aria-labelledby={questionId}
        aria-hidden={!open}
        className={cn(
          'grid transition-all duration-300 ease-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <p className="pb-5 pr-8 text-sm leading-relaxed text-muted-foreground sm:pr-12">
            {item.a}
          </p>
        </div>
      </div>
    </div>
  )
}

function CategoryButton({ category, active, onClick, compact = false }) {
  const Icon = category.icon

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'group flex items-center gap-2.5 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        compact ? 'shrink-0 px-3.5 py-2' : 'w-full px-3 py-2.5',
        active
          ? 'bg-primary/5 font-medium text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-teal' : 'text-muted-foreground/70')} />
      <span className={compact ? 'whitespace-nowrap' : 'flex-1 text-left'}>{category.label}</span>
      {!compact && (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums',
            active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          )}
        >
          {category.questions.length}
        </span>
      )}
    </button>
  )
}

export default function FaqPage() {
  const { data: business } = useBusinessBySlug('clinica-dental-sonrisa')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [openId, setOpenId] = useState(`${CATEGORIES[0].id}-0`)

  const waNumber = (business?.whatsapp_number || '+5491112345678').replace(/\D/g, '')
  const contactEmail = business?.email || 'hola@smilebook.com'
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    'Hola Smile Book! Tengo una consulta sobre los turnos.'
  )}`

  const normalizedQuery = normalize(search.trim())

  const filteredCategories = useMemo(
    () =>
      CATEGORIES.filter(
        (category) => activeCategory === 'all' || category.id === activeCategory
      )
        .map((category) => ({
          ...category,
          questions: category.questions
            .map((item, index) => ({ ...item, id: `${category.id}-${index}` }))
            .filter(
              (item) =>
                !normalizedQuery ||
                normalize(`${item.q} ${item.a}`).includes(normalizedQuery)
            ),
        }))
        .filter((category) => category.questions.length > 0),
    [activeCategory, normalizedQuery]
  )

  const totalResults = filteredCategories.reduce(
    (total, category) => total + category.questions.length,
    0
  )

  const activeCategoryData = CATEGORIES.find((category) => category.id === activeCategory)
  const resultsHeading = normalizedQuery
    ? 'Resultados de búsqueda'
    : activeCategoryData?.label || 'Todos los temas'

  const resetFilters = () => {
    setSearch('')
    setActiveCategory('all')
  }

  const handleTopicClick = (categoryId) => {
    setActiveCategory(categoryId)
    setSearch('')
  }

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
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <HelpCircle className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
              Centro de ayuda
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-balance sm:text-5xl">
              Preguntas{' '}
              <span className="relative whitespace-nowrap text-primary">
                frecuentes
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

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Encontrá respuestas rápidas sobre reservas, pagos, turnos y el cuidado de tus datos.
              Si no está acá, escribinos.
            </p>

            <div role="search" className="mx-auto mt-8 max-w-xl">
              <label htmlFor="faq-search" className="sr-only">
                Buscar en preguntas frecuentes
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="faq-search"
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    if (event.target.value) setActiveCategory('all')
                  }}
                  placeholder="Buscar una pregunta, por ejemplo “cancelar turno”…"
                  className="h-12 w-full rounded-xl border border-border/80 bg-background/90 pl-11 pr-12 text-sm shadow-sm outline-none transition-shadow placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-search-cancel-button]:hidden"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Populares:</span>
              {POPULAR_TOPICS.map((topicId) => {
                const topic = CATEGORIES.find((category) => category.id === topicId)
                if (!topic) return null
                return (
                  <a
                    key={topic.id}
                    href="#temas"
                    onClick={() => handleTopicClick(topic.id)}
                    className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {topic.label}
                  </a>
                )
              })}
            </div>

            <p className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
              {TOTAL_QUESTIONS} respuestas
              <span className="h-3 w-px bg-border" aria-hidden="true" />
              Actualizado en {LAST_UPDATED.toLowerCase()}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Contenido */}
      <section id="temas" className="scroll-mt-20 py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[290px_minmax(0,1fr)]">
            {/* Temas escritorio */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-5">
                <nav aria-label="Temas de ayuda">
                  <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Temas
                  </p>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setActiveCategory('all')}
                      aria-pressed={activeCategory === 'all'}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        activeCategory === 'all'
                          ? 'bg-primary/5 font-medium text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Sparkles
                        className={cn(
                          'h-4 w-4 shrink-0',
                          activeCategory === 'all' ? 'text-teal' : 'text-muted-foreground/70'
                        )}
                      />
                      <span className="flex-1 text-left">Todos los temas</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                        {TOTAL_QUESTIONS}
                      </span>
                    </button>

                    {CATEGORIES.map((category) => (
                      <CategoryButton
                        key={category.id}
                        category={category}
                        active={activeCategory === category.id}
                        onClick={() => setActiveCategory(category.id)}
                      />
                    ))}
                  </div>
                </nav>

                <div className="rounded-xl border border-border/70 bg-muted/40 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <MessageSquare className="h-4 w-4 text-teal" aria-hidden="true" />
                    ¿No encontrás tu respuesta?
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Escribinos y te contestamos a la brevedad.
                  </p>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-[#25D366]/10 px-3 py-2 text-sm font-medium text-[#128C4A] transition-colors hover:bg-[#25D366]/20"
                  >
                    <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
                    Escribir por WhatsApp
                  </a>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="mt-2 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    {contactEmail}
                  </a>
                </div>
              </div>
            </aside>

            <div className="min-w-0">
              {/* Temas móvil */}
              <div className="-mx-4 mb-6 overflow-x-auto px-4 pb-2 lg:hidden">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCategory('all')}
                    aria-pressed={activeCategory === 'all'}
                    className={cn(
                      'shrink-0 rounded-full border px-3.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      activeCategory === 'all'
                        ? 'border-primary/20 bg-primary/5 font-medium text-primary'
                        : 'border-border/70 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Todos
                  </button>
                  {CATEGORIES.map((category) => (
                    <CategoryButton
                      key={category.id}
                      category={category}
                      active={activeCategory === category.id}
                      onClick={() => setActiveCategory(category.id)}
                      compact
                    />
                  ))}
                </div>
              </div>

              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-balance">
                    {resultsHeading}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {normalizedQuery
                      ? `Resultados para “${search.trim()}”`
                      : 'Respuestas claras para resolver tus dudas.'}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium tabular-nums text-muted-foreground">
                  {totalResults} {totalResults === 1 ? 'respuesta' : 'respuestas'}
                </span>
              </div>

              {totalResults === 0 ? (
                <div className="rounded-2xl border border-border/70 bg-card px-6 py-12 text-center shadow-sm">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <Search className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">No encontramos esa pregunta</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Probá con otras palabras o contanos tu consulta y te ayudamos a resolverla.
                  </p>
                  <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                    <Button type="button" variant="outline" onClick={resetFilters}>
                      Limpiar búsqueda
                    </Button>
                    <a href={waLink} target="_blank" rel="noopener noreferrer">
                      <Button type="button">
                        <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
                        Escribir por WhatsApp
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {filteredCategories.map((category) => {
                    const Icon = category.icon
                    return (
                      <section
                        key={category.id}
                        id={category.id}
                        aria-labelledby={`${category.id}-heading`}
                        className="scroll-mt-24"
                      >
                        <div className="mb-3 flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary ring-1 ring-inset ring-primary/10">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <div>
                            <h3
                              id={`${category.id}-heading`}
                              className="text-lg font-semibold tracking-tight"
                            >
                              {category.label}
                            </h3>
                            <p className="text-sm text-muted-foreground">{category.blurb}</p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border/70 bg-card px-5 shadow-sm sm:px-6">
                          {category.questions.map((item) => (
                            <FaqItem
                              key={item.id}
                              item={item}
                              open={openId === item.id}
                              onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                            />
                          ))}
                        </div>
                      </section>
                    )
                  })}
                </div>
              )}

              {/* CTA final */}
              <Reveal className="mt-10">
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
                        Seguimos para ayudarte
                      </p>
                      <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        ¿Seguís con dudas?
                      </h2>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-300">
                        Escribinos por WhatsApp o correo y te respondemos a la brevedad. También
                        podés reservar tu turno online en minutos.
                      </p>
                    </div>

                    <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
                      <a href={waLink} target="_blank" rel="noopener noreferrer">
                        <Button size="lg" className="w-full bg-white text-navy hover:bg-slate-100 sm:w-auto">
                          <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
                          WhatsApp
                        </Button>
                      </a>
                      <Link to="/book">
                        <Button
                          size="lg"
                          variant="outline"
                          className="w-full border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
                        >
                          {CTA.primary}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>

              <p className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
                <span>
                  Última actualización: {LAST_UPDATED}. ¿Ves algo desactualizado? Escribinos.
                </span>
                <Link
                  to="/terms"
                  className="inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
                >
                  Ver Términos y Condiciones
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
