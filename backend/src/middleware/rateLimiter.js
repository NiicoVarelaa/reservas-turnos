const rateLimit = require('express-rate-limit')

// Disable effective limits under Jest so tests are not throttled.
// JEST_WORKER_ID is set automatically by Jest in every worker process.
const IS_TEST = Boolean(process.env.JEST_WORKER_ID)

const UNLIMITED = 100000

const message = { error: 'Too many requests, please try again later.' }

// General API limiter — applied to all /api routes as a baseline
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_TEST ? UNLIMITED : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message
})

// Stricter limiter for auth endpoints — brute-force protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_TEST ? UNLIMITED : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later.' }
})

// Limit for sensitive auth actions (forgot/reset password, etc.)
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: IS_TEST ? UNLIMITED : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later.' }
})

// Limit for payment/booking creation — prevent abuse
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_TEST ? UNLIMITED : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message
})

module.exports = { apiLimiter, authLimiter, sensitiveLimiter, paymentLimiter }