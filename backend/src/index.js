const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const logger = require('./utils/logger')
const reminderService = require('./services/reminder')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.urlencoded({ extended: true }))

// Webhooks route MUST be before express.json() to get raw body for Stripe signature verification
app.use('/api/webhooks', require('./routes/webhooks.routes'))

// JSON parsing for all other routes
app.use(express.json())

// HTTP logging
app.use(logger.http)

// Routes
app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/business', require('./routes/business.routes'))
app.use('/api/services', require('./routes/services.routes'))
app.use('/api/schedules', require('./routes/schedules.routes'))
app.use('/api/bookings', require('./routes/bookings.routes'))
app.use('/api/payments', require('./routes/payments.routes'))
app.use('/api/appointments', require('./routes/appointments.routes'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// 404 handler
app.use(notFoundHandler)

// Error handler
app.use(errorHandler)

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV}`)
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)

  // Start reminder scheduler (check every 30 minutes)
  if (process.env.NODE_ENV !== 'test') {
    reminderService.start(30)
  }
})

module.exports = app
