import { Link } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Reveal from '@/components/ui/Reveal'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CalendarPlus, Home, Mail, Search } from 'lucide-react'
import { CTA } from '@/constants/copy'

const SUGGESTIONS = [
  {
    to: '/',
    icon: Home,
    title: 'Inicio',
    text: 'Volvé a la página principal.',
  },
  {
    to: '/book',
    icon: CalendarPlus,
    title: 'Reservar un turno',
    text: 'Elegí servicio, profesional y horario.',
  },
  {
    to: '/contacto',
    icon: Mail,
    title: 'Contacto',
    text: 'Escribinos y te respondemos.',
  },
]

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="relative flex-1 overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-teal/10 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
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

        <div className="container relative mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center lg:py-24">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <Search className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
              Error 404
            </span>

            <div className="relative mt-6">
              <p
                aria-hidden="true"
                className="select-none text-[7rem] font-bold leading-none tracking-tighter text-primary/10 sm:text-[9rem]"
              >
                404
              </p>
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background shadow-lg shadow-primary/10 ring-1 ring-inset ring-border sm:h-20 sm:w-20">
                  <img src="/logo.png" alt="" className="h-9 w-9 object-contain sm:h-11 sm:w-11" />
                </span>
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              No encontramos esta página
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              Puede que el enlace esté mal escrito o que la página se haya movido. Mientras tanto,
              podés volver al inicio o reservar tu turno en minutos.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/">
                <Button variant="outline" size="lg" className="w-full rounded-xl sm:w-auto">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Volver al inicio
                </Button>
              </Link>
              <Link to="/book">
                <Button size="lg" className="w-full rounded-xl shadow-lg shadow-primary/20 sm:w-auto">
                  <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                  {CTA.primary}
                </Button>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120} className="mt-14 w-full">
            <div className="grid gap-3 text-left sm:grid-cols-3">
              {SUGGESTIONS.map(({ to, icon: Icon, title, text }) => (
                <Link
                  key={to}
                  to={to}
                  className="group rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary ring-1 ring-inset ring-primary/10 transition-colors group-hover:bg-teal/10 group-hover:text-teal">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  )
}
