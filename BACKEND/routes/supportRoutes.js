// ═══════════════════════════════════════════════════════════
//  BACKEND/routes/supportRoutes.js
// ═══════════════════════════════════════════════════════════
const router = require('express').Router();
const ctrl = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const adminOnly = authorizeRoles('ADMINISTRATEUR');

// ── Route publique — formulaire de contact (LandingPage) ──
router.post('/contact', ctrl.createMessage);

// ── Routes admin — lecture et gestion des messages ────────
router.get('/messages', protect, adminOnly, ctrl.getMessages);
router.post('/messages/:id/reply', protect, adminOnly, ctrl.replyMessage);
router.put('/messages/:id/archive', protect, adminOnly, ctrl.archiveMessage);

module.exports = router;
