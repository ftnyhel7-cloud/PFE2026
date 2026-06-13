// On importe express pour créer le router
const router = require('express').Router();

// On importe les fonctions du controller
const {
  proposerSujet,
  validerSujet,
  getSujets,
  getSujetsNonValides,
  mesSujets,
  supprimerSujet,
  modifierSujet,
} = require('../controllers/sujetController');

// On importe les middlewares
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// ─── ROUTES SUJETS ───────────────────────────────────

// GET http://localhost:5000/api/sujets
// Voir tous les sujets validés
// Accessible à tous les utilisateurs connectés
router.get('/', protect, getSujets);

// GET http://localhost:5000/api/sujets/non-valides
// Voir les sujets pas encore validés
// Seulement l'administrateur
router.get('/non-valides', protect, authorizeRoles('ADMINISTRATEUR'), getSujetsNonValides);

// GET http://localhost:5000/api/sujets/mes-sujets
// Voir mes sujets que j'ai proposés
// Seulement l'encadrant
router.get('/mes-sujets', protect, authorizeRoles('ENCADRANT'), mesSujets);

// POST http://localhost:5000/api/sujets
// Proposer un nouveau sujet
// Seulement l'encadrant
router.post('/', protect, authorizeRoles('ENCADRANT'), proposerSujet);

// PUT http://localhost:5000/api/sujets/:id/valider
// Valider un sujet
// Seulement l'administrateur
router.put('/:id/valider', protect, authorizeRoles('ADMINISTRATEUR'), validerSujet);

// DELETE http://localhost:5000/api/sujets/:id
// Supprimer un sujet
// Encadrant ou Administrateur
router.delete('/:id', protect, authorizeRoles('ENCADRANT', 'ADMINISTRATEUR'), supprimerSujet);

router.put('/:id', protect, authorizeRoles('ENCADRANT'), modifierSujet);

// PUT /api/sujets/:id/delai — Admin définit le délai de postulation
router.put(
  '/:id/delai',
  protect,
  authorizeRoles('ADMINISTRATEUR'),
  require('../controllers/sujetController').setDelaiPostulation
);

// On exporte le router
module.exports = router;
