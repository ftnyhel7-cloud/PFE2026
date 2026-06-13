// ═══════════════════════════════════════════════════════════
//  À AJOUTER dans BACKEND/routes/adminRoutes.js
//  Route POST /api/admin/notifications
//  (adminController.sendNotification existe déjà ✅)
// ═══════════════════════════════════════════════════════════

// Ajoute cette ligne dans ton adminRoutes.js existant :
// router.post('/notifications', protect, adminOnly, ctrl.sendNotification);

// ── Si tu n'as pas de fichier adminRoutes.js, voici la version complète ──

const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const adminOnly = authorizeRoles('ADMINISTRATEUR');

router.get('/users', protect, adminOnly, ctrl.getUsers);
router.put('/users/:id/validate', protect, adminOnly, ctrl.validateUser);
router.put('/users/:id', protect, adminOnly, ctrl.updateUser);
router.delete('/users/:id', protect, adminOnly, ctrl.rejectUser);
router.get('/stats', protect, adminOnly, ctrl.getStats);
router.get('/logs', protect, adminOnly, ctrl.getLogs);
router.get('/affectations', protect, adminOnly, ctrl.getAffectations);

// ✅ ROUTE CLÉ — envoi de notifications aux destinataires ciblés
router.post('/notifications', protect, adminOnly, ctrl.sendNotification);
router.get('/notifications/historique', protect, adminOnly, ctrl.getNotificationsHistorique);
router.get('/support', protect, adminOnly, ctrl.getMessages);
router.post('/support/:id/reply', protect, adminOnly, ctrl.replyMessage);
router.put('/support/:id/archive', protect, adminOnly, ctrl.archiveMessage);
router.put('/support/:id/status', protect, adminOnly, ctrl.updateMessageStatus);


router.post('/users', protect, authorizeRoles('ADMINISTRATEUR'), async (req, res) => {
  try {
    const Utilisateur = require('../models/Utilisateur');
    const bcrypt = require('bcryptjs');
    const { prenom, nom, email, mot_de_passe, role, telephone } = req.body;
    const exist = await Utilisateur.findOne({ email });
    if (exist) return res.status(400).json({ message: 'Email déjà utilisé.' });
    const hash = await bcrypt.hash(mot_de_passe, 10);
    const year = new Date().getFullYear();
    const count = await Utilisateur.countDocuments({ role: role || 'ETUDIANT' });
    const prefix =
      (role || 'ETUDIANT') === 'ETUDIANT'
        ? 'MAT'
        : (role || 'ETUDIANT') === 'ENCADRANT'
          ? 'ENC'
          : 'ADM';
    const codeReference = `${prefix}${year}${String(count + 1).padStart(3, '0')}`;

    const user = await Utilisateur.create({
      prenom,
      nom,
      email,
      mot_de_passe: hash,
      role: role || 'ETUDIANT',
      telephone: telephone || '',
      codeReference,
      isValidated: true,
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.put('/users/:id/toggle-active', protect, adminOnly, async (req, res) => {
  try {
    const Utilisateur = require('../models/Utilisateur');
    const user = await Utilisateur.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.get('/config', protect, adminOnly, ctrl.getConfig);
router.put('/config', protect, adminOnly, ctrl.updateConfig);





module.exports = router;
