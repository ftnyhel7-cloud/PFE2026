import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TEAL = '#1a7a8a';
const YELLOW = '#F5C518';
const DARK = '#0d1f30';

// ── Fake Data ────────────────────────────────────────
const FAKE_SUJETS = [
  {
    _id: 's1',
    titre: 'Plateforme MERN de gestion PFE',
    description:
      "Developpez une plateforme complete de gestion des projets de fin d'etudes avec React, Node.js, Express et MongoDB. Le systeme inclut la gestion des candidatures, des encadrants et des etudiants avec tableau de bord analytique.",
    technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Socket.io'],
    encadrant: {
      nom: 'Hammami',
      prenom: 'Mohamed',
      specialite: 'Genie Logiciel',
      email: 'mhammami@univ.tn',
    },
    domaine: 'Web',
    niveau: 'Master 2',
    places: 3,
  },
  {
    _id: 's2',
    titre: 'Detection de fraude bancaire par IA',
    description:
      'Concevez un systeme intelligent de detection des transactions frauduleuses en utilisant des algorithmes de machine learning et deep learning sur des donnees bancaires reelles avec une API REST.',
    technologies: ['Python', 'TensorFlow', 'Scikit-learn', 'FastAPI', 'PostgreSQL'],
    encadrant: {
      nom: 'Ben Salem',
      prenom: 'Fatma',
      specialite: 'Intelligence Artificielle',
      email: 'fbensalem@univ.tn',
    },
    domaine: 'IA',
    niveau: 'Master 1',
    places: 2,
  },
  {
    _id: 's3',
    titre: 'Application mobile e-commerce React Native',
    description:
      "Developpez une application mobile cross-platform de commerce electronique avec panier d'achat, paiement Stripe, geolocalisation et notifications push en temps reel.",
    technologies: ['React Native', 'Firebase', 'Stripe', 'Redux', 'Expo'],
    encadrant: {
      nom: 'Trabelsi',
      prenom: 'Ahmed',
      specialite: 'Developpement Mobile',
      email: 'atrabelsi@univ.tn',
    },
    domaine: 'Mobile',
    niveau: 'Licence 3',
    places: 4,
  },
  {
    _id: 's4',
    titre: "Plateforme LMS d'apprentissage en ligne",
    description:
      'Creez une plateforme e-learning avec cours video, quiz interactifs, suivi de progression, certificats automatiques et tableau de bord analytique pour formateurs et apprenants.',
    technologies: ['Vue.js', 'Laravel', 'MySQL', 'WebRTC', 'Redis'],
    encadrant: {
      nom: 'Khalil',
      prenom: 'Sara',
      specialite: 'E-Learning & EdTech',
      email: 'skhalil@univ.tn',
    },
    domaine: 'Web',
    niveau: 'Master 1',
    places: 3,
  },
  {
    _id: 's5',
    titre: 'Systeme de reconnaissance faciale',
    description:
      "Implementez un systeme de securite biometrique utilisant la reconnaissance faciale en temps reel avec OpenCV et deep learning pour le controle d'acces aux batiments universitaires.",
    technologies: ['Python', 'OpenCV', 'TensorFlow', 'Flask', 'Raspberry Pi'],
    encadrant: {
      nom: 'Mansouri',
      prenom: 'Karim',
      specialite: 'Computer Vision',
      email: 'kmansouri@univ.tn',
    },
    domaine: 'IA',
    niveau: 'Master 2',
    places: 2,
  },
  {
    _id: 's6',
    titre: 'Dashboard analytique pour donnees IoT',
    description:
      'Concevez un tableau de bord temps reel pour visualiser et analyser les donnees collectees par des capteurs IoT industriels avec alertes automatiques et rapports PDF periodiques.',
    technologies: ['React', 'Node.js', 'InfluxDB', 'Grafana', 'MQTT', 'Docker'],
    encadrant: {
      nom: 'Boukhari',
      prenom: 'Leila',
      specialite: 'IoT & Big Data',
      email: 'lboukhari@univ.tn',
    },
    domaine: 'IoT',
    niveau: 'Master 2',
    places: 2,
  },
  {
    _id: 's7',
    titre: 'Chatbot NLP pour service client bancaire',
    description:
      'Developpez un assistant virtuel intelligent base sur le NLP capable de repondre aux questions clients, gerer les reclamations et escalader vers un agent humain si necessaire.',
    technologies: ['Python', 'Rasa', 'BERT', 'FastAPI', 'Docker', 'PostgreSQL'],
    encadrant: {
      nom: 'Jebali',
      prenom: 'Nizar',
      specialite: 'NLP & Traitement Langage',
      email: 'njebali@univ.tn',
    },
    domaine: 'IA',
    niveau: 'Master 2',
    places: 3,
  },
  {
    _id: 's8',
    titre: 'Application de telemedecine securisee',
    description:
      'Creez une plateforme de consultation medicale a distance avec videoconference HD, dossier patient electronique crypte, prescription numerique et systeme de rendez-vous intelligent.',
    technologies: ['Angular', 'Spring Boot', 'PostgreSQL', 'WebRTC', 'AES-256'],
    encadrant: {
      nom: 'Gharbi',
      prenom: 'Amira',
      specialite: 'Sante Numerique & Securite',
      email: 'agharbi@univ.tn',
    },
    domaine: 'Sante',
    niveau: 'Master 1',
    places: 2,
  },
  {
    _id: 's9',
    titre: 'Tracabilite produits par Blockchain',
    description:
      "Implementez une solution de tracabilite des produits alimentaires tout au long de la chaine logistique en utilisant Ethereum pour garantir l'authenticite et la transparence.",
    technologies: ['Solidity', 'Ethereum', 'React', 'Node.js', 'Web3.js', 'IPFS'],
    encadrant: {
      nom: 'Sfar',
      prenom: 'Yassine',
      specialite: 'Blockchain & DeFi',
      email: 'ysfar@univ.tn',
    },
    domaine: 'Blockchain',
    niveau: 'Master 2',
    places: 2,
  },
  {
    _id: 's10',
    titre: 'Systeme de recommandation IA pour streaming',
    description:
      'Implementez un moteur de recommandation personnalise pour une plateforme streaming en utilisant le filtrage collaboratif et les reseaux de neurones pour suggerer films et series.',
    technologies: ['Python', 'TensorFlow', 'React', 'FastAPI', 'Redis', 'Spark'],
    encadrant: {
      nom: 'Mansouri',
      prenom: 'Karim',
      specialite: 'Machine Learning',
      email: 'kmansouri@univ.tn',
    },
    domaine: 'IA',
    niveau: 'Master 1',
    places: 3,
  },
  {
    _id: 's11',
    titre: 'Agriculture intelligente avec IoT',
    description:
      "Creez une solution digitale pour l'agriculture de precision avec analyse de donnees satellites, recommandations d'irrigation automatisees et gestion des stocks agricoles.",
    technologies: ['Flutter', 'Python', 'TensorFlow', 'GIS', 'Firebase', 'Sensors'],
    encadrant: {
      nom: 'Ben Salem',
      prenom: 'Fatma',
      specialite: 'IA & Agriculture',
      email: 'fbensalem@univ.tn',
    },
    domaine: 'IoT',
    niveau: 'Licence 3',
    places: 4,
  },
  {
    _id: 's12',
    titre: 'Monitoring reseau cybersecurite',
    description:
      "Developpez un outil de monitoring et d'analyse du trafic reseau pour detecter les intrusions, anomalies et cyberattaques en temps reel avec generation de rapports de securite.",
    technologies: ['Python', 'Wireshark', 'ELK Stack', 'Suricata', 'Docker', 'Grafana'],
    encadrant: {
      nom: 'Trabelsi',
      prenom: 'Ahmed',
      specialite: 'Cybersecurite & Reseaux',
      email: 'atrabelsi@univ.tn',
    },
    domaine: 'Securite',
    niveau: 'Master 2',
    places: 2,
  },
  {
    _id: 's13',
    titre: 'Application de covoiturage temps reel',
    description:
      "Concevez une application de covoiturage avec algorithme d'optimisation des trajets, paiement en ligne, chat en temps reel et systeme de notation conducteurs/passagers.",
    technologies: ['React Native', 'Node.js', 'Socket.io', 'Google Maps', 'Stripe'],
    encadrant: {
      nom: 'Khalil',
      prenom: 'Sara',
      specialite: 'Applications Mobile',
      email: 'skhalil@univ.tn',
    },
    domaine: 'Mobile',
    niveau: 'Licence 3',
    places: 3,
  },
  {
    _id: 's14',
    titre: 'ERP de gestion des ressources humaines',
    description:
      'Developpez un SIRH complet avec gestion des conges, paie automatisee, evaluation des performances, formation en ligne et tableau de bord analytique pour les responsables RH.',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Chart.js', 'Docker', 'PDF.js'],
    encadrant: {
      nom: 'Boukhari',
      prenom: 'Leila',
      specialite: 'ERP & Systemes RH',
      email: 'lboukhari@univ.tn',
    },
    domaine: 'Web',
    niveau: 'Master 1',
    places: 3,
  },
  {
    _id: 's15',
    titre: 'Plateforme de recrutement matching IA',
    description:
      "Developpez un systeme intelligent de mise en relation candidats/employeurs utilisant l'IA pour analyser les CVs, evaluer les competences et proposer des correspondances optimales.",
    technologies: ['React', 'Python', 'FastAPI', 'NLP', 'PostgreSQL', 'ElasticSearch'],
    encadrant: {
      nom: 'Hammami',
      prenom: 'Mohamed',
      specialite: 'IA & Recrutement',
      email: 'mhammami@univ.tn',
    },
    domaine: 'IA',
    niveau: 'Master 2',
    places: 2,
  },
];

const DOMAINES = ['Tous', 'Web', 'IA', 'Mobile', 'IoT', 'Securite', 'Blockchain', 'Sante'];
const NIVEAUX = ['Tous', 'Licence 3', 'Master 1', 'Master 2'];

const DOMAIN_COLORS = {
  Web: '#1a7a8a',
  IA: '#9B59B6',
  Mobile: '#E74C3C',
  IoT: '#27AE60',
  Securite: '#E67E22',
  Blockchain: '#2980B9',
  Sante: '#16A085',
};

// ── Navbar avec Dropdown ─────────────────────────────
function Navbar({ user, logout }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <nav
      style={{
        background: TEAL,
        padding: '.9rem 2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 200,
        boxShadow: '0 2px 16px rgba(0,0,0,.15)',
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '.75rem', cursor: 'pointer' }}
        onClick={() => navigate('/accueil')}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: YELLOW,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
          }}
        >
          🎓
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', lineHeight: 1 }}>
            Project
          </div>
          <div
            style={{
              fontWeight: 600,
              fontSize: '.58rem',
              color: YELLOW,
              letterSpacing: '.15em',
              textTransform: 'uppercase',
            }}
          >
            Finder
          </div>
        </div>
      </div>

      <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>Sujets PFE disponibles</h2>

      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '.75rem',
            background: 'rgba(255,255,255,.13)',
            border: '1px solid rgba(255,255,255,.22)',
            borderRadius: 12,
            padding: '.55rem 1rem',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: YELLOW,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: DARK,
              fontSize: '.9rem',
            }}
          >
            {user?.prenom?.[0]}
            {user?.nom?.[0]}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '.85rem', lineHeight: 1 }}>
              {user?.prenom} {user?.nom}
            </div>
            <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '.7rem', marginTop: '.12rem' }}>
              Etudiant
            </div>
          </div>
          <span style={{ color: 'rgba(255,255,255,.6)', fontSize: '.65rem' }}>
            {open ? '▲' : '▼'}
          </span>
        </button>

        {open && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + .6rem)',
              right: 0,
              width: 220,
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 16px 48px rgba(0,0,0,.18)',
              border: '1px solid #f0f0f0',
              overflow: 'hidden',
              zIndex: 999,
            }}
          >
            <div
              style={{
                padding: '1rem 1.2rem',
                background: '#f8fafc',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <div style={{ fontWeight: 700, color: DARK, fontSize: '.87rem' }}>
                {user?.prenom} {user?.nom}
              </div>
              <div style={{ color: '#999', fontSize: '.73rem', marginTop: '.12rem' }}>
                {user?.email}
              </div>
            </div>
            {[
              {
                ic: '👤',
                l: 'Mon profil',
                fn: () => {
                  navigate('/profil');
                  setOpen(false);
                },
              },
              {
                ic: '🔔',
                l: 'Notifications',
                fn: () => {
                  navigate('/notifications');
                  setOpen(false);
                },
              },
              {
                ic: '⚙️',
                l: 'Parametres',
                fn: () => {
                  navigate('/parametres');
                  setOpen(false);
                },
              },
            ].map((item) => (
              <button
                key={item.l}
                onClick={item.fn}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.85rem',
                  padding: '.8rem 1.2rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '.86rem',
                  color: '#444',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span>{item.ic}</span>
                {item.l}
              </button>
            ))}
            <div style={{ borderTop: '1px solid #f0f0f0' }} />
            <button
              onClick={() => {
                logout();
                navigate('/accueil');
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '.85rem',
                padding: '.8rem 1.2rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '.86rem',
                color: '#E74C3C',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(231,76,60,.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span>🚪</span>Deconnexion
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

// ── Page principale ──────────────────────────────────
export default function PageSujets() {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [domaine, setDomaine] = useState('Tous');
  const [niveau, setNiveau] = useState('Tous');
  const [selected, setSelected] = useState(null);
  const [candidatures, setCandidatures] = useState([]);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [sending, setSending] = useState(false);

  // Form candidature
  const [cvFile, setCvFile] = useState(null);
  const [lettre, setLettre] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Filtrage
  const sujets = FAKE_SUJETS.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.titre.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.encadrant.nom.toLowerCase().includes(q) ||
      s.technologies.some((t) => t.toLowerCase().includes(q));
    const matchDomaine = domaine === 'Tous' || s.domaine === domaine;
    const matchNiveau = niveau === 'Tous' || s.niveau === niveau;
    return matchSearch && matchDomaine && matchNiveau;
  });

  const dejaPostule = (id) => candidatures.some((c) => c.idSujet === id);
  const getMaCand = (id) => candidatures.find((c) => c.idSujet === id);

  const handlePostuler = async (e) => {
    e.preventDefault();
    if (!cvFile) return setMsg({ text: 'Veuillez joindre votre CV', type: 'error' });
    setSending(true);
    setMsg({ text: '', type: '' });

    // Simulation upload + IA
    await new Promise((r) => setTimeout(r, 2000));
    const scoreIA = Math.floor(Math.random() * 35) + 60;

    setCandidatures((prev) => [
      ...prev,
      {
        idSujet: selected._id,
        titreSujet: selected.titre,
        cvFile: cvFile.name,
        lettre,
        scoreIA,
        statut: 'EN_ATTENTE',
        date: new Date().toLocaleDateString('fr-FR'),
      },
    ]);

    setMsg({
      text: `Candidature envoyee ! Score de compatibilite IA : ${scoreIA}/100`,
      type: 'success',
    });
    setSending(false);
    setTimeout(() => {
      setSelected(null);
      setMsg({ text: '', type: '' });
      setCvFile(null);
      setLettre('');
    }, 3000);
  };

  const statutInfo = {
    EN_ATTENTE: { c: '#F5C518', bg: 'rgba(245,197,24,.12)', l: 'En attente' },
    QUIZ_REQUIS: { c: '#9B59B6', bg: 'rgba(155,89,182,.12)', l: 'Quiz requis' },
    INTERVIEW: { c: '#27AE60', bg: 'rgba(39,174,96,.12)', l: 'Interview' },
    ACCEPTE: { c: '#27AE60', bg: 'rgba(39,174,96,.18)', l: 'Accepte' },
    REFUSE: { c: '#E74C3C', bg: 'rgba(231,76,60,.12)', l: 'Refuse' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fa', fontFamily: 'Poppins, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        .hexshape { clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); }
        .scard { background:#fff; border-radius:16px; padding:1.6rem; box-shadow:0 3px 14px rgba(0,0,0,.06); transition:all .25s; border:1.5px solid #eee; cursor:default; }
        .scard:hover { transform:translateY(-4px); box-shadow:0 14px 36px rgba(0,0,0,.11); border-color:rgba(26,122,138,.25); }
        .tech { background:rgba(26,122,138,.09); color:#1a7a8a; padding:.18rem .65rem; border-radius:100px; font-size:.72rem; font-weight:600; }
        .filter-btn { padding:.5rem 1.1rem; border-radius:100px; border:1.5px solid #e0e0e0; background:#fff; cursor:pointer; font-size:.82rem; font-weight:600; transition:all .2s; font-family:Poppins,sans-serif; color:#555; }
        .filter-btn.on { background:${TEAL}; color:#fff; border-color:${TEAL}; }
        .filter-btn:not(.on):hover { border-color:${TEAL}; color:${TEAL}; }
        .overlay { position:fixed; inset:0; background:rgba(0,0,0,.7); display:flex; align-items:center; justify-content:center; z-index:1000; padding:1rem; }
        .modal { width:100%; max-width:580px; background:#fff; border-radius:20px; max-height:92vh; overflow-y:auto; box-shadow:0 24px 60px rgba(0,0,0,.2); }
        .inp { width:100%; padding:.82rem 1rem; border-radius:10px; border:1.5px solid #e0e0e0; font-size:.88rem; outline:none; font-family:Poppins,sans-serif; transition:border-color .2s; background:#fff; color:#333; }
        .inp:focus { border-color:${TEAL}; box-shadow:0 0 0 3px rgba(26,122,138,.07); }
        .inp::placeholder, textarea::placeholder { color:#ccc; }
        .btn-main { background:linear-gradient(135deg,${TEAL},#16A085); color:#fff; border:none; width:100%; padding:.95rem; border-radius:10px; font-size:.95rem; font-weight:700; cursor:pointer; font-family:Poppins,sans-serif; transition:all .25s; }
        .btn-main:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(26,122,138,.3); }
        .btn-main:disabled { opacity:.5; cursor:not-allowed; transform:none; }
        .drop-zone { border:2px dashed #d0d0d0; border-radius:12px; padding:2rem; text-align:center; cursor:pointer; transition:all .25s; background:#fafafa; }
        .drop-zone.drag { border-color:${TEAL}; background:rgba(26,122,138,.04); }
        .drop-zone:hover { border-color:${TEAL}; }
      `}</style>

      <Navbar user={user} logout={logout} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 2rem' }}>
        {/* Mes candidatures */}
        {candidatures.length > 0 && (
          <div
            style={{
              marginBottom: '1.75rem',
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: 16,
              padding: '1.5rem',
              boxShadow: '0 3px 14px rgba(0,0,0,.05)',
            }}
          >
            <h3 style={{ fontWeight: 700, color: DARK, fontSize: '.97rem', marginBottom: '1rem' }}>
              Mes candidatures ({candidatures.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
              {candidatures.map((c, i) => {
                const si = statutInfo[c.statut] || { c: '#888', bg: '#f0f0f0', l: c.statut };
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f8fafc',
                      borderRadius: 10,
                      padding: '.9rem 1rem',
                    }}
                  >
                    <div>
                      <p style={{ color: DARK, fontWeight: 600, fontSize: '.87rem' }}>
                        {c.titreSujet}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '.25rem' }}>
                        <span style={{ color: '#888', fontSize: '.76rem' }}>
                          CV : <strong style={{ color: TEAL }}>{c.cvFile}</strong>
                        </span>
                        <span style={{ color: '#888', fontSize: '.76rem' }}>
                          Score IA : <strong style={{ color: TEAL }}>{c.scoreIA}/100</strong>
                        </span>
                        <span style={{ color: '#aaa', fontSize: '.76rem' }}>{c.date}</span>
                      </div>
                    </div>
                    <span
                      style={{
                        background: si.bg,
                        color: si.c,
                        padding: '.25rem .85rem',
                        borderRadius: 100,
                        fontSize: '.74rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {si.l}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Barre de recherche + filtres */}
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 3px 14px rgba(0,0,0,.05)',
            border: '1px solid #eee',
          }}
        >
          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <span
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#aaa',
                fontSize: '1.1rem',
              }}
            >
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par titre, technologie ou encadrant..."
              className="inp"
              style={{ paddingLeft: '2.8rem' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.75rem' }}>
            <span
              style={{
                color: '#888',
                fontSize: '.8rem',
                fontWeight: 600,
                alignSelf: 'center',
                marginRight: '.25rem',
              }}
            >
              Domaine :
            </span>
            {DOMAINES.map((d) => (
              <button
                key={d}
                className={'filter-btn' + (domaine === d ? ' on' : '')}
                onClick={() => setDomaine(d)}
              >
                {d}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                color: '#888',
                fontSize: '.8rem',
                fontWeight: 600,
                alignSelf: 'center',
                marginRight: '.25rem',
              }}
            >
              Niveau :
            </span>
            {NIVEAUX.map((n) => (
              <button
                key={n}
                className={'filter-btn' + (niveau === n ? ' on' : '')}
                onClick={() => setNiveau(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <p style={{ color: '#888', fontSize: '.83rem', marginBottom: '1rem' }}>
          {sujets.length} sujet{sujets.length > 1 ? 's' : ''} trouve{sujets.length > 1 ? 's' : ''}
        </p>

        {/* Grille */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {sujets.map((s) => {
            const postule = dejaPostule(s._id);
            const cand = getMaCand(s._id);
            const si = cand
              ? statutInfo[cand.statut] || { c: '#888', bg: '#f0f0f0', l: cand.statut }
              : null;
            const dc = DOMAIN_COLORS[s.domaine] || TEAL;
            return (
              <div key={s._id} className="scard">
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: dc + '15',
                        color: dc,
                        padding: '.22rem .7rem',
                        borderRadius: 100,
                        fontSize: '.72rem',
                        fontWeight: 700,
                      }}
                    >
                      {s.domaine}
                    </span>
                    <span
                      style={{
                        background: 'rgba(0,0,0,.06)',
                        color: '#555',
                        padding: '.22rem .7rem',
                        borderRadius: 100,
                        fontSize: '.72rem',
                        fontWeight: 600,
                      }}
                    >
                      {s.niveau}
                    </span>
                    <span
                      style={{
                        background: 'rgba(245,197,24,.15)',
                        color: '#b8860b',
                        padding: '.22rem .7rem',
                        borderRadius: 100,
                        fontSize: '.72rem',
                        fontWeight: 600,
                      }}
                    >
                      {s.places} place{s.places > 1 ? 's' : ''}
                    </span>
                  </div>
                  {si && (
                    <span
                      style={{
                        background: si.bg,
                        color: si.c,
                        padding: '.22rem .75rem',
                        borderRadius: 100,
                        fontSize: '.72rem',
                        fontWeight: 700,
                      }}
                    >
                      {si.l}
                    </span>
                  )}
                </div>

                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: '.97rem',
                    color: DARK,
                    marginBottom: '.5rem',
                    lineHeight: 1.3,
                  }}
                >
                  {s.titre}
                </h3>
                <p
                  style={{
                    color: '#777',
                    fontSize: '.82rem',
                    lineHeight: 1.65,
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {s.description}
                </p>

                {/* Encadrant */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.65rem',
                    marginBottom: '1rem',
                    padding: '.65rem .9rem',
                    background: '#f8fafc',
                    borderRadius: 10,
                  }}
                >
                  <div
                    className="hexshape"
                    style={{
                      width: 36,
                      height: 36,
                      background: dc,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      color: '#fff',
                      fontSize: '.85rem',
                      flexShrink: 0,
                    }}
                  >
                    {s.encadrant.prenom[0]}
                    {s.encadrant.nom[0]}
                  </div>
                  <div>
                    <p style={{ color: DARK, fontSize: '.82rem', fontWeight: 700 }}>
                      Prof. {s.encadrant.prenom} {s.encadrant.nom}
                    </p>
                    <p style={{ color: '#999', fontSize: '.72rem' }}>{s.encadrant.specialite}</p>
                  </div>
                </div>

                {/* Technologies */}
                <div
                  style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}
                >
                  {s.technologies.map((t, i) => (
                    <span key={i} className="tech">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Score IA si postule */}
                {cand?.scoreIA > 0 && (
                  <div
                    style={{
                      background: 'rgba(26,122,138,.06)',
                      borderRadius: 8,
                      padding: '.55rem .9rem',
                      marginBottom: '.85rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '.3rem',
                      }}
                    >
                      <span style={{ color: '#888', fontSize: '.74rem' }}>Compatibilite IA</span>
                      <span style={{ color: TEAL, fontWeight: 700, fontSize: '.8rem' }}>
                        {cand.scoreIA}/100
                      </span>
                    </div>
                    <div style={{ background: '#e0e0e0', borderRadius: 100, height: 4 }}>
                      <div
                        style={{
                          width: cand.scoreIA + '%',
                          background: `linear-gradient(90deg,${TEAL},#27AE60)`,
                          borderRadius: 100,
                          height: '100%',
                        }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!postule) {
                      setSelected(s);
                      setMsg({ text: '', type: '' });
                      setCvFile(null);
                      setLettre('');
                    }
                  }}
                  disabled={postule}
                  style={{
                    width: '100%',
                    padding: '.78rem',
                    borderRadius: 10,
                    border: 'none',
                    background: postule ? '#f0f0f0' : `linear-gradient(135deg,${TEAL},#16A085)`,
                    color: postule ? '#aaa' : '#fff',
                    fontWeight: 700,
                    cursor: postule ? 'not-allowed' : 'pointer',
                    fontSize: '.87rem',
                    fontFamily: 'Poppins,sans-serif',
                    transition: 'all .25s',
                  }}
                >
                  {postule ? '✅ Candidature envoyee' : 'Postuler a ce sujet →'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL candidature */}
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '2rem' }}>
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ flex: 1, marginRight: '1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: '.5rem',
                      flexWrap: 'wrap',
                      marginBottom: '.6rem',
                    }}
                  >
                    <span
                      style={{
                        background: (DOMAIN_COLORS[selected.domaine] || TEAL) + '15',
                        color: DOMAIN_COLORS[selected.domaine] || TEAL,
                        padding: '.2rem .65rem',
                        borderRadius: 100,
                        fontSize: '.72rem',
                        fontWeight: 700,
                      }}
                    >
                      {selected.domaine}
                    </span>
                    <span
                      style={{
                        background: '#f0f0f0',
                        color: '#555',
                        padding: '.2rem .65rem',
                        borderRadius: 100,
                        fontSize: '.72rem',
                        fontWeight: 600,
                      }}
                    >
                      {selected.niveau}
                    </span>
                  </div>
                  <h2
                    style={{
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      color: DARK,
                      marginBottom: '.5rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {selected.titre}
                  </h2>
                  <p style={{ color: '#777', fontSize: '.83rem', lineHeight: 1.65 }}>
                    {selected.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: '#f0f0f0',
                    border: 'none',
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Encadrant */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.75rem',
                  padding: '1rem 1.1rem',
                  background: 'rgba(26,122,138,.06)',
                  border: '1px solid rgba(26,122,138,.15)',
                  borderRadius: 12,
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  className="hexshape"
                  style={{
                    width: 44,
                    height: 44,
                    background: TEAL,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: '#fff',
                    fontSize: '1rem',
                    flexShrink: 0,
                  }}
                >
                  {selected.encadrant.prenom[0]}
                  {selected.encadrant.nom[0]}
                </div>
                <div>
                  <p style={{ color: DARK, fontSize: '.9rem', fontWeight: 700 }}>
                    Prof. {selected.encadrant.prenom} {selected.encadrant.nom}
                  </p>
                  <p style={{ color: TEAL, fontSize: '.78rem' }}>{selected.encadrant.specialite}</p>
                  <p style={{ color: '#aaa', fontSize: '.73rem' }}>{selected.encadrant.email}</p>
                </div>
              </div>

              {/* Technologies */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p
                  style={{
                    color: '#888',
                    fontSize: '.8rem',
                    fontWeight: 600,
                    marginBottom: '.5rem',
                  }}
                >
                  Technologies requises :
                </p>
                <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                  {selected.technologies.map((t, i) => (
                    <span key={i} className="tech">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Message */}
              {msg.text && (
                <div
                  style={{
                    marginBottom: '1rem',
                    padding: '.85rem 1rem',
                    borderRadius: 10,
                    background:
                      msg.type === 'success' ? 'rgba(39,174,96,.08)' : 'rgba(231,76,60,.08)',
                    color: msg.type === 'success' ? '#27AE60' : '#c0392b',
                    border: `1px solid ${msg.type === 'success' ? 'rgba(39,174,96,.2)' : 'rgba(231,76,60,.2)'}`,
                    fontSize: '.85rem',
                  }}
                >
                  {msg.text}
                </div>
              )}

              {/* Formulaire */}
              {!dejaPostule(selected._id) && (
                <form
                  onSubmit={handlePostuler}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
                >
                  {/* Upload CV */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: '#444',
                        fontSize: '.82rem',
                        fontWeight: 700,
                        marginBottom: '.5rem',
                      }}
                    >
                      📄 Votre CV (PDF ou DOC) *
                    </label>
                    <div
                      className={'drop-zone' + (dragOver ? ' drag' : '')}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const f = e.dataTransfer.files[0];
                        if (
                          f &&
                          (f.type === 'application/pdf' ||
                            f.name.endsWith('.doc') ||
                            f.name.endsWith('.docx'))
                        )
                          setCvFile(f);
                        else setMsg({ text: 'Seulement PDF ou DOC acceptes', type: 'error' });
                      }}
                      onClick={() => document.getElementById('cv-modal').click()}
                    >
                      <input
                        id="cv-modal"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const f = e.target.files[0];
                          if (f) setCvFile(f);
                        }}
                      />
                      {cvFile ? (
                        <div>
                          <div style={{ fontSize: '2rem', marginBottom: '.4rem' }}>📄</div>
                          <p style={{ color: TEAL, fontWeight: 700, fontSize: '.9rem' }}>
                            {cvFile.name}
                          </p>
                          <p style={{ color: '#aaa', fontSize: '.75rem', marginTop: '.25rem' }}>
                            {(cvFile.size / 1024).toFixed(0)} KB
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCvFile(null);
                            }}
                            style={{
                              marginTop: '.5rem',
                              background: 'none',
                              border: 'none',
                              color: '#E74C3C',
                              cursor: 'pointer',
                              fontSize: '.78rem',
                            }}
                          >
                            Supprimer
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '2rem', marginBottom: '.4rem' }}>📤</div>
                          <p style={{ color: '#aaa', fontSize: '.88rem' }}>
                            Glissez votre CV ici ou cliquez pour selectionner
                          </p>
                          <p style={{ color: '#ccc', fontSize: '.75rem', marginTop: '.25rem' }}>
                            PDF ou DOC — Max 10 MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lettre de motivation */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: '#444',
                        fontSize: '.82rem',
                        fontWeight: 700,
                        marginBottom: '.5rem',
                      }}
                    >
                      ✉️ Lettre de motivation{' '}
                      <span style={{ color: '#aaa', fontWeight: 400 }}>(optionnel)</span>
                    </label>
                    <textarea
                      className="inp"
                      rows={4}
                      placeholder="Pourquoi ce sujet vous interesse ? Quelles sont vos competences pertinentes ?"
                      value={lettre}
                      onChange={(e) => setLettre(e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  {/* Info IA */}
                  <div
                    style={{
                      background: 'rgba(26,122,138,.06)',
                      border: '1px solid rgba(26,122,138,.15)',
                      borderRadius: 12,
                      padding: '.9rem 1rem',
                      display: 'flex',
                      gap: '.75rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>🤖</span>
                    <p style={{ color: TEAL, fontSize: '.81rem', lineHeight: 1.65 }}>
                      Notre IA analysera automatiquement votre CV et calculera un score de
                      compatibilite avec les competences requises pour ce sujet.
                    </p>
                  </div>

                  <button type="submit" className="btn-main" disabled={sending}>
                    {sending ? '⏳ Analyse IA en cours...' : '🚀 Envoyer ma candidature'}
                  </button>
                </form>
              )}

              {dejaPostule(selected._id) && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div
                    className="hexshape"
                    style={{
                      width: 70,
                      height: 70,
                      background: 'rgba(39,174,96,.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.2rem',
                      margin: '0 auto .75rem',
                    }}
                  >
                    ✅
                  </div>
                  <p style={{ color: '#27AE60', fontWeight: 700, fontSize: '1rem' }}>
                    Candidature deja envoyee
                  </p>
                  <p style={{ color: '#aaa', fontSize: '.83rem', marginTop: '.4rem' }}>
                    Score IA :{' '}
                    <strong style={{ color: TEAL }}>{getMaCand(selected._id)?.scoreIA}/100</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
