// ═══════════════════════════════════════════════════════════
//  BACKEND/models/Calendrier.js
//  ✅ Ajout des champs : titre, heure, duree
//     (manquants → causaient l'affichage 00:00 et "(sans titre)")
// ═══════════════════════════════════════════════════════════
const mongoose = require('mongoose');

const calendrierSchema = new mongoose.Schema(
  {
    idEncadrant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Encadrant',
      required: true,
    },
    idEtudiant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Etudiant',
      required: true,
    },
    // ✅ Titre de la réunion
    titre: {
      type: String,
      trim: true,
      default: 'Réunion PFE',
    },
    // ✅ Description / ordre du jour
    description: {
      type: String,
      trim: true,
      default: '',
    },
    // Date de la réunion (jour uniquement, ex: 2026-05-12)
    date: {
      type: Date,
      required: true,
    },
    // ✅ Heure au format "HH:MM", ex: "14:30"
    heure: {
      type: String,
      default: '09:00',
      match: /^\d{2}:\d{2}$/,
    },
    // ✅ Durée en minutes
    duree: {
      type: Number,
      default: 60,
      min: 15,
      max: 480,
    },
    lienVisio: {
      type: String,
      default: '',
    },
    statutReunion: {
      type: String,
      enum: ['PLANIFIEE', 'EFFECTUEE', 'ANNULEE'],
      default: 'PLANIFIEE',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Calendrier', calendrierSchema);
