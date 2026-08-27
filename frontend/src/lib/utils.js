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

const AVATAR_COLORS = [
  { bg: 'bg-primary', text: 'text-primary-foreground' },
  { bg: 'bg-sky-700', text: 'text-white' },
  { bg: 'bg-[#0e9aa3]', text: 'text-white' },
  { bg: 'bg-indigo-700', text: 'text-white' },
  { bg: 'bg-slate-700', text: 'text-white' },
  { bg: 'bg-sky-800', text: 'text-white' },
  { bg: 'bg-blue-800', text: 'text-white' },
  { bg: 'bg-cyan-800', text: 'text-white' },
]

export function getAvatarColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export function getInitials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
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
