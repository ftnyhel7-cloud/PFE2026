const mongoose = require('mongoose');

const tacheSchema = new mongoose.Schema(
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

    idProjet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Projet',
      required: true,
    },
    
    titre: { type: String, required: true },
    description: String,
    dateDebut: Date,
    dateLimite: Date,
    statutTache: {
      type: String,
      enum: ['A_FAIRE', 'EN_COURS', 'TERMINEE'],
      default: 'A_FAIRE',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tache', tacheSchema);
