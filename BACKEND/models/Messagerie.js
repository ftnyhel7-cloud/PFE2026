const mongoose = require('mongoose');

const messagerieSchema = new mongoose.Schema(
  {
    idExpediteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
    },
    idDestinataire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
    },
    contenu: { type: String, required: true },
    lu: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Messagerie', messagerieSchema);
