// ═══════════════════════════════════════════════════
// FICHIER 3 : routes/certificationRoutes.js
// ═══════════════════════════════════════════════════
const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const {
  ajouterCertification,
  mesCertifications,
  toutesLesCertifications,
  changerStatut,
  supprimerCertification,
} = require('../controllers/certificationController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// ─── Config upload (PDF/image) ────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/certifications/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_')),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) return cb(null, true);
    cb(new Error('Seuls PDF, JPG et PNG sont acceptés.'));
  },
});

// GET  /api/certifications/mes-certifications  → étudiant
router.get('/mes-certifications', protect, authorizeRoles('ETUDIANT'), mesCertifications);

// POST /api/certifications                     → étudiant (avec fichier optionnel)
router.post(
  '/',
  protect,
  authorizeRoles('ETUDIANT'),
  upload.single('fichierCertif'),
  ajouterCertification
);

// DELETE /api/certifications/:id               → étudiant
router.delete('/:id', protect, authorizeRoles('ETUDIANT'), supprimerCertification);

// GET  /api/certifications                     → admin
router.get('/', protect, authorizeRoles('ADMINISTRATEUR'), toutesLesCertifications);

// PUT  /api/certifications/:id/statut          → admin
router.put('/:id/statut', protect, authorizeRoles('ADMINISTRATEUR'), changerStatut);

module.exports = router;
