const mongoose = require('mongoose');

const encadrantSchema = new mongoose.Schema(
  {
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
    },
    matriculeProf: { type: String, unique: true },
    specialite: String,
    
    disponibilite: { type: Boolean, default: true },
    departement: String,
    typeEncadrant: {
      type: String,
      enum: ['Professionnel', 'Academique'],
    },
    bio: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Encadrant', encadrantSchema);
