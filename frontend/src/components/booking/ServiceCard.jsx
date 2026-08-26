import { Clock, DollarSign, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBookingStore } from '@/store/bookingStore'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/lib/utils'
import { CTA } from '@/constants/copy'

export default function ServiceCard({ service, className }) {
  const navigate = useNavigate()
  const setSelectedService = useBookingStore((s) => s.setSelectedService)

  if (!service?.id) {
    return null
  }

  const handleNavigate = () => {
    setSelectedService(service)
    navigate(`/book/${service.id}`)
  }

  const handleReservar = (e) => {
    e.stopPropagation()
    handleNavigate()
  }

  const businessName = service.businesses?.name
  const currency = service.currency || service.businesses?.currency || 'ARS'

  return (
    <Card
      onClick={handleNavigate}
      className={cn(
        'h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer',
        className
      )}
    >
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
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-semibold">
            <DollarSign className="w-4 h-4" />
            <span>{formatCurrency(service.price_cents, currency)}</span>
          </div>
          <Button size="sm" onClick={handleReservar}>
            {CTA.primary}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}