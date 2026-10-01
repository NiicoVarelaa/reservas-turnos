// Mock of src/config/whatsapp.js
const sendWhatsAppMessage = jest.fn().mockResolvedValue({ messaging_product: 'whatsapp' })

module.exports = { sendWhatsAppMessage }
