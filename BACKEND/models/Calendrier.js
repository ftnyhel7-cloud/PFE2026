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
    date: { type: Date, required: true },
    lienVisio: String,
    statutReunion: {
      type: String,
      enum: ['PLANIFIEE', 'EFFECTUEE', 'ANNULEE'],
      default: 'PLANIFIEE',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Calendrier', calendrierSchema);
