import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CTA } from '@/constants/copy'

const DEFAULT_LINKS = [
  { label: 'Inicio', to: '/' },
  { label: CTA.primary, to: '/book' },
]

const LINK_BASE =
  'inline-flex items-center justify-center gap-2 min-h-[44px] px-4 text-sm font-medium rounded-lg transition-colors'

function linkStyles(active) {
  return cn(
    LINK_BASE,
    'relative',
    active
      ? 'text-primary'
      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
  )
}

function ActiveIndicator() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-teal"
    />
  )
}

function NavLink({ link, active, onClick, mobile }) {
  const isExternal = link.to?.startsWith('http')
  const className = cn(
    mobile ? 'w-full justify-start' : linkStyles(active),
    !mobile && active && 'font-semibold'
  )

  if (isExternal) {
    return (
      <a
        href={link.to}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {link.icon && <link.icon className="w-4 h-4 shrink-0" />}
        {link.label}
        {!mobile && active && <ActiveIndicator />}
      </a>
    )
  }

  return (
    <Link
      to={link.to}
      className={className}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
    >
      {link.icon && <link.icon className="w-4 h-4 shrink-0" />}
      {link.label}
      {!mobile && active && <ActiveIndicator />}
    </Link>
  )
}

export default function Header({ navLinks, showLogin = true }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuButtonRef = useRef(null)
  const location = useLocation()
  const links = navLinks || DEFAULT_LINKS

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const isActive = (link) =>
    !link.to?.startsWith('http') && link.to !== '#' && location.pathname === link.to

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-background/90 backdrop-blur-md transition-all duration-300',
        scrolled ? 'shadow-sm border-b border-border/60' : 'border-b border-transparent'
      )}
    >
      <div
        className={cn(
          'container mx-auto px-4 flex items-center justify-between gap-4 transition-all duration-300',
          scrolled ? 'h-14' : 'h-16'
        )}
      >
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label="Smile Book — Inicio">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <img src="/logo.png" alt="" className="h-6 w-6 object-contain" />
          </span>
          <span className="text-base font-bold tracking-tight">
            Smile <span className="text-teal">Book</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Principal" className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <NavLink key={link.label} link={link} active={isActive(link)} />
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          {showLogin && (
            <Link
              to="/login"
              className="inline-flex items-center justify-center min-h-[44px] px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Iniciar Sesión
            </Link>
          )}
          <Link to="/book">
            <Button size="sm" className="h-10 bg-primary text-primary-foreground hover:bg-primary/90">
              <Calendar className="w-4 h-4" />
              {CTA.primary}
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="md:hidden border-b border-border/60 bg-background">
          <nav aria-label="Menú móvil" className="container mx-auto px-4 py-4 space-y-1 animate-fade-in-down">
            {links.map((link) => (
              <NavLink
                key={link.label}
                link={link}
                active={isActive(link)}
                mobile
                onClick={() => setOpen(false)}
              />
            ))}
            <div className="border-t pt-4 mt-4 space-y-2">
              {showLogin && (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center w-full min-h-[44px] text-sm font-medium text-foreground hover:text-primary rounded-lg transition-colors"
                >
                  Iniciar Sesión
                </Link>
              )}
              <Link to="/book" onClick={() => setOpen(false)} className="block">
                <Button size="sm" className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Calendar className="w-4 h-4" />
                  {CTA.primary}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}