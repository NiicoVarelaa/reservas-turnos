import { Link } from 'react-router-dom'
import { Check, LifeBuoy } from 'lucide-react'
import { cn } from '@/lib/utils'

export const ONBOARDING_STEPS = [
  {
    key: 'business',
    label: 'Negocio',
    description: 'Datos básicos',
  },
  {
    key: 'services',
    label: 'Servicios',
    description: 'Qué ofrecés',
  },
  {
    key: 'schedule',
    label: 'Horarios',
    description: 'Cuándo atendés',
  },
]

export function OnboardingErrorMessage({ message }) {
  if (!message) return null

  return (
    <div
      className="mb-5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      role="alert"
    >
      {message}
    </div>
  )
}

function Stepper({ currentKey }) {
  const currentIndex = Math.max(
    0,
    ONBOARDING_STEPS.findIndex((step) => step.key === currentKey)
  )

  return (
    <ol
      className="flex items-center gap-2 sm:gap-3"
      aria-label="Progreso de la configuración"
    >
      {ONBOARDING_STEPS.map((step, index) => {
        const done = index < currentIndex
        const active = index === currentIndex

        return (
          <li
            key={step.key}
            className={cn('flex items-center gap-2 sm:gap-3', index < ONBOARDING_STEPS.length - 1 && 'flex-1')}
            aria-current={active ? 'step' : undefined}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
                  done && 'border-teal/30 bg-teal/10 text-teal',
                  active &&
                    'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25',
                  !done && !active && 'border-border bg-muted/50 text-muted-foreground'
                )}
                aria-hidden="true"
              >
                {done ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    'truncate text-sm font-semibold',
                    active
                      ? 'text-foreground'
                      : done
                        ? 'text-foreground/80'
                        : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
                <p className="hidden truncate text-xs text-muted-foreground sm:block">
                  {step.description}
                </p>
              </div>
            </div>

            {index < ONBOARDING_STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={cn('h-px flex-1 rounded-full', done ? 'bg-teal/40' : 'bg-border')}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default function OnboardingLayout({ step, title, description, children }) {
  const currentIndex = Math.max(
    0,
    ONBOARDING_STEPS.findIndex((item) => item.key === step)
  )

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-muted/40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 top-8 h-72 w-72 rounded-full bg-teal/5 blur-3xl" />
        <div className="absolute -left-24 bottom-8 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Smile Book — Inicio"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card">
              <img src="/logo.png" alt="" className="h-5 w-5 object-contain" />
            </span>
            <span className="text-base font-bold tracking-tight">Smile Book</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground sm:block">
              Configuración inicial
            </span>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <LifeBuoy className="h-4 w-4" aria-hidden="true" />
              Ayuda
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 justify-center px-4 py-8 sm:items-center sm:px-6 sm:py-12">
        <div className="w-full max-w-3xl">
          <div className="mb-6">
            <Stepper currentKey={step} />
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl shadow-primary/[0.04] sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Paso {currentIndex + 1} de {ONBOARDING_STEPS.length}
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              )}
            </div>

            {children}
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Vas a poder cambiar todo esto cuando quieras desde tu panel.
          </p>
        </div>
      </main>
    </div>
  )
}
