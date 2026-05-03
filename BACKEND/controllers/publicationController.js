// ═══════════════════════════════════════════════════════════
//  BACKEND/controllers/publicationController.js
// ═══════════════════════════════════════════════════════════
const Publication = require('../models/Publication');

// ── GET /api/publications  (public — publiées uniquement) ─
exports.getPublications = async (req, res) => {
  try {
    const { audience } = req.query; // ETUDIANT | ENCADRANT | TOUS | undefined
    const filter = { statut: 'PUBLIE' };

    if (audience) {
      filter.audience = { $in: [audience, 'TOUS'] };
    }

    const pubs = await Publication.find(filter)
      .populate('auteur', 'nom prenom')
      .sort({ datePublication: -1 });

    res.json(pubs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/publications/admin  (ADMIN — toutes) ─────────
exports.getAllPublications = async (req, res) => {
  try {
    const pubs = await Publication.find().populate('auteur', 'nom prenom').sort({ createdAt: -1 });
    res.json(pubs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/publications  (ADMIN — créer) ───────────────
exports.creerPublication = async (req, res) => {
  try {
    const { titre, contenu, type, audience, statut } = req.body;

    if (!titre || !contenu) {
      return res.status(400).json({ message: 'Titre et contenu requis' });
    }

    const pub = await Publication.create({
      titre,
      contenu,
      type: type || 'ANNONCE',
      audience: audience || 'TOUS',
      statut: statut || 'BROUILLON',
      auteur: req.user._id,
    });

    res.status(201).json(pub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/publications/:id  (ADMIN — modifier) ─────────
exports.modifierPublication = async (req, res) => {
  try {
    const pub = await Publication.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pub) return res.status(404).json({ message: 'Publication introuvable' });
    res.json(pub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/publications/:id/publier  (ADMIN) ────────────
exports.publierPublication = async (req, res) => {
  try {
    const pub = await Publication.findByIdAndUpdate(
      req.params.id,
      { statut: 'PUBLIE', datePublication: new Date() },
      { new: true }
    );
    if (!pub) return res.status(404).json({ message: 'Publication introuvable' });
    res.json(pub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/publications/:id/vue  (incrémenter les vues) ─
exports.incrementerVues = async (req, res) => {
  try {
    const pub = await Publication.findByIdAndUpdate(
      req.params.id,
      { $inc: { vues: 1 } },
      { new: true }
    );
    if (!pub) return res.status(404).json({ message: 'Publication introuvable' });
    res.json(pub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/publications/:id  (ADMIN) ─────────────────
exports.supprimerPublication = async (req, res) => {
  try {
    const pub = await Publication.findByIdAndDelete(req.params.id);
    if (!pub) return res.status(404).json({ message: 'Publication introuvable' });
    res.json({ message: 'Publication supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
