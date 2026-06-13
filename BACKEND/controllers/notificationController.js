// On importe le modèle Notification
const Notification = require('../models/Notification');
const { creerEtEnvoyerNotif } = require('../utils/pusher');

// ─── MES NOTIFICATIONS ───────────────────────────────
exports.mesNotifications = async (req, res) => {
  try {
    // On cherche toutes les notifications de l'utilisateur connecté
    // triées de la plus récente à la plus ancienne
    const notifications = await Notification.find({
      idUtilisateur: req.user._id, // seulement mes notifications
    }).sort({ createdAt: -1 }); // du plus récent au plus ancien

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── NOTIFICATIONS NON LUES ──────────────────────────
exports.notificationsNonLues = async (req, res) => {
  try {
    // On compte les notifications non lues
    // pour afficher le petit badge rouge 🔴
    const count = await Notification.countDocuments({
      idUtilisateur: req.user._id, // mes notifications
      lu: false, // pas encore lues
    });

    res.json({ notificationsNonLues: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MARQUER UNE NOTIFICATION COMME LUE ─────────────
exports.marquerCommeLue = async (req, res) => {
  try {
    // On met lu = true pour cette notification
    // req.params.id = l'id de la notification dans l'URL
    const notification = await Notification.findByIdAndUpdate(
      req.params.id, // l'id de la notification
      { lu: true }, // on la marque comme lue
      { new: true } // retourne la notification modifiée
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification introuvable' });
    }

    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MARQUER TOUTES COMME LUES ───────────────────────
exports.marquerToutesCommeLues = async (req, res) => {
  try {
    // On met lu = true pour TOUTES mes notifications non lues
    // updateMany = met à jour plusieurs documents en même temps
    await Notification.updateMany(
      {
        idUtilisateur: req.user._id, // mes notifications
        lu: false, // pas encore lues
      },
      { lu: true } // toutes marquées comme lues
    );

    res.json({ message: 'Toutes les notifications sont lues' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── SUPPRIMER UNE NOTIFICATION ─────────────────────
exports.supprimerNotification = async (req, res) => {
  try {
    // On cherche la notification par son id
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification introuvable' });
    }

    // On vérifie que cette notification appartient bien
    // à l'utilisateur connecté
    if (notification.idUtilisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // On supprime la notification
    await notification.deleteOne();

    res.json({ message: 'Notification supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── SUPPRIMER TOUTES MES NOTIFICATIONS ─────────────
exports.supprimerToutesNotifications = async (req, res) => {
  try {
    // On supprime toutes les notifications de l'utilisateur connecté
    await Notification.deleteMany({
      idUtilisateur: req.user._id,
    });

    res.json({ message: 'Toutes les notifications supprimées' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── ENVOYER NOTIF TEMPS RÉEL (admin → utilisateur ciblé) ───
exports.envoyerNotification = async (req, res) => {
  try {
    const { idUtilisateur, titre, contenu, type = 'SYSTEME' } = req.body;
    if (!idUtilisateur || !titre || !contenu)
      return res.status(400).json({ message: 'idUtilisateur, titre et contenu requis' });

    const notif = await creerEtEnvoyerNotif({
      idUtilisateur,
      titre,
      contenu,
      type,
      envoyePar: req.user._id,
    });
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
