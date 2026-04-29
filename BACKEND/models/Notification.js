// ═══════════════════════════════════════════════════════════
//  BACKEND/models/Notification.js
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
      enum: ['TACHE', 'LIVRABLE', 'VALIDATION', 'REUNION', 'SYSTEME', 'AFFECTATION'],
      required: true,
    },
    // ── Champ existant ───────────────────────────────────
    lu: { type: Boolean, default: false },

    // ── Nouveau champ : popup déjà affichée ? ────────────
    // true  = popup déjà montrée → ne plus l'afficher au login
    // false = nouvelle notif → afficher la popup une seule fois
    isPopupShown: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
