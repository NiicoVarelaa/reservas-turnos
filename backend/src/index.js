const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/business', require('./routes/business.routes'))
app.use('/api/services', require('./routes/services.routes'))
app.use('/api/schedules', require('./routes/schedules.routes'))
app.use('/api/bookings', require('./routes/bookings.routes'))
app.use('/api/payments', require('./routes/payments.routes'))
app.use('/api/appointments', require('./routes/appointments.routes'))

// Webhooks (needs raw body for Stripe signature verification)
app.use('/api/webhooks', require('./routes/webhooks.routes'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 handler
app.use(notFoundHandler)

// Error handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV}`)
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
})
