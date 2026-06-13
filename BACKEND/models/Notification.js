// ═══════════════════════════════════════════════════════════
//  BACKEND/models/Notification.js  ✅ CORRIGÉ
//  Ajout du champ envoyePar pour l'historique admin
// ═══════════════════════════════════════════════════════════
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
      enum: ['TACHE', 'LIVRABLE', 'VALIDATION', 'REUNION', 'SYSTEME', 'AFFECTATION', 'EVALUATION'],
      required: true,
    },
    lu: { type: Boolean, default: false },
    isPopupShown: { type: Boolean, default: false },

    // ── Qui a envoyé cette notification (admin) ──────────
    // Permet à l'admin de voir l'historique de ce qu'il a envoyé
    envoyePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
