import { Outlet } from 'react-router-dom'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <aside className="w-64 border-r p-4">
        <nav>
          <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
          <ul className="space-y-2">
            <li><a href="/dashboard" className="block p-2 rounded hover:bg-accent">Overview</a></li>
            <li><a href="/dashboard/bookings" className="block p-2 rounded hover:bg-accent">Bookings</a></li>
            <li><a href="/dashboard/schedule" className="block p-2 rounded hover:bg-accent">Schedule</a></li>
          </ul>
        </nav>
      </aside>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
