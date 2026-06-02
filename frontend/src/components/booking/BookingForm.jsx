import { useState } from 'react'
import { useBookingStore } from '@/store/bookingStore'
import { bookingSchema } from '@/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function BookingForm({ onSubmit, loading }) {
  const { clientInfo, setClientInfo } = useBookingStore()
  const [errors, setErrors] = useState({})

  const validate = () => {
    const result = bookingSchema.safeParse(clientInfo)
    if (!result.success) {
      const formatted = {}
      result.error.errors.forEach(err => { formatted[err.path[0]] = err.message })
      setErrors(formatted)
      return false
    }
    setErrors({})
    return true
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
              onChange={(e) => { setClientInfo({ name: e.target.value }); setErrors(prev => { const n = {...prev}; delete n.name; return n }) }}
              placeholder="Juan Pérez"
              className={errors.name ? 'border-destructive' : ''}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={clientInfo.email}
              onChange={(e) => { setClientInfo({ email: e.target.value }); setErrors(prev => { const n = {...prev}; delete n.email; return n }) }}
              placeholder="juan@example.com"
              className={errors.email ? 'border-destructive' : ''}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={clientInfo.phone}
              onChange={(e) => { setClientInfo({ phone: e.target.value }); setErrors(prev => { const n = {...prev}; delete n.phone; return n }) }}
              placeholder="+5491112345678"
              className={errors.phone ? 'border-destructive' : ''}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Procesando...' : 'Confirmar Reserva'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
