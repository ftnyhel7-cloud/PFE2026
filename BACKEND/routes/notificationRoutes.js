// On importe express pour créer le router
const router = require('express').Router();

// On importe les fonctions du controller
const {
  mesNotifications,
  notificationsNonLues,
  marquerCommeLue,
  marquerToutesCommeLues,
  supprimerNotification,
  supprimerToutesNotifications,
} = require('../controllers/notificationController');

// On importe le middleware
const { protect } = require('../middleware/authMiddleware');

// ─── ROUTES NOTIFICATIONS ────────────────────────────
// Toutes les routes nécessitent d'être connecté
// Pas besoin de vérifier le rôle car
// tout le monde reçoit des notifications

// GET http://localhost:5000/api/notifications
// Voir toutes mes notifications
router.get('/', protect, mesNotifications);

// GET http://localhost:5000/api/notifications/non-lues
// Compter mes notifications non lues 🔴
router.get('/non-lues', protect, notificationsNonLues);

// PUT http://localhost:5000/api/notifications/toutes-lues
// Marquer toutes mes notifications comme lues
router.put('/toutes-lues', protect, marquerToutesCommeLues);

// PUT http://localhost:5000/api/notifications/:id/lue
// Marquer une notification comme lue
// :id = l'id de la notification
router.put('/:id/lue', protect, marquerCommeLue);

// DELETE http://localhost:5000/api/notifications/toutes
// Supprimer toutes mes notifications
router.delete('/toutes', protect, supprimerToutesNotifications);

// DELETE http://localhost:5000/api/notifications/:id
// Supprimer une notification
// :id = l'id de la notification
router.delete('/:id', protect, supprimerNotification);

// On exporte le router
module.exports = router;
