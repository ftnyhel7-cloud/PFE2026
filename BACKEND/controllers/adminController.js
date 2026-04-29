// ═══════════════════════════════════════════════════════════
//  BACKEND/controllers/adminController.js
//  Fonctions admin : gestion utilisateurs, stats, logs, support
// ═══════════════════════════════════════════════════════════
const Utilisateur = require('../models/Utilisateur');
const Etudiant = require('../models/Etudiant');
const Encadrant = require('../models/Encadrant');
const Sujet = require('../models/Sujet');
const Projet = require('../models/Projet');
const Candidature = require('../models/Candidature');
const Notification = require('../models/Notification');
const ContactMessage = require('../models/ContactMessage');
const Log = require('../models/Log');
const { logAction, getClientIp } = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');

// ─────────────────────────────────────────────────────────
//  LISTER TOUS LES UTILISATEURS (pagination + filtres)
// ─────────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, isValidated, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (isValidated !== undefined) filter.isValidated = isValidated === 'true';
    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Utilisateur.countDocuments(filter);
    const users = await Utilisateur.find(filter)
      .select('-mot_de_passe -refreshToken -refreshTokenExpiry -resetPasswordToken -resetPasswordExpiry')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
//  VALIDER UN UTILISATEUR
// ─────────────────────────────────────────────────────────
exports.validateUser = async (req, res) => {
  try {
    const user = await Utilisateur.findById(req.params.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'Utilisateur introuvable' });

    if (user.isValidated) {
      return res.status(400).json({ status: 'error', message: 'Utilisateur déjà validé' });
    }

    await Utilisateur.findByIdAndUpdate(req.params.id, { isValidated: true });

    // Créer une notification pour l'utilisateur
    await Notification.create({
      idUtilisateur: user._id,
      titre: '✅ Compte validé',
      contenu: 'Votre compte a été validé par l\'administrateur ! Vous pouvez maintenant accéder à la plateforme.',
      type: 'VALIDATION',
    });

    // Log
    await logAction('VALIDATE_USER', {
      userId: req.user._id,
      userRole: 'ADMINISTRATEUR',
      userEmail: req.user.email,
      details: `Validation de ${user.email} (${user.role})`,
      ip: getClientIp(req),
    });

    // Email de notification
    try {
      await sendEmail({
        to: user.email,
        subject: '[Project Finder] ✅ Votre compte a été validé !',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#059669,#10B981);padding:20px;text-align:center;border-radius:6px 6px 0 0;">
              <h1 style="color:#fff;margin:0;">✅ Compte Activé !</h1>
            </div>
            <div style="padding:24px;border:1px solid #e0e0e0;border-radius:0 0 6px 6px;">
              <p>Bonjour <strong>${user.prenom}</strong>,</p>
              <p>Votre compte sur <strong>Project Finder</strong> a été validé par l'administrateur.</p>
              <p>Vous pouvez maintenant vous connecter et accéder à toutes les fonctionnalités de la plateforme.</p>
              <div style="text-align:center;margin:24px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background:#059669;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
                  Se connecter
                </a>
              </div>
              <p>Cordialement,<br/><strong>L'équipe Project Finder</strong></p>
            </div>
          </div>`,
      });
    } catch (emailErr) {
      console.error('Email validation non envoyé:', emailErr.message);
    }

    res.json({ status: 'success', message: `Utilisateur ${user.email} validé avec succès` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
//  REJETER / SUPPRIMER UN UTILISATEUR
// ─────────────────────────────────────────────────────────
exports.rejectUser = async (req, res) => {
  try {
    const user = await Utilisateur.findById(req.params.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'Utilisateur introuvable' });

    // Empêcher la suppression d'un admin
    if (user.role === 'ADMINISTRATEUR') {
      return res.status(403).json({ status: 'error', message: 'Impossible de supprimer un administrateur' });
    }

    // Supprimer le profil associé
    if (user.role === 'ETUDIANT') {
      await Etudiant.deleteMany({ utilisateur: user._id });
    }
    if (user.role === 'ENCADRANT') {
      await Encadrant.deleteMany({ utilisateur: user._id });
    }

    // Supprimer l'utilisateur
    await Utilisateur.findByIdAndDelete(req.params.id);

    // Log
    await logAction('REJECT_USER', {
      userId: req.user._id,
      userRole: 'ADMINISTRATEUR',
      userEmail: req.user.email,
      details: `Suppression de ${user.email} (${user.role})`,
      ip: getClientIp(req),
    });

    res.json({ status: 'success', message: `Utilisateur ${user.email} supprimé` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
//  STATISTIQUES GLOBALES
// ─────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      usersEnAttente,
      totalEtudiants,
      totalEncadrants,
      totalSujets,
      sujetsValides,
      sujetsEnAttente,
      totalProjets,
      projetsEnCours,
      projetsTermines,
      totalCandidatures,
      messagesNonLus,
      logsAujourdhui,
    ] = await Promise.all([
      Utilisateur.countDocuments(),
      Utilisateur.countDocuments({ isValidated: false }),
      Utilisateur.countDocuments({ role: 'ETUDIANT' }),
      Utilisateur.countDocuments({ role: 'ENCADRANT' }),
      Sujet.countDocuments(),
      Sujet.countDocuments({ valide: true }),
      Sujet.countDocuments({ valide: false }),
      Projet.countDocuments(),
      Projet.countDocuments({ statutProjet: 'EN_COURS' }),
      Projet.countDocuments({ statutProjet: 'TERMINE' }),
      Candidature.countDocuments(),
      ContactMessage.countDocuments({ statut: { $in: ['NOUVEAU', 'LU'] } }),
      Log.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ]);

    res.json({
      totalUsers,
      usersEnAttente,
      totalEtudiants,
      totalEncadrants,
      totalSujets,
      sujetsValides,
      sujetsEnAttente,
      totalProjets,
      projetsEnCours,
      projetsTermines,
      totalCandidatures,
      messagesNonLus,
      logsAujourdhui,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
//  LOGS / MONITORING (pagination + filtres)
// ─────────────────────────────────────────────────────────
exports.getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 30, action, userRole, dateFrom, dateTo } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (userRole) filter.userRole = userRole;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const total = await Log.countDocuments(filter);
    const logs = await Log.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      logs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
//  ENVOYER UNE NOTIFICATION CIBLÉE
// ─────────────────────────────────────────────────────────
exports.sendNotification = async (req, res) => {
  try {
    const { titre, contenu, type = 'VALIDATION', rolesCibles, userIds } = req.body;

    if (!titre || !contenu) {
      return res.status(400).json({ status: 'error', message: 'Titre et contenu requis' });
    }

    let destinataires = [];

    // Si des IDs spécifiques sont fournis
    if (userIds && userIds.length > 0) {
      destinataires = userIds;
    }
    // Sinon, cibler par rôle
    else if (rolesCibles && rolesCibles.length > 0) {
      const users = await Utilisateur.find({ role: { $in: rolesCibles } }).select('_id');
      destinataires = users.map((u) => u._id);
    }
    // Sinon, tous les utilisateurs
    else {
      const users = await Utilisateur.find({}).select('_id');
      destinataires = users.map((u) => u._id);
    }

    // Créer les notifications
    const notifications = destinataires.map((id) => ({
      idUtilisateur: id,
      titre,
      contenu,
      type,
    }));

    await Notification.insertMany(notifications);

    // Log
    await logAction('SEND_NOTIFICATION', {
      userId: req.user._id,
      userRole: 'ADMINISTRATEUR',
      userEmail: req.user.email,
      details: `Notification "${titre}" envoyée à ${destinataires.length} utilisateur(s)`,
      ip: getClientIp(req),
    });

    res.json({
      status: 'success',
      message: `Notification envoyée à ${destinataires.length} utilisateur(s)`,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
//  MESSAGES SUPPORT
// ─────────────────────────────────────────────────────────
exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, statut } = req.query;
    const filter = {};
    if (statut) filter.statut = statut;

    const total = await ContactMessage.countDocuments(filter);
    const messages = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      messages,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.replyMessage = async (req, res) => {
  try {
    const { reponse } = req.body;
    if (!reponse) return res.status(400).json({ status: 'error', message: 'Réponse requise' });

    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ status: 'error', message: 'Message introuvable' });

    await ContactMessage.findByIdAndUpdate(req.params.id, {
      reponse,
      statut: 'REPONDU',
      dateReponse: new Date(),
      reponduPar: req.user._id,
    });

    // Envoyer l'email de réponse
    try {
      await sendEmail({
        to: msg.email,
        subject: `[Project Finder] Réponse : ${msg.sujet}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#1a7a8a;padding:20px;text-align:center;border-radius:6px 6px 0 0;">
              <h1 style="color:#fff;margin:0;">🎓 Project Finder — Support</h1>
            </div>
            <div style="padding:24px;border:1px solid #e0e0e0;border-radius:0 0 6px 6px;">
              <p>Bonjour <strong>${msg.nom}</strong>,</p>
              <p>Nous avons bien reçu votre message concernant : <strong>${msg.sujet}</strong></p>
              <div style="background:#f8fafc;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #1a7a8a;">
                <p style="margin:0;white-space:pre-wrap;">${reponse}</p>
              </div>
              <p>Cordialement,<br/><strong>L'équipe Project Finder</strong></p>
            </div>
          </div>`,
      });
    } catch (emailErr) {
      console.error('Email réponse support non envoyé:', emailErr.message);
    }

    // Log
    await logAction('REPLY_SUPPORT', {
      userId: req.user._id,
      userRole: 'ADMINISTRATEUR',
      userEmail: req.user.email,
      details: `Réponse au message de ${msg.email} — sujet: ${msg.sujet}`,
      ip: getClientIp(req),
    });

    res.json({ status: 'success', message: 'Réponse envoyée' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.archiveMessage = async (req, res) => {
  try {
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ status: 'error', message: 'Message introuvable' });

    await ContactMessage.findByIdAndUpdate(req.params.id, { statut: 'ARCHIVE' });

    await logAction('ARCHIVE_SUPPORT', {
      userId: req.user._id,
      userRole: 'ADMINISTRATEUR',
      details: `Archivage message de ${msg.email}`,
      ip: getClientIp(req),
    });

    res.json({ status: 'success', message: 'Message archivé' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.updateMessageStatus = async (req, res) => {
  try {
    const { statut } = req.body;
    const statutsAutorises = ['LU', 'REPONDU', 'ARCHIVE'];

    if (!statut || !statutsAutorises.includes(statut)) {
      return res.status(400).json({
        status: 'error',
        message: `Statut invalide. Valeurs acceptées: ${statutsAutorises.join(', ')}`,
      });
    }

    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ status: 'error', message: 'Message introuvable' });

    msg.statut = statut;
    await msg.save();

    await logAction('ARCHIVE_SUPPORT', {
      userId: req.user._id,
      userRole: 'ADMINISTRATEUR',
      userEmail: req.user.email,
      details: `Mise à jour statut support (${msg.email}) => ${statut}`,
      ip: getClientIp(req),
    });

    return res.json({ status: 'success', message: `Statut mis à jour: ${statut}` });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
//  LISTE DES AFFECTATIONS (projets avec étudiant + encadrant)
// ─────────────────────────────────────────────────────────
exports.getAffectations = async (req, res) => {
  try {
    const projets = await Projet.find()
      .populate({
        path: 'idEtudiant',
        populate: { path: 'utilisateur', select: 'nom prenom email' },
      })
      .populate({
        path: 'idEncadrant',
        populate: { path: 'utilisateur', select: 'nom prenom email' },
      })
      .populate('idSujet')
      .sort({ createdAt: -1 });

    res.json(projets);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
