const mongoose = require('mongoose');

const etudiantSchema = new mongoose.Schema(
  {
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
    }, //C'est le lien entre Etudiant et Utilisateur
    
    filiere: String,
    matricule: { type: String, unique: true },
    niveau: String,
    cvUrl: String,
    statutPFE: {
      type: String,
      enum: ['NON_AFFECTE', 'EN_ATTENTE_VALIDATION', 'EN_COURS', 'TERMINE'],
      default: 'NON_AFFECTE',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Etudiant', etudiantSchema);
