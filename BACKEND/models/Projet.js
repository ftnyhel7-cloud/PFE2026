const mongoose = require('mongoose');

const projetSchema = new mongoose.Schema(
  {
    idEtudiant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Etudiant',
      required: true,
    }, //Le projet appartient à un étudiant

    idEncadrant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Encadrant',
      required: true,
    }, //Le projet est supervisé par un encadrant

    idSujet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sujet',
      required: true,
    }, //Le projet est basé sur un sujet
    
    titre: { type: String, required: true },
    description: String,
    dateDebut: Date,
    dateFin: Date,
    statutProjet: {
      type: String,
      enum: ['EN_COURS', 'REVISION', 'TERMINE'],
      default: 'EN_COURS',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Projet', projetSchema);
