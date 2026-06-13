const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Détection mode : Cloudinary configuré ou stockage local ─
const cloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'ton_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'ton_api_key';

if (cloudinaryConfigured) {
  // ── Mode Cloudinary ────────────────────────────────────────
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('☁️  Cloudinary configuré :', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.warn('⚠️  Cloudinary non configuré → stockage local activé (uploads/)');
}

// ── Stockage local (fallback) ──────────────────────────────
const cvLocalDir = path.join(__dirname, '../uploads/cvs');
const avatarLocalDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(cvLocalDir)) fs.mkdirSync(cvLocalDir, { recursive: true });
if (!fs.existsSync(avatarLocalDir)) fs.mkdirSync(avatarLocalDir, { recursive: true });

const cvLocalStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, cvLocalDir),
  filename: (req, file, cb) => cb(null, `cv_${req.user._id}_${Date.now()}.pdf`),
});

const avatarLocalStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarLocalDir),
  filename: (req, file, cb) => cb(null, `avatar_${req.user._id}_${Date.now()}.jpg`),
});

// ── Multer instances ───────────────────────────────────────
let uploadCV, uploadImage;

if (cloudinaryConfigured) {
  const cvStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'pfe/cvs',
      allowed_formats: ['pdf'],
      resource_type: 'raw',
      public_id: (req, file) => `cv_${req.user._id}_${Date.now()}`,
    },
  });
  const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'pfe/avatars',
      allowed_formats: ['jpg', 'jpeg', 'png'],
      resource_type: 'image',
      transformation: [{ width: 400, height: 400, crop: 'fill' }],
      public_id: (req, file) => `avatar_${req.user._id}_${Date.now()}`,
    },
  });
  uploadCV = multer({ storage: cvStorage });
  uploadImage = multer({ storage: imageStorage });
} else {
  uploadCV = multer({
    storage: cvLocalStorage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') cb(null, true);
      else cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  });
  uploadImage = multer({
    storage: avatarLocalStorage,
    fileFilter: (req, file, cb) => {
      if (['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) cb(null, true);
      else cb(new Error('Seuls jpg/png sont acceptés'), false);
    },
    limits: { fileSize: 2 * 1024 * 1024 },
  });
}

module.exports = { uploadCV, uploadImage, cloudinary, cloudinaryConfigured };
