import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CTA } from '@/constants/copy'

const DEFAULT_LINKS = [
  { label: 'Inicio', to: '/' },
  { label: CTA.primary, to: '/book' },
]

function NavLink({ link, active, onClick }) {
  const isExternal = link.to?.startsWith('http')

  const className = cn(
    'px-3 py-1.5 text-sm rounded-md transition-colors',
    active
      ? 'text-primary font-medium'
      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
  )

  if (isExternal) {
    return (
      <a href={link.to} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        {link.icon && <link.icon className="w-4 h-4 mr-1.5 inline-block" />}
        {link.label}
      </a>
    )
  }

  return (
    <Link to={link.to} className={className} onClick={onClick}>
      {link.icon && <link.icon className="w-4 h-4 mr-1.5 inline-block" />}
      {link.label}
    </Link>
  )
}

function MobileNavLink({ link, active, onClick }) {
  const isExternal = link.to?.startsWith('http')

  const className = cn(
    'block px-3 py-2.5 rounded-md text-sm transition-colors',
    active
      ? 'bg-primary/10 text-primary font-medium'
      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
  )

  if (isExternal) {
    return (
      <a href={link.to} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        {link.icon && <link.icon className="w-4 h-4 mr-1.5 inline-block" />}
        {link.label}
      </a>
    )
  }

  return (
    <Link to={link.to} className={className} onClick={onClick}>
      {link.icon && <link.icon className="w-4 h-4 mr-1.5 inline-block" />}
      {link.label}
    </Link>
  )
}

export default function Header({ navLinks, showLogin = true }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const links = navLinks || DEFAULT_LINKS

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-background/95 backdrop-blur transition-shadow',
        scrolled && 'shadow-sm'
      )}
    >
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="Smile Book" className="w-7 h-7 object-contain" />
          <span className="font-bold text-base">Smile Book</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.label}
              link={link}
              active={!link.to?.startsWith('http') && location.pathname === link.to}
            />
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {showLogin && (
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5 px-2 min-h-[44px] flex items-center">
              Iniciar Sesión
            </Link>
          )}
          <Link to="/book">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Calendar className="w-4 h-4 mr-1.5" />
              {CTA.primary}
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-3 space-y-1">
            {links.map((link) => (
              <MobileNavLink
                key={link.label}
                link={link}
                active={!link.to?.startsWith('http') && location.pathname === link.to}
                onClick={() => setOpen(false)}
              />
            ))}
            <div className="border-t pt-3 mt-3 space-y-2">
              {showLogin && (
                <Link to="/login" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2.5 px-3 rounded-md min-h-[44px]">
                  Iniciar Sesión
                </Link>
              )}
              <Link to="/book" className="block">
                <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Calendar className="w-4 h-4 mr-1.5" />
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