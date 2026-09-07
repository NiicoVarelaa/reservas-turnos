// Mock of src/services/whatsapp.js
module.exports = {
  sendConfirmation: jest.fn().mockResolvedValue({}),
  sendReminder: jest.fn().mockResolvedValue({}),
  sendCancellation: jest.fn().mockResolvedValue({})
}