const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@biyebuzz.com';

let transporter = null;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 */
async function sendEmail({ to, subject, html }) {
  if (!to) {
    console.error('Email send failed: recipient "to" email is required');
    return;
  }

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: EMAIL_FROM,
        to,
        subject,
        html,
      });
      console.log(`Email sent successfully: ${info.messageId}`);
      return info;
    } catch (err) {
      console.error('SMTP Email sending error:', err);
      // Fallback to console log on error
    }
  }

  // Fallback / Development Logger
  console.log('\n=================== [MOCK EMAIL SENT] ===================');
  console.log(`FROM:    ${EMAIL_FROM}`);
  console.log(`TO:      ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log('HTML CONTENT:');
  console.log(html);
  console.log('=========================================================\n');
}

module.exports = { sendEmail };
