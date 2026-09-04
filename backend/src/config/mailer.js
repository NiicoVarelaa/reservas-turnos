const nodemailer = require('nodemailer')

const host = process.env.SMTP_HOST
const port = Number(process.env.SMTP_PORT || 587)
const user = process.env.SMTP_USER
const pass = process.env.SMTP_PASS

let transporter = null

if (host && user) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  })
}

module.exports = { transporter, isMailConfigured: () => Boolean(transporter) }