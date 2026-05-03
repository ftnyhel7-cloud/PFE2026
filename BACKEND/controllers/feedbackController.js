// ═══════════════════════════════════════════════════════════
//  BACKEND/controllers/feedbackController.js
// ═══════════════════════════════════════════════════════════
const Feedback = require('../models/Feedback');

// ── GET /api/feedbacks  (ADMIN — tous) ────────────────────
exports.getAllFeedbacks = async (req, res) => {
  try {
    const { statut } = req.query;
    const filter = statut ? { statut } : {};
    const fbs = await Feedback.find(filter)
      .populate('auteur', 'nom prenom role')
      .sort({ createdAt: -1 });
    res.json(fbs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/feedbacks/publics  (tous — approuvés) ────────
exports.getFeedbacksPublics = async (req, res) => {
  try {
    const fbs = await Feedback.find({ statut: 'APPROUVE' })
      .select('nomAuteur roleAuteur note commentaire createdAt')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(fbs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/feedbacks  (ETUDIANT ou ENCADRANT) ──────────
exports.laisserFeedback = async (req, res) => {
  try {
    const { note, commentaire } = req.body;

    if (!note || note < 1 || note > 5) {
      return res.status(400).json({ message: 'Note invalide (1-5)' });
    }
    if (!commentaire || commentaire.trim().length < 10) {
      return res.status(400).json({ message: 'Commentaire trop court (10 caractères minimum)' });
    }

    // Vérifier si l'utilisateur a déjà laissé un feedback
    const exist = await Feedback.findOne({ auteur: req.user._id });
    if (exist) {
      return res.status(409).json({ message: 'Vous avez déjà laissé un avis' });
    }

    const fb = await Feedback.create({
      auteur: req.user._id,
      nomAuteur: `${req.user.prenom} ${req.user.nom}`,
      roleAuteur: req.user.role,
      note,
      commentaire: commentaire.trim(),
    });

    res.status(201).json(fb);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/feedbacks/:id/statut  (ADMIN — modérer) ──────
exports.modererFeedback = async (req, res) => {
  try {
    const { statut, reponseAdmin } = req.body;
    if (!['APPROUVE', 'REJETE', 'EN_ATTENTE'].includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const fb = await Feedback.findByIdAndUpdate(
      req.params.id,
      { statut, ...(reponseAdmin !== undefined && { reponseAdmin }) },
      { new: true }
    );
    if (!fb) return res.status(404).json({ message: 'Feedback introuvable' });
    res.json(fb);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/feedbacks/:id  (ADMIN) ────────────────────
exports.supprimerFeedback = async (req, res) => {
  try {
    const fb = await Feedback.findByIdAndDelete(req.params.id);
    if (!fb) return res.status(404).json({ message: 'Feedback introuvable' });
    res.json({ message: 'Feedback supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/feedbacks/stats  (ADMIN — statistiques) ──────
exports.statsFeedbacks = async (req, res) => {
  try {
    const approuves = await Feedback.find({ statut: 'APPROUVE' });
    const moyenne = approuves.length
      ? (approuves.reduce((s, f) => s + f.note, 0) / approuves.length).toFixed(1)
      : 0;
    const repartition = [5, 4, 3, 2, 1].map((n) => ({
      note: n,
      count: approuves.filter((f) => f.note === n).length,
    }));

    res.json({
      total: await Feedback.countDocuments(),
      enAttente: await Feedback.countDocuments({ statut: 'EN_ATTENTE' }),
      approuves: approuves.length,
      moyenne: parseFloat(moyenne),
      repartition,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
