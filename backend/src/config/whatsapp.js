const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0'
const PHONE_ID = process.env.WHATSAPP_PHONE_ID
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

if (!PHONE_ID || !ACCESS_TOKEN) {
  throw new Error('Missing WhatsApp Cloud API credentials')
}

const sendWhatsAppMessage = async (to, templateName, languageCode, components) => {
  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode || 'en' },
          components
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${data.error?.message || 'Unknown error'}`)
    }

    return data
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error)
    throw error
  }
}

module.exports = { sendWhatsAppMessage }
