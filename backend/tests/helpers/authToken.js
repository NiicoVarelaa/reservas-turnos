const { TEST_ACCESS_SECRET } = require('./constants')
const jwt = require('jsonwebtoken')

// Signs a token exactly like src/utils/jwt.js (same secret + payload shape)
const accessTokenFor = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    TEST_ACCESS_SECRET,
    { expiresIn: '15m' }
  )
}

module.exports = { accessTokenFor }