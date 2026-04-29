const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const Encadrant = require('../models/Encadrant');
const Projet = require('../models/Projet');

// GET /api/encadrants/mon-profil
router.get('/mon-profil', protect, async (req, res) => {
  try {
    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });

    if (!encadrant) {
      return res.status(404).json({ message: 'Profil encadrant introuvable' });
    }

    res.json(encadrant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/encadrants/mon-profil
router.put('/mon-profil', protect, async (req, res) => {
  try {
    const encadrant = await Encadrant.findOneAndUpdate({ utilisateur: req.user._id }, req.body, {
      new: true,
    });

    res.json(encadrant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/encadrants/mes-etudiants ────────────────────
// Récupère les étudiants dont le PFE est assigné à cet encadrant
// L'accès est conditionné à la validation du PFE (projet créé)
router.get('/mes-etudiants', protect, async (req, res) => {
  try {
    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
    if (!encadrant) {
      return res.status(404).json({ message: 'Profil encadrant introuvable' });
    }

    // Chercher tous les projets de cet encadrant
    const projets = await Projet.find({ idEncadrant: encadrant._id })
      .populate({
        path: 'idEtudiant',
        populate: { path: 'utilisateur', select: 'nom prenom email telephone image' },
      })
      .populate('idSujet')
      .sort({ createdAt: -1 });

    // Formater les données pour le frontend
    const etudiants = projets.map((projet) => ({
      projet: {
        _id: projet._id,
        titre: projet.titre || projet.idSujet?.titre,
        description: projet.idSujet?.description,
        technologies: projet.idSujet?.technologies,
        statutProjet: projet.statutProjet,
        dateDebut: projet.dateDebut,
      },
      etudiant: projet.idEtudiant
        ? {
            _id: projet.idEtudiant._id,
            filiere: projet.idEtudiant.filiere,
            matricule: projet.idEtudiant.matricule,
            niveau: projet.idEtudiant.niveau,
            statutPFE: projet.idEtudiant.statutPFE,
            utilisateur: projet.idEtudiant.utilisateur,
          }
        : null,
    }));

    res.json(etudiants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

