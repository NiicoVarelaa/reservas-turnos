import { describe, expect, it } from 'vitest'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  bookingSchema,
  businessSchema,
  serviceSchema,
  profileUpdateSchema,
  formatZodErrors,
  validateForm
} from './index'

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'secret' })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email inválido')
    }
  })

  it('requires a password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('La contraseña es requerida')
    }
  })
})

describe('registerSchema', () => {
  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'strongpass8',
      full_name: 'Juan Pérez',
      phone: '+541123456789'
    })
    expect(result.success).toBe(true)
  })

  it('rejects a short password', () => {
    const result = registerSchema.safeParse({ email: 'user@example.com', password: 'short' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid phone number', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'strongpass8',
      phone: 'abc'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Número de teléfono inválido')
    }
  })
})

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'user@example.com' }).success).toBe(true)
  })

  it('rejects an invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'nope' }).success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('accepts matching passwords of at least 8 chars', () => {
    const result = resetPasswordSchema.safeParse({ password: 'nuevaClave8', confirmPassword: 'nuevaClave8' })
    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({ password: 'nuevaClave8', confirmPassword: 'distinta' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path[0] === 'confirmPassword')).toBe(true)
      expect(result.error.issues[0].message).toBe('Las contraseñas no coinciden')
    }
  })

  it('rejects a short password', () => {
    const result = resetPasswordSchema.safeParse({ password: 'short', confirmPassword: 'short' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('La contraseña debe tener al menos 8 caracteres')
    }
  })
})

describe('bookingSchema', () => {
  it('accepts valid booking info', () => {
    const result = bookingSchema.safeParse({
      name: 'Ana',
      email: 'ana@example.com',
      phone: '1123456789'
    })
    expect(result.success).toBe(true)
  })

  it('rejects a short name', () => {
    const result = bookingSchema.safeParse({ name: 'A', email: 'ana@example.com', phone: '1123456789' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid email', () => {
    const result = bookingSchema.safeParse({ name: 'Ana', email: 'x', phone: '1123456789' })
    expect(result.success).toBe(false)
  })
})

describe('businessSchema', () => {
  it('accepts a valid business', () => {
    const result = businessSchema.safeParse({ name: 'Clínica Test', category: 'odontologia' })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid category', () => {
    const result = businessSchema.safeParse({ name: 'Clínica', category: 'spa' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Categoría inválida')
    }
  })
})

describe('serviceSchema', () => {
  it('accepts a valid service', () => {
    const result = serviceSchema.safeParse({
      name: 'Limpieza',
      duration_min: 30,
      price_cents: 5000
    })
    expect(result.success).toBe(true)
  })

  it('rejects a duration too short', () => {
    const result = serviceSchema.safeParse({ name: 'Limpieza', duration_min: 1, price_cents: 5000 })
    expect(result.success).toBe(false)
  })

  it('rejects a negative price', () => {
    const result = serviceSchema.safeParse({ name: 'Limpieza', duration_min: 30, price_cents: -1 })
    expect(result.success).toBe(false)
  })
})

describe('profileUpdateSchema', () => {
  it('accepts an empty object', () => {
    expect(profileUpdateSchema.safeParse({}).success).toBe(true)
  })

  it('rejects an invalid phone', () => {
    const result = profileUpdateSchema.safeParse({ phone: 'nope' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Teléfono inválido')
    }
  })
})

describe('formatZodErrors', () => {
  it('returns an empty object without errors', () => {
    expect(formatZodErrors(null)).toEqual({})
    expect(formatZodErrors(undefined)).toEqual({})
  })

  it('flattens issues into a keyed object', () => {
    const result = loginSchema.safeParse({ email: 'bad', password: '' })
    const errors = formatZodErrors(result.error)
    expect(errors).toMatchObject({
      email: 'Email inválido',
      password: 'La contraseña es requerida'
    })
  })
})

describe('validateForm', () => {
  it('returns valid true with parsed data', () => {
    const { valid, data } = validateForm(loginSchema, { email: 'a@b.com', password: 'x' })
    expect(valid).toBe(true)
    expect(data).toEqual({ email: 'a@b.com', password: 'x' })
  })

  it('returns valid false with formatted errors', () => {
    const result = validateForm(loginSchema, { email: 'bad', password: '' })
    expect(result.valid).toBe(false)
    expect(result.errors.email).toBe('Email inválido')
  })
})