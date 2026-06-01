const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        message: err.message,
        status: 400
      }
    })
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: {
        message: 'Unauthorized',
        status: 401
      }
    })
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      error: {
        message: 'Forbidden',
        status: 403
      }
    })
  }

  if (err.code === 'PGRST116') {
    return res.status(404).json({
      error: {
        message: 'Resource not found',
        status: 404
      }
    })
  }

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  })
}

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
      status: 404
    }
  })
}

module.exports = { errorHandler, notFoundHandler }
