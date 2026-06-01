import { useState } from 'react'
import { useBookingStore } from '@/store/bookingStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    <Card>
      <CardHeader>
        <CardTitle>Tus datos</CardTitle>
        <CardDescription>
          Completá tu información para confirmar la reserva
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              type="text"
              value={clientInfo.name}
              onChange={(e) => setClientInfo({ name: e.target.value })}
              placeholder="Juan Pérez"
              className={errors.name ? 'border-destructive' : ''}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={clientInfo.email}
              onChange={(e) => setClientInfo({ email: e.target.value })}
              placeholder="juan@example.com"
              className={errors.email ? 'border-destructive' : ''}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={clientInfo.phone}
              onChange={(e) => setClientInfo({ phone: e.target.value })}
              placeholder="+5491112345678"
              className={errors.phone ? 'border-destructive' : ''}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Procesando...' : 'Confirmar Reserva'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
