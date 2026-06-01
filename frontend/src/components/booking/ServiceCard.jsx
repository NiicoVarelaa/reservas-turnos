import { Clock, DollarSign, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

export default function ServiceCard({ service, className }) {
  const formatPrice = (cents, currency) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency || 'ARS',
      minimumFractionDigits: 0
    }).format(cents / 100)
  }

  const businessName = service.businesses?.name

  return (
    <Link
      to={`/book/${service.id}`}
      className={cn(
        'block p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        className
      )}
    >
      {businessName && (
        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {businessName}
        </p>
      )}
      <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
      {service.description && (
        <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
      )}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{service.duration_min} min</span>
        </div>
        <div className="flex items-center gap-1 font-medium">
          <DollarSign className="w-4 h-4" />
          <span>{formatPrice(service.price_cents, service.currency)}</span>
        </div>
      </div>
    </Link>
  )
}
