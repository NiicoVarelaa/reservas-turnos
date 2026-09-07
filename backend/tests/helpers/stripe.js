// Mock of src/config/stripe.js
const stripe = {
  checkout: {
    sessions: {
      create: jest.fn(),
      list: jest.fn()
    }
  },
  webhooks: {
    constructEvent: jest.fn()
  }
}

module.exports = { stripe }