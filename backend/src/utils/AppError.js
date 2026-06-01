class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message)
    this.statusCode = statusCode
    this.details = details
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }

  static badRequest(message, details) {
    return new AppError(message, 400, details)
  }

  static unauthorized(message = 'Authentication required') {
    return new AppError(message, 401)
  }

  static forbidden(message = 'Insufficient permissions') {
    return new AppError(message, 403)
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404)
  }

  static conflict(message) {
    return new AppError(message, 409)
  }

  static internal(message = 'Internal server error') {
    return new AppError(message, 500)
  }
}

module.exports = AppError
