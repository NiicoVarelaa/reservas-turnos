const { transporter, isMailConfigured } = require('../config/mailer')
const logger = require('../utils/logger')

const DEFAULT_FROM = process.env.MAIL_FROM || 'no-reply@smilebook.app'

class EmailService {
  async sendPasswordReset(user, resetLink) {
    try {
      if (!isMailConfigured()) {
        // No SMTP configured — log the link so it can still be used in development
        logger.warn(`[email] SMTP not configured. Password reset link for ${user.email}: ${resetLink}`)
        return { dev: true, resetLink }
      }

      const info = await transporter.sendMail({
        from: DEFAULT_FROM,
        to: user.email,
        subject: 'Restablecé tu contraseña — Smile Book',
        text: `Hola ${user.full_name || user.email},\n\nRecibimos una solicitud para restablecer tu contraseña.\n\nPara continuar, ingresá al siguiente enlace (válido por 30 minutos):\n\n${resetLink}\n\nSi no solicitaste esto, podés ignorar este correo.\n\n— Smile Book`,
        html: `
          <p>Hola ${user.full_name || user.email},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p>Para continuar, hacé clic en el siguiente botón (válido por 30 minutos):</p>
          <p><a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px;">Restablecer contraseña</a></p>
          <p style="color:#666;">Si no solicitaste esto, podés ignorar este correo.</p>
        `
      })

      logger.info(`[email] Password reset email sent to ${user.email}: ${info.messageId}`)
      return { sent: true }
    } catch (error) {
      logger.error(`[email] Failed to send password reset to ${user.email}:`, error.message)
      throw error
    }
  }
}

module.exports = new EmailService()