const validatePhone = (phone) => {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  return /^\+?[1-9]\d{7,14}$/.test(cleaned)
}

const formatPhone = (phone) => {
  return phone.replace(/[\s\-\(\)]/g, '')
}

const formatDate = (date, locale = 'es-AR') => {
  return new Date(date).toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (date, locale = 'es-AR') => {
  return new Date(date).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (amount, currency = 'USD', locale = 'es-AR') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(amount / 100)
}

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  return input.trim().replace(/[<>]/g, '')
}

const generateReferenceCode = (prefix = 'RT') => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

module.exports = {
  validatePhone,
  formatPhone,
  formatDate,
  formatTime,
  formatCurrency,
  sanitizeInput,
  generateReferenceCode
}
