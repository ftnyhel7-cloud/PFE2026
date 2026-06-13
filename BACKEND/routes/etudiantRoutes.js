const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const Etudiant = require('../models/Etudiant');
const { uploadCV, uploadImage, cloudinaryConfigured, cloudinary } = require('../config/cloudinary');
const multer = require('multer');

// ── Helpers URL ────────────────────────────────────────────
function buildCvUrl(req, file) {
  if (cloudinaryConfigured) {
    // Cloudinary : l'URL est dans req.file.path
    return file.path;
  }
  // Stockage local : construire l'URL publique
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${backendUrl}/uploads/cvs/${file.filename}`;
}

function buildAvatarUrl(req, file) {
  if (cloudinaryConfigured) {
    return file.path;
  }
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${backendUrl}/uploads/avatars/${file.filename}`;
}

// GET mon profil étudiant
router.get('/mon-profil', protect, async (req, res) => {
  try {
    const etudiant = await Etudiant.findOne({ utilisateur: req.user._id });
    if (!etudiant) return res.status(404).json({ message: 'Profil introuvable' });
    res.json(etudiant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT modifier mon profil étudiant
router.put('/mon-profil', protect, async (req, res) => {
  try {
    const etudiant = await Etudiant.findOneAndUpdate({ utilisateur: req.user._id }, req.body, {
      new: true,
    });
    res.json(etudiant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST upload CV (fichier PDF)
router.post(
  '/upload-cv',
  protect,
  (req, res, next) => {
    uploadCV.single('cv')(req, res, (err) => {
      if (err) {
        console.error('Erreur upload CV:', err.message);
        return res.status(500).json({ message: `Erreur upload : ${err.message}` });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier reçu' });
      }

      const cvUrl = buildCvUrl(req, req.file);
      console.log(`📄 CV uploadé : ${cvUrl}`);

      const etudiant = await Etudiant.findOneAndUpdate(
        { utilisateur: req.user._id },
        { cvUrl },
        { new: true }
      );

      res.json({
        message: '✅ CV uploadé avec succès !',
        cvUrl,
        etudiant,
      });
    } catch (err) {
      console.error('Erreur route upload-cv:', err.message);
      res.status(500).json({ message: err.message });
    }
  }
);

// POST upload document (sujet ou lettre) — PDF ou Word
const docLocalDir = path.join(__dirname, '../uploads/documents');
if (!fs.existsSync(docLocalDir)) fs.mkdirSync(docLocalDir, { recursive: true });

const docLocalStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, docLocalDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `doc_${req.user._id}_${Date.now()}${ext}`);
  },
});

const ALLOWED_DOC_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

let uploadDocument;
if (cloudinaryConfigured) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const docStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'pfe/documents',
      allowed_formats: ['pdf', 'doc', 'docx'],
      resource_type: 'raw',
      public_id: (req, file) => `doc_${req.user._id}_${Date.now()}`,
    },
  });
  uploadDocument = multer({ storage: docStorage });
} else {
  uploadDocument = multer({
    storage: docLocalStorage,
    fileFilter: (req, file, cb) => {
      if (ALLOWED_DOC_MIMES.includes(file.mimetype)) cb(null, true);
      else cb(new Error('Seuls PDF, DOC et DOCX sont acceptés'), false);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  });
}

router.post(
  '/upload-document',
  protect,
  (req, res, next) => {
    uploadDocument.single('document')(req, res, (err) => {
      if (err) {
        console.error('Erreur upload document:', err.message);
        return res.status(500).json({ message: `Erreur upload : ${err.message}` });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });
      let documentUrl;
      if (cloudinaryConfigured) {
        documentUrl = req.file.path;
      } else {
        const backendUrl =
          process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        documentUrl = `${backendUrl}/uploads/documents/${req.file.filename}`;
      }
      console.log(`📎 Document uploadé : ${documentUrl}`);
      res.json({
        message: '✅ Document uploadé avec succès !',
        documentUrl,
        filename: req.file.originalname,
      });
    } catch (err) {
      console.error('Erreur route upload-document:', err.message);
      res.status(500).json({ message: err.message });
    }
  }
);

// POST upload photo de profil
router.post(
  '/upload-avatar',
  protect,
  (req, res, next) => {
    uploadImage.single('avatar')(req, res, (err) => {
      if (err) {
        console.error('Erreur upload avatar:', err.message);
        return res.status(500).json({ message: `Erreur upload : ${err.message}` });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier reçu' });
      }

      const imageUrl = buildAvatarUrl(req, req.file);
      console.log(`🖼️  Avatar uploadé : ${imageUrl}`);

      const Utilisateur = require('../models/Utilisateur');
      const user = await Utilisateur.findByIdAndUpdate(
        req.user._id,
        { image: imageUrl },
        { new: true }
      ).select('-mot_de_passe');

      res.json({
        message: '✅ Photo uploadée avec succès !',
        imageUrl,
        user,
      });
    } catch (err) {
      console.error('Erreur route upload-avatar:', err.message);
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
