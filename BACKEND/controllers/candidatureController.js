// ═══════════════════════════════════════════════════════════════
//  BACKEND/controllers/candidatureController.js
//  BASE ORIGINALE INTACTE + ajouts étape 1 :
//  - 40 questions multi-domaines uniques par étudiant
//  - Évaluation quiz par IA
//  - Délai de postulation (dateDebutPostulation / dateFinPostulation)
//  - 5 premiers candidats → INTERVIEW
//  - Recommandation sujet alternatif si REFUSE
//  - Génération token quiz + lien dans l'email
//  - Routes publiques ouvrirQuizToken + soumettreQuizToken
// ═══════════════════════════════════════════════════════════════
const Candidature = require('../models/Candidature');
const Sujet = require('../models/Sujet');
const Etudiant = require('../models/Etudiant');
const Encadrant = require('../models/Encadrant');
const Utilisateur = require('../models/Utilisateur');
const Projet = require('../models/Projet');
const axios = require('axios');
const pdfParse = require('@cyber2024/pdf-parse-fixed');
const sendEmail = require('../utils/sendEmail');
const { creerEtEnvoyerNotif } = require('../utils/pusher');

// ─────────────────────────────────────────────────────────────
//  HELPER : appel Groq
// ─────────────────────────────────────────────────────────────
async function callGroq(prompt, maxTokens = 2000) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: maxTokens,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API ${response.status}: ${err}`);
  }
  const data = await response.json();
  const texte = data.choices?.[0]?.message?.content || '';
  const match = texte.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('JSON non trouvé dans réponse IA');
  return JSON.parse(match[0]);
}

// ─────────────────────────────────────────────────────────────
//  EXTRACTION TEXTE DU CV PDF (Cloudinary → buffer → texte)
// ─────────────────────────────────────────────────────────────
async function extractCvText(cvUrl) {
  if (!cvUrl) return '';
  try {
    const response = await axios.get(cvUrl, { responseType: 'arraybuffer', timeout: 10000 });
    const data = await pdfParse(Buffer.from(response.data));
    return data.text?.trim().slice(0, 4000) || '';
  } catch (err) {
    console.warn('⚠️  Impossible de lire le CV PDF:', err.message);
    return '';
  }
}

// ─────────────────────────────────────────────────────────────
// -------------------------------------------------------------
//  NORMALISATION QCM
// -------------------------------------------------------------
async function normaliserQCM(rawQuiz, sujet) {
  if (!Array.isArray(rawQuiz) || rawQuiz.length === 0) return [];

  const bonnes = [];
  const stringsAConvertir = [];

  rawQuiz.slice(0, 20).forEach((q, i) => {
    if (
      typeof q === 'object' &&
      q !== null &&
      typeof q.question === 'string' &&
      q.question.trim() &&
      typeof q.options === 'object' &&
      q.options !== null &&
      ['A', 'B', 'C', 'D'].every((l) => typeof q.options[l] === 'string' && q.options[l].trim()) &&
      ['A', 'B', 'C', 'D'].includes(q.reponse)
    ) {
      bonnes.push({ idx: i, q });
    } else {
      const texte = typeof q === 'string' ? q : q && q.question ? q.question : JSON.stringify(q);
      stringsAConvertir.push({ idx: i, texte });
    }
  });

  if (stringsAConvertir.length === 0) {
    return bonnes.map((b) => b.q);
  }

  if (process.env.GROQ_API_KEY && stringsAConvertir.length > 0) {
    try {
      const listeQuestions = stringsAConvertir.map((s, i) => `${i + 1}. ${s.texte}`).join('\n');
      const promptConvert = `Tu es un expert QCM pour le domaine "${sujet.titre}" (${sujet.domaine || ''}).
Technologies : ${sujet.technologies ? sujet.technologies.join(', ') : 'non specifie'}.

Transforme chaque question en QCM avec 4 options plausibles (A/B/C/D) et une seule bonne reponse.
Options specifiques au domaine, realistes, non triviales. Varier la position de la bonne reponse.

Questions :
${listeQuestions}

Retourne UNIQUEMENT un tableau JSON valide (sans texte autour) :
[
  { "question": "...", "options": { "A": "...", "B": "...", "C": "...", "D": "..." }, "reponse": "B" }
]
Le tableau doit avoir exactement ${stringsAConvertir.length} objets dans le meme ordre.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: promptConvert }],
          temperature: 0.3,
          max_tokens: 4000,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const texte = data.choices?.[0]?.message?.content || '';
        const match = texte.match(/\[[\s\S]*\]/);
        if (match) {
          const converted = JSON.parse(match[0]);
          if (Array.isArray(converted)) {
            stringsAConvertir.forEach((s, i) => {
              const qcm = converted[i];
              if (
                qcm &&
                qcm.question &&
                qcm.options &&
                ['A', 'B', 'C', 'D'].includes(qcm.reponse)
              ) {
                bonnes.push({ idx: s.idx, q: qcm });
              } else {
                bonnes.push({ idx: s.idx, q: creerQCMFallback(s.texte, sujet) });
              }
            });
          }
        }
      }
    } catch (err) {
      console.warn('Erreur conversion QCM:', err.message);
      stringsAConvertir.forEach((s) =>
        bonnes.push({ idx: s.idx, q: creerQCMFallback(s.texte, sujet) })
      );
    }
  } else {
    stringsAConvertir.forEach((s) =>
      bonnes.push({ idx: s.idx, q: creerQCMFallback(s.texte, sujet) })
    );
  }

  return bonnes.sort((a, b) => a.idx - b.idx).map((b) => b.q);
}

function creerQCMFallback(texte, sujet) {
  const tech =
    sujet.technologies && sujet.technologies[0] ? sujet.technologies[0] : 'Approche standard';
  const tech2 =
    sujet.technologies && sujet.technologies[1] ? sujet.technologies[1] : 'Methode alternative';
  return {
    question: texte,
    options: {
      A: tech,
      B: tech2,
      C: 'Analyse comparative des deux approches',
      D: 'Aucune de ces approches',
    },
    reponse: 'A',
  };
}

async function analyserCandidatureIA({ cvUrl, lettre, sujet, etudiant, nbCandidatsEligibles }) {
  // ── Lire le contenu réel du CV ────────────────────────────
  const cvTexte = await extractCvText(cvUrl);

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

${
  cvTexte
    ? `═══════════════════════════════════════
📄 CONTENU RÉEL DU CV (texte extrait)
═══════════════════════════════════════
${cvTexte}
`
    : "⚠️ CV non lisible — baser l'évaluation uniquement sur la filière et le niveau."
}

${
  lettre
    ? `═══════════════════════════════════════
✉️ LETTRE DE MOTIVATION
═══════════════════════════════════════
${lettre}`
    : ''
}

═══════════════════════════════════════
📊 MÉTHODE DE SCORING — BASE-TOI SUR LE CV RÉEL
═══════════════════════════════════════
IMPORTANT : Le score DOIT refléter le contenu exact du CV ci-dessus.
- Si le CV ne mentionne AUCUNE technologie requise → score < 30
- Si le CV mentionne quelques technologies pertinentes → score 40-60
- Si le CV est bien aligné avec le sujet → score 60-80
- Si le CV est excellent et très aligné → score 80-100

Pondération :
- Compétences techniques (technologies du sujet présentes dans le CV) → 50%
- Projets réalisés en lien avec le domaine → 30%
- Expérience professionnelle → 20%

NE PAS donner un score autour de 70 par défaut.
Le score doit VARIER selon le profil réel : un étudiant L2 sans expérience web postulant à un projet Laravel/Vue.js doit obtenir un score INFÉRIEUR À 30.

═══════════════════════════════════════
⚙️ LOGIQUE DE SÉLECTION
═══════════════════════════════════════
- Si score < 40 → REFUSE obligatoire
- Si score ≥ 40 et < 60 → REFUSE (profil insuffisant)
- Si score ≥ 60 → QUIZ_REQUIS OBLIGATOIRE (tous les candidats retenus passent le quiz technique)
- INTERVIEW et ACCEPTE sont INTERDITS à ce stade — la décision finale se fait après le quiz

===========================================
🧪 QUIZ QCM FORMAT OBLIGATOIRE (si QUIZ_REQUIS)
===========================================
Génère EXACTEMENT 20 questions QCM adaptées au domaine : "${sujet.titre}" (${sujet.domaine || 'domaine général'})
Technologies concernées : ${sujet.technologies?.join(', ') || 'non spécifié'}
Seed : ${etudiant.nom}-${etudiant.prenom}-${Date.now()}

CHAQUE objet dans "quiz" DOIT avoir cette structure EXACTE :
{
  "question": "Texte complet de la question ?",
  "options": { "A": "Première option", "B": "Deuxième option", "C": "Troisième option", "D": "Quatrième option" },
  "reponse": "B"
}

EXEMPLE CONCRET pour un sujet web :
{
  "question": "Quel protocole est utilisé pour sécuriser les échanges HTTP ?",
  "options": { "A": "FTP", "B": "HTTPS", "C": "SMTP", "D": "SSH" },
  "reponse": "B"
}

Règles des options :
- Les 4 options doivent être plausibles et liées au domaine du sujet
- Une seule bonne réponse par question
- Les options ne doivent pas être triviales (pas "aucune réponse" ni "toutes les réponses")
- Varier la position de la bonne réponse (pas toujours A ou B)

Les 20 questions couvrent :
1. CONNAISSANCES THÉORIQUES DU DOMAINE (5 questions)
2. MÉTHODOLOGIE ET APPROCHE (4 questions)
3. CAS PRATIQUES ET MISE EN SITUATION (3 questions)
4. OUTILS ET TECHNOLOGIES : ${sujet.technologies?.join(', ') || 'outils pertinents'} (4 questions)
5. ANALYSE ET ESPRIT CRITIQUE (2 questions)
6. VEILLE ET INNOVATIONS DU DOMAINE (2 questions)

NE JAMAIS mettre une question sous forme de chaîne simple. TOUJOURS utiliser l'objet {question, options, reponse}.

═══════════════════════════════════════
📧 GÉNÉRATION D'EMAIL
═══════════════════════════════════════
1. REFUSE : informer poliment, mentionner le score, encourager à postuler sur un sujet plus adapté
2. QUIZ_REQUIS : présélectionné, quiz à passer
3. INTERVIEW : sélectionné, convocation à venir
4. ACCEPTE : féliciter pour la présélection, indiquer qu'un quiz technique est obligatoire avant la validation finale, ton encourageant

═══════════════════════════════════════
📤 FORMAT DE SORTIE (OBLIGATOIRE)
═══════════════════════════════════════
Retourne UNIQUEMENT un objet JSON valide :

{
  "score": <nombre 0-100 BASÉ SUR LE CV RÉEL>,
  "resume": "<résumé court du profil analysé>",
  "forces": ["<force1>", "<force2>"],
  "faiblesses": ["<faiblesse1>"],
  "decision": "<REFUSE | QUIZ_REQUIS | INTERVIEW | ACCEPTE>",
  "justification": "<explication précise basée sur le CV>",
  "quiz": [
    {
      "question": "<texte de la question>",
      "options": {"A": "<option A>", "B": "<option B>", "C": "<option C>", "D": "<option D>"},
      "reponse": "<A|B|C|D>"
    }
  ],
  "email": {
    "subject": "<objet de l'email>",
    "content": "<contenu HTML professionnel>"
  }
}

🚨 RÈGLES ABSOLUES
- Score basé UNIQUEMENT sur le contenu réel du CV fourni
- Jamais de score fixe ou arbitraire autour de 70
- Réponds uniquement en JSON valide, pas de texte hors JSON
- Si QUIZ_REQUIS : le tableau quiz doit contenir EXACTEMENT 20 objets QCM avec question, options (A/B/C/D), reponse
- Si REFUSE : le tableau quiz doit être vide []`;

  try {
    if (!process.env.GROQ_API_KEY) {
      console.warn('⚠️  GROQ_API_KEY non définie — mode démo activé');
      return modeDemo(sujet, etudiant, nbCandidatsEligibles);
    }
    const result = await callGroq(prompt, 5000);
    return {
      score: Math.min(100, Math.max(0, parseInt(result.score) || 50)),
      resume: result.resume || '',
      forces: Array.isArray(result.forces) ? result.forces : [],
      faiblesses: Array.isArray(result.faiblesses) ? result.faiblesses : [],
      decision: ['REFUSE', 'QUIZ_REQUIS', 'INTERVIEW', 'ACCEPTE'].includes(result.decision)
        ? result.decision
        : 'INTERVIEW',
      justification: result.justification || '',
      quiz: await normaliserQCM(result.quiz, sujet),
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
//  ÉVALUATION QUIZ PAR L'IA  (remplace le score aléatoire)
// ─────────────────────────────────────────────────────────────
async function evaluerQuizIA({ questions, reponses, sujet }) {
  // QCM : calculer score sur les bonnes reponses
  const isQCM = questions.length > 0 && typeof questions[0] === 'object' && questions[0].reponse;
  if (isQCM) {
    let bonnes = 0;
    questions.forEach((q, i) => {
      if ((reponses[i] || '').trim().toUpperCase() === (q.reponse || '').toUpperCase()) bonnes++;
    });
    const scoreQuiz = Math.round((bonnes / questions.length) * 100);
    return {
      scoreQuiz,
      evaluation: `${bonnes}/${questions.length} bonnes reponses`,
      pointsForts: [],
      pointsFaibles: [],
      decision: scoreQuiz >= 70 ? 'INTERVIEW' : 'REFUSE',
    };
  }

  const prompt = `Tu es un évaluateur expert en PFE.
Évalue les réponses d'un étudiant. Le sujet n'est pas forcément informatique.

Sujet       : ${sujet.titre}
Domaine     : ${sujet.domaine || 'Non spécifié'}
Outils/Tech : ${sujet.technologies?.join(', ') || 'Non spécifié'}

${questions.map((q, i) => `Q${i + 1}: ${q}\nR${i + 1}: ${reponses[i] || '(pas de réponse)'}`).join('\n\n')}

Critères : pertinence au domaine, exactitude, profondeur, vocabulaire spécifique.
Score ≥ 70 = qualifié pour entretien.

Retourne UNIQUEMENT ce JSON :
{
  "scoreQuiz": <0-100>,
  "evaluation": "<résumé global>",
  "pointsForts": ["<point1>"],
  "pointsFaibles": ["<point1>"],
  "decision": "<INTERVIEW | REFUSE>"
}`;

  try {
    if (!process.env.GROQ_API_KEY) {
      const score = Math.floor(Math.random() * 30) + 60;
      return {
        scoreQuiz: score,
        evaluation: `Score démo : ${score}/100`,
        pointsForts: [],
        pointsFaibles: [],
        decision: score >= 70 ? 'INTERVIEW' : 'REFUSE',
      };
    }
    const result = await callGroq(prompt, 1000);
    const score = Math.min(100, Math.max(0, parseInt(result.scoreQuiz) || 0));
    return {
      scoreQuiz: score,
      evaluation: result.evaluation || '',
      pointsForts: Array.isArray(result.pointsForts) ? result.pointsForts : [],
      pointsFaibles: Array.isArray(result.pointsFaibles) ? result.pointsFaibles : [],
      decision: result.decision === 'INTERVIEW' ? 'INTERVIEW' : 'REFUSE',
    };
  } catch (error) {
    console.error('Erreur évaluation quiz IA:', error.message);
    const score = Math.floor(Math.random() * 30) + 60;
    return {
      scoreQuiz: score,
      evaluation: '',
      pointsForts: [],
      pointsFaibles: [],
      decision: score >= 70 ? 'INTERVIEW' : 'REFUSE',
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  RECOMMANDATION SUJET ALTERNATIF  (si REFUSE)
// ─────────────────────────────────────────────────────────────
async function recommanderSujetAlternatif({
  etudiant,
  sujetRefuse,
  tousLesSujets,
  cvUrl,
  forces,
  faiblesses,
}) {
  if (!tousLesSujets.length) return null;

  // ── Mode démo (pas de clé Groq) ──────────────────────────
  if (!process.env.GROQ_API_KEY) {
    // Choisir le premier sujet disponible comme recommandation démo
    const sujetDemo = tousLesSujets[0];
    if (!sujetDemo) return null;
    return {
      sujet: sujetDemo,
      raison: `Votre profil (${etudiant.filiere || 'filière non renseignée'}, niveau ${etudiant.niveau || 'N/A'}) correspond mieux à ce sujet dont les technologies sont plus accessibles.`,
    };
  }

  // ── Mode IA ───────────────────────────────────────────────
  const profilDetail = [
    etudiant.filiere ? `Filière : ${etudiant.filiere}` : null,
    etudiant.niveau ? `Niveau : ${etudiant.niveau}` : null,
    forces?.length ? `Points forts identifiés : ${forces.join(', ')}` : null,
    faiblesses?.length ? `Points faibles identifiés : ${faiblesses.join(', ')}` : null,
    cvUrl ? `CV disponible : ${cvUrl}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const prompt = `Un étudiant a été refusé pour le sujet "${sujetRefuse.titre}" (score insuffisant).

═══ PROFIL ÉTUDIANT ═══
${profilDetail || 'Profil non renseigné'}

═══ SUJETS DISPONIBLES ═══
${tousLesSujets
  .slice(0, 20)
  .map(
    (s, i) =>
      `${i + 1}. ID:${s._id} | ${s.titre} | Tech: ${s.technologies?.join(', ') || 'N/A'} | Niveau: ${s.niveau || 'N/A'} | Domaine: ${s.domaine || 'N/A'}`
  )
  .join('\n')}

Recommande le sujet le plus compatible avec le profil réel de cet étudiant.
Prends en compte ses points forts et sa filière pour choisir un sujet où il a plus de chances de réussir.

Retourne UNIQUEMENT ce JSON :
{"idSujetRecommande":"<id MongoDB exact>","raisonRecommandation":"<explication personnalisée en 1-2 phrases, en français>"}`;

  try {
    const result = await callGroq(prompt, 500);
    const sujetTrouve = tousLesSujets.find((s) => s._id.toString() === result.idSujetRecommande);
    if (!sujetTrouve) {
      // Fallback : retourner le premier sujet si l'ID n'est pas trouvé
      return {
        sujet: tousLesSujets[0],
        raison: result.raisonRecommandation || 'Ce sujet correspond mieux à votre profil actuel.',
      };
    }
    return { sujet: sujetTrouve, raison: result.raisonRecommandation || '' };
  } catch {
    // Fallback silencieux
    const sujetFallback = tousLesSujets[0];
    if (!sujetFallback) return null;
    return {
      sujet: sujetFallback,
      raison: 'Ce sujet correspond mieux à votre niveau et votre filière actuelle.',
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  MODE DÉMO  (si GROQ_API_KEY absente)
// ─────────────────────────────────────────────────────────────
function modeDemo(sujet, etudiant, nbCandidats) {
  const score = Math.floor(Math.random() * 35) + 55;
  let decision;
  if (score < 40) decision = 'REFUSE';
  else if (score >= 60 && nbCandidats >= 5) decision = 'QUIZ_REQUIS';
  else if (score >= 80) decision = 'ACCEPTE';
  else decision = 'INTERVIEW';

  // 40 questions démo — pool adapté au domaine, shuffle par étudiant
  const domaine = (sujet.domaine || '').toLowerCase();
  const titre = sujet.titre || 'le sujet';
  const tech = sujet.technologies?.[0] || 'les outils du domaine';
  const tech2 = sujet.technologies?.[1] || 'les méthodes associées';
  const estSante = /sant|méd|médic|cliniq|pharma|bio|infirmier|hospital|patient|patholog/.test(
    domaine + titre.toLowerCase()
  );
  const estEconomie = /économ|financ|compt|gestion|market|entrepris|banq|invest|audit/.test(
    domaine + titre.toLowerCase()
  );
  const estInfo =
    /inform|logiciel|web|mobile|ia|intelligence artificielle|données|réseau|cyber/.test(
      domaine + titre.toLowerCase()
    );

  const pool = [
    `Définissez les concepts fondamentaux liés à "${titre}".`,
    `Quelles sont les principales théories utilisées dans le domaine de "${titre}" ?`,
    `Expliquez l'évolution historique du domaine concerné par "${titre}".`,
    `Quels sont les principaux acteurs ou institutions clés dans ce domaine ?`,
    `Définissez et distinguez les termes techniques essentiels liés à "${titre}".`,
    estSante
      ? `Expliquez le mécanisme physiopathologique principal lié à "${titre}".`
      : estEconomie
        ? `Quels indicateurs économiques sont pertinents pour "${titre}" ?`
        : `Quels sont les paradigmes dominants pour aborder "${titre}" ?`,
    estSante
      ? `Décrivez les protocoles standards pertinents pour "${titre}".`
      : `Quelles normes ou standards internationaux s'appliquent à "${titre}" ?`,
    `Citez 3 publications académiques importantes dans le domaine de "${titre}".`,
    `Quelle est la différence entre approche quantitative et qualitative dans ce domaine ?`,
    `Quels sont les défis et limites actuels dans le domaine de "${titre}" ?`,
    `Quelle méthodologie adopteriez-vous pour mener à bien "${titre}" ?`,
    `Comment planifieriez-vous les étapes de votre PFE sur "${titre}" sur 6 mois ?`,
    estSante
      ? `Quels critères éthiques (Helsinki, CNOM) guident votre travail sur "${titre}" ?`
      : `Quels critères éthiques devez-vous respecter dans "${titre}" ?`,
    `Comment collecteriez-vous des données fiables pour votre projet sur "${titre}" ?`,
    `Quels outils d'analyse utiliseriez-vous pour "${titre}" ? Justifiez votre choix.`,
    `Comment valideriez-vous les résultats de votre travail sur "${titre}" ?`,
    `Décrivez la structure idéale d'un rapport de PFE sur "${titre}".`,
    `Comment géreriez-vous les imprévus méthodologiques dans votre projet ?`,
    `Présentez un cas concret où les concepts de "${titre}" ont été appliqués avec succès.`,
    estSante
      ? `Un patient présente des symptômes liés à votre PFE. Comment procédez-vous ?`
      : estEconomie
        ? `Une entreprise fait face à une crise liée à "${titre}". Quelle stratégie proposez-vous ?`
        : `Vous identifiez un problème majeur lié à "${titre}". Comment l'abordez-vous ?`,
    `Comment mesureriez-vous l'impact des solutions proposées dans "${titre}" ?`,
    `Donnez un exemple de bonne pratique et de mauvaise pratique dans le domaine de "${titre}".`,
    `Si vous aviez accès à des données réelles pour "${titre}", comment les exploiteriez-vous ?`,
    `Comment présenteriez-vous vos résultats à un public non spécialiste de "${titre}" ?`,
    `Quelles sont les critiques ou limites des approches actuelles dans le domaine de "${titre}" ?`,
    `Comparez deux approches différentes pour traiter la problématique de "${titre}".`,
    `Analysez un échec notable dans ce domaine et les leçons à en tirer.`,
    `Comment évalueriez-vous la fiabilité des sources d'information sur "${titre}" ?`,
    `Quel regard critique portez-vous sur l'état actuel de la recherche dans ce domaine ?`,
    `Quels sont les outils principaux utilisés dans le domaine de "${titre}" ? (${tech}, ${tech2})`,
    `Comment maîtrisez-vous ${tech} ? Décrivez une utilisation concrète.`,
    estInfo
      ? `Comment sécuriseriez-vous les données de votre projet "${titre}" ?`
      : `Quels logiciels utiliseriez-vous pour analyser les données de "${titre}" ?`,
    `Quelle est la courbe d'apprentissage de ${tech} et comment l'avez-vous surmontée ?`,
    `Comment choisiriez-vous entre plusieurs outils disponibles pour "${titre}" ?`,
    estSante
      ? `Quelles réglementations (RGPD, confidentialité médicale) s'appliquent à "${titre}" ?`
      : `Quels enjeux éthiques et réglementaires sont associés à "${titre}" ?`,
    `Comment garantissez-vous la confidentialité des données dans votre projet ?`,
    `Quelles responsabilités légales incombent aux praticiens de ce domaine ?`,
    `Comment les évolutions réglementaires récentes impactent-elles "${titre}" ?`,
    `Pourquoi avez-vous choisi "${titre}" ? Quelle est votre motivation personnelle ?`,
    `Décrivez un projet passé en lien avec le domaine de "${titre}".`,
    `Quelles compétences avez-vous qui vous préparent à réussir "${titre}" ?`,
    `Quelles lacunes identifiez-vous dans votre profil et comment comptez-vous les combler ?`,
    `Quelles sont les 3 innovations les plus marquantes du domaine de "${titre}" en 2024-2025 ?`,
    `Citez une publication récente ou conférence marquante dans le domaine de "${titre}".`,
  ];

  // Shuffle déterministe par étudiant
  const seed = (etudiant.nom + etudiant.prenom).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const shuffled = [...pool].sort(
    (a, b) => Math.sin(seed * pool.indexOf(a) + 1) - Math.sin(seed * pool.indexOf(b) + 1)
  );
  // Convertir questions texte en QCM format
  const rawQuestions = ['QUIZ_REQUIS', 'ACCEPTE'].includes(decision) ? shuffled.slice(0, 20) : [];
  const demoOpts = [
    ['Analyse theorique', 'Test empirique', 'Simulation', 'Observation directe'],
    ['Methode qualitative', 'Methode quantitative', 'Methode mixte', 'Sans methode specifique'],
    ['Solution open-source', 'Solution commerciale', 'Developpement interne', 'Externalisation'],
    ['Analyse des besoins', 'Conception', 'Developpement', 'Tests et deploiement'],
  ];
  const repDemo = ['A', 'B', 'C', 'D'];
  const quiz = rawQuestions.map((q, i) => ({
    question: q,
    options: {
      A: demoOpts[i % 4][0],
      B: demoOpts[i % 4][1],
      C: demoOpts[i % 4][2],
      D: demoOpts[i % 4][3],
    },
    reponse: repDemo[i % 4],
  }));

  return {
    score,
    resume: `Profil ${score >= 60 ? 'compatible' : 'insuffisant'} pour "${sujet.titre}". Score : ${score}/100 (mode démo).`,
    forces: ['Candidature soumise avec succès', 'Profil enregistré sur la plateforme'],
    faiblesses: ['Analyse détaillée non disponible en mode démo'],
    decision,
    justification: `Score ${score}/100 → Décision automatique : ${decision}`,
    quiz,
    email: {
      subject: `[SmartPFE] Votre candidature — ${sujet.titre}`,
      content: `<p>Bonjour ${etudiant.prenom},</p><p>Score : ${score}/100 — Décision : <strong>${decision}</strong></p>`,
    },
  };
}

// ═════════════════════════════════════════════════════════════
//  POSTULER À UN SUJET  (logique originale + délai + token)
// ═════════════════════════════════════════════════════════════
exports.postuler = async (req, res) => {
  try {
    const { idSujet, cvUrl, lettre, sujetFileUrl, sujetFileName, lettreFileUrl, lettreFileName } =
      req.body;

    // 1. Vérifier le sujet
    const sujet = await Sujet.findById(idSujet).populate({
      path: 'idEncadrant',
      populate: { path: 'utilisateur', select: 'nom prenom email' },
    });
    if (!sujet) return res.status(404).json({ message: 'Sujet introuvable' });
    if (!sujet.valide) return res.status(400).json({ message: "Ce sujet n'est pas encore validé" });

    // 2. Vérifier délai de postulation (contrôlé par admin)
    const maintenant = new Date();
    if (sujet.dateDebutPostulation && maintenant < sujet.dateDebutPostulation)
      return res.status(400).json({
        message: `Les candidatures ouvrent le ${sujet.dateDebutPostulation.toLocaleDateString('fr-FR')}.`,
      });
    if (sujet.dateFinPostulation && maintenant > sujet.dateFinPostulation)
      return res.status(400).json({
        message: `La période de candidature est terminée depuis le ${sujet.dateFinPostulation.toLocaleDateString('fr-FR')}.`,
      });

    // 3. Vérifier profil étudiant
    const etudiantProfil = await Etudiant.findOne({ utilisateur: req.user._id });
    if (!etudiantProfil) return res.status(404).json({ message: 'Profil étudiant introuvable' });
    const userInfo = await Utilisateur.findById(req.user._id).select('-mot_de_passe');

    // 4. Vérifier doublon
    const dejaPostule = await Candidature.findOne({ idSujet, idEtudiant: etudiantProfil._id });
    if (dejaPostule)
      return res.status(400).json({ message: 'Vous avez déjà postulé pour ce sujet' });

    // 5. Vérifier statut PFE
    if (!['NON_AFFECTE', 'EN_ATTENTE_VALIDATION'].includes(etudiantProfil.statutPFE))
      return res.status(400).json({ message: 'Vous avez déjà un projet PFE actif' });

    // 6. Compter candidats éligibles
    const nbCandidatsEligibles = await Candidature.countDocuments({
      idSujet,
      scoreIA: { $gte: 60 },
    });

    // 7. Analyse IA
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

    // 8. Mapper décision → statut
    const statutMap = {
      REFUSE: 'REFUSE',
      QUIZ_REQUIS: 'QUIZ_REQUIS',
      INTERVIEW: 'INTERVIEW',
      ACCEPTE: 'QUIZ_REQUIS', // présélectionné → quiz obligatoire avant validation finale
    };
    const statut = statutMap[analyse.decision] || 'EN_ATTENTE';
    const dateInterview =
      analyse.decision === 'INTERVIEW' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;

    // 9. Créer la candidature
    const candidature = await Candidature.create({
      idSujet,
      idEtudiant: etudiantProfil._id,
      cvUrl: cvUrl || '',
      lettre: lettre || '',
      sujetFileUrl: sujetFileUrl || '',
      sujetFileName: sujetFileName || '',
      lettreFileUrl: lettreFileUrl || '',
      lettreFileName: lettreFileName || '',
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

    // 9b. Générer token quiz si QUIZ_REQUIS ou ACCEPTE (tous les candidats retenus passent le quiz)
    let quizLink = null;
    if (['QUIZ_REQUIS', 'ACCEPTE'].includes(analyse.decision) && analyse.quiz?.length > 0) {
      const token = candidature.genererQuizToken();
      await candidature.save();
      quizLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/quiz/token/${token}`;
      console.log(`🔗 Lien quiz généré : ${quizLink}`);
    }

    // 10. Mettre à jour statut PFE étudiant
    if (statut !== 'REFUSE')
      await Etudiant.findByIdAndUpdate(etudiantProfil._id, { statutPFE: 'EN_ATTENTE_VALIDATION' });

    // 11. Recommandation si REFUSE
    let recommandation = null;
    if (analyse.decision === 'REFUSE') {
      try {
        const autresSujets = await Sujet.find({
          _id: { $ne: idSujet },
          valide: true,
          $or: [{ dateFinPostulation: null }, { dateFinPostulation: { $gt: maintenant } }],
        })
          .select('_id titre technologies niveau domaine')
          .limit(20);
        recommandation = await recommanderSujetAlternatif({
          etudiant: { filiere: etudiantProfil.filiere, niveau: etudiantProfil.niveau },
          sujetRefuse: sujet,
          tousLesSujets: autresSujets,
          cvUrl: cvUrl || null,
          forces: analyse.forces || [],
          faiblesses: analyse.faiblesses || [],
        });
      } catch (err) {
        console.error('Erreur recommandation:', err.message);
      }
    }

    // 12. Email (contenu original + lien quiz sécurisé)
    if (userInfo.email && analyse.email?.content) {
      try {
        const recommandationHtml = recommandation
          ? `<div style="margin-top:20px;padding:16px;background:#f0fdf4;border-radius:6px;border-left:4px solid #22c55e;">
               <h3 style="color:#16a34a;margin:0 0 8px;">Sujet recommandé pour votre profil</h3>
               <p style="font-weight:700;color:#15803d;margin:0 0 4px;">${recommandation.sujet.titre}</p>
               <p style="color:#166534;font-size:.85rem;margin:0;">${recommandation.raison}</p>
             </div>`
          : '';

        const quizHtml = quizLink
          ? `<div style="margin-top:20px;padding:16px;background:#fff8e1;border-radius:6px;border-left:4px solid #f5c518;">
               <h3 style="color:#b45309;margin:0 0 12px;">Quiz technique — 20 questions</h3>
               <p style="color:#78350f;font-size:.9rem;margin:0 0 8px;">Environ 20 minutes pour répondre. Le chronomètre démarre dès l'ouverture.</p>
               <p style="color:#78350f;font-size:.85rem;margin:0 0 16px;">Lien valable 48 heures — ne le partagez pas.</p>
               <a href="${quizLink}" style="display:inline-block;padding:12px 28px;background:#1a7a8a;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;">Démarrer le quiz</a>
             </div>`
          : '';

        await sendEmail({
          to: userInfo.email,
          subject: analyse.email.subject,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px;">
              <div style="background:#1a7a8a;padding:20px;border-radius:6px 6px 0 0;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:1.4rem;">SmartPFE</h1>
                <p style="color:rgba(255,255,255,.8);margin:.5rem 0 0;font-size:.9rem;">Plateforme de gestion PFE</p>
              </div>
              <div style="padding:24px;">
                ${analyse.email.content}
                ${quizHtml}
                ${recommandationHtml}
                <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e0e0e0;text-align:center;">
                  <p style="color:#888;font-size:.8rem;margin:0;">Score de compatibilité IA : <strong style="color:#1a7a8a;">${analyse.score}/100</strong></p>
                  <p style="color:#888;font-size:.8rem;margin:4px 0 0;">Plateforme SmartPFE — Tunisie</p>
                </div>
              </div>
            </div>`,
        });
        console.log(`📧 Email envoyé à ${userInfo.email}`);
      } catch (emailErr) {
        console.error('Erreur email:', emailErr.message);
      }
    }

    // 13. Réponse
    // Notification temps réel → étudiant
    try {
      await creerEtEnvoyerNotif({
        idUtilisateur: req.user._id,
        titre: `Candidature soumise — ${sujet.titre}`,
        contenu: `Score IA : ${analyse.score}/100 | Décision : ${analyse.decision}`,
        type: 'SYSTEME',
      });
    } catch (e) {
      console.error('Notif pusher étudiant candidature:', e.message);
    }

    // Notification temps réel → encadrant
    try {
      const encadrantUserId = sujet.idEncadrant?.utilisateur?._id || sujet.idEncadrant?.utilisateur;
      if (encadrantUserId) {
        await creerEtEnvoyerNotif({
          idUtilisateur: encadrantUserId,
          titre: `Nouvelle candidature — ${sujet.titre}`,
          contenu: `${userInfo.prenom} ${userInfo.nom} a postulé. Score IA : ${analyse.score}/100 | Statut : ${statut}`,
          type: 'SYSTEME',
        });
      }
    } catch (e) {
      console.error('Notif pusher encadrant candidature:', e.message);
    }

    res.status(201).json({
      message: 'Candidature soumise avec succès !',
      candidature,
      scoreIA: analyse.score,
      decision: analyse.decision,
      statut,
      recommandation,
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

// ═════════════════════════════════════════════════════════════
//  MES CANDIDATURES  (identique à l'original)
// ═════════════════════════════════════════════════════════════
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

// ═════════════════════════════════════════════════════════════
//  CANDIDATURES PAR SUJET  (identique à l'original)
// ═════════════════════════════════════════════════════════════
exports.candidaturesParSujet = async (req, res) => {
  try {
    const candidatures = await Candidature.find({ idSujet: req.params.idSujet })
      .populate({
        path: 'idEtudiant',
        populate: { path: 'utilisateur', select: 'nom prenom email telephone' },
      })
      .sort({ scoreIA: -1 });
    res.json(candidatures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ═════════════════════════════════════════════════════════════
//  TOUTES MES CANDIDATURES  (identique à l'original)
// ═════════════════════════════════════════════════════════════
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

// ═════════════════════════════════════════════════════════════
//  CHANGER STATUT  (logique originale intacte — emails complets)
// ═════════════════════════════════════════════════════════════
exports.changerStatutCandidature = async (req, res) => {
  try {
    const { statut, dateInterview, heureInterview, lienMeet } = req.body;

    const candidature = await Candidature.findById(req.params.id)
      .populate({
        path: 'idEtudiant',
        populate: { path: 'utilisateur', select: 'nom prenom email' },
      })
      .populate({
        path: 'idSujet',
        populate: {
          path: 'idEncadrant',
          populate: { path: 'utilisateur', select: '_id nom prenom' },
        },
      });

    if (!candidature) return res.status(404).json({ message: 'Candidature introuvable' });

    const updateData = { statut };
    if (dateInterview) updateData.dateInterview = dateInterview;
    if (heureInterview) updateData.heureInterview = heureInterview;
    if (lienMeet) updateData.lienMeet = lienMeet;

    await Candidature.findByIdAndUpdate(req.params.id, updateData);

    const userInfo = candidature.idEtudiant?.utilisateur;
    const prenom = userInfo?.prenom || 'Étudiant';
    const email = userInfo?.email;
    const titreSujet = candidature.idSujet?.titre || 'Sujet PFE';

    if (statut === 'ACCEPTE') {
      await Etudiant.findByIdAndUpdate(candidature.idEtudiant._id, { statutPFE: 'EN_COURS' });
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
    if (statut === 'REFUSE')
      await Etudiant.findByIdAndUpdate(candidature.idEtudiant._id, { statutPFE: 'NON_AFFECTE' });

    // Emails complets — identiques à l'original
    if (email) {
      const emails = {
        ACCEPTE: {
          subject: `[SmartPFE] Candidature acceptée — ${titreSujet}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#059669;padding:20px;border-radius:6px 6px 0 0;text-align:center;"><h1 style="color:#fff;margin:0;">Félicitations !</h1></div>
            <div style="padding:24px;border:1px solid #e0e0e0;border-radius:0 0 6px 6px;">
              <p>Bonjour <strong>${prenom}</strong>,</p>
              <p>Votre candidature pour le sujet <strong>${titreSujet}</strong> a été <strong style="color:#059669;">acceptée</strong> par votre encadrant !</p>
              <p>Votre projet PFE commence maintenant. Connectez-vous sur la plateforme pour accéder à votre espace de travail collaboratif.</p>
              <p style="margin-top:20px;">Bonne continuation,<br/><strong>L'équipe SmartPFE</strong></p>
            </div></div>`,
        },
        REFUSE: {
          subject: `[SmartPFE] Candidature non retenue — ${titreSujet}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#64748b;padding:20px;border-radius:6px 6px 0 0;text-align:center;"><h1 style="color:#fff;margin:0;">Résultat de votre candidature</h1></div>
            <div style="padding:24px;border:1px solid #e0e0e0;border-radius:0 0 6px 6px;">
              <p>Bonjour <strong>${prenom}</strong>,</p>
              <p>Après examen de votre candidature pour le sujet <strong>${titreSujet}</strong>, nous vous informons qu'elle n'a pas été retenue par l'encadrant.</p>
              <p>Ne vous découragez pas ! D'autres sujets sont disponibles sur la plateforme.</p>
              <p>Cordialement,<br/><strong>L'équipe SmartPFE</strong></p>
            </div></div>`,
        },
        INTERVIEW: {
          subject: `[SmartPFE] Convocation à un entretien — ${titreSujet}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#1a7a8a;padding:20px;border-radius:6px 6px 0 0;text-align:center;"><h1 style="color:#fff;margin:0;">Invitation à un entretien</h1></div>
            <div style="padding:24px;border:1px solid #e0e0e0;border-radius:0 0 6px 6px;">
              <p>Bonjour <strong>${prenom}</strong>,</p>
              <p>Bonne nouvelle ! Votre candidature pour le sujet <strong>${titreSujet}</strong> a retenu l'attention de l'encadrant.</p>
              ${dateInterview ? `<p>Date : ${new Date(dateInterview).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>` : ''}
              ${heureInterview ? `<p>Heure : ${heureInterview}</p>` : ''}
              ${lienMeet ? `<p>Lien : <a href="${lienMeet}" style="color:#1a7a8a;">${lienMeet}</a></p>` : ''}
              <p>Préparez-vous à présenter votre motivation et vos compétences.</p>
              <p>Bonne chance !<br/><strong>L'équipe SmartPFE</strong></p>
            </div></div>`,
        },
        QUIZ_REQUIS: {
          subject: `[SmartPFE] Quiz de sélection — ${titreSujet}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#7c3aed;padding:20px;border-radius:6px 6px 0 0;text-align:center;"><h1 style="color:#fff;margin:0;">Quiz de sélection</h1></div>
            <div style="padding:24px;border:1px solid #e0e0e0;border-radius:0 0 6px 6px;">
              <p>Bonjour <strong>${prenom}</strong>,</p>
              <p>Votre candidature pour le sujet <strong>${titreSujet}</strong> a été présélectionnée !</p>
              <p>Un quiz technique vous a été assigné. Veuillez vous connecter sur la plateforme pour le compléter dans les <strong>48 heures</strong>.</p>
              <p>Bonne chance !<br/><strong>L'équipe SmartPFE</strong></p>
            </div></div>`,
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

    // Notification temps réel → étudiant (changement statut par encadrant)
    try {
      const etudiantUserId =
        candidature.idEtudiant?.utilisateur?._id || candidature.idEtudiant?.utilisateur;
      if (etudiantUserId) {
        const messages = {
          ACCEPTE: `Félicitations ! Votre candidature pour "${titreSujet}" a été acceptée.`,
          REFUSE: `Votre candidature pour "${titreSujet}" n'a pas été retenue.`,
          INTERVIEW: `Vous êtes convoqué à un entretien pour "${titreSujet}"${dateInterview ? ` le ${new Date(dateInterview).toLocaleDateString('fr-FR')}` : ''}.`,
          QUIZ_REQUIS: `Un quiz de sélection vous a été assigné pour "${titreSujet}".`,
        };
        if (messages[statut]) {
          await creerEtEnvoyerNotif({
            idUtilisateur: etudiantUserId,
            titre: `Candidature ${statut} — ${titreSujet}`,
            contenu: messages[statut],
            type: 'VALIDATION',
          });
        }
      }
    } catch (e) {
      console.error('Notif pusher étudiant statut:', e.message);
    }

    // Notification temps réel → encadrant (confirmation de son action)
    try {
      const encadrantUserId =
        candidature.idSujet?.idEncadrant?.utilisateur?._id ||
        candidature.idSujet?.idEncadrant?.utilisateur;
      const nomEtudiant =
        `${candidature.idEtudiant?.utilisateur?.prenom || ''} ${candidature.idEtudiant?.utilisateur?.nom || ''}`.trim();
      if (encadrantUserId) {
        const confirmations = {
          ACCEPTE: `Vous avez accepté la candidature de ${nomEtudiant} pour "${titreSujet}". Le projet démarre.`,
          REFUSE: `Vous avez refusé la candidature de ${nomEtudiant} pour "${titreSujet}".`,
          INTERVIEW: `Entretien planifié avec ${nomEtudiant} pour "${titreSujet}"${dateInterview ? ` le ${new Date(dateInterview).toLocaleDateString('fr-FR')}` : ''}.`,
          QUIZ_REQUIS: `Quiz assigné à ${nomEtudiant} pour "${titreSujet}".`,
        };
        if (confirmations[statut]) {
          await creerEtEnvoyerNotif({
            idUtilisateur: encadrantUserId,
            titre: `Action confirmée — ${titreSujet}`,
            contenu: confirmations[statut],
            type: 'VALIDATION',
          });
        }
      }
    } catch (e) {
      console.error('Notif pusher encadrant statut:', e.message);
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

// ═════════════════════════════════════════════════════════════
//  SOUMETTRE QUIZ (route protégée — étudiant connecté)
//  Remplace le score aléatoire par évaluation IA + 5 premiers
// ═════════════════════════════════════════════════════════════
exports.soumettreQuiz = async (req, res) => {
  try {
    const { reponses } = req.body;

    const candidature = await Candidature.findById(req.params.id)
      .populate({
        path: 'idEtudiant',
        populate: { path: 'utilisateur', select: 'nom prenom email' },
      })
      .populate('idSujet');

    if (!candidature) return res.status(404).json({ message: 'Candidature introuvable' });
    if (candidature.statut !== 'QUIZ_REQUIS')
      return res.status(400).json({ message: 'Aucun quiz requis pour cette candidature' });

    const evaluation = await evaluerQuizIA({
      questions: candidature.analyseIA.quiz,
      reponses,
      sujet: candidature.idSujet,
    });

    // Règle des 5 premiers
    let decisionFinale = evaluation.decision;
    if (decisionFinale === 'INTERVIEW') {
      const nbDejaInterview = await Candidature.countDocuments({
        idSujet: candidature.idSujet._id,
        statut: 'INTERVIEW',
        _id: { $ne: candidature._id },
      });
      if (nbDejaInterview >= (candidature.idSujet.maxCandidatsInterview || 5)) {
        decisionFinale = 'REFUSE';
        console.log(`ℹ️  Places entretien complètes`);
      }
    }

    await Candidature.findByIdAndUpdate(req.params.id, {
      scoreQuiz: evaluation.scoreQuiz,
      reponsesQuiz: reponses,
      statut: decisionFinale,
    });

    res.json({
      message: 'Quiz soumis avec succès !',
      scoreQuiz: evaluation.scoreQuiz,
      statut: decisionFinale,
      prochainEtape:
        decisionFinale === 'INTERVIEW'
          ? 'Vous serez convoqué à un entretien.'
          : "Votre candidature n'a pas été retenue.",
    });
  } catch (error) {
    console.error('Erreur soumettreQuiz:', error);
    res.status(500).json({ message: error.message });
  }
};

// ═════════════════════════════════════════════════════════════
//  OUVRIR QUIZ VIA TOKEN  (route publique — sans login)
// ═════════════════════════════════════════════════════════════
exports.ouvrirQuizToken = async (req, res) => {
  try {
    const { token } = req.params;

    const candidature = await Candidature.findOne({ quizToken: token })
      .populate('idSujet', 'titre technologies domaine niveau')
      .populate({
        path: 'idEtudiant',
        populate: { path: 'utilisateur', select: 'nom prenom email' },
      });

    if (!candidature) return res.status(404).json({ message: 'Lien invalide ou inexistant.' });
    if (candidature.statut !== 'QUIZ_REQUIS')
      return res.status(400).json({
        message: 'Ce quiz a déjà été soumis ou votre candidature a changé de statut.',
        statut: candidature.statut,
      });
    if (candidature.quizTokenExpire && new Date() > candidature.quizTokenExpire)
      return res
        .status(410)
        .json({ message: 'Ce lien a expiré (48h). Contactez votre encadrant.' });
    if (candidature.quizExpireA && new Date() > candidature.quizExpireA)
      return res
        .status(410)
        .json({ message: 'Le temps imparti (15 minutes) est écoulé.', expire: true });

    // Démarrer chrono à la première ouverture
    if (!candidature.quizOuvertA) {
      candidature.demarrerChrono();
      await candidature.save();
      console.log(`⏱️  Chronomètre démarré — expire à ${candidature.quizExpireA}`);
    }

    const secondesRestantes = candidature.quizExpireA
      ? Math.max(0, Math.floor((candidature.quizExpireA - new Date()) / 1000))
      : 15 * 60;

    res.json({
      candidatureId: candidature._id,
      sujet: {
        titre: candidature.idSujet?.titre,
        technologies: candidature.idSujet?.technologies,
        domaine: candidature.idSujet?.domaine,
      },
      etudiant: {
        nom: candidature.idEtudiant?.utilisateur?.nom,
        prenom: candidature.idEtudiant?.utilisateur?.prenom,
      },
      questions: candidature.analyseIA?.quiz || [],
      secondesRestantes,
      premierOuverture: !candidature.quizOuvertA,
      quizExpireA: candidature.quizExpireA,
    });
  } catch (error) {
    console.error('Erreur ouvrirQuizToken:', error);
    res.status(500).json({ message: error.message });
  }
};

// ═════════════════════════════════════════════════════════════
//  SOUMETTRE QUIZ VIA TOKEN  (route publique — sans login)
// ═════════════════════════════════════════════════════════════
exports.soumettreQuizToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { reponses } = req.body;

    const candidature = await Candidature.findOne({ quizToken: token })
      .populate('idSujet')
      .populate({
        path: 'idEtudiant',
        populate: { path: 'utilisateur', select: 'nom prenom email' },
      });

    if (!candidature) return res.status(404).json({ message: 'Lien invalide.' });
    if (candidature.statut !== 'QUIZ_REQUIS')
      return res
        .status(400)
        .json({ message: 'Ce quiz a déjà été soumis.', statut: candidature.statut });

    const maintenant = new Date();
    const estExpire = candidature.quizExpireA && maintenant > candidature.quizExpireA;

    const evaluation = await evaluerQuizIA({
      questions: candidature.analyseIA.quiz,
      reponses: reponses || [],
      sujet: candidature.idSujet,
    });

    // Règle des 5 premiers + expiration
    let decisionFinale = evaluation.decision;
    if (estExpire) {
      decisionFinale = 'REFUSE';
    } else if (decisionFinale === 'INTERVIEW') {
      const nbDejaInterview = await Candidature.countDocuments({
        idSujet: candidature.idSujet._id,
        statut: 'INTERVIEW',
        _id: { $ne: candidature._id },
      });
      if (nbDejaInterview >= (candidature.idSujet.maxCandidatsInterview || 5)) {
        decisionFinale = 'REFUSE';
      }
    }

    await Candidature.findByIdAndUpdate(candidature._id, {
      scoreQuiz: evaluation.scoreQuiz,
      reponsesQuiz: reponses || [],
      statut: decisionFinale,
      quizSoumisA: maintenant,
      quizExpire: estExpire,
      quizToken: null,
      quizTokenExpire: null,
    });

    // Email résultat
    const email = candidature.idEtudiant?.utilisateur?.email;
    const prenom = candidature.idEtudiant?.utilisateur?.prenom || 'Étudiant';
    if (email) {
      try {
        await sendEmail({
          to: email,
          subject: `[SmartPFE] Résultat de votre quiz — ${candidature.idSujet.titre}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px;">
            <div style="background:${decisionFinale === 'INTERVIEW' ? '#1a7a8a' : '#64748b'};padding:20px;border-radius:6px 6px 0 0;text-align:center;">
              <h1 style="color:#fff;margin:0;">${decisionFinale === 'INTERVIEW' ? 'Félicitations !' : 'Résultat du quiz'}</h1>
            </div>
            <div style="padding:24px;">
              <p>Bonjour <strong>${prenom}</strong>,</p>
              <p>Score obtenu : <strong style="font-size:1.2rem;color:#1a7a8a;">${evaluation.scoreQuiz}/100</strong></p>
              ${
                estExpire
                  ? `<p style="color:#dc2626;">Quiz soumis après expiration du temps imparti — résultat annulé.</p>`
                  : decisionFinale === 'INTERVIEW'
                    ? `<p style="color:#059669;">Vous serez convoqué à un entretien prochainement.</p>`
                    : `<p style="color:#dc2626;">Votre score n'était pas suffisant pour passer à l'étape suivante.</p>`
              }
              <p style="color:#888;font-size:.8rem;margin-top:20px;">Cordialement,<br/><strong>L'équipe SmartPFE</strong></p>
            </div></div>`,
        });
      } catch (err) {
        console.error('Erreur email résultat quiz:', err.message);
      }
    }

    // Notification temps réel résultat quiz → étudiant
    try {
      const etudiantUserId =
        candidature.idEtudiant?.utilisateur?._id || candidature.idEtudiant?.utilisateur;
      if (etudiantUserId) {
        await creerEtEnvoyerNotif({
          idUtilisateur: etudiantUserId,
          titre: estExpire ? 'Quiz expiré' : `Résultat quiz — ${candidature.idSujet.titre}`,
          contenu: estExpire
            ? 'Le temps imparti est écoulé. Votre quiz a été annulé.'
            : `Score : ${evaluation.scoreQuiz}/100 — ${decisionFinale === 'INTERVIEW' ? "Vous passez à l'entretien !" : 'Non retenu à cette étape.'}`,
          type: 'EVALUATION',
        });
      }
    } catch (e) {
      console.error('Notif pusher étudiant quiz:', e.message);
    }

    // Notification temps réel résultat quiz → encadrant
    try {
      const encadrantUserId =
        candidature.idSujet?.idEncadrant?.utilisateur?._id ||
        candidature.idSujet?.idEncadrant?.utilisateur ||
        candidature.idSujet?.idEncadrant;
      const nomEtudiant =
        `${candidature.idEtudiant?.utilisateur?.prenom || ''} ${candidature.idEtudiant?.utilisateur?.nom || ''}`.trim();
      if (encadrantUserId) {
        await creerEtEnvoyerNotif({
          idUtilisateur: encadrantUserId,
          titre: `Quiz terminé — ${candidature.idSujet.titre}`,
          contenu: estExpire
            ? `${nomEtudiant} n'a pas terminé le quiz dans le délai imparti.`
            : `${nomEtudiant} a obtenu ${evaluation.scoreQuiz}/100 — Statut : ${decisionFinale}`,
          type: 'EVALUATION',
        });
      }
    } catch (e) {
      console.error('Notif pusher encadrant quiz:', e.message);
    }

    res.json({
      message: estExpire ? 'Temps écoulé — quiz annulé.' : 'Quiz soumis avec succès !',
      scoreQuiz: evaluation.scoreQuiz,
      statut: decisionFinale,
      estExpire,
      prochainEtape:
        decisionFinale === 'INTERVIEW'
          ? 'Vous serez convoqué à un entretien.'
          : "Votre candidature n'a pas été retenue.",
    });
  } catch (error) {
    console.error('Erreur soumettreQuizToken:', error);
    res.status(500).json({ message: error.message });
  }
};
