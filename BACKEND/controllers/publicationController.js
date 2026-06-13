// ═══════════════════════════════════════════════════════════
//  BACKEND/controllers/publicationController.js
// ═══════════════════════════════════════════════════════════
const Publication = require('../models/Publication');
const Notification = require('../models/Notification');
const Utilisateur = require('../models/Utilisateur');

// ── Helper : créer les notifications pour tous les destinataires ──
async function creerNotificationsPublication(pub) {
  try {
    let rolesVises = [];
    if (pub.audience === 'ETUDIANT') rolesVises = ['ETUDIANT'];
    else if (pub.audience === 'ENCADRANT') rolesVises = ['ENCADRANT'];
    else rolesVises = ['ETUDIANT', 'ENCADRANT'];

    const utilisateurs = await Utilisateur.find({ role: { $in: rolesVises } }, '_id');
    if (!utilisateurs.length) return;

    const notifs = utilisateurs.map((u) => ({
      idUtilisateur: u._id,
      titre: `📢 ${pub.titre}`,
      contenu: pub.contenu.length > 120 ? pub.contenu.slice(0, 120) + '...' : pub.contenu,
      type: 'SYSTEME',
      lu: false,
    }));

    await Notification.insertMany(notifs);
  } catch (err) {
    console.error('[Publication] Erreur notifications :', err.message);
  }
}

// ── GET /api/publications  (connecté — publiées uniquement) ──
exports.getPublications = async (req, res) => {
  try {
    const { audience } = req.query;
    const filter = { statut: 'PUBLIE' };
    if (audience) filter.audience = { $in: [audience, 'TOUS'] };
    const pubs = await Publication.find(filter)
      .populate('auteur', 'nom prenom')
      .sort({ datePublication: -1 });
    res.json(pubs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/publications/admin/all  (ADMIN — toutes) ────────
exports.getAllPublications = async (req, res) => {
  try {
    const pubs = await Publication.find().populate('auteur', 'nom prenom').sort({ createdAt: -1 });
    res.json(pubs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/publications  (ADMIN — créer en BROUILLON) ─────
// Toujours créer en BROUILLON → puis appeler /publier séparément
// Cela évite le double hook pre('save') + /publier
exports.creerPublication = async (req, res) => {
  try {
    const { titre, contenu, type, audience } = req.body;
    if (!titre || !contenu) {
      return res.status(400).json({ message: 'Titre et contenu requis' });
    }
    const pub = await Publication.create({
      titre,
      contenu,
      type: type || 'ANNONCE',
      audience: audience || 'TOUS',
      statut: 'BROUILLON',
      auteur: req.user._id,
    });
    res.status(201).json(pub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/publications/:id  (ADMIN — modifier sauf statut) ─
exports.modifierPublication = async (req, res) => {
  try {
    const { statut, ...rest } = req.body;
    const pub = await Publication.findByIdAndUpdate(req.params.id, rest, { new: true });
    if (!pub) return res.status(404).json({ message: 'Publication introuvable' });
    res.json(pub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/publications/:id/publier  (ADMIN) ───────────────
exports.publierPublication = async (req, res) => {
  try {
    const pub = await Publication.findById(req.params.id);
    if (!pub) return res.status(404).json({ message: 'Publication introuvable' });
    if (pub.statut === 'PUBLIE') return res.json(pub);

    pub.statut = 'PUBLIE';
    pub.datePublication = new Date();
    await pub.save();

    await creerNotificationsPublication(pub);
    res.json(pub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/publications/:id/vue ────────────────────────────
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

// ── DELETE /api/publications/:id ─────────────────────────────
exports.supprimerPublication = async (req, res) => {
  try {
    const pub = await Publication.findByIdAndDelete(req.params.id);
    if (!pub) return res.status(404).json({ message: 'Publication introuvable' });
    res.json({ message: 'Publication supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
