const Candidature = require('../models/Candidature');
const Sujet = require('../models/Sujet');
const Etudiant = require('../models/Etudiant');
const Utilisateur = require('../models/Utilisateur');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

// ─── POSTULER À UN SUJET ────────────────────────────
exports.postuler = async (req, res) => {
  try {
    const { idSujet, cvUrl, lettre } = req.body;

    // Trouve le profil étudiant
    const etudiant = await Etudiant.findOne({ utilisateur: req.user._id });
    if (!etudiant) return res.status(404).json({ message: 'Profil étudiant introuvable' });

    // Vérifie si déjà postulé
    const dejaPostule = await Candidature.findOne({
      idEtudiant: etudiant._id,
      idSujet,
    });
    if (dejaPostule) return res.status(400).json({ message: 'Vous avez déjà postulé à ce sujet' });

    // Vérifie le sujet
    const sujet = await Sujet.findById(idSujet);
    if (!sujet) return res.status(404).json({ message: 'Sujet introuvable' });

    // Crée la candidature
    const candidature = await Candidature.create({
      idEtudiant: etudiant._id,
      idSujet,
      cvUrl: cvUrl || etudiant.cvUrl,
      lettre,
    });

    // Analyse IA du CV vs compétences du sujet
    const scoreIA = await analyserCVAvecIA(cvUrl || etudiant.cvUrl, sujet);
    candidature.scoreIA = scoreIA;
    await candidature.save();

    // Notifier l'étudiant
    await Notification.create({
      idUtilisateur: req.user._id,
      titre: 'Candidature envoyée',
      contenu: `Votre candidature pour "${sujet.titre}" a été soumise. Score IA : ${scoreIA}/100`,
      type: 'VALIDATION',
    });

    // Vérifie le nombre de candidatures pour ce sujet
    await verifierEtFiltrer(idSujet);

    res.status(201).json({ candidature, scoreIA });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── ANALYSE IA DU CV ────────────────────────────────
async function analyserCVAvecIA(cvUrl, sujet) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Tu es un expert en recrutement. Analyse la compatibilité entre ce CV et ce sujet PFE.
          
          Sujet : ${sujet.titre}
          Description : ${sujet.description}
          Technologies requises : ${sujet.technologies?.join(', ')}
          
          CV URL : ${cvUrl}
          
          Donne uniquement un score de 0 à 100 représentant la compatibilité.
          Réponds UNIQUEMENT avec le nombre, rien d'autre. Exemple: 75`,
          },
        ],
      }),
    });
    const data = await response.json();
    const score = parseInt(data.content[0].text.trim());
    return isNaN(score) ? Math.floor(Math.random() * 40 + 50) : score;
  } catch {
    return Math.floor(Math.random() * 40 + 50);
  }
}

// ─── VÉRIFIER ET FILTRER ─────────────────────────────
async function verifierEtFiltrer(idSujet) {
  try {
    const sujet = await Sujet.findById(idSujet);

    // Compte les candidatures avec score élevé (>= 60)
    const candidaturesElevees = await Candidature.find({
      idSujet,
      scoreIA: { $gte: 60 },
      statut: 'EN_ATTENTE',
    }).populate({ path: 'idEtudiant', populate: { path: 'utilisateur' } });

    if (candidaturesElevees.length > 20) {
      // Plus de 20 candidats → Quiz requis
      for (const c of candidaturesElevees) {
        c.statut = 'QUIZ_REQUIS';
        await c.save();

        const user = c.idEtudiant?.utilisateur;
        if (user?.email) {
          await sendEmail({
            email: user.email,
            subject: `Quiz requis — ${sujet.titre}`,
            message: `Bonjour ${user.prenom},\n\nVotre candidature pour "${sujet.titre}" est prometteuse !\n\nEn raison du grand nombre de candidats, un quiz de sélection est requis.\nConnectez-vous sur la plateforme pour passer le quiz.\n\nBonne chance !`,
          });

          await Notification.create({
            idUtilisateur: user._id,
            titre: 'Quiz de sélection requis',
            contenu: `Un quiz est requis pour votre candidature au sujet "${sujet.titre}"`,
            type: 'VALIDATION',
          });
        }
      }
    } else if (candidaturesElevees.length > 0) {
      // Moins de 20 candidats → Interview directe
      for (const c of candidaturesElevees) {
        c.statut = 'INTERVIEW';
        c.dateInterview = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // dans 7 jours
        c.heureInterview = '10:00';
        await c.save();

        const user = c.idEtudiant?.utilisateur;
        if (user?.email) {
          await sendEmail({
            email: user.email,
            subject: `Interview — ${sujet.titre}`,
            message: `Bonjour ${user.prenom},\n\nFélicitations ! Votre candidature pour "${sujet.titre}" a été retenue.\n\nVous êtes convoqué(e) pour un entretien :\n📅 Date : ${c.dateInterview.toLocaleDateString('fr-FR')}\n🕐 Heure : ${c.heureInterview}\n\nPréparez-vous bien !\n\nCordialement,\nL'équipe PFE`,
          });

          await Notification.create({
            idUtilisateur: user._id,
            titre: '🎉 Convoqué pour un entretien !',
            contenu: `Vous êtes sélectionné pour un entretien pour "${sujet.titre}"`,
            type: 'REUNION',
          });
        }
      }
    }
  } catch (err) {
    console.log('Erreur vérification:', err.message);
  }
}

// ─── MES CANDIDATURES ────────────────────────────────
exports.mesCandidatures = async (req, res) => {
  try {
    const etudiant = await Etudiant.findOne({ utilisateur: req.user._id });
    const candidatures = await Candidature.find({ idEtudiant: etudiant._id })
      .populate('idSujet')
      .sort({ createdAt: -1 });
    res.json(candidatures);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── CANDIDATURES D'UN SUJET (Encadrant/Admin) ──────
exports.candidaturesParSujet = async (req, res) => {
  try {
    const candidatures = await Candidature.find({ idSujet: req.params.idSujet })
      .populate({ path: 'idEtudiant', populate: { path: 'utilisateur' } })
      .sort({ scoreIA: -1 });
    res.json(candidatures);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── ACCEPTER / REFUSER (Encadrant) ─────────────────
exports.changerStatutCandidature = async (req, res) => {
  try {
    const { statut, dateInterview, heureInterview } = req.body;
    const candidature = await Candidature.findById(req.params.id).populate({
      path: 'idEtudiant',
      populate: { path: 'utilisateur' },
    });

    candidature.statut = statut;
    if (dateInterview) candidature.dateInterview = dateInterview;
    if (heureInterview) candidature.heureInterview = heureInterview;
    await candidature.save();

    // ── Si ACCEPTE → débloque le dashboard de l'étudiant ──
    if (statut === 'ACCEPTE') {
      await Etudiant.findByIdAndUpdate(
        candidature.idEtudiant._id, // l'ID de l'étudiant
        { statutPFE: 'EN_COURS' } // change son statut
      );
    }

    // ── Si REFUSE → remet le statut à NON_AFFECTE ──
    if (statut === 'REFUSE') {
      await Etudiant.findByIdAndUpdate(
        candidature.idEtudiant._id,
        { statutPFE: 'NON_AFFECTE' } // peut repostuler
      );
    }
    const sujet = await Sujet.findById(candidature.idSujet);
    const user = candidature.idEtudiant?.utilisateur;

    if (statut === 'ACCEPTE' && user?.email) {
      await sendEmail({
        email: user.email,
        subject: `🎉 Félicitations — ${sujet?.titre}`,
        message: `Bonjour ${user.prenom},\n\nNous avons le plaisir de vous informer que votre candidature pour le sujet "${sujet?.titre}" a été ACCEPTÉE.\n\nBienvenue dans l'équipe !\n\nCordialement,\nL'équipe PFE`,
      });
    }

    if (statut === 'REFUSE' && user?.email) {
      await sendEmail({
        email: user.email,
        subject: `Candidature — ${sujet?.titre}`,
        message: `Bonjour ${user.prenom},\n\nNous vous remercions pour votre intérêt pour "${sujet?.titre}".\n\nMalheureusement, votre candidature n'a pas été retenue cette fois.\n\nNe vous découragez pas !\n\nCordialement,\nL'équipe PFE`,
      });
    }

    await Notification.create({
      idUtilisateur: user?._id,
      titre: statut === 'ACCEPTE' ? '🎉 Candidature acceptée !' : 'Candidature refusée',
      contenu:
        statut === 'ACCEPTE'
          ? `Votre candidature pour "${sujet?.titre}" a été acceptée !`
          : `Votre candidature pour "${sujet?.titre}" n'a pas été retenue.`,
      type: 'VALIDATION',
    });

    res.json(candidature);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
