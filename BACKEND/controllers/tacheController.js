// On importe les modèles dont on a besoin
const Tache = require('../models/Tache');
const Etudiant = require('../models/Etudiant');
const Encadrant = require('../models/Encadrant');
const Notification = require('../models/Notification');

// ─── CRÉER UNE TÂCHE (Encadrant) ────────────────────
exports.creerTache = async (req, res) => {
  try {
    // On trouve le profil encadrant lié à l'utilisateur connecté
    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
    if (!encadrant) {
      return res.status(404).json({ message: 'Profil encadrant introuvable' });
    }

    // On crée la tâche avec les données envoyées par le frontend
    const tache = await Tache.create({
      idEncadrant: encadrant._id, // qui a créé la tâche
      idEtudiant: req.body.idEtudiant, // à qui est assignée la tâche
      idProjet: req.body.idProjet, // à quel projet appartient la tâche
      titre: req.body.titre, // le titre de la tâche
      description: req.body.description, // la description
      dateDebut: req.body.dateDebut, // quand commencer
      dateLimite: req.body.dateLimite, // date limite
    });

    // On trouve l'étudiant pour lui envoyer une notification
    const etudiant = await Etudiant.findById(req.body.idEtudiant);

    // On crée une notification pour l'étudiant
    await Notification.create({
      idUtilisateur: etudiant.utilisateur, // l'étudiant qui reçoit
      titre: 'Nouvelle tâche',
      contenu: `Une nouvelle tâche vous a été assignée : ${tache.titre}`,
      type: 'TACHE', // type TACHE de l'enumeration
    });

    // On répond avec la tâche créée
    res.status(201).json(tache);
  } catch (err) {
    // Si erreur → on l'envoie au frontend
    res.status(500).json({ message: err.message });
  }
};

// ─── TOUTES LES TÂCHES D'UN PROJET ──────────────────
exports.getTachesByProjet = async (req, res) => {
  try {
    // On cherche toutes les tâches qui appartiennent à ce projet
    // req.params.projetId = l'id du projet dans l'URL
    // Exemple : GET /api/taches/projet/abc123
    const taches = await Tache.find({ idProjet: req.params.projetId })
      .populate('idEtudiant') // affiche les infos de l'étudiant
      .populate('idEncadrant'); // affiche les infos de l'encadrant

    res.json(taches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MES TÂCHES (Etudiant) ───────────────────────────
exports.mesTaches = async (req, res) => {
  try {
    // On trouve le profil étudiant lié à l'utilisateur connecté
    const etudiant = await Etudiant.findOne({ utilisateur: req.user._id });
    if (!etudiant) {
      return res.status(404).json({ message: 'Profil étudiant introuvable' });
    }

    // On cherche toutes les tâches assignées à cet étudiant
    const taches = await Tache.find({ idEtudiant: etudiant._id }).populate('idProjet'); // affiche les infos du projet

    res.json(taches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── CHANGER STATUT TÂCHE (Etudiant) ────────────────
exports.changerStatutTache = async (req, res) => {
  try {
    // On met à jour le statut de la tâche
    // req.params.id = l'id de la tâche dans l'URL
    // req.body.statutTache = le nouveau statut envoyé par le frontend
    // { new: true } = retourne la tâche modifiée
    const tache = await Tache.findByIdAndUpdate(
      req.params.id,
      { statutTache: req.body.statutTache },
      { new: true }
    );

    if (!tache) {
      return res.status(404).json({ message: 'Tâche introuvable' });
    }

    // On notifie l'encadrant que le statut a changé
    const encadrant = await Encadrant.findById(tache.idEncadrant);
    await Notification.create({
      idUtilisateur: encadrant.utilisateur, // l'encadrant qui reçoit
      titre: 'Statut tâche modifié',
      contenu: `La tâche "${tache.titre}" est maintenant : ${req.body.statutTache}`,
      type: 'TACHE',
    });

    res.json(tache);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── SUPPRIMER UNE TÂCHE (Encadrant) ────────────────
exports.supprimerTache = async (req, res) => {
  try {
    // On cherche la tâche par son id
    const tache = await Tache.findById(req.params.id);
    if (!tache) {
      return res.status(404).json({ message: 'Tâche introuvable' });
    }

    // On supprime la tâche
    await tache.deleteOne();

    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MODIFIER UNE TÂCHE (Encadrant) ─────────────────
exports.modifierTache = async (req, res) => {
  try {
    // On met à jour la tâche avec les nouvelles données
    const tache = await Tache.findByIdAndUpdate(
      req.params.id, // l'id de la tâche à modifier
      {
        titre: req.body.titre,
        description: req.body.description,
        dateDebut: req.body.dateDebut,
        dateLimite: req.body.dateLimite,
      },
      { new: true } // retourne la tâche modifiée
    );

    if (!tache) {
      return res.status(404).json({ message: 'Tâche introuvable' });
    }

    res.json(tache);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
