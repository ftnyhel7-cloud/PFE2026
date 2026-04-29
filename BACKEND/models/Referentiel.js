// ═══════════════════════════════════════════════════════════
//  BACKEND/models/Referentiel.js
//  Référentiel des codes autorisés (matricules étudiants / codes contrat encadrants)
// ═══════════════════════════════════════════════════════════
const mongoose = require('mongoose');

const ReferentielSchema = new mongoose.Schema(
  {
    // Type de code : ETUDIANT (matricule) ou ENCADRANT (code contrat)
    type: {
      type: String,
      enum: ['ETUDIANT', 'ENCADRANT'],
      required: true,
    },

    // Le code lui-même (matricule ou code contrat)
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // Nom/description associé (pour faciliter la gestion admin)
    label: {
      type: String,
      default: '',
      trim: true,
    },

    // Si ce code a déjà été utilisé lors d'une inscription
    utilise: {
      type: Boolean,
      default: false,
    },

    // Référence vers l'utilisateur qui a utilisé ce code
    utilisePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      default: null,
    },
  },
  { timestamps: true }
);

// Index composé pour recherche rapide
ReferentielSchema.index({ type: 1, code: 1 });

module.exports = mongoose.model('Referentiel', ReferentielSchema);
