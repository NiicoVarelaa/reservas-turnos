import { useState } from 'react'
import { Outlet, useNavigate, Link, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { ToastViewport } from '@/components/ui/toast'
import {
  Calendar,
  Clock,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/dashboard/bookings', icon: Calendar, label: 'Reservas' },
  { path: '/dashboard/schedule', icon: Clock, label: 'Horarios' },
]

function SidebarNav({ onNavClick }) {
  const location = useLocation()

  return (
    <nav className="space-y-1 px-3">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path ||
          (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
              isActive
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <item.icon className={`w-5 h-5 shrink-0 transition-colors ${
              isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
            }`} />
            <span>{item.label}</span>
            {isActive && (
              <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

function UserSection() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || '?'

  return (
    <div className="border-t pt-4 px-3 space-y-3">
      <div className="flex items-center gap-3 px-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
          {initials}
        </div>
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

function MobileHeader({ onMenuToggle, isOpen }) {
  return (
    <header className="lg:hidden border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
          <img src="/logo.png" alt="Smile Book" className="w-8 h-8 object-contain" />
          <span>Smile Book</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={onMenuToggle} aria-label="Abrir menú">
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>
    </header>
  )
}

function MobileSidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-card border-r shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between px-4 h-14 border-b">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-lg" onClick={onClose}>
            <img src="/logo.png" alt="Smile Book" className="w-8 h-8 object-contain" />
            <span>Smile Book</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar menú">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex flex-col h-[calc(100%-3.5rem)] p-4">
          <SidebarNav onNavClick={onClose} />
          <div className="mt-auto">
            <UserSection />
          </div>
        </div>
      </aside>
    </>
  )
}

function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 border-r bg-card min-h-screen">
      <div className="flex items-center gap-2.5 px-6 h-16 border-b shrink-0">
        <img src="/logo.png" alt="Smile Book" className="w-9 h-9 object-contain" />
        <div>
          <p className="font-semibold text-sm leading-tight">Smile Book</p>
          <p className="text-xs text-muted-foreground leading-tight">Panel de control</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col py-4">
        <SidebarNav />

        <div className="mt-auto">
          <UserSection />
        </div>
      </div>
    </aside>
  )
}

export default function DashboardLayout() {
  const { isAuthenticated, loading } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    )
  }

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
