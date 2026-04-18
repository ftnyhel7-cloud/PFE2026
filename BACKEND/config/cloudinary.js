const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure le stockage pour les CVs
const cvStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pfe/cvs', // dossier dans Cloudinary
    allowed_formats: ['pdf'], // seulement PDF
    resource_type: 'raw', // pour les PDFs
    public_id: (req, file) => {
      // nom du fichier : cv_userId_timestamp
      return `cv_${req.user._id}_${Date.now()}`;
    },
  },
});

// Configure le stockage pour les photos de profil
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pfe/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    resource_type: 'image',
    transformation: [{ width: 400, height: 400, crop: 'fill' }],
    public_id: (req, file) => {
      return `avatar_${req.user._id}_${Date.now()}`;
    },
  },
});

const uploadCV = multer({ storage: cvStorage });
const uploadImage = multer({ storage: imageStorage });

module.exports = { uploadCV, uploadImage, cloudinary };
