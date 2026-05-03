// ═══════════════════════════════════════════════════════════
//  BACKEND/models/Feedback.js
//  Avis des utilisateurs sur la plateforme
// ═══════════════════════════════════════════════════════════
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    auteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
    },
    // Dénormalisation pour affichage rapide sans populate
    nomAuteur: { type: String, default: '' },
    roleAuteur: {
      type: String,
      enum: ['ETUDIANT', 'ENCADRANT'],
      required: true,
    },
    note: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    commentaire: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    statut: {
      type: String,
      enum: ['EN_ATTENTE', 'APPROUVE', 'REJETE'],
      default: 'EN_ATTENTE',
    },
    // L'admin peut ajouter une réponse publique
    reponseAdmin: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
