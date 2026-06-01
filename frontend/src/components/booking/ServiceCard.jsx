import { Clock, DollarSign, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
    <Link to={`/book/${service.id}`}>
      <Card className={cn(
        'h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer',
        className
      )}>
        <CardHeader className="pb-3">
          {businessName && (
            <Badge variant="secondary" className="mb-2 w-fit">
              <MapPin className="w-3 h-3 mr-1" />
              {businessName}
            </Badge>
          )}
          <h3 className="text-lg font-semibold">{service.name}</h3>
        </CardHeader>
        <CardContent className="pb-3">
          {service.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {service.description}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-0">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{service.duration_min} min</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold">
            <DollarSign className="w-4 h-4" />
            <span>{formatPrice(service.price_cents, service.currency)}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
