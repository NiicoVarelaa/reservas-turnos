const { z } = require('zod')

const phoneRegex = /^\+?[1-9]\d{6,14}$/

// Auth schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  phone: z.string().regex(phoneRegex, 'Invalid phone number').optional()
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
})

// Booking schema
const bookingSchema = z.object({
  serviceId: z.string().uuid('Valid serviceId is required'),
  professionalId: z.string().uuid('Valid professionalId is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date is required (YYYY-MM-DD)'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Valid startTime is required (HH:MM)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Valid endTime is required (HH:MM)'),
  clientName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  clientEmail: z.string().email('Valid email is required'),
  clientPhone: z.string().min(7, 'Valid phone number is required').max(20),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional()
})

// Payment schema
const paymentSessionSchema = z.object({
  appointmentId: z.string().uuid('Valid appointmentId is required'),
  amount: z.number().int().min(1, 'Valid amount in cents is required'),
  currency: z.string().length(3, 'Valid 3-letter currency code is required').optional()
})

// Business schema
const businessSchema = z.object({
  name: z.string().min(2, 'Business name must be between 2 and 100 characters').max(100),
  category: z.enum([
    'odontologia', 'medicina', 'belleza', 'peluqueria',
    'psicologia', 'veterinaria', 'fitness', 'educacion',
    'legal', 'consultoria', 'general'
  ], 'Valid category is required'),
  tagline: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  whatsapp_number: z.string().regex(phoneRegex, 'Valid WhatsApp number is required').optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Valid hex color is required').optional(),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Valid hex color is required').optional(),
  currency: z.string().length(3).optional(),
  timezone: z.string().max(50).optional()
})

// Service schema
const serviceSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  duration_min: z.number().int().min(5, 'Duration must be at least 5 minutes').max(480),
  price_cents: z.number().int().min(0, 'Price cannot be negative'),
  currency: z.string().length(3).optional(),
  is_active: z.boolean().optional()
})

// Schedule schema
const scheduleSchema = z.object({
  day_of_week: z.number().int().min(0).max(6, 'Valid day of week is required (0-6)'),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Valid start time is required (HH:MM)'),
  end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Valid end time is required (HH:MM)'),
  is_active: z.boolean().optional()
})

// Profile update schema
const profileUpdateSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(phoneRegex, 'Invalid phone number').optional(),
  avatar_url: z.string().url('Invalid URL').optional(),
  bio: z.string().max(500).optional()
})

// Param schemas
const uuidParamSchema = z.object({
  id: z.string().uuid('Valid ID is required')
})

const slugParamSchema = z.object({
  slug: z.string().min(1, 'Valid slug is required')
})

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  bookingSchema,
  paymentSessionSchema,
  businessSchema,
  serviceSchema,
  scheduleSchema,
  profileUpdateSchema,
  uuidParamSchema,
  slugParamSchema
}
