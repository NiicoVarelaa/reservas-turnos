import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, ShieldCheck, Sparkles, Star } from 'lucide-react'
import InitialsAvatar from '@/components/ui/InitialsAvatar'
import { cn } from '@/lib/utils'

const PROOF_AVATARS = ['María López', 'Carlos García', 'Ana Rodríguez']

export function AuthSpinner({ className }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} aria-hidden="true" />
}

export function AuthErrorMessage({ message, icon: Icon }) {
  if (!message) return null

  return (
    <div
      className="mb-5 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
      role="alert"
    >
      {Icon && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/20">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      )}
      <p>{message}</p>
    </div>
  )
}

function BrandPanel({
  brandEyebrow,
  headline,
  description,
  features,
  featuresOrdered,
  proof,
}) {
  const List = featuresOrdered ? 'ol' : 'ul'

  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-navy via-navy to-primary lg:flex lg:w-[46%] xl:w-[48%]">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-teal/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.55) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
        <Link
          to="/"
          className="flex w-fit items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          aria-label="Smile Book — Inicio"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/15">
            <img src="/logo.png" alt="" className="h-6 w-6 object-contain" />
          </span>
          <span className="text-lg font-bold text-white">Smile Book</span>
        </Link>

        <div className="max-w-md py-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
            {brandEyebrow}
          </span>

          <h2 className="mt-5 text-[2.15rem] font-bold leading-[1.15] tracking-tight text-white text-balance xl:text-4xl">
            {headline}
          </h2>
          {description && (
            <p className="mt-4 text-base leading-relaxed text-white/65">{description}</p>
          )}

          {features.length > 0 && (
            <List className="mt-9 space-y-5">
              {features.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-inset ring-white/10">
                    <Icon className="h-4 w-4 text-teal" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/55">{text}</p>
                  </div>
                </li>
              ))}
            </List>
          )}
        </div>

        <div>
          {proof && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex -space-x-2" aria-hidden="true">
                  {PROOF_AVATARS.map((name) => (
                    <InitialsAvatar
                      key={name}
                      name={name}
                      className="h-8 w-8 text-[10px] ring-2 ring-navy"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-0.5 text-teal" aria-label="Calificación 4.9 de 5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3 w-3 fill-current" aria-hidden="true" />
                  ))}
                  <span className="ml-1.5 text-xs font-medium text-white/70">4.9</span>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/75">“{proof.quote}”</p>
              <p className="mt-1.5 text-xs text-white/45">{proof.author}</p>
            </div>
          )}

          <p className="mt-5 text-xs text-white/40">
            © {new Date().getFullYear()} Smile Book ·{' '}
            <Link to="/terms" className="transition-colors hover:text-white/70">
              Términos
            </Link>{' '}
            ·{' '}
            <Link to="/legal" className="transition-colors hover:text-white/70">
              Privacidad
            </Link>
          </p>
        </div>
      </div>
    </aside>
  )
}

export default function AuthLayout({
  brandEyebrow = 'Acceso',
  headline,
  description,
  features = [],
  featuresOrdered = false,
  proof,
  topRight,
  cardEyebrow,
  cardTitle,
  cardDescription,
  children,
  footer,
  secureNote = 'Conexión segura. Tus credenciales están protegidas.',
  maxWidth = 'max-w-lg',
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <BrandPanel
        brandEyebrow={brandEyebrow}
        headline={headline}
        description={description}
        features={features}
        featuresOrdered={featuresOrdered}
        proof={proof}
      />

      <main className="flex flex-1 flex-col">
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border/70 bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver
          </Link>
          <Link to="/" className="flex items-center gap-2" aria-label="Smile Book — Inicio">
            <img src="/logo.png" alt="" className="h-6 w-6 object-contain" />
            <span className="text-sm font-bold">Smile Book</span>
          </Link>
        </div>

        <div className="relative flex flex-1 items-center justify-center bg-gradient-to-b from-background via-background to-muted/30 p-6 sm:p-10 lg:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -right-24 top-8 h-64 w-64 rounded-full bg-teal/5 blur-3xl" />
            <div className="absolute -left-24 bottom-8 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className={cn('relative w-full', maxWidth)}>
            <div className="mb-6 hidden items-center justify-between gap-4 lg:flex">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Volver al inicio
              </Link>
              {topRight}
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl shadow-primary/[0.04] sm:p-8">
              {(cardEyebrow || cardTitle) && (
                <>
                  {cardEyebrow && (
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      {cardEyebrow}
                    </p>
                  )}
                  {cardTitle && (
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance">
                      {cardTitle}
                    </h1>
                  )}
                  {cardDescription && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {cardDescription}
                    </p>
                  )}
                </>
              )}

              {children}

              {footer && (
                <div className="mt-6 border-t border-border/70 pt-5 text-center text-sm text-muted-foreground lg:hidden">
                  {footer}
                </div>
              )}
            </div>

            {secureNote && (
              <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
                {secureNote}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
