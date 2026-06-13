const nodemailer = require('nodemailer');

async function test() {
  console.log('📤 Envoi en cours...');

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: 'aad8b0001@smtp-brevo.com',
      pass: 'xsmtpsib-54df818260e870ab41adf7f32f7bb221e7e36d10a64b58350cb1a0b0135ff1ff-6ZY0AhGUn1OAZ5qI',
    },
    tls: { rejectUnauthorized: false },
  });

  const info = await transporter.sendMail({
    from: 'SmartPFE <nousan123456@gmail.com>',
    to: 'nousan123456@gmail.com',
    subject: 'Test SmartPFE',
    html: '<h1>✅ Ça marche !</h1>',
  });

  console.log('✅ Envoyé ! ID:', info.messageId);
}

test().catch((err) => console.error('❌ Erreur:', err.message));
