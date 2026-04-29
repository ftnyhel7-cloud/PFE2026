// ═══════════════════════════════════════════════════════════
//  BACKEND/routes/authRoutes.js
// ═══════════════════════════════════════════════════════════
const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ── Routes publiques ─────────────────────────────────────
router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);
router.post('/refresh-token', ctrl.refreshToken); // Appelé par l'intercepteur Axios
router.post('/forgot-password', ctrl.forgotPassword);
router.put('/reset-password/:token', ctrl.resetPassword);

// ── Routes protégées ─────────────────────────────────────
router.get('/profile', protect, ctrl.getProfile);
router.put('/profile', protect, ctrl.updateProfile);

module.exports = router;
