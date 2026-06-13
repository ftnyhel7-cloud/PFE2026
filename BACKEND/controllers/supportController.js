// ═══════════════════════════════════════════════════════════
//  BACKEND/controllers/supportController.js
//  Gestion des messages de contact + réponses par email
//  → Utilise Resend via utils/sendEmail.js
// ═══════════════════════════════════════════════════════════
const ContactMessage = require('../models/ContactMessage');
const sendEmail = require('../utils/sendEmail');

// ─────────────────────────────────────────────────────────
//  TEMPLATES HTML — emails professionnels
// ─────────────────────────────────────────────────────────

/**
 * Template de confirmation envoyé au visiteur après soumission du formulaire
 */
function templateConfirmation({ nom, sujet, message }) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Message reçu — SmartPFE</title>
</head>
<body style="margin:0;padding:0;background:#f4faf7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4faf7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(45,158,107,.10);">

          <!-- En-tête -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a7a4f,#2d9e6b,#4caf82);padding:32px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,.18);border-radius:12px;padding:10px 14px;margin-bottom:12px;">
                <span style="font-size:28px;">🎓</span>
              </div>
              <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 6px;">SmartPFE</h1>
              <p style="color:rgba(255,255,255,.8);font-size:13px;margin:0;">Plateforme de Gestion PFE — Tunisie</p>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="color:#0f2d1e;font-size:18px;font-weight:700;margin:0 0 12px;">
                Bonjour ${nom} 👋
              </h2>
              <p style="color:#3d6b52;font-size:15px;line-height:1.7;margin:0 0 20px;">
                Nous avons bien reçu votre message. Notre équipe vous répondra dans les plus brefs délais.
              </p>

              <!-- Récapitulatif du message -->
              <div style="background:#f4faf7;border-left:4px solid #2d9e6b;border-radius:0 10px 10px 0;padding:18px 20px;margin-bottom:24px;">
                <p style="color:#7fa98e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin:0 0 6px;">Votre message</p>
                <p style="color:#0f2d1e;font-size:14px;font-weight:700;margin:0 0 8px;">📌 Sujet : ${sujet}</p>
                <p style="color:#3d6b52;font-size:13px;line-height:1.65;margin:0;">${message}</p>
              </div>

              <p style="color:#7fa98e;font-size:13px;line-height:1.6;margin:0 0 28px;">
                Si vous avez d'autres questions, n'hésitez pas à nous contacter à nouveau via notre formulaire ou directement à
                <a href="mailto:${process.env.ADMIN_EMAIL || 'contact@projectfinder.tn'}" style="color:#2d9e6b;font-weight:600;text-decoration:none;">${process.env.ADMIN_EMAIL || 'contact@projectfinder.tn'}</a>.
              </p>

              <div style="text-align:center;margin-top:8px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="display:inline-block;background:linear-gradient(135deg,#1a7a4f,#2d9e6b);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">
                  Visiter SmartPFE
                </a>
              </div>
            </td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td style="background:#f4faf7;padding:20px 40px;text-align:center;border-top:1px solid #e0efe8;">
              <p style="color:#7fa98e;font-size:11px;margin:0;">
                © ${new Date().getFullYear()} SmartPFE — Tunisie &nbsp;·&nbsp;
                <a href="mailto:${process.env.ADMIN_EMAIL || 'contact@projectfinder.tn'}" style="color:#2d9e6b;text-decoration:none;">contact@projectfinder.tn</a>
              </p>
              <p style="color:#b0c9bc;font-size:10px;margin:4px 0 0;">
                Vous recevez cet email car vous avez utilisé notre formulaire de contact.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Template de réponse admin envoyé au visiteur
 * replyTo = email du visiteur → l'admin peut répondre depuis sa boîte mail
 */
function templateReponseAdmin({ nom, sujetOriginal, messageOriginal, reponse }) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Réponse — SmartPFE</title>
</head>
<body style="margin:0;padding:0;background:#f4faf7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4faf7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(45,158,107,.10);">

          <!-- En-tête -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a7a4f,#2d9e6b,#4caf82);padding:32px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,.18);border-radius:12px;padding:10px 14px;margin-bottom:12px;">
                <span style="font-size:28px;">✉️</span>
              </div>
              <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 6px;">Réponse de l'équipe</h1>
              <p style="color:rgba(255,255,255,.8);font-size:13px;margin:0;">SmartPFE — Plateforme PFE Tunisie</p>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="color:#0f2d1e;font-size:18px;font-weight:700;margin:0 0 12px;">
                Bonjour ${nom} 👋
              </h2>
              <p style="color:#3d6b52;font-size:15px;line-height:1.7;margin:0 0 24px;">
                Voici la réponse de notre équipe à votre demande.
              </p>

              <!-- Réponse de l'admin -->
              <div style="background:#edfbf4;border:1px solid #a7f3d0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <p style="color:#065f46;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;margin:0 0 10px;">
                  💬 Réponse de l'administrateur
                </p>
                <p style="color:#0f2d1e;font-size:14px;line-height:1.75;margin:0;white-space:pre-line;">${reponse}</p>
              </div>

              <!-- Message original (rappel) -->
              <div style="background:#f9fafb;border-left:3px solid #d1fae5;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:24px;">
                <p style="color:#9ca3af;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin:0 0 6px;">Votre message original — ${sujetOriginal}</p>
                <p style="color:#6b7280;font-size:12px;line-height:1.6;margin:0;font-style:italic;">${messageOriginal}</p>
              </div>

              <p style="color:#7fa98e;font-size:13px;line-height:1.6;margin:0 0 28px;">
                Vous pouvez répondre directement à cet email, ou nous contacter à nouveau via notre formulaire de contact.
              </p>

              <div style="text-align:center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}#contact" style="display:inline-block;background:linear-gradient(135deg,#1a7a4f,#2d9e6b);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">
                  Nous contacter à nouveau
                </a>
              </div>
            </td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td style="background:#f4faf7;padding:20px 40px;text-align:center;border-top:1px solid #e0efe8;">
              <p style="color:#7fa98e;font-size:11px;margin:0;">
                © ${new Date().getFullYear()} SmartPFE — Tunisie &nbsp;·&nbsp;
                <a href="mailto:${process.env.ADMIN_EMAIL || 'contact@projectfinder.tn'}" style="color:#2d9e6b;text-decoration:none;">${process.env.ADMIN_EMAIL || 'contact@projectfinder.tn'}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────
//  1. CRÉER UN MESSAGE DE CONTACT (public — LandingPage)
// ─────────────────────────────────────────────────────────
exports.createMessage = async (req, res) => {
  try {
    const { nom, email, sujet, message } = req.body;

    // Validation
    if (!nom || !email || !sujet || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Tous les champs sont obligatoires (nom, email, sujet, message)',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ status: 'error', message: "Format d'email invalide" });
    }

    if (message.trim().length < 10) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Le message est trop court (minimum 10 caractères)' });
    }

    // ✅ Sauvegarde en base de données
    const contact = await ContactMessage.create({
      nom: nom.trim(),
      email: email.toLowerCase().trim(),
      sujet: sujet.trim(),
      message: message.trim(),
      statut: 'NOUVEAU',
    });

    // ✅ Email de confirmation HTML au visiteur
    // replyTo = email admin → si le visiteur répond à cet email, l'admin le reçoit
    try {
      await sendEmail({
        to: email.trim(),
        subject: `[SmartPFE] Votre message a bien été reçu`,
        html: templateConfirmation({
          nom: nom.trim(),
          sujet: sujet.trim(),
          message: message.trim(),
        }),
        replyTo: process.env.ADMIN_EMAIL || 'contact@projectfinder.tn',
      });
    } catch (emailErr) {
      // L'email de confirmation n'est pas bloquant — le message est déjà sauvé
      console.error('[createMessage] Email confirmation non envoyé:', emailErr.message);
    }

    // ✅ Notification interne à l'admin (optionnel)
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'contact@projectfinder.tn',
        subject: `[SmartPFE] Nouveau message de contact — ${sujet.trim()}`,
        html: `
          <div style="font-family:Arial,sans-serif;padding:24px;background:#f4faf7;border-radius:12px;">
            <h2 style="color:#1a7a4f;">📬 Nouveau message de contact</h2>
            <p><strong>De :</strong> ${nom.trim()} &lt;${email.trim()}&gt;</p>
            <p><strong>Sujet :</strong> ${sujet.trim()}</p>
            <p><strong>Message :</strong></p>
            <blockquote style="border-left:4px solid #2d9e6b;padding:12px 16px;background:#fff;border-radius:0 8px 8px 0;color:#3d6b52;">
              ${message.trim()}
            </blockquote>
            <p style="color:#7fa98e;font-size:12px;margin-top:16px;">
              Connectez-vous au <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color:#2d9e6b;">dashboard admin</a> pour répondre.
            </p>
          </div>`,
        replyTo: email.trim(), // ← l'admin peut répondre directement depuis sa boîte mail
      });
    } catch (notifErr) {
      console.error('[createMessage] Notification admin non envoyée:', notifErr.message);
    }

    return res.status(201).json({
      status: 'success',
      message: 'Votre message a été envoyé avec succès. Vous recevrez une confirmation par email.',
      contact,
    });
  } catch (error) {
    console.error('[createMessage] Erreur:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
//  2. RÉCUPÉRER TOUS LES MESSAGES (admin)
// ─────────────────────────────────────────────────────────
exports.getMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    // Filtre optionnel par statut
    const filter = {};
    if (req.query.statut) filter.statut = req.query.statut;

    const [messages, total] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ContactMessage.countDocuments(filter),
    ]);

    return res.status(200).json({ status: 'success', messages, total });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
//  3. RÉPONDRE À UN MESSAGE — envoie un email HTML au visiteur
//     ✅ replyTo = email du visiteur
//        → si l'admin répond depuis sa boîte mail, le visiteur reçoit la réponse
// ─────────────────────────────────────────────────────────
exports.replyMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { reponse } = req.body;

    if (!reponse || !reponse.trim()) {
      return res.status(400).json({ status: 'error', message: 'La réponse est obligatoire' });
    }

    const contact = await ContactMessage.findById(id);
    if (!contact) {
      return res.status(404).json({ status: 'error', message: 'Message introuvable' });
    }

    if (contact.statut === 'ARCHIVE') {
      return res
        .status(400)
        .json({ status: 'error', message: 'Impossible de répondre à un message archivé' });
    }

    // ✅ Envoi de l'email HTML de réponse au visiteur
    //    from    = adresse officielle (noreply@projectfinder.tn)
    //    replyTo = email de l'admin → si le visiteur clique "Répondre", l'admin reçoit
    await sendEmail({
      to: contact.email,
      subject: `Re: ${contact.sujet} — SmartPFE`,
      html: templateReponseAdmin({
        nom: contact.nom,
        sujetOriginal: contact.sujet,
        messageOriginal: contact.message,
        reponse: reponse.trim(),
      }),
      replyTo: process.env.ADMIN_EMAIL || 'contact@projectfinder.tn',
    });

    // ✅ Mise à jour en base
    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      {
        reponse: reponse.trim(),
        statut: 'REPONDU',
        dateReponse: new Date(),
      },
      { new: true }
    );

    return res.status(200).json({
      status: 'success',
      message: `Réponse envoyée par email à ${contact.email}`,
      contact: updated,
    });
  } catch (error) {
    // Erreurs spécifiques Resend
    if (error.message?.includes('API key')) {
      return res.status(500).json({
        status: 'error',
        message: 'Clé API Resend invalide. Vérifiez RESEND_API_KEY dans votre fichier .env',
      });
    }
    if (error.message?.includes('domain')) {
      return res.status(500).json({
        status: 'error',
        message:
          "Domaine expéditeur non vérifié sur Resend. En mode test, utilisez 'onboarding@resend.dev'",
      });
    }
    console.error('[replyMessage] Erreur:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
//  4. ARCHIVER UN MESSAGE (admin)
// ─────────────────────────────────────────────────────────
exports.archiveMessage = async (req, res) => {
  try {
    const updated = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { statut: 'ARCHIVE' },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Message introuvable' });
    }
    return res.status(200).json({ status: 'success', contact: updated });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
