// ═══════════════════════════════════════════════════════════
//  BACKEND/routes/publicationRoutes.js
// ═══════════════════════════════════════════════════════════
const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/publicationController');

// ── PUBLIC (connecté) — publications publiées ─────────────
// GET /api/publications?audience=ETUDIANT   → filtrées
// GET /api/publications?audience=ENCADRANT  → filtrées
// GET /api/publications                     → toutes publiées
router.get('/', protect, ctrl.getPublications);

// ── Incrémenter les vues (tout utilisateur connecté) ──────
router.put('/:id/vue', protect, ctrl.incrementerVues);

// ── ADMIN uniquement ──────────────────────────────────────
router.get('/admin/all', protect, authorizeRoles('ADMINISTRATEUR'), ctrl.getAllPublications);
router.post('/', protect, authorizeRoles('ADMINISTRATEUR'), ctrl.creerPublication);
router.put('/:id', protect, authorizeRoles('ADMINISTRATEUR'), ctrl.modifierPublication);
router.put('/:id/publier', protect, authorizeRoles('ADMINISTRATEUR'), ctrl.publierPublication);
router.delete('/:id', protect, authorizeRoles('ADMINISTRATEUR'), ctrl.supprimerPublication);

module.exports = router;
