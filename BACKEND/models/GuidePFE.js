const mongoose = require('mongoose');

const GuidePFESchema = new mongoose.Schema(
  {
    titre: { type: String, required: true, trim: true },
    contenu: { type: String, required: true },
    categorie: {
      type: String,
      enum: ['academique', 'documentation', 'ressources'],
      default: 'academique',
    },
    type: { type: String, enum: ['INFO', 'ETAPE', 'REGLE', 'RESSOURCE', 'FAQ'], default: 'INFO' },
    audience: { type: String, enum: ['TOUS', 'ETUDIANT', 'ENCADRANT'], default: 'TOUS' },
    ordre: { type: Number, default: 0 },
    actif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GuidePFE', GuidePFESchema);
