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

// ─── Helper: envoyer les notifications ────────────────────────
async function envoyerNotifications({ evalPop, encadrantUtilisateur, isModification }) {
  try {
    const Utilisateur = require('../models/Utilisateur');

    // Récupérer le nom encadrant
    let nomEncadrant = '';
    if (encadrantUtilisateur) {
      nomEncadrant =
        `${encadrantUtilisateur.prenom || ''} ${encadrantUtilisateur.nom || ''}`.trim();
    } else {
      nomEncadrant =
        `${evalPop.idEncadrant?.utilisateur?.prenom || ''} ${evalPop.idEncadrant?.utilisateur?.nom || ''}`.trim();
    }

    const titreProjet = evalPop.idProjet?.titre || 'votre projet';
    const noteFinale = evalPop.note ?? 0;
    const mention = evalPop.mention || '';

    const nomEtudiant =
      `${evalPop.idEtudiant?.utilisateur?.prenom || ''} ${evalPop.idEtudiant?.utilisateur?.nom || ''}`.trim();

    // 1. Notif pour l'étudiant
    const etudiantUserId = evalPop.idEtudiant?.utilisateur?._id;
    if (etudiantUserId) {
      await Notification.create({
        idUtilisateur: etudiantUserId,
        titre: isModification
          ? 'Votre évaluation a été modifiée'
          : 'Votre évaluation est disponible',
        contenu: isModification
          ? `${nomEncadrant} a modifié l'évaluation de "${titreProjet}". Nouvelle note : ${noteFinale}/20 (${mention}).`
          : `${nomEncadrant} a évalué votre projet "${titreProjet}". Note obtenue : ${noteFinale}/20 (${mention}).`,
        type: 'EVALUATION',
        lu: false,
      });
    }

    // 2. Notifs pour tous les admins
    const admins = await Utilisateur.find({ role: 'ADMINISTRATEUR' }).select('_id');
    await Promise.all(
      admins.map((admin) =>
        Notification.create({
          idUtilisateur: admin._id,
          titre: isModification
            ? "Fiche d'évaluation modifiée"
            : "Nouvelle fiche d'évaluation soumise",
          contenu: isModification
            ? `${nomEncadrant} a modifié l'évaluation de ${nomEtudiant} — Projet : "${titreProjet}" — Nouvelle note : ${noteFinale}/20.`
            : `${nomEncadrant} a évalué l'étudiant ${nomEtudiant} — Projet : "${titreProjet}" — Note : ${noteFinale}/20.`,
          type: 'EVALUATION',
          lu: false,
        })
      )
    );
  } catch (notifErr) {
    // Les notifications ne bloquent pas la réponse principale
    console.error('Erreur notification:', notifErr.message);
  }
}

// ─── Helper: calculer fiche ────────────────────────────────────
function calculerFiche(ficheData) {
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

  return { fiche, total, note, mention };
}

// ── POST /api/evaluations/fiche  (ENCADRANT) ──────────────────
exports.creerFiche = async (req, res) => {
  try {
    console.log('✅ creerFiche appelé');
    console.log('Body reçu:', JSON.stringify(req.body, null, 2));
    console.log('User ID:', req.user?._id, '| Role:', req.user?.role);
    const { idProjet, ficheData, observations } = req.body;

    const projet = await Projet.findById(idProjet);
    if (!projet) return res.status(404).json({ message: 'Projet introuvable' });

    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id }).populate(
      'utilisateur',
      'nom prenom'
    );
    if (!encadrant) return res.status(404).json({ message: 'Profil encadrant introuvable' });

    if (projet.idEncadrant.toString() !== encadrant._id.toString())
      return res.status(403).json({ message: 'Ce projet ne vous est pas assigné' });

    const { fiche, total, note, mention } = calculerFiche(ficheData);

    const updateData = {
      idEncadrant: encadrant._id,
      fiche,
      totalFiche: total,
      typeSaisie: 'fiche',
      note,
      mention,
      observations: observations || '',
      dateEvaluation: new Date(),
    };

    const existing = await Evaluation.findOne({ idProjet, idEtudiant: projet.idEtudiant });

    let savedId;
    if (existing) {
      // Mise à jour (pas de notifications pour une mise à jour via creerFiche)
      await Evaluation.updateOne({ _id: existing._id }, { $set: updateData });
      savedId = existing._id;
    } else {
      // Nouvelle évaluation
      const nouvelleEval = new Evaluation({
        idProjet,
        idEtudiant: projet.idEtudiant,
        ...updateData,
      });
      await Evaluation.collection.insertOne(nouvelleEval.toObject()); // bypass pre-save
      const savedId2 = nouvelleEval._id;
      savedId = savedId2;
      savedId = nouvelleEval._id;
    }

    // Populate pour la réponse et les notifications
    const evalPop = await Evaluation.findById(savedId)
      .populate({ path: 'idEtudiant', populate: { path: 'utilisateur', select: '_id nom prenom' } })
      .populate({
        path: 'idEncadrant',
        populate: { path: 'utilisateur', select: '_id nom prenom' },
      })
      .populate('idProjet', 'titre');

    // Envoyer les notifications seulement pour une nouvelle évaluation
    if (!existing) {
      await envoyerNotifications({
        evalPop,
        encadrantUtilisateur: encadrant.utilisateur,
        isModification: false,
      });
    }

    return res.status(existing ? 200 : 201).json(evalPop);
  } catch (err) {
    console.error('❌ ERREUR creerFiche:', err.message);
    res.status(500).json({ message: err.message });
  }
};


// ── PUT /api/evaluations/:id/fiche  (ENCADRANT) ───────────────
exports.modifierFiche = async (req, res) => {
  try {
    const { ficheData, observations } = req.body;

    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id }).populate(
      'utilisateur',
      'nom prenom'
    );
    if (!encadrant) return res.status(404).json({ message: 'Profil encadrant introuvable' });

    const eval_ = await Evaluation.findById(req.params.id);
    if (!eval_) return res.status(404).json({ message: 'Évaluation introuvable' });

    if (eval_.idEncadrant.toString() !== encadrant._id.toString())
      return res.status(403).json({ message: 'Accès refusé' });

    const { fiche, total, note, mention } = calculerFiche(ficheData);

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
      .populate({ path: 'idEtudiant', populate: { path: 'utilisateur', select: '_id nom prenom' } })
      .populate({
        path: 'idEncadrant',
        populate: { path: 'utilisateur', select: '_id nom prenom' },
      })
      .populate('idProjet', 'titre');

    // Envoyer les notifications de modification
    await envoyerNotifications({
      evalPop: updated,
      encadrantUtilisateur: encadrant.utilisateur,
      isModification: true,
    });

    return res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
