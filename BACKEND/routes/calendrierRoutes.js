// On importe express pour créer le router
const router = require('express').Router();

// On importe les fonctions du controller
const {
  planifierReunion,
  mesReunionsEtudiant,
  mesReunionsEncadrant,
  changerStatutReunion,
  modifierReunion,
  supprimerReunion,
} = require('../controllers/calendrierController');

// On importe les middlewares
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// ─── ROUTES CALENDRIER ───────────────────────────────

// GET http://localhost:5000/api/calendrier/etudiant
// Voir mes réunions en tant qu'étudiant
// Seulement l'étudiant
router.get('/etudiant', protect, authorizeRoles('ETUDIANT'), mesReunionsEtudiant);

// GET http://localhost:5000/api/calendrier/encadrant
// Voir mes réunions en tant qu'encadrant
// Seulement l'encadrant
router.get('/encadrant', protect, authorizeRoles('ENCADRANT'), mesReunionsEncadrant);

// POST http://localhost:5000/api/calendrier
// Planifier une nouvelle réunion
// Seulement l'encadrant
router.post('/', protect, authorizeRoles('ENCADRANT'), planifierReunion);

// PUT http://localhost:5000/api/calendrier/:id
// Modifier une réunion
// Seulement l'encadrant
router.put('/:id', protect, authorizeRoles('ENCADRANT'), modifierReunion);

// PUT http://localhost:5000/api/calendrier/:id/statut
// Changer le statut d'une réunion
// PLANIFIEE → EFFECTUEE ou ANNULEE
// Seulement l'encadrant
router.put('/:id/statut', protect, authorizeRoles('ENCADRANT'), changerStatutReunion);

// DELETE http://localhost:5000/api/calendrier/:id
// Supprimer une réunion
// Seulement l'encadrant
router.delete('/:id', protect, authorizeRoles('ENCADRANT'), supprimerReunion);

// On exporte le router
module.exports = router;
