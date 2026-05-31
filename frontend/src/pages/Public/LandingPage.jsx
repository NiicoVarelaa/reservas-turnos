export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Booking System</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <section className="text-center py-12">
          <h2 className="text-4xl font-bold mb-4">Book Your Appointment</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Select a service, choose a time, and confirm your booking in seconds.
          </p>
        </section>
      </main>
    </div>
  )
}
