const router = require('express').Router();
const {
  postuler,
  mesCandidatures,
  candidaturesParSujet,
  changerStatutCandidature,
} = require('../controllers/candidatureController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Étudiant postule
router.post('/', protect, authorizeRoles('ETUDIANT'), postuler);

// Mes candidatures
router.get('/mes-candidatures', protect, authorizeRoles('ETUDIANT'), mesCandidatures);

// Candidatures d'un sujet
router.get(
  '/sujet/:idSujet',
  protect,
  authorizeRoles('ENCADRANT', 'ADMINISTRATEUR'),
  candidaturesParSujet
);

// Changer statut
router.put(
  '/:id/statut',
  protect,
  authorizeRoles('ENCADRANT', 'ADMINISTRATEUR'),
  changerStatutCandidature
);

module.exports = router;
