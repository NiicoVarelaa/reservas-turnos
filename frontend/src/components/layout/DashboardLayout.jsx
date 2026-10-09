import { useState } from 'react'
import { Outlet, useNavigate, Link, Navigate, useLocation } from 'react-router-dom'
import { useIsAuthenticated, useAuthUser, useLogout } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { ToastViewport } from '@/components/ui/toast'
import InitialsAvatar from '@/components/ui/InitialsAvatar'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import {
  Calendar,
  Clock,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Scissors,
  Settings,
  UserCircle,
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/dashboard/bookings', icon: Calendar, label: 'Reservas' },
      { path: '/dashboard/services', icon: Scissors, label: 'Servicios' },
      { path: '/dashboard/schedule', icon: Clock, label: 'Horarios' },
    ],
  },
  {
    label: 'Configuración',
    items: [
      { path: '/dashboard/settings/business', icon: Settings, label: 'Mi Negocio' },
      { path: '/dashboard/profile', icon: UserCircle, label: 'Mi Perfil' },
    ],
  },
]

function isActiveItem(path, locationPathname) {
  return (
    locationPathname === path ||
    (path !== '/dashboard' && locationPathname.startsWith(path))
  )
}

function SidebarNav({ onNavClick }) {
  const location = useLocation()

  return (
    <nav aria-label="Menú del panel" className="space-y-6">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            {section.label}
          </p>
          <div className="space-y-1">
            {section.items.map((item) => {
              const active = isActiveItem(item.path, location.pathname)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onNavClick}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex items-center gap-3 px-3 min-h-11 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 group',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-teal"
                    />
                  )}
                  <item.icon
                    className={cn(
                      'w-5 h-5 shrink-0 transition-colors',
                      active
                        ? 'text-teal'
                        : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  <span className={cn(active && 'font-semibold')}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

function UserSection() {
  const user = useAuthUser()
  const logout = useLogout()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout.mutateAsync()
    navigate('/login')
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || '?'

  return (
    <div className="rounded-xl border bg-background p-3 space-y-3">
      <div className="flex items-center gap-3">
        <InitialsAvatar name={user?.full_name || user?.email} className="w-9 h-9 text-sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{user?.full_name || 'Usuario'}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 mr-2.5" />
        Cerrar sesión
      </Button>
    </div>
  )
}

function BrandBlock() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1" aria-label="Smile Book — Dashboard">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
        <img src="/logo.png" alt="" className="h-6 w-6 object-contain" />
      </span>
      <span className="text-base font-bold tracking-tight">
        Smile <span className="text-teal">Book</span>
      </span>
    </Link>
  )
}

function MobileHeader({ onMenuToggle, isOpen }) {
  return (
    <header className="lg:hidden border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <BrandBlock />
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isOpen}
          className="w-11 h-11"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>
    </header>
  )
}

function MobileSidebar({ open, onClose }) {
  return (
    <Drawer open={open} onOpenChange={(next) => { if (!next) onClose() }}>
      <DrawerContent side="left" className="w-72 max-w-none p-0">
        <div className="flex items-center justify-between px-4 h-14 border-b shrink-0">
          <BrandBlock />
        </div>
        <div className="flex flex-col h-[calc(100%-3.5rem)] p-4">
          <div className="flex-1 overflow-y-auto">
            <SidebarNav onNavClick={onClose} />
          </div>
          <div className="mt-4">
            <UserSection />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col w-72 border-r bg-card min-h-screen sticky top-0 h-screen">
      <div className="flex items-center px-6 h-16 border-b shrink-0">
        <BrandBlock />
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto py-5 px-3">
        <SidebarNav />

        <div className="mt-auto pt-5">
          <UserSection />
        </div>
      </div>
    </aside>
  )
}

export default function DashboardLayout() {
  const isAuthenticated = useIsAuthenticated()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader
        isOpen={mobileMenuOpen}
        onMenuToggle={() => setMobileMenuOpen(v => !v)}
      />

      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex">
        <DesktopSidebar />

        <main className="flex-1 min-h-screen">
          <div className="max-w-6xl mx-auto p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastViewport />
    </div>
  )
}