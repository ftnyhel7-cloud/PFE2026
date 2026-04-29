// ═══════════════════════════════════════════════════════════
//  BACKEND/models/Log.js
//  Journalisation de toutes les actions importantes du système
// ═══════════════════════════════════════════════════════════
const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema(
  {
    // Type d'action
    action: {
      type: String,
      enum: [
        'LOGIN',
        'LOGOUT',
        'REGISTER',
        'VALIDATE_USER',
        'REJECT_USER',
        'CREATE_SUJET',
        'VALIDATE_SUJET',
        'DELETE_SUJET',
        'ASSIGN_PFE',
        'ACCEPT_CANDIDATURE',
        'REFUSE_CANDIDATURE',
        'SEND_NOTIFICATION',
        'CREATE_TACHE',
        'UPDATE_PROFILE',
        'REPLY_SUPPORT',
        'ARCHIVE_SUPPORT',
        'ADD_REFERENTIEL',
        'DELETE_REFERENTIEL',
        'OTHER',
      ],
      required: true,
    },

    // Utilisateur ayant effectué l'action
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      default: null,
    },

    // Rôle au moment de l'action
    userRole: {
      type: String,
      enum: ['ETUDIANT', 'ENCADRANT', 'ADMINISTRATEUR', 'SYSTEME'],
      default: 'SYSTEME',
    },

    // Email pour référence rapide
    userEmail: {
      type: String,
      default: '',
    },

    // Détails de l'action (texte libre)
    details: {
      type: String,
      default: '',
    },

    // Adresse IP
    ip: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Index pour requêtes fréquentes
LogSchema.index({ action: 1, createdAt: -1 });
LogSchema.index({ userId: 1 });
LogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Log', LogSchema);
