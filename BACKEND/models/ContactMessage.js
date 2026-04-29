// ═══════════════════════════════════════════════════════════
//  BACKEND/models/ContactMessage.js
// ═══════════════════════════════════════════════════════════
const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    sujet: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    reponse: { type: String, default: null },
    dateReponse: { type: Date, default: null },
    statut: {
      type: String,
      enum: ['NOUVEAU', 'REPONDU', 'ARCHIVE'],
      default: 'NOUVEAU',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
