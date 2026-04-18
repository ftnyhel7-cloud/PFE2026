const mongoose = require('mongoose');

const candidatureSchema = new mongoose.Schema(
  {
    idEtudiant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Etudiant',
      required: true,
    },
    idSujet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sujet',
      required: true,
    },
    cvUrl: { type: String, required: true },
    lettre: String,
    scoreIA: { type: Number, default: 0 },
    statut: {
      type: String,
      enum: ['EN_ATTENTE', 'QUIZ_REQUIS', 'INTERVIEW', 'ACCEPTE', 'REFUSE'],
      default: 'EN_ATTENTE',
    },
    scoreQuiz: { type: Number, default: 0 },
    dateInterview: Date,
    heureInterview: String,
  },
  { timestamps: true }
);

// Un étudiant ne peut pas postuler deux fois au même sujet
candidatureSchema.index({ idEtudiant: 1, idSujet: 1 }, { unique: true });

module.exports = mongoose.model('Candidature', candidatureSchema);
