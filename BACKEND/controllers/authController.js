// ═══════════════════════════════════════════════════════════
//  BACKEND/controllers/authController.js  ✅ CORRIGÉ
//  Fix : popupNotifications retournées aussi dans refreshToken
// ═══════════════════════════════════════════════════════════
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Utilisateur = require('../models/Utilisateur');
const Etudiant = require('../models/Etudiant');
const Encadrant = require('../models/Encadrant');
const Referentiel = require('../models/Referentiel');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const { logAction, getClientIp } = require('../utils/logger');

// ─────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────
const genAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });

const genRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth/refresh-token',
  });
};

const formatUser = (user) => ({
  _id: user._id,
  nom: user.nom,
  prenom: user.prenom,
  email: user.email,
  role: user.role,
  telephone: user.telephone || '',
  image: user.image || '',
  isValidated: user.isValidated,
});

// ── Helper partagé : récupère les popups non encore affichées ──
const getPopupNotifications = async (userId) =>
  Notification.find({
    idUtilisateur: userId,
    lu: false,
    isPopupShown: false,
  })
    .sort({ createdAt: -1 })
    .limit(10);

// ─────────────────────────────────────────────────────────
//  INSCRIPTION
// ─────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const {
      nom,
      prenom,
      email,
      mot_de_passe,
      role = 'ETUDIANT',
      telephone,
      filiere,
      matricule,
      niveau,
      matriculeProf,
      specialite,
      departement,
      typeEncadrant,
      codeReference,
    } = req.body;

    if (!nom || !prenom || !email || !mot_de_passe) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Nom, prénom, email et mot de passe sont obligatoires' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ status: 'error', message: "Format d'email invalide" });
    }

    if (mot_de_passe.length < 8) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    const existant = await Utilisateur.findOne({ email: email.toLowerCase().trim() });
    if (existant) {
      return res
        .status(409)
        .json({ status: 'error', message: 'Un compte avec cet email existe déjà' });
    }

    const rolesValides = ['ETUDIANT', 'ENCADRANT'];
    if (!rolesValides.includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Rôle invalide. Valeurs acceptées : ETUDIANT, ENCADRANT',
      });
    }

    const codeAVerifier = codeReference || (role === 'ETUDIANT' ? matricule : matriculeProf);

    if (!codeAVerifier) {
      return res.status(400).json({
        status: 'error',
        message:
          role === 'ETUDIANT'
            ? 'Le matricule étudiant est obligatoire'
            : 'Le code contrat (matricule prof) est obligatoire',
      });
    }

    const typeRef = role === 'ETUDIANT' ? 'ETUDIANT' : 'ENCADRANT';
    const refEntry = await Referentiel.findOne({
      type: typeRef,
      code: codeAVerifier.toUpperCase().trim(),
    });

    if (!refEntry) {
      return res.status(403).json({
        status: 'error',
        message: `Code non autorisé. Votre ${role === 'ETUDIANT' ? 'matricule' : 'code contrat'} n'existe pas dans le référentiel. Contactez l'administration.`,
      });
    }

    if (refEntry.utilise) {
      return res
        .status(409)
        .json({ status: 'error', message: 'Ce code a déjà été utilisé pour une inscription.' });
    }

    const motDePasseHache = await bcrypt.hash(mot_de_passe, 12);

    const utilisateur = await Utilisateur.create({
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email.toLowerCase().trim(),
      mot_de_passe: motDePasseHache,
      role,
      telephone: telephone || '',
      isValidated: true,
      codeReference: codeAVerifier.toUpperCase().trim(),
    });

    if (role === 'ETUDIANT') {
      await Etudiant.create({
        utilisateur: utilisateur._id,
        filiere: filiere || '',
        matricule: codeAVerifier.toUpperCase().trim(),
        niveau: niveau || '',
        statutPFE: 'NON_AFFECTE',
      });
    }

    if (role === 'ENCADRANT') {
      await Encadrant.create({
        utilisateur: utilisateur._id,
        matriculeProf: codeAVerifier.toUpperCase().trim(),
        specialite: specialite || '',
        departement: departement || '',
        typeEncadrant: typeEncadrant || 'Academique',
        disponibilite: true,
      });
    }

    await Referentiel.findByIdAndUpdate(refEntry._id, {
      utilise: true,
      utilisePar: utilisateur._id,
    });

    await logAction('REGISTER', {
      userId: utilisateur._id,
      userRole: role,
      userEmail: utilisateur.email,
      details: `Inscription ${role} — code: ${codeAVerifier}`,
      ip: getClientIp(req),
    });

    try {
      await sendEmail({
        to: utilisateur.email,
        subject: '[SmartPFE] Bienvenue sur la plateforme !',
        text: `Bonjour ${prenom} !\n\nVotre compte a été créé avec succès en tant que ${role}.\nVotre compte est actif. Vous pouvez vous connecter immédiatement.\n\nCordialement,\nL'équipe SmartPFE`,
      });
    } catch (emailErr) {
      console.error('Email bienvenue non envoyé:', emailErr.message);
    }

    return res.status(201).json({
      status: 'success',
      message: 'Compte créé avec succès. Vous pouvez vous connecter maintenant.',
      user: formatUser(utilisateur),
    });
  } catch (error) {
    console.error('Erreur register:', error);
    return res
      .status(500)
      .json({ status: 'error', message: "Erreur serveur lors de l'inscription" });
  }
};

// ─────────────────────────────────────────────────────────
//  CONNEXION
// ─────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Email et mot de passe sont requis' });
    }

    const utilisateur = await Utilisateur.findOne({
      email: email.toLowerCase().trim(),
    }).select('+mot_de_passe +refreshToken');

    if (!utilisateur) {
      return res.status(401).json({ status: 'error', message: 'Email ou mot de passe incorrect' });
    }

    const mdpValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!mdpValide) {
      return res.status(401).json({ status: 'error', message: 'Email ou mot de passe incorrect' });
    }

    const accessToken = genAccessToken(utilisateur);
    const refreshToken = genRefreshToken(utilisateur);

    await Utilisateur.findByIdAndUpdate(utilisateur._id, {
      refreshToken,
      refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lastLogin: new Date(),
    });

    setRefreshCookie(res, refreshToken);

    await logAction('LOGIN', {
      userId: utilisateur._id,
      userRole: utilisateur.role,
      userEmail: utilisateur.email,
      details: 'Connexion réussie',
      ip: getClientIp(req),
    });

    // ── Notifications popup non encore affichées ──────────
    const popupNotifications = await getPopupNotifications(utilisateur._id);

    return res.status(200).json({
      status: 'success',
      message: 'Connexion réussie',
      accessToken,
      user: formatUser(utilisateur),
      popupNotifications,
    });
  } catch (error) {
    console.error('Erreur login:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Erreur serveur lors de la connexion' });
  }
};

// ─────────────────────────────────────────────────────────
//  RAFRAÎCHIR LE TOKEN
//  ✅ FIX : retourne aussi popupNotifications
//  → sans ça, les notifications disparaissent après un refresh
//    de page (silentRefresh dans AuthContext)
// ─────────────────────────────────────────────────────────
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token manquant — veuillez vous reconnecter',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ status: 'error', message: 'Refresh token invalide ou expiré' });
    }

    const utilisateur = await Utilisateur.findById(decoded.id).select(
      '+refreshToken +refreshTokenExpiry'
    );

    if (!utilisateur || utilisateur.refreshToken !== token) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Session invalide — veuillez vous reconnecter' });
    }

    if (utilisateur.refreshTokenExpiry < new Date()) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Session expirée — veuillez vous reconnecter' });
    }

    const newAccessToken = genAccessToken(utilisateur);
    const newRefreshToken = genRefreshToken(utilisateur);

    await Utilisateur.findByIdAndUpdate(utilisateur._id, {
      refreshToken: newRefreshToken,
      refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setRefreshCookie(res, newRefreshToken);

    // ✅ FIX : récupérer les popups non affichées (même logique que login)
    const popupNotifications = await getPopupNotifications(utilisateur._id);

    return res.status(200).json({
      status: 'success',
      accessToken: newAccessToken,
      user: formatUser(utilisateur),
      popupNotifications, // ✅ AJOUT — manquait dans la version originale
    });
  } catch (error) {
    console.error('Erreur refreshToken:', error);
    return res.status(500).json({ status: 'error', message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────────────────
//  DÉCONNEXION
// ─────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        await Utilisateur.findByIdAndUpdate(decoded.id, {
          refreshToken: null,
          refreshTokenExpiry: null,
        });
        await logAction('LOGOUT', {
          userId: decoded.id,
          details: 'Déconnexion',
          ip: getClientIp(req),
        });
      } catch {}
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh-token',
    });

    return res.status(200).json({ status: 'success', message: 'Déconnexion réussie' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────────────────
//  MON PROFIL
// ─────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const user = await Utilisateur.findById(req.user._id).select(
      '-mot_de_passe -refreshToken -refreshTokenExpiry'
    );
    if (!user) return res.status(404).json({ status: 'error', message: 'Utilisateur introuvable' });
    return res.status(200).json({ status: 'success', user: formatUser(user) });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────────────────
//  MODIFIER MON PROFIL
// ─────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { nom, prenom, telephone, image, mot_de_passe } = req.body;

    const updateData = {};
    if (nom) updateData.nom = nom.trim();
    if (prenom) updateData.prenom = prenom.trim();
    if (telephone) updateData.telephone = telephone;
    if (image) updateData.image = image;

    if (mot_de_passe) {
      if (mot_de_passe.length < 8) {
        return res
          .status(400)
          .json({ status: 'error', message: 'Mot de passe trop court (min 8 car.)' });
      }
      updateData.mot_de_passe = await bcrypt.hash(mot_de_passe, 12);
    }

    const user = await Utilisateur.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    }).select('-mot_de_passe -refreshToken');

    await logAction('UPDATE_PROFILE', {
      userId: req.user._id,
      userRole: req.user.role,
      userEmail: req.user.email,
      details: 'Mise à jour du profil',
      ip: getClientIp(req),
    });

    return res
      .status(200)
      .json({ status: 'success', message: 'Profil mis à jour', user: formatUser(user) });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────────────────
//  MOT DE PASSE OUBLIÉ
// ─────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ status: 'error', message: 'Email requis' });

    const user = await Utilisateur.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(200).json({
        status: 'success',
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    await Utilisateur.findByIdAndUpdate(user._id, {
      resetPasswordToken: resetHash,
      resetPasswordExpiry: new Date(Date.now() + 30 * 60 * 1000),
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: '[SmartPFE] Réinitialisation de mot de passe',
        text: `Bonjour ${user.prenom},\n\nUne demande de réinitialisation de mot de passe a été effectuée.\n\nCliquez sur ce lien (valable 30 minutes) :\n${resetUrl}\n\nSi vous n'avez pas fait cette demande, ignorez cet email.\n\nCordialement,\nL'équipe SmartPFE`,
      });
    } catch (emailErr) {
      console.error('Email reset non envoyé:', emailErr.message);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────────────────
//  RÉINITIALISER LE MOT DE PASSE
// ─────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { mot_de_passe } = req.body;

    if (!mot_de_passe || mot_de_passe.length < 8) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Mot de passe trop court (min 8 car.)' });
    }

    const resetHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await Utilisateur.findOne({
      resetPasswordToken: resetHash,
      resetPasswordExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ status: 'error', message: 'Lien invalide ou expiré' });
    }

    await Utilisateur.findByIdAndUpdate(user._id, {
      mot_de_passe: await bcrypt.hash(mot_de_passe, 12),
      resetPasswordToken: null,
      resetPasswordExpiry: null,
      refreshToken: null,
    });

    return res
      .status(200)
      .json({ status: 'success', message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Erreur serveur' });
  }
};
