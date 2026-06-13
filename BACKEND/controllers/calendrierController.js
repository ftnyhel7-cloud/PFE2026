// ═══════════════════════════════════════════════════════════
//  BACKEND/controllers/calendrierController.js
//  ✅ Sauvegarde heure, duree, titre correctement
//  ✅ Validation : date+heure passée bloquée
//  ✅ Validation : conflit de créneau bloqué
// ═══════════════════════════════════════════════════════════
const Calendrier = require('../models/Calendrier');
const Etudiant = require('../models/Etudiant');
const Encadrant = require('../models/Encadrant');
const Notification = require('../models/Notification');

// ─── HELPER : vérifie les conflits de créneaux ─────────────
async function verifierConflitCreneau(idEncadrant, dateStr, heure, duree, excludeId = null) {
  const debut = new Date(`${dateStr}T${heure}:00`);
  const dureeMin = parseInt(duree) || 60;
  const fin = new Date(debut.getTime() + dureeMin * 60000);

  const filtre = { idEncadrant, statutReunion: { $ne: 'ANNULEE' } };
  if (excludeId) filtre._id = { $ne: excludeId };

  const reunions = await Calendrier.find(filtre);

  for (const r of reunions) {
    const rDate = r.date.toISOString().split('T')[0];
    const rDebut = new Date(`${rDate}T${r.heure || '09:00'}:00`);
    const rFin = new Date(rDebut.getTime() + (r.duree || 60) * 60000);
    if (debut < rFin && fin > rDebut) {
      return {
        conflit: true,
        message: `Ce créneau chevauche une réunion existante : "${r.titre}" le ${rDate} à ${r.heure} (${r.duree} min).`,
      };
    }
  }
  return { conflit: false };
}

// ─── PLANIFIER UNE RÉUNION (Encadrant) ──────────────────────
exports.planifierReunion = async (req, res) => {
  try {
    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
    if (!encadrant) return res.status(404).json({ message: 'Profil encadrant introuvable' });

    const { idEtudiant, titre, description, date, heure, duree, lienVisio } = req.body;

    if (!date || !heure) {
      return res.status(400).json({ message: "La date et l'heure sont obligatoires." });
    }

    const dateStr = date.toString().split('T')[0];
    const datetime = new Date(`${dateStr}T${heure}:00`);

    // ✅ Bloquer si date+heure passée
    if (datetime < new Date()) {
      return res
        .status(400)
        .json({ message: 'Impossible de planifier une réunion à une date/heure passée.' });
    }

    // ✅ Vérifier conflit
    const { conflit, message } = await verifierConflitCreneau(encadrant._id, dateStr, heure, duree);
    if (conflit) return res.status(409).json({ message });

    const reunion = await Calendrier.create({
      idEncadrant: encadrant._id,
      idEtudiant,
      titre: (titre || 'Réunion PFE').trim(),
      description: (description || '').trim(),
      date: new Date(dateStr),
      heure: heure.trim(),
      duree: parseInt(duree) || 60,
      lienVisio: lienVisio || '',
      statutReunion: 'PLANIFIEE',
    });

    const etudiant = await Etudiant.findById(idEtudiant);
    if (etudiant) {
      await Notification.create({
        idUtilisateur: etudiant.utilisateur,
        titre: 'Nouvelle réunion planifiée',
        contenu: `Une réunion "${reunion.titre}" a été planifiée le ${dateStr} à ${heure}.`,
        type: 'REUNION',
      });
    }

    res.status(201).json(reunion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MES RÉUNIONS (Etudiant) ────────────────────────────────
exports.mesReunionsEtudiant = async (req, res) => {
  try {
    const etudiant = await Etudiant.findOne({ utilisateur: req.user._id });
    if (!etudiant) return res.status(404).json({ message: 'Profil étudiant introuvable' });
    const reunions = await Calendrier.find({ idEtudiant: etudiant._id })
      .populate('idEncadrant')
      .sort({ date: 1 });
    res.json(reunions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MES RÉUNIONS (Encadrant) ───────────────────────────────
exports.mesReunionsEncadrant = async (req, res) => {
  try {
    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
    if (!encadrant) return res.status(404).json({ message: 'Profil encadrant introuvable' });
    const reunions = await Calendrier.find({ idEncadrant: encadrant._id })
      .populate({
        path: 'idEtudiant',
        populate: { path: 'utilisateur', select: 'nom prenom email' },
      })
      .sort({ date: 1 });
    res.json(reunions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MODIFIER UNE RÉUNION (Encadrant) ───────────────────────
exports.modifierReunion = async (req, res) => {
  try {
    const { titre, description, date, heure, duree, lienVisio } = req.body;
    const { id } = req.params;

    const reunionExistante = await Calendrier.findById(id);
    if (!reunionExistante) return res.status(404).json({ message: 'Réunion introuvable' });

    const dateStr = date.toString().split('T')[0];
    const datetime = new Date(`${dateStr}T${heure}:00`);

    if (datetime < new Date()) {
      return res
        .status(400)
        .json({ message: 'Impossible de modifier vers une date/heure passée.' });
    }

    const { conflit, message } = await verifierConflitCreneau(
      reunionExistante.idEncadrant,
      dateStr,
      heure,
      duree,
      id
    );
    if (conflit) return res.status(409).json({ message });

    const reunion = await Calendrier.findByIdAndUpdate(
      id,
      {
        titre: (titre || 'Réunion PFE').trim(),
        description: (description || '').trim(),
        date: new Date(dateStr),
        heure: heure.trim(),
        duree: parseInt(duree) || 60,
        lienVisio: lienVisio || reunionExistante.lienVisio,
      },
      { new: true }
    );

    const etudiant = await Etudiant.findById(reunion.idEtudiant);
    if (etudiant) {
      await Notification.create({
        idUtilisateur: etudiant.utilisateur,
        titre: 'Réunion modifiée',
        contenu: `Votre réunion "${reunion.titre}" a été modifiée : ${dateStr} à ${heure}.`,
        type: 'REUNION',
      });
    }

    res.json(reunion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── CHANGER STATUT (Encadrant) ─────────────────────────────
exports.changerStatutReunion = async (req, res) => {
  try {
    const reunion = await Calendrier.findByIdAndUpdate(
      req.params.id,
      { statutReunion: req.body.statutReunion },
      { new: true }
    );
    if (!reunion) return res.status(404).json({ message: 'Réunion introuvable' });
    const etudiant = await Etudiant.findById(reunion.idEtudiant);
    if (etudiant) {
      await Notification.create({
        idUtilisateur: etudiant.utilisateur,
        titre: 'Réunion modifiée',
        contenu: `Votre réunion est maintenant : ${req.body.statutReunion}`,
        type: 'REUNION',
      });
    }
    res.json(reunion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── SUPPRIMER (Encadrant) ───────────────────────────────────
exports.supprimerReunion = async (req, res) => {
  try {
    const reunion = await Calendrier.findById(req.params.id);
    if (!reunion) return res.status(404).json({ message: 'Réunion introuvable' });
    await reunion.deleteOne();
    res.json({ message: 'Réunion supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
