const {
  validatePhone,
  formatPhone,
  formatDate,
  formatTime,
  formatCurrency,
  sanitizeInput,
  generateReferenceCode
} = require('../../src/utils/helpers')

describe('helpers', () => {
  describe('validatePhone', () => {
    it('accepts international format with plus sign', () => {
      expect(validatePhone('+5491123456789')).toBe(true)
    })

    it('accepts plain 8+ digit numbers', () => {
      expect(validatePhone('1123456789')).toBe(true)
    })

    it('accepts separators like spaces, dashes and parentheses', () => {
      expect(validatePhone('+54 (11) 2345-6789')).toBe(true)
    })

    it('rejects short numbers', () => {
      expect(validatePhone('1234')).toBe(false)
    })

    it('rejects non-digit content', () => {
      expect(validatePhone('abc12345')).toBe(false)
    })
  })

  describe('formatPhone', () => {
    it('strips whitespace, dashes and parentheses', () => {
      expect(formatPhone('+54 (11) 2345-6789')).toBe('+541123456789')
    })
  })

  describe('formatDate / formatTime', () => {
    it('formats a date in Spanish long form', () => {
      const date = new Date('2026-09-05T12:00:00Z')
      const formatted = formatDate(date, 'es-AR')
      expect(formatted).toMatch(/sábado/i)
      expect(formatted).toMatch(/2026/)
    })

    it('formats time with hour and minute', () => {
      const date = new Date('2026-09-05T12:30:00Z')
      const formatted = formatTime(date, 'es-AR')
      // Hour/minute pattern (local timezone independent), optional AM/PM suffix, no seconds
      expect(formatted).toMatch(/^\d{1,2}:\d{2}((\u00A0|\s)[ap]\.\sm\.)?$/i)
    })
  })

  describe('formatCurrency', () => {
    it('formats cents into pesos', () => {
      expect(formatCurrency(15000, 'ARS', 'es-AR')).toMatch(/150/)
    })

    it('handles dollars with cents divisor', () => {
      const formatted = formatCurrency(5000, 'USD', 'en-US')
      expect(formatted).toContain('50')
    })
  })

  describe('sanitizeInput', () => {
    it('trims whitespace', () => {
      expect(sanitizeInput('  hola  ')).toBe('hola')
    })

    it('removes angle brackets', () => {
      expect(sanitizeInput('<script>alert(1)</script>')).toBe('scriptalert(1)/script')
    })

    it('returns non-strings unchanged', () => {
      expect(sanitizeInput(123)).toBe(123)
      expect(sanitizeInput(null)).toBe(null)
    })
  })

  describe('generateReferenceCode', () => {
    it('uses the given prefix', () => {
      expect(generateReferenceCode('RT')).toMatch(/^RT-/)
    })

    it('generates unique codes', () => {
      const a = generateReferenceCode('RT')
      const b = generateReferenceCode('RT')
      expect(a).not.toBe(b)
    })
  })
})