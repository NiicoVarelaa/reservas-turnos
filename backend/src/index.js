const dotenv = require('dotenv')
const logger = require('./utils/logger')
const reminderService = require('./services/reminder')
const app = require('./app')

dotenv.config()

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV}`)
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)

  // Start reminder scheduler (check every 30 minutes)
  if (process.env.NODE_ENV !== 'test') {
    reminderService.start(30)
  }
})