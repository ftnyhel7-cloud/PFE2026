// ═══════════════════════════════════════════════════════════
//  BACKEND/routes/feedbackRoutes.js
// ═══════════════════════════════════════════════════════════
const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/feedbackController');

// ── PUBLIC connecté — feedbacks approuvés (landing page) ─
router.get('/publics', protect, ctrl.getFeedbacksPublics);

// ── ADMIN ─────────────────────────────────────────────────
router.get('/', protect, authorizeRoles('ADMINISTRATEUR'), ctrl.getAllFeedbacks);
router.get('/stats', protect, authorizeRoles('ADMINISTRATEUR'), ctrl.statsFeedbacks);
router.put('/:id/statut', protect, authorizeRoles('ADMINISTRATEUR'), ctrl.modererFeedback);
router.delete('/:id', protect, authorizeRoles('ADMINISTRATEUR'), ctrl.supprimerFeedback);

// ── ETUDIANT / ENCADRANT — laisser un avis ───────────────
router.post('/', protect, authorizeRoles('ETUDIANT', 'ENCADRANT'), ctrl.laisserFeedback);

module.exports = router;
