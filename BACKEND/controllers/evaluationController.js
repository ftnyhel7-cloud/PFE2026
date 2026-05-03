const Evaluation = require('../models/Evaluation');
const Projet = require('../models/Projet');
const Encadrant = require('../models/Encadrant');
const Etudiant = require('../models/Etudiant');
const Notification = require('../models/Notification');
// ── GET /api/evaluations  (ADMIN) ──────────────────────────────
exports.getAllEvaluations = async (req, res) => {
  try {
    const evals = await Evaluation.find()
      .populate({ path: 'idEtudiant', populate: { path: 'utilisateur', select: 'nom prenom' } })
      .populate({ path: 'idEncadrant', populate: { path: 'utilisateur', select: 'nom prenom' } })
      .populate('idProjet', 'titre')
      .sort({ createdAt: -1 });
    res.json(evals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/evaluations/mes-evaluations  (ETUDIANT) ───────────
exports.mesEvaluations = async (req, res) => {
  try {
    const etudiant = await Etudiant.findOne({ utilisateur: req.user._id });
    if (!etudiant) return res.status(404).json({ message: 'Profil étudiant introuvable' });

    const evals = await Evaluation.find({ idEtudiant: etudiant._id })
      .populate({ path: 'idEncadrant', populate: { path: 'utilisateur', select: 'nom prenom' } })
      .populate('idProjet', 'titre')
      .sort({ createdAt: -1 });
    res.json(evals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/evaluations/encadrant  (ENCADRANT) ────────────────
exports.evaluationsEncadrant = async (req, res) => {
  try {
    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
    if (!encadrant) return res.status(404).json({ message: 'Profil encadrant introuvable' });

    const evals = await Evaluation.find({ idEncadrant: encadrant._id })
      .populate({ path: 'idEtudiant', populate: { path: 'utilisateur', select: 'nom prenom' } })
      .populate('idProjet', 'titre')
      .sort({ createdAt: -1 });
    res.json(evals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/evaluations  (ENCADRANT) ────────────────────────
exports.creerEvaluation = async (req, res) => {
  try {
    const { idProjet, criteres, observations } = req.body;

    if (!criteres) return res.status(400).json({ message: 'Les critères sont requis' });

    const projet = await Projet.findById(idProjet);
    if (!projet) return res.status(404).json({ message: 'Projet introuvable' });

    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
    if (!encadrant) return res.status(404).json({ message: 'Profil encadrant introuvable' });

    if (projet.idEncadrant.toString() !== encadrant._id.toString())
      return res.status(403).json({ message: 'Ce projet ne vous est pas assigné' });

    const eval_ = await Evaluation.findOneAndUpdate(
      { idProjet, idEtudiant: projet.idEtudiant },
      { idEncadrant: encadrant._id, criteres, observations: observations || '' },
      { new: true, upsert: true, runValidators: false }
    );
    await eval_.save();

    res.status(201).json(eval_);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/evaluations/:id  (ENCADRANT) ─────────────────────
exports.modifierEvaluation = async (req, res) => {
  try {
    const { criteres, observations } = req.body;
    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });

    const eval_ = await Evaluation.findById(req.params.id);
    if (!eval_) return res.status(404).json({ message: 'Évaluation introuvable' });

    if (eval_.idEncadrant.toString() !== encadrant._id.toString())
      return res.status(403).json({ message: 'Accès refusé' });

    if (criteres) eval_.criteres = criteres;
    if (observations !== undefined) eval_.observations = observations;
    await eval_.save();

    res.json(eval_);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/evaluations/:id  (ADMIN) ──────────────────────
exports.supprimerEvaluation = async (req, res) => {
  try {
    const eval_ = await Evaluation.findByIdAndDelete(req.params.id);
    if (!eval_) return res.status(404).json({ message: 'Évaluation introuvable' });
    res.json({ message: 'Évaluation supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/evaluations/fiche  (ENCADRANT) ──────────────────
exports.creerFiche = async (req, res) => {
  try {
    const { idProjet, ficheData, observations } = req.body;

    const projet = await Projet.findById(idProjet);
    if (!projet) return res.status(404).json({ message: 'Projet introuvable' });

    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
    if (!encadrant) return res.status(404).json({ message: 'Profil encadrant introuvable' });

    if (projet.idEncadrant.toString() !== encadrant._id.toString())
      return res.status(403).json({ message: 'Ce projet ne vous est pas assigné' });

    const MAX_CRIT = {
      assiduite: 4,
      motivation: 4,
      adaptation: 4,
      travail_grp: 4,
      initiative: 4,
      niv_sci: 6,
      expression: 6,
      glob: 8,
    };
    const PCT = [0, 0.25, 0.5, 0.75, 1.0];
    const fiche = {};
    let total = 0;

    for (const [key, max] of Object.entries(MAX_CRIT)) {
      const col = ficheData[key] ?? null;
      const pts = col !== null ? Math.round(max * PCT[col]) : 0;
      fiche[key] = { col, pts };
      total += pts;
    }

    const note = parseFloat(((total / 40) * 20).toFixed(2));
    let mention = 'Insuffisant';
    if (note >= 18) mention = 'Excellent';
    else if (note >= 16) mention = 'Très Bien';
    else if (note >= 14) mention = 'Bien';
    else if (note >= 12) mention = 'Assez Bien';
    else if (note >= 10) mention = 'Passable';

    // ── On calcule tout ici, pas besoin du hook pre-save
    const existing = await Evaluation.findOne({
      idProjet,
      idEtudiant: projet.idEtudiant,
    });

    if (existing) {
      existing.idEncadrant = encadrant._id;
      existing.fiche = fiche;
      existing.totalFiche = total;
      existing.typeSaisie = 'fiche';
      existing.note = note;
      existing.mention = mention;
      existing.observations = observations || '';
      existing.dateEvaluation = new Date();

      // Bypass pre-save hook avec updateOne direct
      await Evaluation.updateOne(
        { _id: existing._id },
        {
          $set: {
            fiche,
            totalFiche: total,
            typeSaisie: 'fiche',
            note,
            mention,
            observations: observations || '',
            dateEvaluation: new Date(),
          },
        }
      );
      const updated = await Evaluation.findById(existing._id)
        .populate({ path: 'idEtudiant', populate: { path: 'utilisateur', select: 'nom prenom' } })
        .populate({ path: 'idEncadrant', populate: { path: 'utilisateur', select: 'nom prenom' } })
        .populate('idProjet', 'titre');
      return res.json(updated);
    }

    // Nouvelle évaluation
    const nouvelleEval = await Evaluation.create({
      idProjet,
      idEtudiant: projet.idEtudiant,
      idEncadrant: encadrant._id,
      fiche,
      totalFiche: total,
      typeSaisie: 'fiche',
      note,
      mention,
      observations: observations || '',
    });

    // ── Notifications automatiques ──────────────────────────
    try {
      // Populate pour récupérer les infos étudiant + encadrant
      const evalPop = await Evaluation.findById(nouvelleEval._id)
        .populate({
          path: 'idEtudiant',
          populate: { path: 'utilisateur', select: '_id nom prenom' },
        })
        .populate({
          path: 'idEncadrant',
          populate: { path: 'utilisateur', select: '_id nom prenom' },
        })
        .populate('idProjet', 'titre');

      const nomEncadrant =
        `${evalPop.idEncadrant?.utilisateur?.prenom || ''} ${evalPop.idEncadrant?.utilisateur?.nom || ''}`.trim();
      const titreProjet = evalPop.idProjet?.titre || 'votre projet';
      const noteFinale = evalPop.note ?? 0;

      // 1. Notif pour l'étudiant
      if (evalPop.idEtudiant?.utilisateur?._id) {
        await Notification.create({
          idUtilisateur: evalPop.idEtudiant.utilisateur._id,
          titre: 'Votre évaluation est disponible',
          contenu: `${nomEncadrant} a évalué votre projet "${titreProjet}". Note obtenue : ${noteFinale}/20 (${evalPop.mention}).`,
          type: 'EVALUATION',
          lu: false,
        });
      }

      // 2. Notif pour l'admin (idUtilisateur = tous les admins)
      const Utilisateur = require('../models/Utilisateur');
      const admins = await Utilisateur.find({ role: 'ADMINISTRATEUR' }).select('_id');
      await Promise.all(
        admins.map((admin) =>
          Notification.create({
            idUtilisateur: admin._id,
            titre: "Nouvelle fiche d'évaluation soumise",
            contenu: `${nomEncadrant} a évalué l'étudiant ${evalPop.idEtudiant?.utilisateur?.prenom || ''} ${evalPop.idEtudiant?.utilisateur?.nom || ''} — Projet : "${titreProjet}" — Note : ${noteFinale}/20.`,
            type: 'EVALUATION',
            lu: false,
          })
        )
      );
    } catch (notifErr) {
      // Les notifications ne bloquent pas la réponse principale
      console.error('Erreur notification:', notifErr.message);
    }

    res.status(201).json(nouvelleEval);

    res.status(201).json(nouvelleEval);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/evaluations/:id/fiche  (ENCADRANT) ───────────────
exports.modifierFiche = async (req, res) => {
  try {
    const { ficheData, observations } = req.body;

    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
    if (!encadrant) return res.status(404).json({ message: 'Profil encadrant introuvable' });

    const eval_ = await Evaluation.findById(req.params.id);
    if (!eval_) return res.status(404).json({ message: 'Évaluation introuvable' });

    if (eval_.idEncadrant.toString() !== encadrant._id.toString())
      return res.status(403).json({ message: 'Accès refusé' });

    const MAX_CRIT = {
      assiduite: 4,
      motivation: 4,
      adaptation: 4,
      travail_grp: 4,
      initiative: 4,
      niv_sci: 6,
      expression: 6,
      glob: 8,
    };
    const PCT = [0, 0.25, 0.5, 0.75, 1.0];
    const fiche = {};
    let total = 0;

    for (const [key, max] of Object.entries(MAX_CRIT)) {
      const col = ficheData[key] ?? null;
      const pts = col !== null ? Math.round(max * PCT[col]) : 0;
      fiche[key] = { col, pts };
      total += pts;
    }

    const note = parseFloat(((total / 40) * 20).toFixed(2));
    let mention = 'Insuffisant';
    if (note >= 18) mention = 'Excellent';
    else if (note >= 16) mention = 'Très Bien';
    else if (note >= 14) mention = 'Bien';
    else if (note >= 12) mention = 'Assez Bien';
    else if (note >= 10) mention = 'Passable';

    await Evaluation.updateOne(
      { _id: eval_._id },
      {
        $set: {
          fiche,
          totalFiche: total,
          typeSaisie: 'fiche',
          note,
          mention,
          observations: observations ?? eval_.observations,
          dateEvaluation: new Date(),
        },
      }
    );

    const updated = await Evaluation.findById(eval_._id)
      .populate({ path: 'idEtudiant', populate: { path: 'utilisateur', select: 'nom prenom' } })
      .populate({ path: 'idEncadrant', populate: { path: 'utilisateur', select: 'nom prenom' } })
      .populate('idProjet', 'titre');

    // ── Notifications automatiques ──────────────────────────
    try {
      const nomEncadrant =
        `${encadrant?.utilisateur?.prenom || ''} ${encadrant?.utilisateur?.nom || ''}`.trim();
      const titreProjet = updated.idProjet?.titre || 'votre projet';
      const noteFinale = updated.note ?? 0;

      // 1. Notif pour l'étudiant
      if (updated.idEtudiant?.utilisateur?._id) {
        await Notification.create({
          idUtilisateur: updated.idEtudiant.utilisateur._id,
          titre: 'Votre évaluation a été modifiée',
          contenu: `${nomEncadrant} a modifié l'évaluation de "${titreProjet}". Nouvelle note : ${noteFinale}/20 (${updated.mention}).`,
          type: 'EVALUATION',
          lu: false,
        });
      }

      // 2. Notif pour l'admin
      const Utilisateur = require('../models/Utilisateur');
      const admins = await Utilisateur.find({ role: 'ADMINISTRATEUR' }).select('_id');
      await Promise.all(
        admins.map((admin) =>
          Notification.create({
            idUtilisateur: admin._id,
            titre: "Fiche d'évaluation modifiée",
            contenu: `${nomEncadrant} a modifié l'évaluation de ${updated.idEtudiant?.utilisateur?.prenom || ''} ${updated.idEtudiant?.utilisateur?.nom || ''} — Projet : "${titreProjet}" — Nouvelle note : ${noteFinale}/20.`,
            type: 'EVALUATION',
            lu: false,
          })
        )
      );
    } catch (notifErr) {
      console.error('Erreur notification:', notifErr.message);
    }

    res.json(updated);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};