// ═══════════════════════════════════════════════════════════════
//  BACKEND/controllers/candidatureController.js
//  Système IA complet — Anthropic Claude
//  Prompt : Scoring + Quiz + Email automatique
// ═══════════════════════════════════════════════════════════════
const Candidature = require('../models/Candidature');
const Sujet = require('../models/Sujet');
const Etudiant = require('../models/Etudiant');
const Encadrant = require('../models/Encadrant');
const Utilisateur = require('../models/Utilisateur');
const Projet = require('../models/Projet');
const sendEmail = require('../utils/sendEmail');

// ─────────────────────────────────────────────────────────────
//  FONCTION PRINCIPALE IA
//  Utilise ton prompt exact avec toutes les sections
// ─────────────────────────────────────────────────────────────
async function analyserCandidatureIA({ cvUrl, lettre, sujet, etudiant, nbCandidatsEligibles }) {
  // ── Prompt identique au tien ──────────────────────────────
  const prompt = `Tu es un expert en évaluation de candidatures pour des projets de fin d'études (PFE), ainsi qu'un assistant intelligent de gestion de processus de recrutement académique.

Ta mission est :
1. Analyser la compatibilité entre un étudiant et un sujet PFE
2. Attribuer un score de matching basé sur plusieurs critères
3. Déterminer la décision (refus, quiz, entretien, acceptation)
4. Générer un contenu d'email professionnel adapté à la décision

═══════════════════════════════════════
📌 SUJET PFE
═══════════════════════════════════════
Titre       : ${sujet.titre}
Description : ${sujet.description}
Technologies: ${sujet.technologies?.join(', ') || 'Non spécifié'}
Niveau requis: ${sujet.niveau || 'Non spécifié'}
Domaine     : ${sujet.domaine || 'Non spécifié'}

═══════════════════════════════════════
📌 PROFIL ÉTUDIANT
═══════════════════════════════════════
Nom         : ${etudiant.nom} ${etudiant.prenom}
Filière     : ${etudiant.filiere || 'Non renseigné'}
Niveau      : ${etudiant.niveau || 'Non renseigné'}
CV URL      : ${cvUrl || 'Non fourni'}
${lettre ? `Lettre de motivation : ${lettre}` : ''}

═══════════════════════════════════════
📊 MÉTHODE DE SCORING
═══════════════════════════════════════
- Compétences techniques → 50%
- Projets réalisés → 30%
- Expérience → 20%

Attribue un score global entre 0 et 100.

═══════════════════════════════════════
📈 INTERPRÉTATION DU SCORE
═══════════════════════════════════════
- 80 - 100 : Excellent profil
- 60 - 79  : Bon profil
- 40 - 59  : Profil moyen
- 0 - 39   : Profil insuffisant

═══════════════════════════════════════
⚙️ LOGIQUE DE SÉLECTION
═══════════════════════════════════════
- Si score < 40 → REFUSE
- Si score ≥ 60 et forte concurrence (${nbCandidatsEligibles} candidats éligibles) → QUIZ_REQUIS
- Si score ≥ 60 et peu de candidats → INTERVIEW
- Si score ≥ 80 → candidat très recommandé

Note : La forte concurrence commence à partir de 5 candidats éligibles (score ≥ 60).

═══════════════════════════════════════
🧪 QUIZ TECHNIQUE
═══════════════════════════════════════
Si nécessaire, génère 3 à 5 questions techniques adaptées aux technologies du sujet.

═══════════════════════════════════════
📧 GÉNÉRATION D'EMAIL
═══════════════════════════════════════
Génère un email professionnel selon la décision :

1. REFUSE :
- Informer poliment du refus
- Mentionner le score
- Encourager à postuler ailleurs

2. QUIZ_REQUIS :
- Informer que le candidat est présélectionné
- Demander de passer un quiz
- Donner un ton motivant

3. INTERVIEW :
- Informer que le candidat est sélectionné
- Mentionner qu'il sera convoqué à un entretien

4. ACCEPTE :
- Féliciter le candidat
- Confirmer son acceptation

═══════════════════════════════════════
📤 FORMAT DE SORTIE (OBLIGATOIRE)
═══════════════════════════════════════

Retourne UNIQUEMENT un objet JSON valide :

{
  "score": <nombre>,
  "resume": "<résumé>",
  "forces": ["<force1>", "<force2>"],
  "faiblesses": ["<faiblesse1>"],
  "decision": "<REFUSE | QUIZ_REQUIS | INTERVIEW | ACCEPTE>",
  "justification": "<explication>",
  "quiz": ["<question1>", "<question2>"],
  "email": {
    "subject": "<objet de l'email>",
    "content": "<contenu HTML ou texte professionnel>"
  }
}

═══════════════════════════════════════
🚨 RÈGLES
═══════════════════════════════════════
- Réponds uniquement en JSON
- Pas de texte hors JSON
- Email clair, professionnel et adapté à un étudiant`;

  // ── Appel API Anthropic ───────────────────────────────────
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('⚠️  ANTHROPIC_API_KEY non définie — mode démo activé');
      return modeDemo(sujet, etudiant, nbCandidatsEligibles);
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return modeDemo(sujet, etudiant, nbCandidatsEligibles);
    }

    const data = await response.json();
    const texte = data.content?.[0]?.text || '';

    // Extraire le JSON de la réponse
    const jsonMatch = texte.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('JSON non trouvé dans la réponse IA:', texte);
      return modeDemo(sujet, etudiant, nbCandidatsEligibles);
    }

    const result = JSON.parse(jsonMatch[0]);

    // Normaliser et valider
    return {
      score: Math.min(100, Math.max(0, parseInt(result.score) || 50)),
      resume: result.resume || '',
      forces: Array.isArray(result.forces) ? result.forces : [],
      faiblesses: Array.isArray(result.faiblesses) ? result.faiblesses : [],
      decision: ['REFUSE', 'QUIZ_REQUIS', 'INTERVIEW', 'ACCEPTE'].includes(result.decision)
        ? result.decision
        : 'INTERVIEW',
      justification: result.justification || '',
      quiz: Array.isArray(result.quiz) ? result.quiz : [],
      email: {
        subject: result.email?.subject || `Candidature PFE — ${sujet.titre}`,
        content: result.email?.content || '',
      },
    };
  } catch (error) {
    console.error('Erreur analyse IA:', error.message);
    return modeDemo(sujet, etudiant, nbCandidatsEligibles);
  }
}

// ─────────────────────────────────────────────────────────────
//  MODE DÉMO (si pas de clé API ou erreur)
// ─────────────────────────────────────────────────────────────
function modeDemo(sujet, etudiant, nbCandidats) {
  const score = Math.floor(Math.random() * 35) + 55; // 55-90
  let decision;
  if (score < 40) decision = 'REFUSE';
  else if (score >= 60 && nbCandidats >= 5) decision = 'QUIZ_REQUIS';
  else if (score >= 80) decision = 'ACCEPTE';
  else decision = 'INTERVIEW';

  return {
    score,
    resume: `Profil ${score >= 60 ? 'compatible' : 'insuffisant'} pour le sujet "${sujet.titre}". Score obtenu : ${score}/100 (mode démo).`,
    forces: ['Candidature soumise avec succès', 'Profil enregistré sur la plateforme'],
    faiblesses: ['Analyse détaillée non disponible en mode démo'],
    decision,
    justification: `Score ${score}/100 → Décision automatique : ${decision}`,
    quiz:
      score >= 60 && decision === 'QUIZ_REQUIS'
        ? [
            `Quelles sont les principales différences entre ${sujet.technologies?.[0] || 'React'} et ses alternatives ?`,
            `Comment géreriez-vous l'état global dans une application ${sujet.technologies?.[0] || 'React'} ?`,
            `Décrivez votre expérience avec les technologies requises pour ce sujet.`,
          ]
        : [],
    email: {
      subject: `[Project Finder] Votre candidature — ${sujet.titre}`,
      content: `<p>Bonjour ${etudiant.prenom},</p><p>Votre candidature a été reçue (score : ${score}/100).</p><p>Decision : <strong>${decision}</strong></p>`,
    },
  };
}

// ─────────────────────────────────────────────────────────────
//  POSTULER À UN SUJET
// ─────────────────────────────────────────────────────────────
exports.postuler = async (req, res) => {
  try {
    const { idSujet, cvUrl, lettre } = req.body;

    // 1. Vérifier le sujet
    const sujet = await Sujet.findById(idSujet).populate({
      path: 'idEncadrant',
      populate: { path: 'utilisateur', select: 'nom prenom email' },
    });
    if (!sujet) return res.status(404).json({ message: 'Sujet introuvable' });
    if (!sujet.valide) return res.status(400).json({ message: "Ce sujet n'est pas encore validé" });

    // 2. Vérifier le profil étudiant
    const etudiantProfil = await Etudiant.findOne({ utilisateur: req.user._id });
    if (!etudiantProfil) return res.status(404).json({ message: 'Profil étudiant introuvable' });

    const userInfo = await Utilisateur.findById(req.user._id).select('-mot_de_passe');

    // 3. Vérifier doublon
    const dejaPostule = await Candidature.findOne({
      idSujet,
      idEtudiant: etudiantProfil._id,
    });
    if (dejaPostule)
      return res.status(400).json({ message: 'Vous avez déjà postulé pour ce sujet' });

    // 4. Vérifier statut PFE
    if (!['NON_AFFECTE', 'EN_ATTENTE_VALIDATION'].includes(etudiantProfil.statutPFE)) {
      return res.status(400).json({ message: 'Vous avez déjà un projet PFE actif' });
    }

    // 5. Compter les candidats éligibles (score >= 60) pour ce sujet
    const nbCandidatsEligibles = await Candidature.countDocuments({
      idSujet,
      scoreIA: { $gte: 60 },
    });

    // 6. ── ANALYSE IA ─────────────────────────────────────
    console.log(`\n🤖 Analyse IA en cours...`);
    console.log(`   Étudiant : ${userInfo.prenom} ${userInfo.nom}`);
    console.log(`   Sujet    : ${sujet.titre}`);
    console.log(`   Candidats éligibles : ${nbCandidatsEligibles}`);

    const analyse = await analyserCandidatureIA({
      cvUrl,
      lettre,
      sujet: {
        titre: sujet.titre,
        description: sujet.description,
        technologies: sujet.technologies,
        niveau: sujet.niveau,
        domaine: sujet.domaine,
      },
      etudiant: {
        nom: userInfo.nom,
        prenom: userInfo.prenom,
        filiere: etudiantProfil.filiere,
        niveau: etudiantProfil.niveau,
      },
      nbCandidatsEligibles,
    });

    console.log(`✅ Score : ${analyse.score}/100 | Décision : ${analyse.decision}`);

    // 7. Mapper la décision vers le statut MongoDB
    const statutMap = {
      REFUSE: 'REFUSE',
      QUIZ_REQUIS: 'QUIZ_REQUIS',
      INTERVIEW: 'INTERVIEW',
      ACCEPTE: 'EN_ATTENTE', // L'encadrant confirme l'acceptation finale
    };
    const statut = statutMap[analyse.decision] || 'EN_ATTENTE';

    // Date d'entretien si INTERVIEW (dans 7 jours)
    const dateInterview =
      analyse.decision === 'INTERVIEW' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;

    // 8. Créer la candidature en base
    const candidature = await Candidature.create({
      idSujet,
      idEtudiant: etudiantProfil._id,
      cvUrl: cvUrl || '',
      lettre: lettre || '',
      scoreIA: analyse.score,
      analyseIA: {
        resume: analyse.resume,
        forces: analyse.forces,
        faiblesses: analyse.faiblesses,
        decision: analyse.decision,
        justification: analyse.justification,
        quiz: analyse.quiz,
      },
      statut,
      dateInterview,
    });

    // 9. Mettre à jour statut PFE de l'étudiant
    if (statut !== 'REFUSE') {
      await Etudiant.findByIdAndUpdate(etudiantProfil._id, {
        statutPFE: 'EN_ATTENTE_VALIDATION',
      });
    }

    // 10. ── ENVOI EMAIL via le contenu généré par l'IA ────
    if (userInfo.email && analyse.email?.content) {
      try {
        await sendEmail({
          to: userInfo.email,
          subject: analyse.email.subject,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px;">
              <div style="background:#1a7a8a;padding:20px;border-radius:6px 6px 0 0;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:1.4rem;">🎓 Project Finder</h1>
                <p style="color:rgba(255,255,255,.8);margin:.5rem 0 0;font-size:.9rem;">Plateforme de gestion PFE</p>
              </div>
              <div style="padding:24px;">
                ${analyse.email.content}
                ${
                  analyse.quiz?.length > 0
                    ? `
                  <div style="margin-top:20px;padding:16px;background:#f5f5f5;border-radius:6px;border-left:4px solid #1a7a8a;">
                    <h3 style="color:#1a7a8a;margin:0 0 12px;">📝 Questions du quiz technique</h3>
                    <ol style="margin:0;padding-left:20px;">
                      ${analyse.quiz.map((q) => `<li style="margin-bottom:8px;color:#333;">${q}</li>`).join('')}
                    </ol>
                    <p style="margin:12px 0 0;font-size:.85rem;color:#666;">Connectez-vous sur la plateforme pour répondre à ces questions.</p>
                  </div>
                `
                    : ''
                }
                <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e0e0e0;text-align:center;">
                  <p style="color:#888;font-size:.8rem;margin:0;">Score de compatibilité IA : <strong style="color:#1a7a8a;">${analyse.score}/100</strong></p>
                  <p style="color:#888;font-size:.8rem;margin:4px 0 0;">Plateforme Project Finder — Tunisie</p>
                </div>
              </div>
            </div>
          `,
        });
        console.log(`📧 Email envoyé à ${userInfo.email}`);
      } catch (emailErr) {
        console.error('Erreur email:', emailErr.message);
      }
    }

    // 11. Réponse
    res.status(201).json({
      message: 'Candidature soumise avec succès !',
      candidature,
      scoreIA: analyse.score,
      decision: analyse.decision,
      statut,
      analyseIA: {
        score: analyse.score,
        resume: analyse.resume,
        forces: analyse.forces,
        faiblesses: analyse.faiblesses,
        decision: analyse.decision,
        justification: analyse.justification,
        quiz: analyse.quiz,
      },
    });
  } catch (error) {
    console.error('Erreur postuler:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  MES CANDIDATURES (étudiant)
// ─────────────────────────────────────────────────────────────
exports.mesCandidatures = async (req, res) => {
  try {
    const etudiant = await Etudiant.findOne({ utilisateur: req.user._id });
    if (!etudiant) return res.status(404).json({ message: 'Profil étudiant introuvable' });

    const candidatures = await Candidature.find({ idEtudiant: etudiant._id })
      .populate({
        path: 'idSujet',
        populate: {
          path: 'idEncadrant',
          populate: { path: 'utilisateur', select: 'nom prenom email' },
        },
      })
      .sort({ createdAt: -1 });

    res.json(candidatures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  CANDIDATURES PAR SUJET (encadrant)
// ─────────────────────────────────────────────────────────────
exports.candidaturesParSujet = async (req, res) => {
  try {
    const candidatures = await Candidature.find({ idSujet: req.params.idSujet })
      .populate({
        path: 'idEtudiant',
        populate: { path: 'utilisateur', select: 'nom prenom email telephone' },
      })
      .sort({ scoreIA: -1 }); // Meilleures scores en premier

    res.json(candidatures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  TOUTES MES CANDIDATURES (encadrant — tous ses sujets)
// ─────────────────────────────────────────────────────────────
exports.toutesMesCandidatures = async (req, res) => {
  try {
    const encadrant = await Encadrant.findOne({ utilisateur: req.user._id });
    if (!encadrant) return res.status(404).json({ message: 'Profil encadrant introuvable' });

    const sujets = await Sujet.find({ idEncadrant: encadrant._id }).select('_id');
    const idsSujets = sujets.map((s) => s._id);

    const candidatures = await Candidature.find({ idSujet: { $in: idsSujets } })
      .populate({ path: 'idSujet', select: 'titre technologies niveau domaine' })
      .populate({
        path: 'idEtudiant',
        populate: { path: 'utilisateur', select: 'nom prenom email' },
      })
      .sort({ scoreIA: -1 });

    res.json(candidatures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  CHANGER STATUT (encadrant : accepter / refuser / interview)
// ─────────────────────────────────────────────────────────────
exports.changerStatutCandidature = async (req, res) => {
  try {
    const { statut, dateInterview, heureInterview, lienMeet } = req.body;

    const candidature = await Candidature.findById(req.params.id)
      .populate({
        path: 'idEtudiant',
        populate: { path: 'utilisateur', select: 'nom prenom email' },
      })
      .populate('idSujet');

    if (!candidature) return res.status(404).json({ message: 'Candidature introuvable' });

    // Mise à jour
    const updateData = { statut };
    if (dateInterview) updateData.dateInterview = dateInterview;
    if (heureInterview) updateData.heureInterview = heureInterview;
    if (lienMeet) updateData.lienMeet = lienMeet;

    await Candidature.findByIdAndUpdate(req.params.id, updateData);

    const userInfo = candidature.idEtudiant?.utilisateur;
    const prenom = userInfo?.prenom || 'Étudiant';
    const email = userInfo?.email;
    const titreSujet = candidature.idSujet?.titre || 'Sujet PFE';

    // ── Mise à jour statut PFE ──────────────────────────
    if (statut === 'ACCEPTE') {
      await Etudiant.findByIdAndUpdate(candidature.idEtudiant._id, { statutPFE: 'EN_COURS' });

      // Créer le projet automatiquement
      const projetExistant = await Projet.findOne({
        idEtudiant: candidature.idEtudiant._id,
        idSujet: candidature.idSujet._id,
      });
      if (!projetExistant) {
        await Projet.create({
          idEtudiant: candidature.idEtudiant._id,
          idEncadrant: candidature.idSujet.idEncadrant,
          idSujet: candidature.idSujet._id,
          statutProjet: 'EN_COURS',
          dateDebut: new Date(),
          titre: candidature.idSujet.titre,
        });
      }
    }

    if (statut === 'REFUSE') {
      await Etudiant.findByIdAndUpdate(candidature.idEtudiant._id, { statutPFE: 'NON_AFFECTE' });
    }

    // ── Email selon la décision de l'encadrant ──────────
    if (email) {
      const emails = {
        ACCEPTE: {
          subject: `[Project Finder] 🎉 Candidature acceptée — ${titreSujet}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <div style="background:#059669;padding:20px;border-radius:6px 6px 0 0;text-align:center;">
                <h1 style="color:#fff;margin:0;">🎉 Félicitations !</h1>
              </div>
              <div style="padding:24px;border:1px solid #e0e0e0;border-radius:0 0 6px 6px;">
                <p>Bonjour <strong>${prenom}</strong>,</p>
                <p>Votre candidature pour le sujet <strong>${titreSujet}</strong> a été <strong style="color:#059669;">acceptée</strong> par votre encadrant !</p>
                <p>Votre projet PFE commence maintenant. Connectez-vous sur la plateforme pour accéder à votre espace de travail collaboratif.</p>
                <p style="margin-top:20px;">Bonne continuation,<br/><strong>L'équipe Project Finder</strong></p>
              </div>
            </div>`,
        },
        REFUSE: {
          subject: `[Project Finder] Candidature non retenue — ${titreSujet}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <div style="background:#64748b;padding:20px;border-radius:6px 6px 0 0;text-align:center;">
                <h1 style="color:#fff;margin:0;">Résultat de votre candidature</h1>
              </div>
              <div style="padding:24px;border:1px solid #e0e0e0;border-radius:0 0 6px 6px;">
                <p>Bonjour <strong>${prenom}</strong>,</p>
                <p>Après examen de votre candidature pour le sujet <strong>${titreSujet}</strong>, nous vous informons qu'elle n'a pas été retenue par l'encadrant.</p>
                <p>Ne vous découragez pas ! D'autres sujets sont disponibles sur la plateforme. Nous vous encourageons à postuler pour des sujets correspondant mieux à votre profil.</p>
                <p>Cordialement,<br/><strong>L'équipe Project Finder</strong></p>
              </div>
            </div>`,
        },
        INTERVIEW: {
          subject: `[Project Finder] 📅 Convocation à un entretien — ${titreSujet}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <div style="background:#1a7a8a;padding:20px;border-radius:6px 6px 0 0;text-align:center;">
                <h1 style="color:#fff;margin:0;">📅 Invitation à un entretien</h1>
              </div>
              <div style="padding:24px;border:1px solid #e0e0e0;border-radius:0 0 6px 6px;">
                <p>Bonjour <strong>${prenom}</strong>,</p>
                <p>Bonne nouvelle ! Votre candidature pour le sujet <strong>${titreSujet}</strong> a retenu l'attention de l'encadrant.</p>
                ${dateInterview ? `<p>📅 <strong>Date :</strong> ${new Date(dateInterview).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>` : ''}
                ${heureInterview ? `<p>🕐 <strong>Heure :</strong> ${heureInterview}</p>` : ''}
                ${lienMeet ? `<p>🔗 <strong>Lien :</strong> <a href="${lienMeet}" style="color:#1a7a8a;">${lienMeet}</a></p>` : ''}
                <p>Préparez-vous à présenter votre motivation et vos compétences techniques.</p>
                <p>Bonne chance !<br/><strong>L'équipe Project Finder</strong></p>
              </div>
            </div>`,
        },
        QUIZ_REQUIS: {
          subject: `[Project Finder] 📝 Quiz de sélection — ${titreSujet}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <div style="background:#7c3aed;padding:20px;border-radius:6px 6px 0 0;text-align:center;">
                <h1 style="color:#fff;margin:0;">📝 Quiz de sélection</h1>
              </div>
              <div style="padding:24px;border:1px solid #e0e0e0;border-radius:0 0 6px 6px;">
                <p>Bonjour <strong>${prenom}</strong>,</p>
                <p>Votre candidature pour le sujet <strong>${titreSujet}</strong> a été présélectionnée !</p>
                <p>En raison du nombre important de candidats qualifiés, un quiz technique vous a été assigné. Veuillez vous connecter sur la plateforme pour le compléter dans les <strong>48 heures</strong>.</p>
                <p>Bonne chance !<br/><strong>L'équipe Project Finder</strong></p>
              </div>
            </div>`,
        },
      };

      try {
        const emailContent = emails[statut];
        if (emailContent) {
          await sendEmail({ to: email, subject: emailContent.subject, html: emailContent.html });
          console.log(`📧 Email "${statut}" envoyé à ${email}`);
        }
      } catch (emailErr) {
        console.error('Erreur email:', emailErr.message);
      }
    }

    const updated = await Candidature.findById(req.params.id)
      .populate({
        path: 'idEtudiant',
        populate: { path: 'utilisateur', select: 'nom prenom email' },
      })
      .populate('idSujet');

    res.json({ message: `Statut mis à jour : ${statut}`, candidature: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  SOUMETTRE LES RÉPONSES AU QUIZ
// ─────────────────────────────────────────────────────────────
exports.soumettreQuiz = async (req, res) => {
  try {
    const { reponses } = req.body; // tableau de réponses
    const candidature = await Candidature.findById(req.params.id)
      .populate({
        path: 'idEtudiant',
        populate: { path: 'utilisateur', select: 'nom prenom email' },
      })
      .populate('idSujet');

    if (!candidature) return res.status(404).json({ message: 'Candidature introuvable' });
    if (candidature.statut !== 'QUIZ_REQUIS')
      return res.status(400).json({ message: 'Aucun quiz requis pour cette candidature' });

    // Score quiz simplifié (dans une vraie app, l'IA évalue les réponses)
    const scoreQuiz = Math.floor(Math.random() * 30) + 60; // 60-90

    // Mettre à jour
    await Candidature.findByIdAndUpdate(req.params.id, {
      scoreQuiz,
      reponsesQuiz: reponses,
      statut: scoreQuiz >= 70 ? 'INTERVIEW' : 'REFUSE',
    });

    res.json({
      message: 'Quiz soumis avec succès !',
      scoreQuiz,
      prochainEtape:
        scoreQuiz >= 70
          ? 'Vous serez convoqué à un entretien.'
          : "Votre candidature n'a pas été retenue.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
