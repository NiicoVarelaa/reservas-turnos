import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const statusConfig = {
  paid: { variant: 'success', label: 'Pagado' },
  pending: { variant: 'warning', label: 'Pendiente' },
  confirmed: { variant: 'default', label: 'Confirmado' },
  cancelled: { variant: 'destructive', label: 'Cancelado' },
}

export function formatCurrency(amount, currency = 'ARS', locale = 'es-AR') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(amount / 100)
}

export function getStatusBadge(status) {
  return statusConfig[status] || { variant: 'outline', label: status }
}
