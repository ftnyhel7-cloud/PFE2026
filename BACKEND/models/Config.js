const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema(
  {
    cle: { type: String, required: true, unique: true },
    valeur: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Config', ConfigSchema);
