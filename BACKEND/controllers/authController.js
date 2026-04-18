const Utilisateur = require('../models/Utilisateur');
const Etudiant = require('../models/Etudiant');
const Encadrant = require('../models/Encadrant');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// ─── Générer Token JWT ───────────────────────────────
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ─── INSCRIPTION ────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const {
      nom,
      prenom,
      email,
      mot_de_passe,
      role,
      filiere,
      matricule,
      niveau,
      matriculeProf,
      specialite,
      departement,
      typeEncadrant,
    } = req.body;

    // 1. Email déjà utilisé ?
    const existe = await Utilisateur.findOne({ email });
    if (existe) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    // 2. Créer l'utilisateur
    const user = await Utilisateur.create({
      nom,
      prenom,
      email,
      mot_de_passe,
      role,
    });

    // 3. Créer le profil selon le rôle
    if (role === 'ETUDIANT') {
      await Etudiant.create({
        utilisateur: user._id,
        filiere,
        matricule,
        niveau,
      });
    }

    if (role === 'ENCADRANT') {
      await Encadrant.create({
        utilisateur: user._id,
        matriculeProf,
        specialite,
        departement,
        typeEncadrant,
      });
    }

    // 4. Répondre avec le token
    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── CONNEXION ──────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    // 1. Trouver l'utilisateur
    const user = await Utilisateur.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email incorrect' });
    }

    // 2. Vérifier mot de passe
    const isMatch = await user.matchPassword(mot_de_passe);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // 3. Répondre avec le token
    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MOT DE PASSE OUBLIÉ ────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    // 1. Trouver l'utilisateur
    const user = await Utilisateur.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'Aucun compte avec cet email' });
    }

    // 2. Générer le token
    const resetToken = user.getResetToken();
    await user.save();

    // 3. Créer le lien
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    // 4. Envoyer l'email
    const message = `
      Bonjour ${user.nom},

      Vous avez demandé une réinitialisation de mot de passe.
      Cliquez sur ce lien (valable 10 minutes) :

      ${resetUrl}

      Si vous n'avez pas demandé ça, ignorez cet email.
    `;

    await sendEmail({
      email: user.email,
      subject: 'Réinitialisation de mot de passe',
      message,
    });

    res.json({ message: 'Email envoyé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── RÉINITIALISER MOT DE PASSE ─────────────────────
exports.resetPassword = async (req, res) => {
  try {
    // 1. Hacher le token reçu
    const resetToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // 2. Trouver l'utilisateur avec ce token
    const user = await Utilisateur.findOne({
      resetToken,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalide ou expiré' });
    }

    // 3. Changer le mot de passe
    user.mot_de_passe = req.body.mot_de_passe;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MON PROFIL ─────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const user = await Utilisateur.findById(req.user._id).select('-mot_de_passe');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MODIFIER MON PROFIL ────────────────────────────
// ─── MODIFIER PROFIL 
exports.updateProfile = async (req, res) => {
  try {
    const { nom, prenom, telephone, image, mot_de_passe } = req.body;

    // Si l'utilisateur veut changer son mot de passe
    if (mot_de_passe) {
      // On récupère l'utilisateur complet
      const user = await Utilisateur.findById(req.user._id);
      // On assigne le nouveau mot de passe
      user.mot_de_passe = mot_de_passe;
      // Le pre('save') va automatiquement hacher le mot de passe
      await user.save();
    }

    // On prépare les données à mettre à jour
    const updateData = {};
    if (nom)       updateData.nom       = nom;
    if (prenom)    updateData.prenom    = prenom;
    if (telephone) updateData.telephone = telephone;
    if (image)     updateData.image     = image;

    // On met à jour l'utilisateur
    const user = await Utilisateur.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-mot_de_passe'); // ne retourne pas le mot de passe

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};