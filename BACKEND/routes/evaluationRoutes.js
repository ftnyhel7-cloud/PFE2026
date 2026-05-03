const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/evaluationController');

// ── ADMIN ──────────────────────────────────────────────────────
router.get('/', protect, authorizeRoles('ADMINISTRATEUR'), ctrl.getAllEvaluations);
router.delete('/:id', protect, authorizeRoles('ADMINISTRATEUR'), ctrl.supprimerEvaluation);

// ── ETUDIANT ───────────────────────────────────────────────────
router.get('/mes-evaluations', protect, authorizeRoles('ETUDIANT'), ctrl.mesEvaluations);

// ── ENCADRANT ──────────────────────────────────────────────────
router.get('/encadrant', protect, authorizeRoles('ENCADRANT'), ctrl.evaluationsEncadrant);
router.post('/', protect, authorizeRoles('ENCADRANT'), ctrl.creerEvaluation);

// ── NOUVELLES ROUTES FICHE ─────────────────────────────────────
router.post('/fiche', protect, authorizeRoles('ENCADRANT'), ctrl.creerFiche);
router.put('/:id/fiche', protect, authorizeRoles('ENCADRANT'), ctrl.modifierFiche);

// ── MODIFIER EVALUATION SIMPLE ─────────────────────────────────
router.put('/:id', protect, authorizeRoles('ENCADRANT'), ctrl.modifierEvaluation);

module.exports = router;
