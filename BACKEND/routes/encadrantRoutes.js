const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const Encadrant = require('../models/Encadrant');

// GET /api/encadrants/mon-profil
router.get('/mon-profil', protect, async (req, res) => {
  try {
    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });

    if (!encadrant) {
      return res.status(404).json({ message: 'Profil encadrant introuvable' });
    }

    res.json(encadrant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/encadrants/mon-profil
router.put('/mon-profil', protect, async (req, res) => {
  try {
    const encadrant = await Encadrant.findOneAndUpdate({ utilisateur: req.user._id }, req.body, {
      new: true,
    });

    res.json(encadrant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
