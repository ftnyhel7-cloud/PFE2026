// ═══════════════════════════════════════════════════════════
//  BACKEND/controllers/tacheController.js
//  ✅ FIX : validation date passée à la création et modification
//  ✅ FIX : modifier une tâche (encadrant)
//  ✅ FIX : supprimer une tâche (encadrant)
// ═══════════════════════════════════════════════════════════
const Tache = require('../models/Tache');
const Etudiant = require('../models/Etudiant');
const Encadrant = require('../models/Encadrant');
const Notification = require('../models/Notification');

// ─── HELPER : vérifie qu'une date n'est pas dans le passé ──
function isDatePassee(date) {
  if (!date) return false;
  const aujourd_hui = new Date();
  aujourd_hui.setHours(0, 0, 0, 0); // compare uniquement les jours
  return new Date(date) < aujourd_hui;
}

// ─── CRÉER UNE TÂCHE (Encadrant) ────────────────────────────
exports.creerTache = async (req, res) => {
  try {
    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
    if (!encadrant) {
      return res.status(404).json({ message: 'Profil encadrant introuvable' });
    }

    const { titre, description, dateDebut, dateLimite, idEtudiant, idProjet } = req.body;

    // ✅ RÈGLE : La date de début ne peut pas être dans le passé
    if (isDatePassee(dateDebut)) {
      return res.status(400).json({
        message: 'La date de début ne peut pas être une date passée.',
      });
    }

    // ✅ RÈGLE : La date limite ne peut pas être dans le passé
    if (isDatePassee(dateLimite)) {
      return res.status(400).json({
        message: 'La date limite ne peut pas être une date passée.',
      });
    }

    // ✅ RÈGLE : La date limite doit être après la date de début
    if (dateDebut && dateLimite && new Date(dateLimite) < new Date(dateDebut)) {
      return res.status(400).json({
        message: 'La date limite doit être après la date de début.',
      });
    }

    const tache = await Tache.create({
      idEncadrant: encadrant._id,
      idEtudiant,
      idProjet,
      titre,
      description,
      dateDebut,
      dateLimite,
    });

    // Notification à l'étudiant
    const etudiant = await Etudiant.findById(idEtudiant);
    if (etudiant) {
      await Notification.create({
        idUtilisateur: etudiant.utilisateur,
        titre: 'Nouvelle tâche assignée',
        contenu: `Une nouvelle tâche vous a été assignée : "${tache.titre}"`,
        type: 'TACHE',
      });
    }

    res.status(201).json(tache);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MES TÂCHES (Etudiant) ──────────────────────────────────
exports.mesTaches = async (req, res) => {
  try {
    const etudiant = await Etudiant.findOne({ utilisateur: req.user._id });
    if (!etudiant) {
      return res.status(404).json({ message: 'Profil étudiant introuvable' });
    }

    const taches = await Tache.find({ idEtudiant: etudiant._id })
      .populate('idProjet')
      .populate('idEncadrant')
      .sort({ dateDebut: 1 });

    res.json(taches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MES TÂCHES (Encadrant) ─────────────────────────────────
exports.mesTachesEncadrant = async (req, res) => {
  try {
    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
    if (!encadrant) {
      return res.status(404).json({ message: 'Profil encadrant introuvable' });
    }

    const taches = await Tache.find({ idEncadrant: encadrant._id })
      .populate({
        path: 'idEtudiant',
        populate: { path: 'utilisateur', select: 'nom prenom email' },
      })
      .populate('idProjet')
      .sort({ dateDebut: 1 });

    res.json(taches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── TÂCHES D'UN PROJET ─────────────────────────────────────
exports.getTachesByProjet = async (req, res) => {
  try {
    const taches = await Tache.find({ idProjet: req.params.projetId })
      .populate('idEtudiant')
      .populate('idEncadrant');
    res.json(taches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── CHANGER STATUT (Etudiant) ──────────────────────────────
exports.changerStatutTache = async (req, res) => {
  try {
    const tache = await Tache.findByIdAndUpdate(
      req.params.id,
      { statutTache: req.body.statutTache },
      { new: true }
    );
    if (!tache) {
      return res.status(404).json({ message: 'Tâche introuvable' });
    }

    const encadrant = await Encadrant.findById(tache.idEncadrant);
    if (encadrant) {
      await Notification.create({
        idUtilisateur: encadrant.utilisateur,
        titre: 'Statut tâche modifié',
        contenu: `La tâche "${tache.titre}" est maintenant : ${req.body.statutTache}`,
        type: 'TACHE',
      });
    }

    res.json(tache);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MODIFIER UNE TÂCHE (Encadrant) ─────────────────────────
//  ✅ Validation : dates ne peuvent pas être dans le passé
exports.modifierTache = async (req, res) => {
  try {
    const { titre, description, dateDebut, dateLimite } = req.body;

    // ✅ RÈGLE : La date de début ne peut pas être dans le passé
    if (isDatePassee(dateDebut)) {
      return res.status(400).json({
        message: 'La date de début ne peut pas être une date passée.',
      });
    }

    // ✅ RÈGLE : La date limite ne peut pas être dans le passé
    if (isDatePassee(dateLimite)) {
      return res.status(400).json({
        message: 'La date limite ne peut pas être une date passée.',
      });
    }

    // ✅ RÈGLE : La date limite doit être après la date de début
    if (dateDebut && dateLimite && new Date(dateLimite) < new Date(dateDebut)) {
      return res.status(400).json({
        message: 'La date limite doit être après la date de début.',
      });
    }

    const tache = await Tache.findByIdAndUpdate(
      req.params.id,
      { titre, description, dateDebut, dateLimite },
      { new: true }
    );
    if (!tache) {
      return res.status(404).json({ message: 'Tâche introuvable' });
    }

    // Notification à l'étudiant
    const etudiant = await Etudiant.findById(tache.idEtudiant);
    if (etudiant) {
      await Notification.create({
        idUtilisateur: etudiant.utilisateur,
        titre: 'Tâche modifiée',
        contenu: `La tâche "${tache.titre}" a été modifiée par votre encadrant.`,
        type: 'TACHE',
      });
    }

    res.json(tache);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── SUPPRIMER UNE TÂCHE (Encadrant) ────────────────────────
exports.supprimerTache = async (req, res) => {
  try {
    const tache = await Tache.findById(req.params.id);
    if (!tache) {
      return res.status(404).json({ message: 'Tâche introuvable' });
    }
    await tache.deleteOne();
    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
