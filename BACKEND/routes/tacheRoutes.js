// On importe express pour créer le router
const router = require('express').Router();

// On importe les fonctions du controller
const {
  creerTache,
  getTachesByProjet,
  mesTaches,
  changerStatutTache,
  supprimerTache,
  modifierTache,
} = require('../controllers/tacheController');

// On importe les middlewares
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// ─── ROUTES TÂCHES ───────────────────────────────────

// GET http://localhost:5000/api/taches/mes-taches
// Voir mes tâches
// Seulement l'étudiant
router.get('/mes-taches', protect, authorizeRoles('ETUDIANT'), mesTaches);

// GET http://localhost:5000/api/taches/projet/:projetId
// Voir toutes les tâches d'un projet
// Etudiant et Encadrant
router.get(
  '/projet/:projetId',
  protect,
  authorizeRoles('ETUDIANT', 'ENCADRANT'),
  getTachesByProjet
);

// POST http://localhost:5000/api/taches
// Créer une tâche
// Seulement l'encadrant
router.post('/', protect, authorizeRoles('ENCADRANT'), creerTache);

// PUT http://localhost:5000/api/taches/:id
// Modifier une tâche
// Seulement l'encadrant
router.put('/:id', protect, authorizeRoles('ENCADRANT'), modifierTache);

// PUT http://localhost:5000/api/taches/:id/statut
// Changer le statut d'une tâche
// Seulement l'étudiant
router.put('/:id/statut', protect, authorizeRoles('ETUDIANT'), changerStatutTache);

// DELETE http://localhost:5000/api/taches/:id
// Supprimer une tâche
// Seulement l'encadrant
router.delete('/:id', protect, authorizeRoles('ENCADRANT'), supprimerTache);

// On exporte le router
module.exports = router;
