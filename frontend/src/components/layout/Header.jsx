import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEFAULT_LINKS = [
  { label: 'Inicio', to: '/' },
  { label: 'Reservar Turno', to: '/book' },
]

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
            <Link
              key={link.label}
              to={link.to}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                location.pathname === link.to
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          {showLogin && (
            <Link to="/login">
              <Button variant="ghost" size="sm">Iniciar Sesión</Button>
            </Link>
          )}
          <Link to="/book">
            <Button size="sm" className="bg-[#11b7c1] hover:bg-[#0e9aa3] text-white">
              <Calendar className="w-4 h-4 mr-1.5" />
              Reservar
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
              <Link
                key={link.label}
                to={link.to}
                className={cn(
                  'block px-3 py-2.5 rounded-md text-sm transition-colors',
                  location.pathname === link.to
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t pt-3 mt-3 space-y-2">
              {showLogin && (
                <Link to="/login" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Iniciar Sesión
                  </Button>
                </Link>
              )}
              <Link to="/book" className="block">
                <Button size="sm" className="w-full bg-[#11b7c1] hover:bg-[#0e9aa3] text-white">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  Reservar Turno
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}