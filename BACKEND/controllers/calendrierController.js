// On importe les modèles dont on a besoin
const Calendrier = require('../models/Calendrier');
const Etudiant = require('../models/Etudiant');
const Encadrant = require('../models/Encadrant');
const Notification = require('../models/Notification');

// ─── PLANIFIER UNE RÉUNION (Encadrant) ──────────────
exports.planifierReunion = async (req, res) => {
  try {
    // On trouve le profil encadrant lié à l'utilisateur connecté
    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
    if (!encadrant) {
      return res.status(404).json({ message: 'Profil encadrant introuvable' });
    }

    // On crée la réunion avec les données envoyées par le frontend
    const reunion = await Calendrier.create({
      idEncadrant: encadrant._id, // qui planifie la réunion
      idEtudiant: req.body.idEtudiant, // avec quel étudiant
      date: req.body.date, // quand
      lienVisio: req.body.lienVisio, // lien Google Meet
    });

    // On trouve l'étudiant pour lui envoyer une notification
    const etudiant = await Etudiant.findById(req.body.idEtudiant);

    // On notifie l'étudiant qu'une réunion a été planifiée
    await Notification.create({
      idUtilisateur: etudiant.utilisateur, // l'étudiant qui reçoit
      titre: 'Nouvelle réunion',
      contenu: `Une réunion a été planifiée le ${req.body.date}`,
      type: 'REUNION', // type REUNION de l'enumeration
    });

    // On répond avec la réunion créée
    res.status(201).json(reunion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MES RÉUNIONS (Etudiant) ─────────────────────────
exports.mesReunionsEtudiant = async (req, res) => {
  try {
    // On trouve le profil étudiant lié à l'utilisateur connecté
    const etudiant = await Etudiant.findOne({ utilisateur: req.user._id });
    if (!etudiant) {
      return res.status(404).json({ message: 'Profil étudiant introuvable' });
    }

    // On cherche toutes les réunions de cet étudiant
    const reunions = await Calendrier.find({ idEtudiant: etudiant._id })
      .populate('idEncadrant') // affiche les infos de l'encadrant
      .sort({ date: 1 }); // triées par date croissante

    res.json(reunions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MES RÉUNIONS (Encadrant) ────────────────────────
exports.mesReunionsEncadrant = async (req, res) => {
  try {
    // On trouve le profil encadrant lié à l'utilisateur connecté
    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
    if (!encadrant) {
      return res.status(404).json({ message: 'Profil encadrant introuvable' });
    }

    // On cherche toutes les réunions de cet encadrant
    const reunions = await Calendrier.find({ idEncadrant: encadrant._id })
      .populate('idEtudiant') // affiche les infos de l'étudiant
      .sort({ date: 1 }); // triées par date croissante

    res.json(reunions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── CHANGER STATUT RÉUNION (Encadrant) ─────────────
exports.changerStatutReunion = async (req, res) => {
  try {
    // On met à jour le statut de la réunion
    // Les statuts possibles : PLANIFIEE, EFFECTUEE, ANNULEE
    const reunion = await Calendrier.findByIdAndUpdate(
      req.params.id, // l'id de la réunion
      { statutReunion: req.body.statutReunion }, // le nouveau statut
      { new: true } // retourne la réunion modifiée
    );

    if (!reunion) {
      return res.status(404).json({ message: 'Réunion introuvable' });
    }

    // On notifie l'étudiant du changement de statut
    const etudiant = await Etudiant.findById(reunion.idEtudiant);
    await Notification.create({
      idUtilisateur: etudiant.utilisateur,
      titre: 'Réunion modifiée',
      contenu: `Votre réunion est maintenant : ${req.body.statutReunion}`,
      type: 'REUNION',
    });

    res.json(reunion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MODIFIER UNE RÉUNION (Encadrant) ───────────────
exports.modifierReunion = async (req, res) => {
  try {
    // On met à jour la réunion avec les nouvelles données
    const reunion = await Calendrier.findByIdAndUpdate(
      req.params.id, // l'id de la réunion à modifier
      {
        date: req.body.date, // nouvelle date
        lienVisio: req.body.lienVisio, // nouveau lien
      },
      { new: true } // retourne la réunion modifiée
    );

    if (!reunion) {
      return res.status(404).json({ message: 'Réunion introuvable' });
    }

    // On notifie l'étudiant que la réunion a été modifiée
    const etudiant = await Etudiant.findById(reunion.idEtudiant);
    await Notification.create({
      idUtilisateur: etudiant.utilisateur,
      titre: 'Réunion modifiée',
      contenu: `Votre réunion a été modifiée. Nouvelle date : ${req.body.date}`,
      type: 'REUNION',
    });

    res.json(reunion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── SUPPRIMER UNE RÉUNION (Encadrant) ──────────────
exports.supprimerReunion = async (req, res) => {
  try {
    // On cherche la réunion par son id
    const reunion = await Calendrier.findById(req.params.id);
    if (!reunion) {
      return res.status(404).json({ message: 'Réunion introuvable' });
    }

    // On supprime la réunion
    await reunion.deleteOne();

    res.json({ message: 'Réunion supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
