const router = require('express').Router();
const {
  creerTache,
  getTachesByProjet,
  mesTaches,
  mesTachesEncadrant, // ✅ NOUVEAU
  changerStatutTache,
  supprimerTache,
  modifierTache,
} = require('../controllers/tacheController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// GET /api/taches/mes-taches          → étudiant voit ses tâches
router.get('/mes-taches', protect, authorizeRoles('ETUDIANT'), mesTaches);

// GET /api/taches/mes-taches-encadrant → encadrant voit toutes ses tâches créées ✅ NOUVEAU
router.get('/mes-taches-encadrant', protect, authorizeRoles('ENCADRANT'), mesTachesEncadrant);

// GET /api/taches/projet/:projetId    → tâches d'un projet
router.get(
  '/projet/:projetId',
  protect,
  authorizeRoles('ETUDIANT', 'ENCADRANT'),
  getTachesByProjet
);

// POST /api/taches                    → créer une tâche
router.post('/', protect, authorizeRoles('ENCADRANT'), creerTache);

// PUT /api/taches/:id                 → modifier une tâche
router.put('/:id', protect, authorizeRoles('ENCADRANT'), modifierTache);

// PUT /api/taches/:id/statut          → changer statut (étudiant)
router.put('/:id/statut', protect, authorizeRoles('ETUDIANT'), changerStatutTache);

// DELETE /api/taches/:id              → supprimer une tâche
router.delete('/:id', protect, authorizeRoles('ENCADRANT'), supprimerTache);

module.exports = router;
