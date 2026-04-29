// BACKEND/routes/candidatureRoutes.js
const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/candidatureController');

// ── Étudiant ─────────────────────────────────────────────────
// POST   /api/candidatures            → Postuler (avec analyse IA)
// GET    /api/candidatures/mes-candidatures → Mes candidatures
// POST   /api/candidatures/:id/quiz   → Soumettre les réponses quiz

router.post('/', protect, authorizeRoles('ETUDIANT'), ctrl.postuler);

router.get('/mes-candidatures', protect, authorizeRoles('ETUDIANT'), ctrl.mesCandidatures);

router.post('/:id/quiz', protect, authorizeRoles('ETUDIANT'), ctrl.soumettreQuiz);

// ── Encadrant ─────────────────────────────────────────────────
// GET  /api/candidatures/sujet/:idSujet  → Candidatures d'un sujet
// GET  /api/candidatures/sujet/all       → Toutes mes candidatures
// PUT  /api/candidatures/:id/statut      → Changer le statut

router.get('/sujet/all', protect, authorizeRoles('ENCADRANT'), ctrl.toutesMesCandidatures);

router.get(
  '/sujet/:idSujet',
  protect,
  authorizeRoles('ENCADRANT', 'ADMINISTRATEUR'),
  ctrl.candidaturesParSujet
);

router.put(
  '/:id/statut',
  protect,
  authorizeRoles('ENCADRANT', 'ADMINISTRATEUR'),
  ctrl.changerStatutCandidature
);

module.exports = router;
