const Referentiel = require('../models/Referentiel');

const defaultEtudiants = [
  { type: 'ETUDIANT', code: 'MAT2026001', label: 'Etudiant Test 1' },
  { type: 'ETUDIANT', code: 'MAT2026002', label: 'Etudiant Test 2' },
  { type: 'ETUDIANT', code: 'MAT2026003', label: 'Etudiant Test 3' },
];

const defaultEncadrants = [
  { type: 'ENCADRANT', code: 'ENC-CONTRAT-001', label: 'Encadrant Test 1' },
  { type: 'ENCADRANT', code: 'ENC-CONTRAT-002', label: 'Encadrant Test 2' },
  { type: 'ENCADRANT', code: 'ENC-CONTRAT-003', label: 'Encadrant Test 3' },
];

async function seedReferentielIfEmpty() {
  const total = await Referentiel.countDocuments();
  if (total > 0) return;

  const fakeData = [...defaultEtudiants, ...defaultEncadrants];
  await Referentiel.insertMany(fakeData);
  console.log(`🌱 Référentiel initialisé (${fakeData.length} entrées fake data).`);
}

module.exports = seedReferentielIfEmpty;
