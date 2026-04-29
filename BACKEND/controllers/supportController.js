// ═══════════════════════════════════════════════════════════
//  BACKEND/controllers/supportController.js
// ═══════════════════════════════════════════════════════════
const ContactMessage = require('../models/ContactMessage');
const sendEmail = require('../utils/sendEmail');

// ─────────────────────────────────────────────────────────
//  CRÉER UN MESSAGE DE CONTACT (public)
// ─────────────────────────────────────────────────────────
exports.createMessage = async (req, res) => {
  try {
    const { nom, email, sujet, message } = req.body;

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

    const contact = await ContactMessage.create({
      nom: nom.trim(),
      email: email.toLowerCase().trim(),
      sujet: sujet.trim(),
      message: message.trim(),
      statut: 'NOUVEAU',
    });

    // Email de confirmation au visiteur
    try {
      await sendEmail({
        email,
        subject: `[Project Finder] Votre message a bien été reçu`,
        message: `Bonjour ${nom},\n\nNous avons bien reçu votre message concernant "${sujet}".\nNotre équipe vous répondra dans les plus brefs délais.\n\nCordialement,\nL'équipe Project Finder`,
      });
    } catch (emailErr) {
      console.error('Email confirmation visiteur non envoyé:', emailErr.message);
    }

    return res.status(201).json({
      status: 'success',
      message: 'Votre message a été envoyé avec succès. Vous recevrez une réponse par email.',
      contact,
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
//  RÉCUPÉRER TOUS LES MESSAGES (admin)
// ─────────────────────────────────────────────────────────
exports.getMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      ContactMessage.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      ContactMessage.countDocuments(),
    ]);

    return res.status(200).json({ status: 'success', messages, total });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
//  RÉPONDRE À UN MESSAGE — envoie l'email au visiteur
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

    // Envoyer l'email de réponse au visiteur
    await sendEmail({
      email: contact.email,
      subject: `[Project Finder] Réponse à votre message : ${contact.sujet}`,
      message: `Bonjour ${contact.nom},\n\nVoici la réponse de notre équipe concernant votre message :\n\n"${contact.message}"\n\n──────────────────\nRéponse de l'administrateur :\n\n${reponse.trim()}\n──────────────────\n\nCordialement,\nL'équipe Project Finder\ncontact@projectfinder.tn`,
    });

    // Mettre à jour le message en base
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
    // Si l'email échoue, on informe clairement l'admin
    if (error.code === 'EAUTH' || error.code === 'ECONNECTION') {
      return res.status(500).json({
        status: 'error',
        message:
          'Erreur de configuration email. Vérifiez EMAIL_HOST, EMAIL_USER et EMAIL_PASS dans .env',
      });
    }
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
//  ARCHIVER UN MESSAGE (admin)
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
