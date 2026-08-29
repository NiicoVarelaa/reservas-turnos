import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { businessApi } from '@/services/api'

function formatRelative(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()

  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  const time = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  if (diffDays <= 0) return `hoy a las ${time}`
  if (diffDays === 1) return `mañana a las ${time}`

  const weekday = date.toLocaleDateString('es-AR', { weekday: 'long' })
  return `${weekday} a las ${time}`
}

export default function NextAvailableSlot({ businessId }) {
  const [slot, setSlot] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!businessId) { setLoading(false); return }

    let cancelled = false
    businessApi.getNextAvailableSlot(businessId)
      .then(({ data }) => {
        if (!cancelled && data.slot) setSlot(data.slot)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [businessId])

  if (loading || !slot) return null

  return (
    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-teal/10 px-3.5 py-1.5 text-sm">
        <Clock className="w-4 h-4 text-teal" />
        <span className="text-muted-foreground">Próximo turno disponible: <strong className="font-semibold text-foreground">{formatRelative(slot.start)}</strong></span>
      </div>
  )
}
