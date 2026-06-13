// ═══════════════════════════════════════════════════════════
//  BACKEND/routes/messagerieRoutes.js
// ═══════════════════════════════════════════════════════════
const router = require('express').Router();
const ctrl = require('../controllers/messagerieController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, ctrl.getConversations);
router.get('/non-lus', protect, ctrl.messagesNonLus);
router.get('/mon-encadrant', protect, ctrl.getMonEncadrant); // étudiant
router.get('/mes-etudiants', protect, ctrl.getMesEtudiants); // encadrant
router.get('/conversation/:userId', protect, ctrl.getConversation);
router.post('/', protect, ctrl.envoyerMessage);
router.put('/:userId/lus', protect, ctrl.marquerCommeLus);
router.post('/typing', protect, ctrl.sendTyping);
module.exports = router;
