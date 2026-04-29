// BACKEND/models/Candidature.js
const mongoose = require('mongoose');

const CandidatureSchema = new mongoose.Schema(
  {
    // ── Références ──────────────────────────────────────────
    idSujet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sujet',
      required: true,
    },
    idEtudiant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Etudiant',
      required: true,
    },

    // ── Fichiers soumis ─────────────────────────────────────
    cvUrl: {
      type: String,
      default: '',
    },
    lettre: {
      type: String,
      default: '',
    },

    // ── Score IA ────────────────────────────────────────────
    scoreIA: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ── Analyse complète générée par l'IA ───────────────────
    analyseIA: {
      resume: { type: String, default: '' },
      forces: [{ type: String }],
      faiblesses: [{ type: String }],
      decision: {
        type: String,
        enum: ['REFUSE', 'QUIZ_REQUIS', 'INTERVIEW', 'ACCEPTE'],
        default: 'INTERVIEW',
      },
      justification: { type: String, default: '' },
      quiz: [{ type: String }], // Questions du quiz générées par l'IA
    },

    // ── Statut du processus ──────────────────────────────────
    statut: {
      type: String,
      enum: ['EN_ATTENTE', 'QUIZ_REQUIS', 'INTERVIEW', 'ACCEPTE', 'REFUSE'],
      default: 'EN_ATTENTE',
    },

    // ── Quiz ────────────────────────────────────────────────
    scoreQuiz: {
      type: Number,
      default: 0,
    },
    reponsesQuiz: [
      {
        type: String,
      },
    ],

    // ── Entretien ───────────────────────────────────────────
    dateInterview: {
      type: Date,
      default: null,
    },
    heureInterview: {
      type: String,
      default: '',
    },
    lienMeet: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // createdAt, updatedAt automatiques
  }
);

// ── Index pour éviter les doublons ──────────────────────────
CandidatureSchema.index({ idSujet: 1, idEtudiant: 1 }, { unique: true });

module.exports = mongoose.model('Candidature', CandidatureSchema);
