// ═══════════════════════════════════════════════════════════
//  BACKEND/routes/encadrantRoutes.js
//  ✅ FIX : suppression du SVG JSX qui causait le crash Node.js
// ═══════════════════════════════════════════════════════════
const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const Encadrant = require('../models/Encadrant');
const Projet = require('../models/Projet');

// ── GET /api/encadrants/mon-profil ───────────────────────────
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

// ── PUT /api/encadrants/mon-profil ───────────────────────────
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

// ── GET /api/encadrants/mes-etudiants ────────────────────────
router.get('/mes-etudiants', protect, async (req, res) => {
  try {
    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
    if (!encadrant) {
      return res.status(404).json({ message: 'Profil encadrant introuvable' });
    }

    const projets = await Projet.find({ idEncadrant: encadrant._id })
      .populate({
        path: 'idEtudiant',
        populate: { path: 'utilisateur', select: 'nom prenom email telephone image' },
      })
      .populate('idSujet')
      .sort({ createdAt: -1 });

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
