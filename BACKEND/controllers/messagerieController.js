// ═══════════════════════════════════════════════════════════
//  BACKEND/controllers/messagerieController.js
//  Messagerie sécurisée — Pusher remplace Socket.IO
// ═══════════════════════════════════════════════════════════
const Messagerie = require('../models/Messagerie');
const Projet = require('../models/Projet');
const Etudiant = require('../models/Etudiant');
const Encadrant = require('../models/Encadrant');
const Utilisateur = require('../models/Utilisateur');
const Pusher = require('pusher');

// ── Init Pusher ───────────────────────────────────────────
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// ── Helper : résoudre l'interlocuteur autorisé ────────────
async function getInterlocuteurAutorise(userId, role, targetUserId) {
  if (role === 'ETUDIANT') {
    const etudiant = await Etudiant.findOne({ utilisateur: userId });
    if (!etudiant) throw new Error('Profil étudiant introuvable');

    const projet = await Projet.findOne({ idEtudiant: etudiant._id }).populate({
      path: 'idEncadrant',
      populate: { path: 'utilisateur', select: 'nom prenom image role email' },
    });

    if (!projet) throw new Error('Aucun projet affecté');
    if (!projet.idEncadrant) throw new Error('Aucun encadrant affecté');

    const encadrantUserId = projet.idEncadrant.utilisateur?._id?.toString();
    if (targetUserId && encadrantUserId !== targetUserId.toString())
      throw new Error('Accès non autorisé à cette conversation');

    return {
      interlocuteur: projet.idEncadrant.utilisateur,
      interlocuteurUserId: encadrantUserId,
      projet,
    };
  }

  if (role === 'ENCADRANT') {
    const encadrant = await Encadrant.findOne({ utilisateur: userId });
    if (!encadrant) throw new Error('Profil encadrant introuvable');

    if (targetUserId) {
      const etudiantUser = await Utilisateur.findById(targetUserId).select(
        'nom prenom image role email'
      );
      if (!etudiantUser) throw new Error('Étudiant introuvable');

      const etudiantDoc = await Etudiant.findOne({ utilisateur: targetUserId });
      if (!etudiantDoc) throw new Error('Profil étudiant introuvable');

      const projet = await Projet.findOne({
        idEncadrant: encadrant._id,
        idEtudiant: etudiantDoc._id,
      });
      if (!projet) throw new Error("Cet étudiant n'est pas dans vos étudiants assignés");

      return { interlocuteur: etudiantUser, interlocuteurUserId: targetUserId, projet };
    }
    return null;
  }

  throw new Error('Rôle non autorisé');
}

// ─── GET /messagerie/mon-encadrant ───────────────────────
exports.getMonEncadrant = async (req, res) => {
  try {
    const result = await getInterlocuteurAutorise(req.user._id, req.user.role);
    return res.json({ encadrant: result.interlocuteur, projet: result.projet });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// ─── GET /messagerie/mes-etudiants ───────────────────────
exports.getMesEtudiants = async (req, res) => {
  try {
    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
    if (!encadrant) return res.status(404).json({ message: 'Profil encadrant introuvable' });

    const projets = await Projet.find({ idEncadrant: encadrant._id })
      .populate({
        path: 'idEtudiant',
        populate: { path: 'utilisateur', select: 'nom prenom image email role' },
      })
      .populate('idSujet', 'titre');

    const etudiants = await Promise.all(
      projets.map(async (p) => {
        const etudiantUserId = p.idEtudiant?.utilisateur?._id;
        const nonLus = etudiantUserId
          ? await Messagerie.countDocuments({
              idExpediteur: etudiantUserId,
              idDestinataire: req.user._id,
              lu: false,
            })
          : 0;
        return {
          userId: etudiantUserId,
          prenom: p.idEtudiant?.utilisateur?.prenom,
          nom: p.idEtudiant?.utilisateur?.nom,
          image: p.idEtudiant?.utilisateur?.image,
          email: p.idEtudiant?.utilisateur?.email,
          matricule: p.idEtudiant?.matricule,
          sujetTitre: p.idSujet?.titre,
          projetId: p._id,
          nonLus,
        };
      })
    );
    return res.json(etudiants.filter((e) => e.userId));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ─── GET /messagerie/conversation/:userId ────────────────
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    await getInterlocuteurAutorise(req.user._id, req.user.role, userId);

    const messages = await Messagerie.find({
      $or: [
        { idExpediteur: req.user._id, idDestinataire: userId },
        { idExpediteur: userId, idDestinataire: req.user._id },
      ],
    })
      .populate('idExpediteur', 'nom prenom image role')
      .populate('idDestinataire', 'nom prenom image role')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    await Messagerie.updateMany(
      { idExpediteur: userId, idDestinataire: req.user._id, lu: false },
      { lu: true }
    );

    return res.json(messages);
  } catch (err) {
    return res.status(403).json({ message: err.message });
  }
};

// ─── POST /messagerie ─────────────────────────────────────
exports.envoyerMessage = async (req, res) => {
  try {
    const { idDestinataire, contenu } = req.body;
    if (!idDestinataire || !contenu?.trim())
      return res.status(400).json({ message: 'Destinataire et contenu requis' });

    await getInterlocuteurAutorise(req.user._id, req.user.role, idDestinataire);

    const message = await Messagerie.create({
      idExpediteur: req.user._id,
      idDestinataire,
      contenu: contenu.trim(),
    });

    const populated = await Messagerie.findById(message._id)
      .populate('idExpediteur', 'nom prenom image role')
      .populate('idDestinataire', 'nom prenom image role');

    // ✅ Pusher remplace io.to(userId).emit()
    await pusher.trigger(
      `private-chat-${idDestinataire.toString()}`, // channel du destinataire
      'nouveau_message',
      populated.toObject()
    );

    return res.status(201).json(populated);
  } catch (err) {
    return res.status(403).json({ message: err.message });
  }
};

// ─── POST /messagerie/typing ──────────────────────────────
// Nouvelle route pour le typing indicator via Pusher
exports.sendTyping = async (req, res) => {
  try {
    const { toUserId, isTyping } = req.body;
    await pusher.trigger(`private-chat-${toUserId}`, isTyping ? 'typing' : 'stop_typing', {
      fromUserId: req.user._id.toString(),
    });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ─── GET /messagerie/non-lus ─────────────────────────────
exports.messagesNonLus = async (req, res) => {
  try {
    const count = await Messagerie.countDocuments({ idDestinataire: req.user._id, lu: false });
    return res.json({ messagesNonLus: count });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ─── GET /messagerie ─────────────────────────────────────
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const messages = await Messagerie.find({
      $or: [{ idExpediteur: req.user._id }, { idDestinataire: req.user._id }],
    })
      .populate('idExpediteur', 'nom prenom image role')
      .populate('idDestinataire', 'nom prenom image role')
      .sort({ createdAt: -1 });

    const map = new Map();
    for (const msg of messages) {
      const autre =
        msg.idExpediteur?._id?.toString() === userId ? msg.idDestinataire : msg.idExpediteur;
      if (!autre) continue;
      const autreId = autre._id.toString();
      if (!map.has(autreId)) {
        const nonLus = await Messagerie.countDocuments({
          idExpediteur: autre._id,
          idDestinataire: req.user._id,
          lu: false,
        });
        map.set(autreId, { interlocuteur: autre, dernierMessage: msg, nonLus });
      }
    }
    return res.json(Array.from(map.values()));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ─── PUT /messagerie/:userId/lus ─────────────────────────
exports.marquerCommeLus = async (req, res) => {
  try {
    await Messagerie.updateMany(
      { idExpediteur: req.params.userId, idDestinataire: req.user._id, lu: false },
      { lu: true }
    );
    return res.json({ message: 'Messages marqués comme lus' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
