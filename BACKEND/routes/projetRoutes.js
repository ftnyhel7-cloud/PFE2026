// On importe express pour créer le router
const router = require('express').Router();

// On importe les fonctions du controller
const {
  creerProjet,
  getProjets,
  monProjet,
  projetEncadrant,
  changerStatut,
} = require('../controllers/projetController');

// On importe les middlewares
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// ─── ROUTES PROJETS ──────────────────────────────────

// GET http://localhost:5000/api/projets
// Voir tous les projets
// Seulement l'administrateur
router.get('/', protect, authorizeRoles('ADMINISTRATEUR'), getProjets);

// GET http://localhost:5000/api/projets/mon-projet
// Voir mon projet
// Seulement l'étudiant
router.get('/mon-projet', protect, authorizeRoles('ETUDIANT'), monProjet);

// GET http://localhost:5000/api/projets/encadrant/:encadrantId
// Voir les projets d'un encadrant
// Seulement l'encadrant
router.get('/encadrant/:encadrantId', protect, authorizeRoles('ENCADRANT'), projetEncadrant);

// POST http://localhost:5000/api/projets
// Créer un projet (admin ou encadrant)
router.post('/', protect, authorizeRoles('ADMINISTRATEUR', 'ENCADRANT'), creerProjet);

// PUT http://localhost:5000/api/projets/:id/statut
// Changer le statut du projet
// Seulement l'encadrant
router.put('/:id/statut', protect, authorizeRoles('ENCADRANT'), changerStatut);

// On exporte le router
module.exports = router;
