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
    <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mt-3">
      <Clock className="w-3.5 h-3.5 text-[#11b7c1]" />
      <span>Próximo turno disponible: <strong className="text-foreground">{formatRelative(slot.start)}</strong></span>
    </div>
  )
}
