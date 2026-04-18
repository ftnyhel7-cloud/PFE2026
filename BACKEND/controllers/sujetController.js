const Sujet = require('../models/Sujet');
const Notification = require('../models/Notification');
const Encadrant = require('../models/Encadrant');

// ─── PROPOSER UN SUJET (Encadrant) ──────────────────
exports.proposerSujet = async (req, res) => {
  try {
    // 1. Trouver le profil encadrant
    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
    if (!encadrant) {
      return res.status(404).json({ message: 'Profil encadrant introuvable' });
    }

    // 2. Créer le sujet
    const sujet = await Sujet.create({
      idEncadrant: encadrant._id,
      titre: req.body.titre,
      description: req.body.description,
      reference: req.body.reference,
      technologies: req.body.technologies,
    });

    res.status(201).json(sujet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── VALIDER UN SUJET (Admin) ────────────────────────
exports.validerSujet = async (req, res) => {
  try {
    // 1. Trouver le sujet
    const sujet = await Sujet.findById(req.params.id);
    if (!sujet) {
      return res.status(404).json({ message: 'Sujet introuvable' });
    }

    // 2. Valider le sujet
    sujet.valide = true;
    await sujet.save();

    // 3. Notifier l'encadrant
    const encadrant = await Encadrant.findById(sujet.idEncadrant);
    await Notification.create({
      idUtilisateur: encadrant.utilisateur,
      titre: 'Sujet validé',
      contenu: `Votre sujet "${sujet.titre}" a été validé`,
      type: 'VALIDATION',
    });

    res.json(sujet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── LISTE DES SUJETS VALIDÉS (Tous) ────────────────
// ─── LISTE DES SUJETS VALIDÉS ────────────────────────
exports.getSujets = async (req, res) => {
  try {
    const sujets = await Sujet.find({ valide: true })
      .populate({
        path: 'idEncadrant',           // charge les infos de l'encadrant
        populate: {
          path: 'utilisateur',          // charge les infos utilisateur de l'encadrant
          select: 'nom prenom email'    // seulement ces champs
        }
      });

    res.json(sujets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── LISTE DES SUJETS NON VALIDÉS (Admin) ───────────
exports.getSujetsNonValides = async (req, res) => {
  try {
    const sujets = await Sujet.find({ valide: false }).populate('idEncadrant');
    res.json(sujets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MES SUJETS (Encadrant) ──────────────────────────
exports.mesSujets = async (req, res) => {
  try {
    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
    const sujets = await Sujet.find({ idEncadrant: encadrant._id });
    res.json(sujets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── SUPPRIMER UN SUJET (Encadrant/Admin) ───────────
exports.supprimerSujet = async (req, res) => {
  try {
    const sujet = await Sujet.findById(req.params.id);
    if (!sujet) {
      return res.status(404).json({ message: 'Sujet introuvable' });
    }

    await sujet.deleteOne();
    res.json({ message: 'Sujet supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
