// ═══════════════════════════════════════════════════════════
//  BACKEND/utils/sendEmail.js — Brevo SMTP
//  Fix : self-signed certificate in certificate chain (Windows)
//  Installation : npm install nodemailer
// ═══════════════════════════════════════════════════════════
const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  if (!process.env.BREVO_API_KEY) {
    console.warn('[sendEmail] BREVO_API_KEY manquant dans .env');
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER, // votre email Brevo
      pass: process.env.BREVO_API_KEY, // clé API Brevo
    },
    tls: {
      rejectUnauthorized: false, // ✅ Fix erreur certificat Windows
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      ...(html ? { html } : { text: text || '' }),
      ...(replyTo ? { replyTo } : {}),
    });

    console.log(`[sendEmail] ✅ Envoyé → ${to} | id: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('[sendEmail] ❌ Erreur:', err.message);
    throw err;
  }
};

module.exports = sendEmail;
