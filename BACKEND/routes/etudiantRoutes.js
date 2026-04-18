const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const Etudiant = require('../models/Etudiant');
const { uploadCV, uploadImage } = require('../config/cloudinary');

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
router.post('/upload-cv', protect, uploadCV.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier reçu' });
    }

    // URL du CV sur Cloudinary
    const cvUrl = req.file.path;

    // Sauvegarde l'URL dans MongoDB
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
    res.status(500).json({ message: err.message });
  }
});

// POST upload photo de profil
router.post('/upload-avatar', protect, uploadImage.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier reçu' });
    }

    const imageUrl = req.file.path;

    // Sauvegarde dans Utilisateur
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
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
