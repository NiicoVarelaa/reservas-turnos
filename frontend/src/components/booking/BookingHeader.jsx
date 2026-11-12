import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export default function BookingHeader({
  backTo = '/',
  backLabel = 'Volver al inicio',
  badge = 'Pago seguro',
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 rounded-lg py-2 pr-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{backLabel}</span>
          </Link>
          <span aria-hidden="true" className="hidden h-5 w-px bg-border sm:block" />
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Smile Book — Inicio"
          >
            <img src="/logo.png" alt="" className="h-7 w-7 object-contain" />
            <span className="hidden text-sm font-bold sm:inline">Smile Book</span>
          </Link>
        </div>

        {badge && (
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <ShieldCheck className="h-4 w-4 text-teal" aria-hidden="true" />
            {badge}
          </span>
        )}
      </div>
    </header>
  )
}
