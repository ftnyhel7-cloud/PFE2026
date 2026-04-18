// On importe le modèle Messagerie
const Messagerie = require('../models/Messagerie');

// ─── ENVOYER UN MESSAGE ──────────────────────────────
exports.envoyerMessage = async (req, res) => {
  try {
    // On crée le message avec les données du frontend
    const message = await Messagerie.create({
      idExpediteur: req.user._id, // l'utilisateur connecté qui envoie
      idDestinataire: req.body.idDestinataire, // à qui on envoie
      contenu: req.body.contenu, // le texte du message
    });

    // On répond avec le message créé
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── CONVERSATION ENTRE 2 PERSONNES ─────────────────
exports.getConversation = async (req, res) => {
  try {
    // On cherche tous les messages entre
    // l'utilisateur connecté et l'autre utilisateur
    // dans les 2 sens (envoyé ET reçu)
    const messages = await Messagerie.find({
      $or: [
        // Sens 1 : moi → l'autre
        {
          idExpediteur: req.user._id,
          idDestinataire: req.params.userId,
        },
        // Sens 2 : l'autre → moi
        {
          idExpediteur: req.params.userId,
          idDestinataire: req.user._id,
        },
      ],
    }).sort({ createdAt: 1 }); // triés du plus ancien au plus récent

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MARQUER MESSAGES COMME LUS ──────────────────────
exports.marquerCommeLus = async (req, res) => {
  try {
    // On met lu = true pour tous les messages
    // envoyés par l'autre utilisateur vers moi
    // que je n'ai pas encore lus
    await Messagerie.updateMany(
      {
        idExpediteur: req.params.userId, // envoyés par l'autre
        idDestinataire: req.user._id, // reçus par moi
        lu: false, // pas encore lus
      },
      { lu: true } // on les marque comme lus
    );

    res.json({ message: 'Messages marqués comme lus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MESSAGES NON LUS ────────────────────────────────
exports.messagesNonLus = async (req, res) => {
  try {
    // On compte les messages non lus reçus par l'utilisateur connecté
    const count = await Messagerie.countDocuments({
      idDestinataire: req.user._id, // reçus par moi
      lu: false, // pas encore lus
    });

    res.json({ messagesNonLus: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── LISTE DES CONVERSATIONS ─────────────────────────
exports.getConversations = async (req, res) => {
  try {
    // On trouve tous les messages où je suis impliqué
    // soit comme expéditeur soit comme destinataire
    const messages = await Messagerie.find({
      $or: [{ idExpediteur: req.user._id }, { idDestinataire: req.user._id }],
    })
      .populate('idExpediteur', 'nom prenom image') // affiche nom + photo
      .populate('idDestinataire', 'nom prenom image') // affiche nom + photo
      .sort({ createdAt: -1 }); // du plus récent au plus ancien

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
