export default function DashboardHome() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm text-muted-foreground">Total Bookings</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm text-muted-foreground">Today</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm text-muted-foreground">Revenue</h3>
          <p className="text-3xl font-bold mt-2">$0</p>
        </div>
      </div>
    </div>
  )
}
