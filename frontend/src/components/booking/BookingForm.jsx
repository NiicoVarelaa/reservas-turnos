import { useState } from 'react'
import { useBookingStore } from '@/store/bookingStore'
import { bookingSchema, formatZodErrors } from '@/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import SecurePaymentBadge from '@/components/booking/SecurePaymentBadge'
import { ArrowRight, Lock, Mail, Phone, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'

const FIELD_IDS = { name: 'booking-name', email: 'booking-email', phone: 'booking-phone' }
const FIELD_ORDER = ['name', 'email', 'phone']

export default function BookingForm({ onSubmit, loading }) {
  const { clientInfo, setClientInfo } = useBookingStore()
  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setClientInfo({ [field]: value })
    setErrors((previous) => {
      if (!previous[field]) return previous
      const next = { ...previous }
      delete next[field]
      return next
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const result = bookingSchema.safeParse(clientInfo)
    if (!result.success) {
      const nextErrors = formatZodErrors(result.error)
      setErrors(nextErrors)
      const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field])
      if (firstInvalid) document.getElementById(FIELD_IDS[firstInvalid])?.focus()
      return
    }

    setErrors({})
    onSubmit(clientInfo)
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
        <p>Usamos tus datos solo para confirmar el turno y enviarte el recordatorio por WhatsApp.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={FIELD_IDS.name}>Nombre completo</Label>
            <div className="relative">
              <UserRound
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id={FIELD_IDS.name}
                name="name"
                value={clientInfo.name}
                onChange={(event) => handleChange('name', event.target.value)}
                placeholder="Juan Pérez"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'booking-name-error' : undefined}
                className={cn(
                  'h-11 rounded-xl pl-10',
                  errors.name && 'border-destructive focus-visible:ring-destructive'
                )}
              />
            </div>
            {errors.name && (
              <p id="booking-name-error" role="alert" className="text-xs text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={FIELD_IDS.email}>Email</Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id={FIELD_IDS.email}
                name="email"
                type="email"
                value={clientInfo.email}
                onChange={(event) => handleChange('email', event.target.value)}
                placeholder="juan@email.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'booking-email-error' : undefined}
                className={cn(
                  'h-11 rounded-xl pl-10',
                  errors.email && 'border-destructive focus-visible:ring-destructive'
                )}
              />
            </div>
            {errors.email && (
              <p id="booking-email-error" role="alert" className="text-xs text-destructive">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={FIELD_IDS.phone}>Teléfono</Label>
          <div className="relative">
            <Phone
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id={FIELD_IDS.phone}
              name="phone"
              type="tel"
              value={clientInfo.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
              placeholder="+5491112345678"
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'booking-phone-error' : 'booking-phone-hint'}
              className={cn(
                'h-11 rounded-xl pl-10',
                errors.phone && 'border-destructive focus-visible:ring-destructive'
              )}
            />
          </div>
          {errors.phone ? (
            <p id="booking-phone-error" role="alert" className="text-xs text-destructive">
              {errors.phone}
            </p>
          ) : (
            <p id="booking-phone-hint" className="text-xs text-muted-foreground">
              Te enviamos la confirmación y el recordatorio por WhatsApp.
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-shadow hover:shadow-primary/30"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Procesando...
            </span>
          ) : (
            <>
              Confirmar reserva
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>

        <SecurePaymentBadge className="justify-center" />
      </form>
    </div>
  )
}
