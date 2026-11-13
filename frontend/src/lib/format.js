const LOCALE = 'es-AR'

export function capitalize(text) {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function parseDate(value) {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00`)
    return Number.isNaN(date.getTime()) ? null : date
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function startOfDay(value = new Date()) {
  const date = parseDate(value)
  if (!date) return null
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function isSameDay(a, b) {
  const first = parseDate(a)
  const second = parseDate(b)
  if (!first || !second) return false
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

export function dayOffset(value, base = new Date()) {
  const date = startOfDay(value)
  const reference = startOfDay(base)
  if (!date || !reference) return null
  return Math.round((date.getTime() - reference.getTime()) / 86400000)
}

export function formatDate(value, options = {}) {
  const date = parseDate(value)
  if (!date) return '—'
  return date.toLocaleDateString(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  })
}

export function formatLongDate(value, options = {}) {
  const date = parseDate(value)
  if (!date) return '—'
  return capitalize(
    date.toLocaleDateString(LOCALE, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      ...options,
    })
  )
}

export function formatTime(value) {
  const date = parseDate(value)
  if (!date) return '—'
  return date.toLocaleTimeString(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function formatTimeWithSuffix(value) {
  const time = formatTime(value)
  return time === '—' ? time : `${time} hs`
}

export function formatDateTime(value) {
  const date = parseDate(value)
  if (!date) return '—'
  return `${formatDate(date)} · ${formatTime(date)}`
}

export function relativeDayLabel(value, base = new Date()) {
  const offset = dayOffset(value, base)
  if (offset === 0) return 'Hoy'
  if (offset === 1) return 'Mañana'
  if (offset === -1) return 'Ayer'
  return formatDate(value)
}

export function formatNumber(value, options = {}) {
  return new Intl.NumberFormat(LOCALE, options).format(Number(value) || 0)
}

export function resolveCurrency(...candidates) {
  const match = candidates.find(
    (candidate) => typeof candidate === 'string' && candidate.trim().length === 3
  )
  return match ? match.trim().toUpperCase() : 'ARS'
}

export function priceToCents(value) {
  if (value === '' || value === null || value === undefined) return 0
  const normalized = String(value).replace(/\s/g, '').replace(',', '.')
  const amount = Number.parseFloat(normalized)
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0
}

export function centsToPriceInput(cents) {
  const amount = (Number(cents) || 0) / 100
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2)
}

export function minutesFromTime(value) {
  if (typeof value !== 'string' || !/^\d{1,2}:\d{2}$/.test(value)) return null
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}
