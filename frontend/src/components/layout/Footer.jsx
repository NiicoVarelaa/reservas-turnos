import { Link } from 'react-router-dom'
import { Calendar, Clock, Facebook, Instagram, Mail, MapPin, Phone, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'
import { CTA } from '@/constants/copy'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Inicio', to: '/' },
  { label: CTA.primary, to: '/book' },
  { label: 'Contacto', to: '#contacto' },
  { label: 'Acceso Profesional', to: '/login' },
]

const LEGAL_LINKS = [
  { label: 'Términos y Condiciones', to: '/terms' },
  { label: 'Política de Privacidad', to: '/legal' },
]

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://facebook.com', icon: Facebook },
  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
]

const HOURS = [
  { days: 'Lunes a Viernes', time: '9:00 - 18:00' },
  { days: 'Sábados', time: '9:00 - 14:00' },
]

function ColumnTitle({ children }) {
  return (
    <h4 className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-white">
      {children}
      <span className="h-px flex-1 bg-gradient-to-r from-white/25 to-transparent" aria-hidden="true" />
    </h4>
  )
}

function NavItem({ link }) {
  const external = link.to.startsWith('http')

  if (external) {
    return (
      <a
        href={link.to}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <span className="h-px w-0 bg-teal transition-all duration-300 group-hover:w-3" aria-hidden="true" />
        {link.label}
      </a>
    )
  }

  if (link.to.startsWith('#')) {
    return (
      <a
        href={link.to}
        className="group flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <span className="h-px w-0 bg-teal transition-all duration-300 group-hover:w-3" aria-hidden="true" />
        {link.label}
      </a>
    )
  }

  return (
    <Link
      to={link.to}
      className="group flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
    >
      <span className="h-px w-0 bg-teal transition-all duration-300 group-hover:w-3" aria-hidden="true" />
      {link.label}
    </Link>
  )
}

function ContactItem({ icon: Icon, children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 ring-1 ring-inset ring-white/10">
        <Icon className="h-4 w-4 text-teal" />
      </span>
      <span className="text-sm leading-relaxed text-slate-400">{children}</span>
    </li>
  )
}

function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="group inline-flex items-center gap-1.5 text-slate-400 transition-colors hover:text-white"
      aria-label="Volver arriba"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-inset ring-white/15 transition-colors group-hover:bg-white/10 group-hover:ring-white/30">
        <ArrowUp className="h-3 w-3" />
      </span>
      <span className="hidden sm:inline">Volver arriba</span>
    </button>
  )
}

function BottomBar() {
  return (
    <div className="border-t border-white/10">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:gap-6">
        <p>&copy; {new Date().getFullYear()} Smile Book. Todos los derechos reservados.</p>

        <nav aria-label="Enlaces legales" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <BackToTop />
      </div>
    </div>
  )
}

export default function Footer({ variant = 'compact', description, waNumber, contactPhone, contactEmail, contactAddress }) {
  if (variant === 'compact') {
    return (
      <footer className="bg-navy">
        <BottomBar />
      </footer>
    )
  }

  return (
    <footer className="bg-navy text-slate-300">
      <div
        className="h-1 w-full bg-gradient-to-r from-teal via-teal/35 to-transparent"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 pt-14 pb-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">

          {/* Brand + CTA */}
          <div className="lg:col-span-5">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/15">
                <img src="/logo.png" alt="" className="h-7 w-7 object-contain" />
              </span>
              <span className="text-lg font-bold text-white">Smile Book</span>
            </div>

            <p className="mb-6 max-w-sm text-sm leading-relaxed text-slate-400">
              {description}
            </p>

            <Link to="/book">
              <Button size="sm" className="bg-white px-5 font-medium text-navy hover:bg-slate-100">
                <Calendar className="mr-2 h-4 w-4" />
                {CTA.primary}
              </Button>
            </Link>

            <div className="mt-7 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-all hover:bg-teal hover:text-white"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-all hover:bg-teal hover:text-white"
              >
                <WhatsAppIcon className="h-[18px] w-[18px] text-[#25D366] transition-colors group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Navegación */}
          <nav aria-label="Navegación del pie" className="lg:col-span-3">
            <ColumnTitle>Navegación</ColumnTitle>
            <ul className="space-y-3.5">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavItem link={link} />
                </li>
              ))}
            </ul>
          </nav>

          {/* Contacto */}
          <div className="lg:col-span-4">
            <ColumnTitle>Contacto</ColumnTitle>
            <ul className="space-y-4">
              <ContactItem icon={Phone}>{contactPhone}</ContactItem>
              <ContactItem icon={Mail}>{contactEmail}</ContactItem>
              <ContactItem icon={MapPin}>{contactAddress}</ContactItem>
            </ul>

            <div className="mt-7">
              <ColumnTitle>Horarios</ColumnTitle>
              <ul className="space-y-2.5">
                {HOURS.map(({ days, time }) => (
                  <li key={days} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-400">{days}</span>
                    <span className="font-medium text-white">{time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>

      <BottomBar />
    </footer>
  )
}
