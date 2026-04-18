// On importe express pour créer le router
const router = require('express').Router();

// On importe les fonctions du controller
const {
  envoyerMessage,
  getConversation,
  marquerCommeLus,
  messagesNonLus,
  getConversations,
} = require('../controllers/messagerieController');

// On importe les middlewares
const { protect } = require('../middleware/authMiddleware');

// ─── ROUTES MESSAGERIE ───────────────────────────────
// Toutes les routes nécessitent d'être connecté
// Pas besoin de vérifier le rôle car
// tout le monde peut envoyer des messages

// GET http://localhost:5000/api/messagerie
// Voir toutes mes conversations
router.get('/', protect, getConversations);

// GET http://localhost:5000/api/messagerie/non-lus
// Compter mes messages non lus 🔴
router.get('/non-lus', protect, messagesNonLus);

// GET http://localhost:5000/api/messagerie/:userId
// Voir la conversation avec un utilisateur spécifique
// :userId = l'id de l'autre personne
router.get('/:userId', protect, getConversation);

// POST http://localhost:5000/api/messagerie
// Envoyer un message
router.post('/', protect, envoyerMessage);

// PUT http://localhost:5000/api/messagerie/:userId/lus
// Marquer tous les messages d'une conversation comme lus
// :userId = l'id de l'expéditeur
router.put('/:userId/lus', protect, marquerCommeLus);

// On exporte le router
module.exports = router;
