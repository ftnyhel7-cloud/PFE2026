const Projet = require('../models/Projet');
const Etudiant = require('../models/Etudiant');
const Notification = require('../models/Notification');
const Encadrant = require('../models/Encadrant');

// ─── CRÉER UN PROJET (Admin) ─────────────────────────
exports.creerProjet = async (req, res) => {
  try {
    let idEncadrant = req.body.idEncadrant;

    // Si c'est un encadrant connecté, on force son propre idEncadrant
    if (req.user?.role === 'ENCADRANT') {
      const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
      if (!encadrant) {
        return res.status(404).json({ message: 'Profil encadrant introuvable' });
      }
      idEncadrant = encadrant._id;
    }

    const projet = await Projet.create({
      idEtudiant: req.body.idEtudiant,
      idEncadrant,
      idSujet: req.body.idSujet,
      titre: req.body.titre,
      description: req.body.description,
      dateDebut: req.body.dateDebut,
      dateFin: req.body.dateFin,
    });

    // Mettre à jour le statut de l'étudiant
    await Etudiant.findByIdAndUpdate(req.body.idEtudiant, { statutPFE: 'EN_COURS' });

    // Notifier l'étudiant
    const etudiant = await Etudiant.findById(req.body.idEtudiant);
    await Notification.create({
      idUtilisateur: etudiant.utilisateur,
      titre: 'Projet créé',
      contenu: `Votre projet "${projet.titre}" a été créé`,
      type: 'VALIDATION',
    });

    res.status(201).json(projet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── TOUS LES PROJETS (Admin) ────────────────────────
exports.getProjets = async (req, res) => {
  try {
    const projets = await Projet.find()
      .populate('idEtudiant')
      .populate('idEncadrant')
      .populate('idSujet');
    res.json(projets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MON PROJET (Etudiant) ───────────────────────────
exports.monProjet = async (req, res) => {
  try {
    const etudiant = await Etudiant.findOne({ utilisateur: req.user._id });
    const projet = await Projet.findOne({ idEtudiant: etudiant._id })
      .populate('idEncadrant')
      .populate('idSujet');
    res.json(projet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── PROJETS DE MON ENCADRANT ────────────────────────
exports.projetEncadrant = async (req, res) => {
  try {
    const projets = await Projet.find({ idEncadrant: req.params.encadrantId })
      .populate('idEtudiant')
      .populate('idSujet');
    res.json(projets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── CHANGER STATUT PROJET (Encadrant) ──────────────
exports.changerStatut = async (req, res) => {
  try {
    const projet = await Projet.findByIdAndUpdate(
      req.params.id,
      { statutProjet: req.body.statutProjet },
      { new: true }
    );

    // Si projet terminé → mettre à jour statut étudiant
    if (req.body.statutProjet === 'TERMINE') {
      await Etudiant.findByIdAndUpdate(projet.idEtudiant, { statutPFE: 'TERMINE' });
    }

    // Notifier l'étudiant
    const etudiant = await Etudiant.findById(projet.idEtudiant);
    await Notification.create({
      idUtilisateur: etudiant.utilisateur,
      titre: 'Statut projet modifié',
      contenu: `Votre projet est maintenant : ${req.body.statutProjet}`,
      type: 'VALIDATION',
    });

    res.json(projet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
