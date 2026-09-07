// Mock of src/services/email.js
module.exports = {
  sendPasswordReset: jest.fn().mockResolvedValue({ sent: true })
}