// ═══════════════════════════════════════════════════════════
//  BACKEND/routes/candidatureRoutes.js
//  Ajout étape 1 : routes publiques pour quiz par token
// ═══════════════════════════════════════════════════════════
const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/candidatureController');

// ── Routes PUBLIQUES (pas de login — accès par token) ─────
// GET  /api/candidatures/quiz/token/:token  → Ouvrir le quiz + démarrer chrono
// POST /api/candidatures/quiz/token/:token  → Soumettre les réponses
router.get('/quiz/token/:token', ctrl.ouvrirQuizToken);
router.post('/quiz/token/:token', ctrl.soumettreQuizToken);

// ── Étudiant ─────────────────────────────────────────────
router.post('/', protect, authorizeRoles('ETUDIANT'), ctrl.postuler);
router.get('/mes-candidatures', protect, authorizeRoles('ETUDIANT'), ctrl.mesCandidatures);
// Route protégée gardée pour compatibilité (si l'étudiant est connecté)
router.post('/:id/quiz', protect, authorizeRoles('ETUDIANT'), ctrl.soumettreQuiz);

// ── Encadrant ────────────────────────────────────────────
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
