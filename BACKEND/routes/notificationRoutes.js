// ═══════════════════════════════════════════════════════════
//  BACKEND/routes/notificationRoutes.js  ✅ CORRIGÉ
//  Fix POST / : l'admin peut envoyer à un destinataire ciblé
//  Fix DELETE /:id : branché sur l'API (était local uniquement)
// ═══════════════════════════════════════════════════════════
const router = require('express').Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// ── POST / — Créer une notification ──────────────────────
//  ✅ FIX : si l'admin fournit un idUtilisateur dans le body,
//  la notification est créée pour ce destinataire.
//  Avant ce fix, elle était toujours créée pour req.user._id
//  (l'admin lui-même), donc jamais visible par l'étudiant/encadrant.
router.post('/', protect, async (req, res) => {
  try {
    const { titre, contenu, type, idUtilisateur } = req.body;

    if (!titre || !contenu) {
      return res.status(400).json({ message: 'Titre et contenu requis' });
    }

    // L'admin peut cibler un autre utilisateur via idUtilisateur
    // Sinon la notification est pour soi-même
    const destinataire =
      req.user.role === 'ADMINISTRATEUR' && idUtilisateur ? idUtilisateur : req.user._id;

    const notif = await Notification.create({
      idUtilisateur: destinataire,
      titre,
      contenu,
      type: type || 'SYSTEME',
      lu: false,
    });

    return res.status(201).json(notif);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── GET / — Toutes mes notifications ─────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const notifs = await Notification.find({ idUtilisateur: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);
    return res.json(notifs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── PUT /toutes-lues — Marquer toutes comme lues ─────────
// IMPORTANT : cette route DOIT être avant /:id
router.put('/toutes-lues', protect, async (req, res) => {
  try {
    await Notification.updateMany({ idUtilisateur: req.user._id, lu: false }, { lu: true });
    return res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── PUT /popup-shown — Marquer les popups comme affichées ─
router.put('/popup-shown', protect, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids requis (tableau)' });
    }
    await Notification.updateMany(
      { _id: { $in: ids }, idUtilisateur: req.user._id },
      { isPopupShown: true }
    );
    return res.json({ message: `${ids.length} notification(s) marquées comme affichées` });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── PUT /:id/lue — Marquer une notif comme lue ───────────
router.put('/:id/lue', protect, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, idUtilisateur: req.user._id },
      { lu: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: 'Notification introuvable' });
    return res.json(notif);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── DELETE /:id — Supprimer une notification ─────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const notif = await Notification.findOne({
      _id: req.params.id,
      idUtilisateur: req.user._id,
    });
    if (!notif) return res.status(404).json({ message: 'Notification introuvable' });

    await notif.deleteOne();
    return res.json({ message: 'Notification supprimée' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
