// ═══════════════════════════════════════════════════════════
//  BACKEND/routes/adminRoutes.js
//  Routes Admin — protégées (ADMINISTRATEUR uniquement)
// ═══════════════════════════════════════════════════════════
const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');

// Toutes les routes admin sont protégées et réservées aux ADMINISTRATEURS
router.use(protect, authorizeRoles('ADMINISTRATEUR'));

// ── Utilisateurs ─────────────────────────────────────────
router.get('/users', ctrl.getUsers);
router.put('/users/:id/validate', ctrl.validateUser);
router.delete('/users/:id', ctrl.rejectUser);

// ── Statistiques ─────────────────────────────────────────
router.get('/stats', ctrl.getStats);

// ── Logs / Monitoring ────────────────────────────────────
router.get('/logs', ctrl.getLogs);

// ── Notifications ciblées ────────────────────────────────
router.post('/notifications', ctrl.sendNotification);

// ── Support / Messages ───────────────────────────────────
router.get('/messages', ctrl.getMessages);
router.post('/messages/:id/reply', ctrl.replyMessage);
router.patch('/messages/:id/status', ctrl.updateMessageStatus);
router.put('/messages/:id/archive', ctrl.archiveMessage);

// ── Affectations (projets) ───────────────────────────────
router.get('/affectations', ctrl.getAffectations);

module.exports = router;
