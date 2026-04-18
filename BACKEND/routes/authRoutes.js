const router = require('express').Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Routes publiques
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Routes protégées
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
