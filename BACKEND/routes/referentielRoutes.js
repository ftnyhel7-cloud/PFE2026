// ═══════════════════════════════════════════════════════════
//  BACKEND/routes/referentielRoutes.js
//  CRUD des codes autorisés — Admin uniquement
// ═══════════════════════════════════════════════════════════
const router = require('express').Router();
const ctrl = require('../controllers/referentielController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');

// Toutes les routes sont protégées et réservées aux ADMINISTRATEURS
router.use(protect, authorizeRoles('ADMINISTRATEUR'));

router.get('/', ctrl.getAll);
router.post('/', ctrl.addCode);
router.put('/:id', ctrl.updateCode);
router.post('/bulk', ctrl.importBulk);
router.delete('/:id', ctrl.deleteCode);

module.exports = router;
