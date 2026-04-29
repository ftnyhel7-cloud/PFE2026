const Sujet = require('../models/Sujet');
const Encadrant = require('../models/Encadrant');

const sujetsBase = [
  ['Plateforme RH intelligente', 'Automatisation des workflows RH', ['React', 'Node.js', 'MongoDB']],
  ['App mobile santé', 'Suivi patients et rendez-vous', ['Flutter', 'Firebase']],
  ['Détection fraude e-commerce', 'Scoring anti-fraude temps réel', ['Python', 'FastAPI', 'PostgreSQL']],
  ['Dashboard IoT industriel', 'Monitoring capteurs et alertes', ['React', 'MQTT', 'InfluxDB']],
  ['Chatbot universitaire', 'Assistant FAQ étudiants', ['NLP', 'Rasa', 'Node.js']],
  ['Analyse sentiment social', 'Exploration sentiment des tweets', ['Python', 'Transformers']],
  ['Système recommandation cours', 'Recommandation personnalisée', ['Python', 'TensorFlow']],
  ['Gestion parc automobile', 'Suivi flotte et maintenance', ['React', 'Express', 'MongoDB']],
  ['Blockchain traçabilité', 'Suivi lot de production', ['Solidity', 'Web3.js']],
  ['Plateforme covoiturage', 'Matching trajets en temps réel', ['React Native', 'Socket.io']],
];

function buildSujets(encadrantId) {
  const out = [];
  for (let i = 1; i <= 30; i += 1) {
    const [titre, description, technologies] = sujetsBase[(i - 1) % sujetsBase.length];
    out.push({
      idEncadrant: encadrantId,
      titre: `${titre} #${i}`,
      description: `${description} - Sujet de test ${i} pour environnement réaliste.`,
      reference: `PFE-TEST-${String(i).padStart(3, '0')}`,
      technologies,
      valide: true,
    });
  }
  return out;
}

async function seedSujetsIfNeeded() {
  const total = await Sujet.countDocuments();
  if (total >= 30) return;

  const encadrant = await Encadrant.findOne().select('_id');
  if (!encadrant) {
    console.log('⚠️ Seed sujets ignoré: aucun encadrant trouvé.');
    return;
  }

  if (total > 0 && total < 30) {
    await Sujet.deleteMany({});
  }

  const sujets = buildSujets(encadrant._id);
  await Sujet.insertMany(sujets);
  console.log(`🌱 Sujets initialisés (${sujets.length} sujets de test).`);
}

module.exports = seedSujetsIfNeeded;
