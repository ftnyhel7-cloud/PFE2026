// BACKEND/models/Utilisateur.js
const mongoose = require('mongoose');

const UtilisateurSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },

    // unique:true crée déjà l'index — pas besoin de schema.index()
    email: {
      type: String,
      required: true,
      unique: true, // ← ceci suffit, pas besoin de index:true en plus
      lowercase: true,
      trim: true,
    },

    mot_de_passe: {
      type: String,
      required: true,
      select: false,
      minlength: 8,
    },

    role: {
      type: String,
      enum: ['ETUDIANT', 'ENCADRANT', 'ADMINISTRATEUR'],
      default: 'ETUDIANT',
    },

    telephone: { type: String, default: '' },
    image: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' },

    // Conservé pour compatibilité, mais l'inscription valide directement le compte
    isValidated: { type: Boolean, default: true },

    // Code de référence utilisé lors de l'inscription
    // Matricule pour ETUDIANT, Code contrat pour ENCADRANT
    codeReference: { type: String, default: '' },

    // Refresh token — HTTP-Only cookie
    refreshToken: {
      type: String,
      select: false,
    },
    refreshTokenExpiry: {
      type: Date,
      select: false,
    },

    // Reset mot de passe
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpiry: {
      type: Date,
      select: false,
    },

    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// ── Un seul index explicite sur role (email est déjà indexé via unique:true) ──
UtilisateurSchema.index({ role: 1 });

module.exports = mongoose.model('Utilisateur', UtilisateurSchema);
