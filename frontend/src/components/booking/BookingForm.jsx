import { useState } from 'react'
import { useBookingStore } from '../../store/bookingStore'

export default function BookingForm({ onSubmit, loading }) {
  const { clientInfo, setClientInfo } = useBookingStore()
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}

    if (!clientInfo.name.trim() || clientInfo.name.length < 2) {
      newErrors.name = 'Nombre debe tener al menos 2 caracteres'
    }

    if (!clientInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientInfo.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!clientInfo.phone || clientInfo.phone.length < 7) {
      newErrors.phone = 'Teléfono inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(clientInfo)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium mb-1"
        >
          Nombre completo
        </label>
        <input
          id="name"
          type="text"
          value={clientInfo.name}
          onChange={(e) => setClientInfo({ name: e.target.value })}
          className={`w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.name ? 'border-destructive' : 'border-input'
          }`}
          placeholder="Juan Pérez"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive mt-1" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium mb-1"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={clientInfo.email}
          onChange={(e) => setClientInfo({ email: e.target.value })}
          className={`w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.email ? 'border-destructive' : 'border-input'
          }`}
          placeholder="juan@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive mt-1" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium mb-1"
        >
          Teléfono
        </label>
        <input
          id="phone"
          type="tel"
          value={clientInfo.phone}
          onChange={(e) => setClientInfo({ phone: e.target.value })}
          className={`w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.phone ? 'border-destructive' : 'border-input'
          }`}
          placeholder="+5491112345678"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
        />
        {errors.phone && (
          <p id="phone-error" className="text-sm text-destructive mt-1" role="alert">
            {errors.phone}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Procesando...' : 'Confirmar Reserva'}
      </button>
    </form>
  )
}
