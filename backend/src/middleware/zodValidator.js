const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    let data

    switch (source) {
      case 'body':
        data = req.body
        break
      case 'params':
        data = req.params
        break
      case 'query':
        data = req.query
        break
      default:
        data = req.body
    }

    const result = schema.safeParse(data)

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      })
    }

    req.validatedData = result.data
    next()
  }
}

module.exports = { validate }
