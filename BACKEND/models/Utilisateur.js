const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const utilisateurSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mot_de_passe: {
      type: String,
      required: true,
      minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
    },
    role: {
      type: String,
      enum: ['ADMINISTRATEUR', 'ETUDIANT', 'ENCADRANT'],
      required: true,
    },
    telephone: String,
    image: String,
    resetToken: String,
    resetTokenExpire: Date,
  },
  { timestamps: true }
);

// Hachage mot de passe avant sauvegarde

utilisateurSchema.pre('save', async function () {
  if (!this.isModified('mot_de_passe')) return;
  this.mot_de_passe = await bcrypt.hash(this.mot_de_passe, 10);
});

// Vérifier mot de passe
utilisateurSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.mot_de_passe);
};

// Générer token réinitialisation
utilisateurSchema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetTokenExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model('Utilisateur', utilisateurSchema);
