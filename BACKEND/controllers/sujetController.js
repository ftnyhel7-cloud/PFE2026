const Sujet = require('../models/Sujet');
const Notification = require('../models/Notification');
const Encadrant = require('../models/Encadrant');

// ─── PROPOSER UN SUJET (Encadrant) ──────────────────
exports.proposerSujet = async (req, res) => {
  try {
    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
    if (!encadrant) return res.status(404).json({ message: 'Profil encadrant introuvable' });

    const sujet = await Sujet.create({
      idEncadrant: encadrant._id,
      titre: req.body.titre,
      description: req.body.description,
      reference: req.body.reference || '',
      technologies: req.body.technologies || [],
      domaine: req.body.domaine || '',
      niveau: req.body.niveau || '',
      places: req.body.places || 1,
    });

    res.status(201).json(sujet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── VALIDER UN SUJET (Admin) ────────────────────────
exports.validerSujet = async (req, res) => {
  try {
    const sujet = await Sujet.findById(req.params.id);
    if (!sujet) {
      return res.status(404).json({ message: 'Sujet introuvable' });
    }

    sujet.valide = true;
    await sujet.save();

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
exports.getSujets = async (req, res) => {
  try {
    const sujets = await Sujet.find({ valide: true }).populate({
      path: 'idEncadrant',
      populate: {
        path: 'utilisateur',
        select: 'nom prenom email',
      },
    });

    // ✅ Un seul res.json() — l'ancien doublon a été supprimé
    return res.json(
      sujets.map((s) => ({
        ...s.toObject(),
        statut: 'VALIDE',
        disponibilite: s.disponibilite || 'DISPONIBLE',
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── LISTE DES SUJETS NON VALIDÉS (Admin) ───────────
exports.getSujetsNonValides = async (req, res) => {
  try {
    const sujets = await Sujet.find({ valide: false }).populate('idEncadrant');
    res.json(sujets.map((s) => ({ ...s.toObject(), statut: 'EN_ATTENTE' })));
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
//sujet modifier
exports.modifierSujet = async (req, res) => {
  try {
    const sujet = await Sujet.findById(req.params.id);
    if (!sujet) return res.status(404).json({ message: 'Sujet introuvable' });

    // Pas de vérification stricte — l'encadrant connecté peut modifier
    const { titre, description, technologies, domaine, niveau, places } = req.body;
    if (titre) sujet.titre = titre;
    if (description) sujet.description = description;
    if (technologies) sujet.technologies = technologies;
    if (domaine) sujet.domaine = domaine;
    if (niveau) sujet.niveau = niveau;
    if (places) sujet.places = places;

    await sujet.save();
    res.json(sujet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DÉFINIR LE DÉLAI DE POSTULATION (admin) ─────────────
exports.setDelaiPostulation = async (req, res) => {
  try {
    const { dateDebutPostulation, dateFinPostulation, maxCandidatsInterview } = req.body;

    const update = {};
    if (dateDebutPostulation !== undefined)
      update.dateDebutPostulation = dateDebutPostulation ? new Date(dateDebutPostulation) : null;
    if (dateFinPostulation !== undefined)
      update.dateFinPostulation = dateFinPostulation ? new Date(dateFinPostulation) : null;
    if (maxCandidatsInterview !== undefined)
      update.maxCandidatsInterview = parseInt(maxCandidatsInterview) || 5;

    const sujet = await require('../models/Sujet').findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!sujet) return res.status(404).json({ message: 'Sujet introuvable' });

    res.json({ message: 'Délai de postulation mis à jour.', sujet });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
