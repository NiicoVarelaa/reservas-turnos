import { z } from 'zod'

const phoneRegex = /^\+?[1-9]\d{6,14}$/

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida')
})

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(128),
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100).optional(),
  phone: z.string().regex(phoneRegex, 'Número de teléfono inválido').optional()
})

export const bookingSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  phone: z.string().min(7, 'Teléfono inválido').max(20)
})

export const businessSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener entre 2 y 100 caracteres').max(100),
  category: z.enum([
    'odontologia', 'medicina', 'belleza', 'peluqueria',
    'psicologia', 'veterinaria', 'fitness', 'educacion',
    'legal', 'consultoria', 'general'
  ], 'Categoría inválida'),
  tagline: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  whatsapp_number: z.string().regex(phoneRegex, 'Número de WhatsApp inválido').optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional()
})

export const serviceSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  description: z.string().max(500).optional(),
  duration_min: z.number().int().min(5, 'Duración mínima de 5 minutos').max(480),
  price_cents: z.number().int().min(0, 'El precio no puede ser negativo'),
  currency: z.string().length(3).optional()
})

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(phoneRegex, 'Teléfono inválido').optional(),
  avatar_url: z.string().url('URL inválida').optional(),
  bio: z.string().max(500).optional()
})

export function formatZodErrors(error) {
  if (!error || !error.errors) return {}
  const formatted = {}
  error.errors.forEach(e => {
    const field = e.path.join('.')
    formatted[field] = e.message
  })
  return formatted
}

export function validateForm(schema, data) {
  const result = schema.safeParse(data)
  if (!result.success) {
    return { valid: false, errors: formatZodErrors(result.error) }
  }
  return { valid: true, data: result.data }
}
