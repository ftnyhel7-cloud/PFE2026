import { useState, useEffect, useRef } from 'react';

// ─── PALETTE (cohérente avec le thème global) ────────────────
const P = {
  accent:     '#2e7d52',
  accentL:    '#4caf82',
  accentBg:   '#e6f4ed',
  accentBg2:  '#d4eddf',
  accentText: '#1a5c36',
  bg:         '#f0faf4',
  white:      '#ffffff',
  border:     'rgba(0,0,0,.07)',
  text:       '#1e293b',
  textSoft:   '#64748b',
  textMuted:  '#94a3b8',
  warning:    '#c47c0a',
  warningBg:  '#faeeda',
  danger:     '#d03030',
  dangerBg:   '#fcebeb',
  blue:       '#3b82f6',
  blueBg:     '#eff6ff',
  purple:     '#7c3aed',
  purpleBg:   '#ede9fe',
  coral:      '#d85a30',
  coralBg:    '#faece7',
};

// ─── RESPONSIVE HOOK ─────────────────────────────────────────
function useW() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return w;
}

// ─── SCROLL REVEAL HOOK ───────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ─── ANIMATED PROGRESS BAR ───────────────────────────────────
function ProgressBar({ pct, color, delay = 0 }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{ height: 10, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden', marginTop: 6 }}>
      <div style={{
        height: '100%', borderRadius: 999,
        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
        width: vis ? `${pct}%` : '0%',
        transition: `width 1.1s cubic-bezier(.4,0,.2,1) ${delay}ms`,
        boxShadow: `0 0 8px ${color}55`,
      }}/>
    </div>
  );
}

// ─── DONUT CHART ─────────────────────────────────────────────
function Donut({ pct, color, size = 72 }) {
  const [ref, vis] = useReveal();
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = vis ? (pct / 100) * circ : 0;
  return (
    <div ref={ref} style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={10}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: `stroke-dasharray 1.3s cubic-bezier(.4,0,.2,1)` }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color }}>
        {pct}%
      </div>
    </div>
  );
}

// ─── ICÔNES SVG ───────────────────────────────────────────────
const Ic = {
  book:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  file:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  heart:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  list:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  intro:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  search2: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  uml:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="6" height="5" rx="1"/><rect x="16" y="3" width="6" height="5" rx="1"/><rect x="9" y="16" width="6" height="5" rx="1"/><path d="M5 8v4h14V8"/><line x1="12" y1="12" x2="12" y2="16"/></svg>,
  code:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  test:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  flag:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  link2:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  clip:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
  dl:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  eye:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  search:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  star:    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  mic:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  clock:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  award:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
  users:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  bulb:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>,
  slides:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  target:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  chevD:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  chevU:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>,
  pdf:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  eye2:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
};

// ─── DONNÉES MOCKÉES ─────────────────────────────────────────
const STRUCTURE = [
  { id:1, icon:Ic.file,    num:'01', titre:'Page de garde',        color:P.accent,   description:'Première page du rapport contenant : logo de l\'établissement, intitulé du diplôme, titre du projet, nom de l\'étudiant, encadrant, année universitaire et spécialité.', tips:['Respecter la charte graphique de l\'établissement','Utiliser une police sobre et professionnelle','Vérifier l\'orthographe de tous les éléments'] },
  { id:2, icon:Ic.heart,   num:'02', titre:'Remerciements',        color:'#e85d75',   description:'Page dédiée à l\'expression de gratitude envers les personnes ayant contribué au projet : encadrant, équipe d\'accueil, jury, famille.', tips:['Rester sincère et concis (max 1 page)','Citer les noms complets avec leurs titres','Éviter les formules trop génériques'] },
  { id:3, icon:Ic.heart,   num:'03', titre:'Dédicaces',            color:'#f472b6',   description:'Page personnelle dédiée aux proches. Distincte des remerciements, elle exprime un attachement affectif. Style libre, sobre et élégant.', tips:['Une seule page suffit','Style poétique ou sobre accepté','Optionnel mais apprécié'] },
  { id:4, icon:Ic.book,    num:'04', titre:'Résumé / Abstract',    color:P.blue,      description:'Synthèse du projet en 200–300 mots en français ET en anglais. Doit couvrir : contexte, objectifs, méthodes utilisées, résultats et conclusion. Rédiger en dernier.', tips:['Écrire en français ET en anglais','200 à 300 mots maximum','Inclure : contexte, objectifs, méthode, résultats'] },
  { id:5, icon:Ic.list,    num:'05', titre:'Table des matières',   color:P.purple,    description:'Listage complet et structuré de toutes les sections avec leurs numéros de page. Générée automatiquement via Word ou LaTeX pour éviter les erreurs.', tips:['Générer automatiquement via Word/LaTeX','Vérifier la cohérence des numéros de pages','Inclure les listes des figures et tableaux'] },
  { id:6, icon:Ic.intro,   num:'06', titre:'Introduction générale',color:P.accent,    description:'Présentation du contexte général, de la problématique, des objectifs du projet et du plan du rapport. Doit captiver le lecteur dès les premières lignes.', tips:['1 à 2 pages maximum','Présenter clairement la problématique','Annoncer le plan du document'] },
  { id:7, icon:Ic.search2, num:'07', titre:'Étude de l\'existant', color:P.warning,   description:'Analyse critique des solutions existantes similaires à votre projet. Identification de leurs forces et faiblesses pour justifier votre approche.', tips:['Analyser au moins 3 solutions existantes','Présenter un tableau comparatif','Conclure sur les lacunes justifiant votre projet'] },
  { id:8, icon:Ic.target,  num:'08', titre:'Analyse des besoins',  color:P.coral,     description:'Identification et spécification des besoins fonctionnels et non-fonctionnels du système. Utilisation de diagrammes de cas d\'utilisation UML.', tips:['Distinguer besoins fonctionnels et non-fonctionnels','Utiliser des diagrammes de cas d\'utilisation','Valider avec l\'encadrant'] },
  { id:9, icon:Ic.uml,     num:'09', titre:'Conception UML',       color:P.purple,    description:'Modélisation architecturale du système avec les diagrammes UML appropriés : classes, séquences, activités, déploiement selon les besoins.', tips:['Choisir les diagrammes adaptés au projet','Respecter les normes UML 2.x','Commenter chaque diagramme'] },
  { id:10,icon:Ic.code,    num:'10', titre:'Réalisation technique', color:P.blue,      description:'Description détaillée des technologies utilisées, de l\'architecture implémentée et des fonctionnalités développées avec captures d\'écran annotées.', tips:['Inclure des captures d\'écran claires','Expliquer les choix technologiques','Présenter les interfaces utilisateur'] },
  { id:11,icon:Ic.test,    num:'11', titre:'Tests et validation',   color:P.accentL,   description:'Description de la stratégie de tests : unitaires, intégration, fonctionnels. Présentation des résultats et de la couverture de test du projet.', tips:['Présenter des cas de tests concrets','Inclure les résultats de tests','Utiliser des outils de test reconnus'] },
  { id:12,icon:Ic.flag,    num:'12', titre:'Conclusion générale',   color:'#059669',   description:'Synthèse des travaux réalisés, bilan des objectifs atteints, perspectives d\'amélioration et apport personnel du projet. Miroir de l\'introduction.', tips:['Répondre à la problématique posée','Présenter les perspectives futures','Mentionner votre apport personnel'] },
  { id:13,icon:Ic.link2,   num:'13', titre:'Bibliographie',         color:P.textSoft,  description:'Liste exhaustive et normalisée de toutes les sources utilisées (articles, livres, sites web). Respecter une norme de citation : IEEE, APA ou Harvard.', tips:['Utiliser une norme de citation cohérente','Citer toutes les sources utilisées','Inclure : auteur, titre, date, éditeur'] },
  { id:14,icon:Ic.clip,    num:'14', titre:'Annexes',               color:'#7c3aed',   description:'Éléments complémentaires non essentiels dans le corps du texte : codes source, manuels d\'installation, jeux de données, questionnaires.', tips:['Numéroter chaque annexe (A, B, C...)','Référencer dans le corps du texte','Inclure la documentation technique'] },
];

const EXEMPLES = [
  { id:1, titre:'Plateforme E-learning avec IA', spec:'Génie Logiciel', annee:'2024', tech:['React','Node.js','TensorFlow'], encadrant:'Dr. Ben Salah', cat:'IA', note:4.8, pages:95 },
  { id:2, titre:'Application Mobile de Santé', spec:'Réseaux & Télécoms', annee:'2024', tech:['Flutter','Firebase','ML Kit'], encadrant:'Dr. Hamdi', cat:'Mobile', note:4.6, pages:87 },
  { id:3, titre:'Système IoT de Surveillance Agricole', spec:'Systèmes Embarqués', annee:'2023', tech:['Arduino','Python','MQTT'], encadrant:'Dr. Mansouri', cat:'IoT', note:4.9, pages:112 },
  { id:4, titre:'Marketplace B2B avec Blockchain', spec:'Commerce Électronique', annee:'2023', tech:['Vue.js','Solidity','IPFS'], encadrant:'Dr. Chaabane', cat:'Web', note:4.5, pages:103 },
  { id:5, titre:'Chatbot RH Intelligent', spec:'Génie Logiciel', annee:'2024', tech:['Python','NLP','FastAPI'], encadrant:'Dr. Ben Salah', cat:'IA', note:4.7, pages:91 },
  { id:6, titre:'Dashboard Analytics Temps Réel', spec:'Big Data', annee:'2023', tech:['Angular','Kafka','ElasticSearch'], encadrant:'Dr. Riahi', cat:'Web', note:4.4, pages:88 },
];

const BAREME = [
  { label:'Rapport écrit',               pct:30, color:P.accent,   desc:'Qualité rédactionnelle, structure, clarté et complétude du document final.',        icon:Ic.book },
  { label:'Qualité technique',           pct:25, color:P.blue,     desc:'Maîtrise des technologies, architecture du système et qualité du code produit.',     icon:Ic.code },
  { label:'Innovation & Originalité',    pct:10, color:P.purple,   desc:'Apport original, créativité de la solution et valeur ajoutée par rapport à l\'existant.', icon:Ic.bulb },
  { label:'Présentation orale',          pct:15, color:P.warning,  desc:'Clarté de l\'exposé, qualité des slides, aisance à l\'oral et structure de la présentation.', icon:Ic.slides },
  { label:'Démonstration technique',     pct:10, color:P.coral,    desc:'Fonctionnement en live du produit, robustesse et exhaustivité des fonctionnalités présentées.', icon:Ic.target },
  { label:'Réponses aux questions',      pct:7,  color:'#059669',  desc:'Pertinence et précision des réponses aux questions posées par les membres du jury.',  icon:Ic.users },
  { label:'Gestion du temps',            pct:3,  color:'#f472b6',  desc:'Respect du temps imparti pour la présentation et répartition équilibrée des parties.', icon:Ic.clock },
];

const CONSEILS = [
  { icon:Ic.slides,  titre:'Préparez des slides impactants',      niveau:'Essentiel', color:P.accent,  colorBg:P.accentBg,  desc:'Limitez à 1 idée par slide. Utilisez des visuels plutôt que du texte. Police ≥ 24pt. Maximum 15–20 slides pour 20 minutes de présentation.', tags:['Slides','Design','Clarté'] },
  { icon:Ic.clock,   titre:'Respectez le temps imparti',          niveau:'Critique',  color:P.danger,  colorBg:P.dangerBg,  desc:'Chronométrez-vous lors des répétitions. Prévoyez 1 min de marge. Si vous dépassez, passez directement à la conclusion sans vous excuser.', tags:['Timing','Organisation'] },
  { icon:Ic.mic,     titre:'Entraînez-vous à voix haute',         niveau:'Essentiel', color:P.blue,    colorBg:P.blueBg,    desc:'Répétez au moins 3 fois devant un miroir ou des proches. Enregistrez-vous pour identifier vos tics de langage et améliorer votre débit.', tags:['Pratique','Confiance'] },
  { icon:Ic.target,  titre:'Maîtrisez la démonstration',          niveau:'Important', color:P.purple,  colorBg:P.purpleBg,  desc:'Testez l\'application la veille sur la machine de présentation. Préparez un plan B (vidéo ou captures) en cas de panne ou de bug en live.', tags:['Demo','Technique','Backup'] },
  { icon:Ic.search2, titre:'Anticipez les questions du jury',      niveau:'Important', color:P.warning, colorBg:P.warningBg, desc:'Listez les points faibles de votre projet et préparez des réponses. Le jury questionne souvent : choix technologiques, scalabilité, sécurité.', tags:['Questions','Préparation'] },
  { icon:Ic.book,    titre:'Adoptez un langage professionnel',     niveau:'Essentiel', color:P.coral,   colorBg:P.coralBg,   desc:'Bannissez les expressions familières. Utilisez le vocabulaire technique de votre domaine. Articulez clairement et modulez votre voix.', tags:['Vocabulaire','Communication'] },
  { icon:Ic.award,   titre:'Maintenez un bon contact visuel',      niveau:'Tip',       color:'#059669', colorBg:'#ecfdf5',   desc:'Regardez chaque membre du jury à tour de rôle. Ne lisez pas vos slides. Le contact visuel montre votre confiance et maintient l\'attention.', tags:['Confiance','Posture'] },
];

const CATS = ['Tous','Web','IA','Mobile','IoT'];
const NIVEAU_COLOR = { Critique:P.danger, Essentiel:P.accent, Important:P.warning, Tip:P.blue };

// ─── ACCORDÉON ────────────────────────────────────────────────
function Accordeon({ item, idx }) {
  const [open, setOpen] = useState(false);
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(18px)',
      transition: `opacity .45s ease ${idx * 40}ms, transform .45s ease ${idx * 40}ms`,
      background: P.white, borderRadius: 12, border: `1.5px solid ${open ? item.color + '40' : P.border}`,
      overflow: 'hidden', marginBottom: 8,
      boxShadow: open ? `0 4px 20px ${item.color}18` : '0 1px 4px rgba(0,0,0,.04)',
      transition2: 'border-color .2s, box-shadow .2s',
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
        textAlign: 'left', fontFamily: 'Nunito, sans-serif',
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: item.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
          {item.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: item.color, letterSpacing: '.06em' }}>{item.num}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: P.text }}>{item.titre}</span>
          </div>
        </div>
        <div style={{ color: P.textMuted, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }}>
          {Ic.chevD}
        </div>
      </button>
      <div style={{ maxHeight: open ? 400 : 0, overflow: 'hidden', transition: 'max-height .35s cubic-bezier(.4,0,.2,1)' }}>
        <div style={{ padding: '0 16px 16px 64px' }}>
          <p style={{ fontSize: 13, color: P.textSoft, lineHeight: 1.75, marginBottom: 12 }}>{item.description}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {item.tips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: P.textSoft }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: item.color, flexShrink: 0, marginTop: 5 }}/>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CARTE EXEMPLE ────────────────────────────────────────────
const CAT_COLORS = { Web:P.blue, IA:P.purple, Mobile:P.accent, IoT:P.warning };

function CarteExemple({ ex, idx }) {
  const [ref, vis] = useReveal();
  const cc = CAT_COLORS[ex.cat] || P.accent;
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(20px)',
      transition: `opacity .4s ease ${idx * 60}ms, transform .4s ease ${idx * 60}ms`,
      background: P.white, borderRadius: 14, border: `1.5px solid ${P.border}`,
      padding: '16px', display: 'flex', flexDirection: 'column', gap: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,.04)',
      cursor: 'pointer',
    }}
      onMouseOver={e => { e.currentTarget.style.borderColor = cc + '60'; e.currentTarget.style.boxShadow = `0 8px 24px ${cc}18`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.04)'; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: P.text, marginBottom: 3, lineHeight: 1.35 }}>{ex.titre}</p>
          <p style={{ fontSize: 11, color: P.textMuted }}>{ex.spec} · {ex.annee}</p>
        </div>
        <span style={{ background: cc + '18', color: cc, fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 999, flexShrink: 0, border: `1px solid ${cc}30` }}>{ex.cat}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {ex.tech.map(t => <span key={t} style={{ fontSize: 10, fontWeight: 600, background: P.bg, color: P.textSoft, padding: '2px 8px', borderRadius: 6, border: `1px solid ${P.border}` }}>{t}</span>)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: P.textMuted }}>
        <span>Enc. {ex.encadrant}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#f59e0b' }}>
          {Ic.star} <span style={{ color: P.textSoft, fontWeight: 700 }}>{ex.note}</span>
          <span style={{ color: P.textMuted }}>· {ex.pages}p</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, paddingTop: 4, borderTop: `1px solid ${P.border}` }}>
        <button style={{ flex: 1, padding: '7px', borderRadius: 8, border: `1.5px solid ${cc}`, background: 'transparent', color: cc, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'Nunito,sans-serif' }}>
          {Ic.eye} Voir PDF
        </button>
        <button style={{ flex: 1, padding: '7px', borderRadius: 8, border: 'none', background: cc, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'Nunito,sans-serif' }}>
          {Ic.dl} Télécharger
        </button>
      </div>
    </div>
  );
}

// ─── CARTE BAREME ────────────────────────────────────────────
function CarteBareme({ item, idx }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(16px)',
      transition: `all .45s ease ${idx * 50}ms`,
      background: P.white, borderRadius: 14, border: `1.5px solid ${P.border}`,
      padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <Donut pct={item.pct} color={item.color} size={64}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ color: item.color }}>{item.icon}</div>
            <p style={{ fontSize: 13, fontWeight: 800, color: P.text }}>{item.label}</p>
          </div>
          <span style={{ fontSize: 22, fontWeight: 900, color: item.color, letterSpacing: '-.02em' }}>{item.pct}<span style={{ fontSize: 13, fontWeight: 600, color: P.textMuted }}> pts</span></span>
        </div>
      </div>
      <p style={{ fontSize: 12, color: P.textSoft, lineHeight: 1.65 }}>{item.desc}</p>
      <ProgressBar pct={item.pct * (100 / 30)} color={item.color} delay={idx * 80}/>
    </div>
  );
}

// ─── CARTE CONSEIL ────────────────────────────────────────────
function CarteConseil({ c, idx }) {
  const [ref, vis] = useReveal();
  const nColor = NIVEAU_COLOR[c.niveau] || P.accent;
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateX(-16px)',
      transition: `all .4s ease ${idx * 55}ms`,
      background: P.white, borderRadius: 14, padding: '18px',
      border: `1.5px solid ${P.border}`,
      boxShadow: '0 2px 8px rgba(0,0,0,.04)',
      position: 'relative', overflow: 'hidden',
    }}
      onMouseOver={e => { e.currentTarget.style.borderColor = c.color + '50'; e.currentTarget.style.boxShadow = `0 8px 24px ${c.color}18`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.04)'; e.currentTarget.style.transform = 'none'; }}>
      {/* Accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${c.color}, ${c.color}66)` }}/>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: c.colorBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>
          {c.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: P.text }}>{c.titre}</p>
            <span style={{ fontSize: 10, fontWeight: 700, background: nColor + '18', color: nColor, padding: '2px 8px', borderRadius: 999, border: `1px solid ${nColor}30` }}>{c.niveau}</span>
          </div>
          <p style={{ fontSize: 12.5, color: P.textSoft, lineHeight: 1.7, marginBottom: 10 }}>{c.desc}</p>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {c.tags.map(t => <span key={t} style={{ fontSize: 10, fontWeight: 600, background: P.bg, color: P.textSoft, padding: '2px 8px', borderRadius: 6 }}>{t}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────
export default function AccompagnementPFE() {
  const w = useW();
  const isMobile = w < 768;
  const isTablet = w >= 768 && w < 1024;

  const [onglet, setOnglet] = useState('structure');
  const [search, setSearch] = useState('');
  const [cat, setCat]       = useState('Tous');
  const [headerRef, headerVis] = useReveal();

  const ONGLETS = [
    { id:'structure', label:'Structure Rapport', shortLabel:'Structure', icon:Ic.book,   color:P.accent  },
    { id:'exemples',  label:'Exemples de Rapports', shortLabel:'Exemples', icon:Ic.pdf,    color:P.blue    },
    { id:'bareme',    label:'Barème d\'Évaluation', shortLabel:'Barème',  icon:Ic.award,  color:P.purple  },
    { id:'conseils',  label:'Conseils Soutenance', shortLabel:'Conseils', icon:Ic.mic,    color:P.warning },
  ];

  const exemplesFiltres = EXEMPLES.filter(e =>
    (cat === 'Tous' || e.cat === cat) &&
    (search === '' || e.titre.toLowerCase().includes(search.toLowerCase()) || e.tech.some(t => t.toLowerCase().includes(search.toLowerCase())))
  );

  const totalPts = BAREME.reduce((s, b) => s + b.pct, 0);

  return (
    <div style={{ fontFamily: 'Nunito, sans-serif', minHeight: '100vh', background: P.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        @keyframes shimmer { 0%,100% { opacity:.6; } 50% { opacity:1; } }
        .onglet-btn { transition: all .2s; }
        .onglet-btn:hover { opacity:.85; }
        .search-inp:focus { outline:none; border-color:${P.accent} !important; box-shadow:0 0 0 3px ${P.accent}20; }
        button { transition: all .15s; }
        button:active { transform: scale(.97); }
      `}</style>

      {/* ── HERO HEADER ── */}
      <div ref={headerRef} style={{
        background: `linear-gradient(135deg, ${P.accent} 0%, #1a5c36 60%, #0f3d24 100%)`,
        padding: isMobile ? '28px 16px 32px' : '36px 28px 42px',
        position: 'relative', overflow: 'hidden',
        opacity: headerVis ? 1 : 0, transform: headerVis ? 'none' : 'translateY(-10px)',
        transition: 'opacity .5s, transform .5s',
      }}>
        {/* Décorations */}
        <div style={{ position:'absolute', top:-60, right:-60, width:240, height:240, borderRadius:'50%', background:'rgba(255,255,255,.05)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-40, left:-40, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,.04)', pointerEvents:'none' }}/>
        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0 }}>
              {Ic.award}
            </div>
            <div>
              <p style={{ color:'rgba(255,255,255,.65)', fontSize:11, fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase' }}>Ressources académiques</p>
              <h1 style={{ color:'#fff', fontSize: isMobile ? 20 : 26, fontWeight:900, letterSpacing:'-.02em', lineHeight:1.15 }}>Accompagnement PFE</h1>
            </div>
          </div>
          <p style={{ color:'rgba(255,255,255,.75)', fontSize:13, maxWidth:560, lineHeight:1.7, marginBottom:20 }}>
            Toutes les ressources pour rédiger un rapport professionnel et réussir votre soutenance : structure officielle, exemples réels, barème de notation et conseils d'experts.
          </p>
          {/* Stats rapides */}
          <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
            {[['14','Parties du rapport'],['6','Rapports exemples'],['7','Critères d\'évaluation'],['7','Conseils experts']].map(([n,l]) => (
              <div key={l} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:22, fontWeight:900, color:'#fff' }}>{n}</span>
                <span style={{ fontSize:11, color:'rgba(255,255,255,.6)', fontWeight:500, maxWidth:70, lineHeight:1.3 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ONGLETS ── */}
      <div style={{ background:P.white, borderBottom:`1.5px solid ${P.border}`, position:'sticky', top:0, zIndex:20 }}>
        <div style={{ display:'flex', overflowX:'auto', padding:'0 16px', gap:4 }}>
          {ONGLETS.map(o => {
            const active = onglet === o.id;
            return (
              <button key={o.id} className="onglet-btn" onClick={() => setOnglet(o.id)} style={{
                display:'flex', alignItems:'center', gap:7, padding: isMobile ? '12px 10px' : '14px 18px',
                border:'none', background:'transparent', cursor:'pointer', fontFamily:'Nunito,sans-serif',
                fontSize: isMobile ? 12 : 13, fontWeight: active ? 800 : 600,
                color: active ? o.color : P.textSoft, borderBottom: `2.5px solid ${active ? o.color : 'transparent'}`,
                whiteSpace:'nowrap', flexShrink:0,
              }}>
                <div style={{ color: active ? o.color : P.textMuted }}>{o.icon}</div>
                {isMobile ? o.shortLabel : o.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: isMobile ? '16px' : '24px 20px', maxWidth:1200, margin:'0 auto' }}>

        {/* ════════════════ STRUCTURE ════════════════ */}
        {onglet === 'structure' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '300px 1fr', gap:24, alignItems:'start' }}>
              {/* Sidebar info */}
              <div>
                <div style={{ background:P.white, borderRadius:14, padding:18, border:`1.5px solid ${P.border}`, marginBottom:16 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:P.textMuted, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:10 }}>À propos de la structure</p>
                  <p style={{ fontSize:13, color:P.textSoft, lineHeight:1.75 }}>
                    Un rapport PFE est composé de <strong style={{color:P.text}}>14 parties officielles</strong>. Chacune joue un rôle précis dans la présentation de votre travail au jury.
                  </p>
                </div>
                {/* Progress global */}
                <div style={{ background:P.white, borderRadius:14, padding:18, border:`1.5px solid ${P.border}` }}>
                  <p style={{ fontSize:12, fontWeight:700, color:P.textMuted, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Volume recommandé</p>
                  {[['Introduction','5–8%',P.accent],['Chapitres principaux','60–70%',P.blue],['Conclusion','3–5%','#059669'],['Annexes','10–15%',P.purple]].map(([l,v,c]) => (
                    <div key={l} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                        <span style={{ color:P.text, fontWeight:600 }}>{l}</span>
                        <span style={{ color:c, fontWeight:800 }}>{v}</span>
                      </div>
                      <ProgressBar pct={parseInt(v)} color={c}/>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accordéons */}
              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:8 }}>
                  <h2 style={{ fontSize:16, fontWeight:800, color:P.text }}>Les 14 parties du rapport</h2>
                  <span style={{ fontSize:12, color:P.textSoft, background:P.bg, padding:'4px 12px', borderRadius:999, border:`1px solid ${P.border}` }}>Cliquez pour développer</span>
                </div>
                {STRUCTURE.map((item, i) => <Accordeon key={item.id} item={item} idx={i}/>)}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════ EXEMPLES ════════════════ */}
        {onglet === 'exemples' && (
          <div>
            {/* Barre recherche + filtres */}
            <div style={{ background:P.white, borderRadius:14, padding:'14px 16px', border:`1.5px solid ${P.border}`, marginBottom:20, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, minWidth:200, background:P.bg, border:`1.5px solid ${P.border}`, borderRadius:10, padding:'8px 12px' }}>
                <div style={{ color:P.textMuted }}>{Ic.search}</div>
                <input className="search-inp" placeholder="Rechercher un rapport, une technologie…" value={search} onChange={e => setSearch(e.target.value)}
                  style={{ border:'none', background:'transparent', fontFamily:'Nunito,sans-serif', fontSize:13, color:P.text, outline:'none', width:'100%' }}/>
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {CATS.map(c => (
                  <button key={c} onClick={() => setCat(c)} style={{
                    padding:'6px 14px', borderRadius:999, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Nunito,sans-serif',
                    border:`1.5px solid ${cat===c ? (CAT_COLORS[c]||P.accent) : P.border}`,
                    background: cat===c ? (CAT_COLORS[c]||P.accent) : 'transparent',
                    color: cat===c ? '#fff' : P.textSoft,
                  }}>{c}</button>
                ))}
              </div>
            </div>

            {/* Résultats */}
            <p style={{ fontSize:12, color:P.textMuted, marginBottom:14 }}>{exemplesFiltres.length} rapport{exemplesFiltres.length > 1 ? 's' : ''} trouvé{exemplesFiltres.length > 1 ? 's' : ''}</p>
            {exemplesFiltres.length === 0
              ? <div style={{ background:P.white, borderRadius:14, padding:'3rem', textAlign:'center', border:`1.5px solid ${P.border}` }}>
                  <p style={{ fontSize:32, marginBottom:8 }}>🔍</p>
                  <p style={{ color:P.textMuted, fontSize:14 }}>Aucun rapport ne correspond à votre recherche.</p>
                </div>
              : <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap:16 }}>
                  {exemplesFiltres.map((e, i) => <CarteExemple key={e.id} ex={e} idx={i}/>)}
                </div>
            }

            {/* Banner PDF viewer */}
            <div style={{ marginTop:24, background:`linear-gradient(135deg,${P.blueBg},${P.accentBg})`, borderRadius:14, padding:'20px 24px', border:`1.5px solid ${P.blue}25`, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
              <div style={{ width:48, height:48, borderRadius:12, background:P.blue+'20', display:'flex', alignItems:'center', justifyContent:'center', color:P.blue, flexShrink:0 }}>{Ic.eye2}</div>
              <div style={{ flex:1, minWidth:200 }}>
                <p style={{ fontWeight:800, color:P.text, marginBottom:3 }}>Aperçu PDF intégré</p>
                <p style={{ fontSize:12, color:P.textSoft }}>Cliquez sur "Voir PDF" pour visualiser n'importe quel rapport directement dans votre navigateur sans téléchargement.</p>
              </div>
              <span style={{ background:P.blue, color:'#fff', fontSize:11, fontWeight:700, padding:'5px 14px', borderRadius:999 }}>Bientôt disponible</span>
            </div>
          </div>
        )}

        {/* ════════════════ BARÈME ════════════════ */}
        {onglet === 'bareme' && (
          <div>
            {/* Total banner */}
            <div style={{ background:`linear-gradient(135deg,${P.accent},#1a5c36)`, borderRadius:14, padding:'18px 22px', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
              <div>
                <p style={{ color:'rgba(255,255,255,.7)', fontSize:12, fontWeight:600 }}>Note sur</p>
                <p style={{ color:'#fff', fontSize:32, fontWeight:900, lineHeight:1 }}>{totalPts} <span style={{ fontSize:16, fontWeight:600, opacity:.7 }}>points</span></p>
              </div>
              <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                {[['Rapport écrit','30%'],['Oral & Démo','32%'],['Innovation','10%']].map(([l,v]) => (
                  <div key={l} style={{ textAlign:'center' }}>
                    <p style={{ color:'#fff', fontSize:20, fontWeight:900 }}>{v}</p>
                    <p style={{ color:'rgba(255,255,255,.6)', fontSize:10, fontWeight:600 }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap:16, marginBottom:24 }}>
              {BAREME.map((b, i) => <CarteBareme key={b.label} item={b} idx={i}/>)}
            </div>

            {/* Conseils barème */}
            <div style={{ background:P.white, borderRadius:14, padding:'18px 20px', border:`1.5px solid ${P.border}` }}>
              <p style={{ fontSize:13, fontWeight:800, color:P.text, marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ color:P.warning }}>{Ic.bulb}</span> Stratégie pour maximiser votre note
              </p>
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap:10 }}>
                {[
                  ['Rapport écrit (30 pts)','Commencez tôt, relisez 3 fois, faites relire par un tiers.', P.accent],
                  ['Présentation orale (15 pts)','Préparez des slides clairs, répétez à voix haute.', P.blue],
                  ['Qualité technique (25 pts)','Architecture solide, code propre, tests inclus.', P.purple],
                  ['Gestion du temps (3 pts)','3 points faciles à obtenir — ne les perdez pas !', P.warning],
                ].map(([titre, conseil, color]) => (
                  <div key={titre} style={{ background:P.bg, borderRadius:10, padding:'12px 14px', borderLeft:`3px solid ${color}` }}>
                    <p style={{ fontSize:12, fontWeight:800, color, marginBottom:4 }}>{titre}</p>
                    <p style={{ fontSize:12, color:P.textSoft, lineHeight:1.6 }}>{conseil}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════ CONSEILS ════════════════ */}
        {onglet === 'conseils' && (
          <div>
            {/* Header section */}
            <div style={{ background:`linear-gradient(135deg,${P.warningBg},#fff9e6)`, borderRadius:14, padding:'18px 22px', marginBottom:24, border:`1.5px solid ${P.warning}30`, display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
              <div style={{ width:52, height:52, borderRadius:14, background:P.warning+'25', display:'flex', alignItems:'center', justifyContent:'center', color:P.warning, flexShrink:0 }}>{Ic.mic}</div>
              <div>
                <p style={{ fontSize:16, fontWeight:900, color:P.text, marginBottom:4 }}>7 clés pour réussir votre soutenance</p>
                <p style={{ fontSize:13, color:P.textSoft, lineHeight:1.6 }}>La soutenance dure généralement <strong>20 minutes</strong> + 10–15 minutes de questions. Préparez chaque aspect avec soin.</p>
              </div>
            </div>

            {/* Légende niveaux */}
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:18 }}>
              {Object.entries(NIVEAU_COLOR).map(([n,c]) => (
                <div key={n} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:P.textSoft }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:c }}/>
                  {n}
                </div>
              ))}
            </div>

            {/* Grille conseils */}
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(2,1fr)', gap:14, marginBottom:24 }}>
              {CONSEILS.map((c, i) => <CarteConseil key={c.titre} c={c} idx={i}/>)}
            </div>

            {/* Checklist J-1 */}
            <div style={{ background:P.white, borderRadius:14, padding:'18px 20px', border:`1.5px solid ${P.border}` }}>
              <p style={{ fontSize:13, fontWeight:800, color:P.text, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ color:P.accent }}>{Ic.test}</span> Checklist J-1 de la soutenance
              </p>
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap:8 }}>
                {['Tester l\'application sur la machine de présentation','Vérifier que les slides s\'affichent correctement','Préparer une version offline de votre démo','Charger votre ordinateur à 100%','Préparer une tenue professionnelle','Relire une dernière fois vos diapositives','Prévoir de l\'eau pour la gorge','Arriver 15 min avant le début','Avoir le rapport papier en version imprimée','Se coucher tôt la veille'].map((item, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', background:P.bg, borderRadius:9, border:`1px solid ${P.border}` }}>
                    <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${P.accentL}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:P.accent }}>
                      {Ic.test}
                    </div>
                    <span style={{ fontSize:12, color:P.textSoft, lineHeight:1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
