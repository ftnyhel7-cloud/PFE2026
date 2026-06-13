const GuidePFE = require('../models/GuidePFE');

exports.getAll = async (req, res) => {
  try {
    const items = await GuidePFE.find({ actif: true }).sort({
      categorie: 1,
      ordre: 1,
      createdAt: -1,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { titre, contenu, categorie, type, audience, ordre } = req.body;
    if (!titre || !contenu)
      return res.status(400).json({ message: 'Titre et contenu obligatoires' });
    const item = await GuidePFE.create({
      titre,
      contenu,
      categorie,
      type,
      audience,
      ordre: ordre || 0,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await GuidePFE.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Élément introuvable' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await GuidePFE.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Élément introuvable' });
    res.json({ message: 'Supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
