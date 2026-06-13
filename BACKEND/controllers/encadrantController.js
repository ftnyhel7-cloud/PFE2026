// ═══════════════════════════════════════════════════════════
//  À ajouter dans votre controller encadrant
//  GET /api/encadrant/mes-etudiants
//  Retourne la liste des étudiants que l'encadrant supervise
//  (via le modèle Projet : idEncadrant → idEtudiant)
// ═══════════════════════════════════════════════════════════

const Projet = require('../models/Projet');
const Encadrant = require('../models/Encadrant');

exports.mesEtudiants = async (req, res) => {
  try {
    // 1. Trouver le profil encadrant lié à l'utilisateur connecté
    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
    if (!encadrant) {
      return res.status(404).json({ message: 'Profil encadrant introuvable' });
    }

    // 2. Chercher tous les projets de cet encadrant
    //    et peupler les infos de l'étudiant
    const projets = await Projet.find({ idEncadrant: encadrant._id })
      .populate({
        path: 'idEtudiant',
        populate: {
          path: 'utilisateur', // pour avoir nom, prenom, email
          select: 'nom prenom email',
        },
      })
      .select('idEtudiant titre statutProjet');

    // 3. Dédupliquer les étudiants (un étudiant peut avoir un seul projet
    //    mais on sécurise au cas où)
    const seen = new Set();
    const etudiants = [];

    for (const projet of projets) {
      const et = projet.idEtudiant;
      if (!et) continue;
      const id = et._id.toString();
      if (seen.has(id)) continue;
      seen.add(id);

      etudiants.push({
        _id: et._id,
        utilisateur: et.utilisateur, // { nom, prenom, email }
        projet: {
          _id: projet._id,
          titre: projet.titre,
          statut: projet.statutProjet,
        },
      });
    }

    return res.json(etudiants);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ═══════════════════════════════════════════════════════════
//  À ajouter dans votre fichier de routes encadrant
//  (ex: encadrantRoutes.js)
// ═══════════════════════════════════════════════════════════

/*
const { mesEtudiants } = require('../controllers/encadrantController');
const { protect }      = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get(
  '/mes-etudiants',
  protect,
  authorizeRoles('ENCADRANT'),
  mesEtudiants
);
*/
