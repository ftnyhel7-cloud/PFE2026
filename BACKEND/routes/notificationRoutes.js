// ═══════════════════════════════════════════════════════════
//  BACKEND/routes/notificationRoutes.js  (version complète)
//  Remplace l'ancien fichier
// ═══════════════════════════════════════════════════════════
const router = require('express').Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

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
// IMPORTANT : cette route DOIT être avant /:id pour ne pas
// être capturée par la route dynamique
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
// ⚠️ ÉTAIT MANQUANT — maintenant ajouté
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
