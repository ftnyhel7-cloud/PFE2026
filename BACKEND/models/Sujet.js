const mongoose = require('mongoose');

const sujetSchema = new mongoose.Schema(
  {
    idEncadrant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Encadrant',
      required: true,
    },
    titre: { type: String, required: true },
    description: String,
    reference: String,
    technologies: [String],
    valide: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sujet', sujetSchema);
