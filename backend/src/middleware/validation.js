const { body, param, query, validationResult } = require('express-validator')

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    })
  }
  next()
}

const validateBooking = [
  body('serviceId')
    .isUUID()
    .withMessage('Valid serviceId is required'),
  body('professionalId')
    .isUUID()
    .withMessage('Valid professionalId is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required (YYYY-MM-DD)'),
  body('startTime')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('Valid startTime is required (HH:MM)'),
  body('endTime')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('Valid endTime is required (HH:MM)'),
  body('clientName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('clientName must be between 2 and 100 characters'),
  body('clientEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('clientPhone')
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Valid phone number is required'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  handleValidationErrors
]

const validatePaymentSession = [
  body('appointmentId')
    .isUUID()
    .withMessage('Valid appointmentId is required'),
  body('amount')
    .isInt({ min: 1 })
    .withMessage('Valid amount in cents is required'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Valid 3-letter currency code is required'),
  handleValidationErrors
]

const validateAppointmentId = [
  param('id')
    .isUUID()
    .withMessage('Valid appointment ID is required'),
  handleValidationErrors
]

const validateServiceId = [
  param('id')
    .isUUID()
    .withMessage('Valid service ID is required'),
  handleValidationErrors
]

module.exports = {
  handleValidationErrors,
  validateBooking,
  validatePaymentSession,
  validateAppointmentId,
  validateServiceId
}
