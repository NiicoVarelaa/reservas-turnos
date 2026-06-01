const { stripe } = require('../config/stripe')
const db = require('../services/database')
const whatsappService = require('../services/whatsapp')

class PaymentsController {
  async createCheckoutSession(req, res, next) {
    try {
      const { appointmentId, amount, currency } = req.body

      // Get appointment details
      const appointment = await db.getAppointment(appointmentId)

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' })
      }

      if (appointment.status !== 'pending') {
        return res.status(400).json({
          error: `Cannot create payment for appointment with status: ${appointment.status}`
        })
      }

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency || 'usd',
              product_data: {
                name: appointment.services.name,
                description: `Booking with ${appointment.profiles.full_name}`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/confirm/{CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/book/${appointment.service_id}?cancelled=true`,
        metadata: {
          appointmentId: appointment.id,
          professionalId: appointment.professional_id,
          clientEmail: appointment.client_email,
        },
        customer_email: appointment.client_email,
      })

      // Update appointment with session ID
      await db.updateAppointment(appointmentId, {
        stripe_session_id: session.id
      })

      res.json({
        checkoutUrl: session.url,
        sessionId: session.id
      })
    } catch (error) {
      next(error)
    }
  }

  async handleStripeWebhook(req, res, next) {
    const sig = req.headers['stripe-signature']
    let event

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object
          const { appointmentId } = session.metadata

          // Update appointment status
          await db.updateAppointment(appointmentId, {
            status: 'paid',
            stripe_payment_intent_id: session.payment_intent
          })

          // Create payment record
          const payment = await db.createPayment({
            appointment_id: appointmentId,
            stripe_payment_intent_id: session.payment_intent,
            amount_cents: session.amount_total,
            currency: session.currency,
            status: 'succeeded',
            paid_at: new Date().toISOString()
          })

          // Create notification record for WhatsApp
          const notification = await db.createNotification({
            appointment_id: appointmentId,
            type: 'confirmation',
            channel: 'whatsapp',
            status: 'pending'
          })

          // Send WhatsApp confirmation (async, don't block webhook response)
          whatsappService.sendConfirmation(appointmentId)
            .then(() => console.log(`WhatsApp sent for appointment: ${appointmentId}`))
            .catch(err => console.error(`WhatsApp failed for appointment: ${appointmentId}`, err))

          console.log(`Payment successful for appointment: ${appointmentId}`)
          break
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object
          const session = await stripe.checkout.sessions.list({
            payment_intent: paymentIntent.id,
            limit: 1
          })

          if (session.data.length > 0) {
            const { appointmentId } = session.data[0].metadata

            await db.updateAppointment(appointmentId, {
              status: 'pending'
            })

            console.log(`Payment failed for appointment: ${appointmentId}`)
          }
          break
        }

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      res.json({ received: true })
    } catch (error) {
      console.error('Webhook processing error:', error)
      res.status(500).json({ error: 'Webhook processing failed' })
    }
  }
}

module.exports = new PaymentsController()
