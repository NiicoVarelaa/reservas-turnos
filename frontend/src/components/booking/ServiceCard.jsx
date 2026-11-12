import { Clock, MapPin, Stethoscope, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useBookingStore } from '@/store/bookingStore'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency } from '@/lib/utils'
import { CTA } from '@/constants/copy'

export default function ServiceCard({ service, className }) {
  const setSelectedService = useBookingStore((s) => s.setSelectedService)

  if (!service?.id) {
    return null
  }

  const businessName = service.businesses?.name
  const currency = service.currency || service.businesses?.currency || 'ARS'

  return (
    <Card
      className={cn(
        'group relative flex h-full flex-col overflow-hidden border-border/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
        className
      )}
    >
      <Link
        to={`/book/${service.id}`}
        onClick={() => setSelectedService(service)}
        className="flex h-full flex-col rounded-xl p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary ring-1 ring-inset ring-primary/10">
            <Stethoscope className="h-5 w-5" aria-hidden="true" />
          </span>
          {businessName && (
            <Badge variant="secondary" className="max-w-[65%] gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{businessName}</span>
            </Badge>
          )}
        </div>

        <h3 className="mt-4 text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
          {service.name}
        </h3>

        {service.description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {service.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {service.duration_min} min
          </span>
          <span className="text-lg font-semibold text-primary">
            {formatCurrency(service.price_cents, currency)}
          </span>
        </div>

        <span className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-colors group-hover:bg-primary/90">
          {CTA.primary}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    </Card>
  )
}
