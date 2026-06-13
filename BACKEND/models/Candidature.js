// ═══════════════════════════════════════════════════════════
//  BACKEND/models/Candidature.js
// ═══════════════════════════════════════════════════════════
const mongoose = require('mongoose');
const crypto = require('crypto');

// ── Sous-schema pour une question QCM ───────────────────────
const QuizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, default: '' },
    options: {
      A: { type: String, default: '' },
      B: { type: String, default: '' },
      C: { type: String, default: '' },
      D: { type: String, default: '' },
    },
    reponse: { type: String, enum: ['A', 'B', 'C', 'D'], default: 'A' },
  },
  { _id: false }
);

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
    cvUrl: { type: String, default: '' },
    lettre: { type: String, default: '' },
    sujetFileUrl: { type: String, default: '' },
    sujetFileName: { type: String, default: '' },
    lettreFileUrl: { type: String, default: '' },
    lettreFileName: { type: String, default: '' },

    // ── Score IA ────────────────────────────────────────────
    scoreIA: { type: Number, default: 0, min: 0, max: 100 },

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
      quiz: [QuizQuestionSchema], // 20 questions QCM {question, options{A,B,C,D}, reponse}
    },

    // ── Statut du processus ──────────────────────────────────
    statut: {
      type: String,
      enum: ['EN_ATTENTE', 'QUIZ_REQUIS', 'INTERVIEW', 'ACCEPTE', 'REFUSE'],
      default: 'EN_ATTENTE',
    },

    // ── Quiz — token sécurisé ────────────────────────────────
    quizToken: {
      type: String,
      default: null,
      index: true,
    },
    quizTokenExpire: {
      type: Date,
      default: null,
    },
    quizOuvertA: {
      type: Date,
      default: null,
    },
    quizExpireA: {
      type: Date,
      default: null,
    },
    quizSoumisA: {
      type: Date,
      default: null,
    },
    quizExpire: {
      type: Boolean,
      default: false,
    },

    // ── Résultat quiz ────────────────────────────────────────
    scoreQuiz: { type: Number, default: 0 },
    reponsesQuiz: [{ type: String }],

    // ── Entretien ───────────────────────────────────────────
    dateInterview: { type: Date, default: null },
    heureInterview: { type: String, default: '' },
    lienMeet: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// ── Index pour éviter les doublons ──────────────────────────
CandidatureSchema.index({ idSujet: 1, idEtudiant: 1 }, { unique: true });

// ── Méthode : générer un token quiz unique ───────────────────
CandidatureSchema.methods.genererQuizToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.quizToken = token;
  this.quizTokenExpire = new Date(Date.now() + 48 * 60 * 60 * 1000);
  this.quizOuvertA = null;
  this.quizExpireA = null;
  this.quizSoumisA = null;
  this.quizExpire = false;
  return token;
};

// ── Méthode : démarrer le chronomètre (appelé à l'ouverture) ─
CandidatureSchema.methods.demarrerChrono = function () {
  if (this.quizOuvertA) return;
  this.quizOuvertA = new Date();
  this.quizExpireA = new Date(Date.now() + 15 * 60 * 1000);
};

// ── Méthode : vérifier si le chronomètre est encore valide ───
CandidatureSchema.methods.chronoValide = function () {
  if (!this.quizExpireA) return true;
  return new Date() <= this.quizExpireA;
};

module.exports = mongoose.model('Candidature', CandidatureSchema);
