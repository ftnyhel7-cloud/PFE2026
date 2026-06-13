// ═══════════════════════════════════════════════════
// FICHIER 1 : models/Certification.js
// ═══════════════════════════════════════════════════
const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema(
  {
    idEtudiant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Etudiant',
      required: true,
    },
    idProjet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Projet',
      default: null,
    },
    titre: {
      type: String,
      required: true,
      trim: true,
    },
    organisme: {
      type: String,
      required: true,
      trim: true,
    },
    dateObtention: {
      type: Date,
      required: true,
    },
    dateExpiration: {
      type: Date,
      default: null,
    },
    lienVerification: {
      type: String,
      trim: true,
      default: '',
    },
    fichierCertif: {
      type: String, // chemin ou URL du fichier uploadé
      default: '',
    },
    statut: {
      type: String,
      enum: ['EN_ATTENTE', 'VALIDEE', 'REJETEE'],
      default: 'EN_ATTENTE',
    },
    commentaireAdmin: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Certification || mongoose.model('Certification', certificationSchema);
