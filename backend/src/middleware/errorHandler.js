const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    logger.warn(`${err.message} [${err.statusCode}]`, {
      path: req.originalUrl,
      method: req.method,
      details: err.details
    })

    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        status: err.statusCode,
        ...(err.details && { details: err.details })
      }
    })
  }

  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method
  })

  if (err.code === 'PGRST116' || err.code === '404') {
    return res.status(404).json({
      error: {
        message: 'Resource not found',
        status: 404
      }
    })
  }

  if (err.code === '23505') {
    return res.status(409).json({
      error: {
        message: 'Resource already exists',
        status: 409
      }
    })
  }

  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
      status: 500
    }
  })
}

const notFoundHandler = (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`)

  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
      status: 404
    }
  })
}

module.exports = { errorHandler, notFoundHandler }
