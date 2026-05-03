// ═══════════════════════════════════════════════════════════
//  BACKEND/models/Publication.js
//  Publications/annonces de l'admin vers les utilisateurs
// ═══════════════════════════════════════════════════════════
const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: true,
      trim: true,
    },
    contenu: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['ANNONCE', 'RESSOURCE', 'CALENDRIER'],
      default: 'ANNONCE',
    },
    // À qui est destinée la publication
    audience: {
      type: String,
      enum: ['TOUS', 'ETUDIANT', 'ENCADRANT'],
      default: 'TOUS',
    },
    statut: {
      type: String,
      enum: ['BROUILLON', 'PUBLIE'],
      default: 'BROUILLON',
    },
    auteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
    },
    vues: {
      type: Number,
      default: 0,
    },
    // Date de publication effective
    datePublication: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Quand on publie, enregistrer la date
publicationSchema.pre('save', function (next) {
  if (this.isModified('statut') && this.statut === 'PUBLIE' && !this.datePublication) {
    this.datePublication = new Date();
  }
  next();
});

module.exports = mongoose.model('Publication', publicationSchema);
