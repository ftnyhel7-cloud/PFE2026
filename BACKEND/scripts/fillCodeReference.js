const mongoose = require('mongoose');
require('dotenv').config();

const Utilisateur = require('../models/Utilisateur');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connecté à MongoDB');

const users = await Utilisateur.find({
  $or: [{ codeReference: '' }, { codeReference: null }, { codeReference: { $exists: false } }],
});  console.log(`${users.length} utilisateurs sans code référence`);

  let countEtudiant = 1;
  let countEncadrant = 1;

  for (const u of users) {
    let code = '';
    const year = new Date(u.createdAt).getFullYear();

    if (u.role === 'ETUDIANT') {
      code = `MAT${year}${String(countEtudiant).padStart(3, '0')}`;
      countEtudiant++;
    } else if (u.role === 'ENCADRANT') {
      code = `ENC${year}${String(countEncadrant).padStart(3, '0')}`;
      countEncadrant++;
    } else {
      code = `ADM${year}001`;
    }

    await Utilisateur.findByIdAndUpdate(u._id, { codeReference: code });
    console.log(`✅ ${u.prenom} ${u.nom} → ${code}`);
  }

  console.log('Terminé !');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
