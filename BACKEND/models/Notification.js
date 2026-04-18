const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    idUtilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
    },
    titre: { type: String, required: true },
    contenu: { type: String, required: true },
    type: {
      type: String,
      enum: ['TACHE', 'LIVRABLE', 'VALIDATION', 'REUNION'],
      required: true,
    },
    lu: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
