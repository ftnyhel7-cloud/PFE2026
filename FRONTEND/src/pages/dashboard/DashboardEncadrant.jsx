import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import CalendrierPage from './CalendrierPage';

// ── Palette verte ─────────────────────────────────────────
const P = {
  sidebar: '#1a3d2b',
  sidebarBorder: 'rgba(255,255,255,.07)',
  sidebarText: 'rgba(255,255,255,.55)',
  sidebarHover: 'rgba(255,255,255,.07)',
  sidebarActive: 'rgba(255,255,255,.12)',
  sidebarAccent: '#4caf82',
  sidebarUser: 'rgba(255,255,255,.08)',
  accent: '#2e7d52',
  accentLight: '#4caf82',
  accentBg: '#e6f4ed',
  accentBg2: '#d4eddf',
  accentText: '#1a5c36',
  bg: '#f0faf4',
  white: '#ffffff',
  border: 'rgba(0,0,0,.06)',
  text: '#1e293b',
  textSoft: '#64748b',
  textMuted: '#94a3b8',
  success: '#2e7d52',
  successBg: '#e6f4ed',
  successBg2: '#d4eddf',
  successText: '#1a5c36',
  warning: '#c47c0a',
  warningBg: '#FAEEDA',
  warningText: '#854F0B',
  danger: '#d03030',
  dangerBg: '#FCEBEB',
  dangerText: '#A32D2D',
  coral: '#D85A30',
  coralBg: '#FAECE7',
  coralText: '#993C1D',
};

// ── Icônes SVG inline ─────────────────────────────────────
const Icon = {
  grid: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  users: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  doc: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  check: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  msg: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  bell: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  cal: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  user: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  settings: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M21 12h-2M5 12H3M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 19v2M12 3V1" />
    </svg>
  ),
  logout: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  search: (c = 'currentColor') => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  plus: (c = 'currentColor') => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  checkSmall: (c = 'currentColor') => (
    <svg
      width="9"
      height="9"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="3"
      strokeLinecap="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  clock: (c = 'currentColor') => (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  chevLeft: (c = 'currentColor') => (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  chevRight: (c = 'currentColor') => (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: 'accueil', label: 'Tableau de bord', icon: Icon.grid, section: 'principal' },
  { id: 'etudiants', label: 'Mes étudiants', icon: Icon.users, section: 'principal' },
  { id: 'sujets', label: 'Mes sujets', icon: Icon.doc, section: 'principal' },
  { id: 'taches', label: 'Tâches', icon: Icon.check, section: 'principal', badge: 3 },
  { id: 'messages', label: 'Messagerie', icon: Icon.msg, section: 'principal', external: true },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Icon.bell,
    section: 'gestion',
    badgeDynamic: 'notifications',
  },
  { id: 'calendrier', label: 'Calendrier', icon: Icon.cal, section: 'gestion' },
];

// ── StatCard ──────────────────────────────────────────────
function StatCard({ icon, value, label, sub, subColor, iconBg, iconColor, valueColor }) {
  return (
    <div
      style={{
        background: P.white,
        borderRadius: 12,
        padding: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        border: `0.5px solid ${P.border}`,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon(iconColor)}
      </div>
      <div>
        <p
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: valueColor,
            letterSpacing: '-.03em',
            lineHeight: 1,
          }}
        >
          {value}
        </p>
        <p style={{ fontSize: 11, fontWeight: 600, color: P.textSoft, marginTop: 3 }}>{label}</p>
        {sub && (
          <p style={{ fontSize: 10, color: subColor, fontWeight: 700, marginTop: 1 }}>{sub}</p>
        )}
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────
export default function DashboardEncadrant() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('accueil');
  const [col, setCol] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [sujets, setSujets] = useState([]);
  const [mesEtudiants, setMesEtudiants] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [profilEncadrant, setProfilEncadrant] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    idEtudiant: '',
    idProjet: '',
    titre: '',
    description: '',
    dateDebut: '',
    dateLimite: '',
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [sujetsRes, etudiantsRes, notifRes, profilRes] = await Promise.all([
        API.get('/sujets/mes-sujets'),
        API.get('/encadrants/mes-etudiants'),
        API.get('/notifications'),
        API.get('/encadrants/mon-profil'),
      ]);
      setSujets(sujetsRes.data || []);
      setMesEtudiants(etudiantsRes.data || []);
      setNotifications(notifRes.data || []);
      setProfilEncadrant(profilRes.data || null);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const optionsEtudiants = useMemo(
    () =>
      mesEtudiants
        .filter((x) => x?.etudiant?._id)
        .map((x) => ({
          idEtudiant: x.etudiant._id,
          idProjet: x.projet?._id || '',
          label:
            `${x.etudiant.utilisateur?.prenom || ''} ${x.etudiant.utilisateur?.nom || ''}`.trim(),
        })),
    [mesEtudiants]
  );

  const onChooseStudentForTask = (idEtudiant) => {
    const s = optionsEtudiants.find((o) => o.idEtudiant === idEtudiant);
    setTaskForm((p) => ({ ...p, idEtudiant, idProjet: s?.idProjet || '' }));
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await API.post('/taches', taskForm);
      setShowTaskModal(false);
      setTaskForm({
        idEtudiant: '',
        idProjet: '',
        titre: '',
        description: '',
        dateDebut: '',
        dateLimite: '',
      });
      setMsg('Tâche créée avec succès.');
    } catch {
      setMsg('Erreur lors de la création de la tâche.');
    }
    setTimeout(() => setMsg(''), 4000);
  };

  const totalValides = sujets.filter((s) => s.valide).length;
  const initials = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase();

  if (loading)
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: P.bg,
          fontFamily: 'Nunito, sans-serif',
        }}
      >
        <p style={{ color: P.accent }}>Chargement…</p>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap')`}</style>
      </div>
    );

  // ── couleurs étudiants cycliques
  const etColors = [
    { bg: P.accentBg, tc: P.accentText, bar: P.accentLight },
    { bg: P.warningBg, tc: P.warningText, bar: '#EF9F27' },
    { bg: P.accentBg2, tc: P.successText, bar: P.accent },
    { bg: P.coralBg, tc: P.coralText, bar: P.coral },
  ];

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: 'Nunito, sans-serif',
        background: P.bg,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

        /* Sidebar nav item */
        .ni {
          display: flex; align-items: center; gap: 11px;
          padding: 9px 14px 9px 18px;
          cursor: pointer; border: none; background: transparent;
          width: 100%; text-align: left;
          color: ${P.sidebarText};
          font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 500;
          border-left: 3px solid transparent;
          transition: background .12s, color .12s;
        }
        .ni:hover  { background: ${P.sidebarHover}; color: #fff; }
        .ni.on     { background: ${P.sidebarActive}; color: #fff; font-weight: 700; border-left: 3px solid ${P.sidebarAccent}; }
        .ni svg    { flex-shrink: 0; opacity: .6; }
        .ni.on svg, .ni:hover svg { opacity: 1; }

        /* Badge */
        .nb      { margin-left: auto; background: ${P.danger}; color: #fff; border-radius: 999px; font-size: 10px; font-weight: 700; padding: 1px 7px; min-width: 18px; text-align: center; }
        .nb.warn { background: ${P.warning}; }

        /* Carte contenu */
        .card     { background: ${P.white}; border-radius: 14px; padding: 16px; border: 0.5px solid ${P.border}; }
        .card-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 13px; }
        .ct       { font-size: 13px; font-weight: 700; color: ${P.text}; display: flex; align-items: center; gap: 6px; }

        /* Row */
        .row          { display: flex; align-items: center; gap: 9px; padding: 8px 0; border-bottom: 0.5px solid ${P.border}; }
        .row:last-child { border-bottom: none; padding-bottom: 0; }

        /* Progress bar */
        .pb { height: 4px; border-radius: 999px; background: #f1f5f9; margin-top: 4px; overflow: hidden; }
        .pf { height: 100%; border-radius: 999px; }

        /* Badge pill */
        .bdg { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; }

        /* Topbar button */
        .tbtn { background: transparent; border: 0.5px solid ${P.border}; border-radius: 10px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: ${P.textSoft}; transition: background .12s; }
        .tbtn:hover { background: ${P.accentBg}; }

        /* Modal inputs */
        .mi { width: 100%; padding: .7rem .9rem; border-radius: 9px; border: 0.5px solid #d1d5db; font-family: 'Nunito', sans-serif; font-size: 13px; color: ${P.text}; outline: none; background: #f9fafb; transition: border-color .14s, box-shadow .14s; }
        .mi:focus { border-color: ${P.accent}; box-shadow: 0 0 0 3px rgba(46,125,82,.12); background: #fff; }

        /* Profil champ */
        .pf-field { background: #f8fafc; border: 0.5px solid ${P.border}; border-radius: 10px; padding: .8rem 1rem; }
        .pf-lbl   { font-size: .63rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: ${P.textMuted}; margin-bottom: .28rem; }
        .pf-val   { font-size: .85rem; font-weight: 600; color: ${P.text}; }

        .anim { animation: fadeIn .22s ease; }
      `}</style>

      {/* ══════════════ SIDEBAR ══════════════ */}
      <div
        style={{
          width: col ? 58 : 220,
          minHeight: '100vh',
          background: P.sidebar,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width .22s ease',
          borderRight: `0.5px solid ${P.sidebarBorder}`,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '18px 16px 14px',
            borderBottom: `0.5px solid ${P.sidebarBorder}`,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: P.accentLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3.33 2 8.67 2 12 0v-5" />
            </svg>
          </div>
          {!col && (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
                ProjectFinder
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
                Espace encadrant
              </div>
            </div>
          )}
          <button
            onClick={() => setCol(!col)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,.35)',
              cursor: 'pointer',
              fontSize: 14,
              padding: 2,
              flexShrink: 0,
            }}
          >
            {col ? '›' : '‹'}
          </button>
        </div>

        {/* Sections nav */}
        {['principal', 'gestion'].map((section) => (
          <div key={section} style={{ paddingTop: 8 }}>
            {!col && (
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,.3)',
                  padding: '10px 20px 5px',
                }}
              >
                {section === 'principal' ? 'Principal' : 'Gestion'}
              </p>
            )}
            {NAV_ITEMS.filter((n) => n.section === section).map((item) => (
              <button
                key={item.id}
                className={`ni${active === item.id ? ' on' : ''}`}
                onClick={() => {
                  if (item.external) {
                    navigate('/messagerie');
                    return;
                  }
                  setActive(item.id);
                }}
              >
                {item.icon('currentColor')}
                {!col && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flex: 1,
                    }}
                  >
                    {item.label}
                    {item.badge && <span className="nb">{item.badge}</span>}
                    {item.badgeDynamic === 'notifications' && notifications.length > 0 && (
                      <span className="nb warn">{notifications.length}</span>
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}

        <div style={{ flex: 1 }} />

        {/* Compte */}
        <div style={{ borderTop: `0.5px solid ${P.sidebarBorder}`, paddingTop: 8 }}>
          {!col && (
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,.3)',
                padding: '8px 20px 5px',
              }}
            >
              Compte
            </p>
          )}
          <button
            className={`ni${active === 'profil' ? ' on' : ''}`}
            onClick={() => setActive('profil')}
          >
            {Icon.user('currentColor')}
            {!col && <span>Profil</span>}
          </button>
          <button className="ni" onClick={() => navigate('/parametres')}>
            {Icon.settings('currentColor')}
            {!col && <span>Paramètres</span>}
          </button>
          <button
            className="ni"
            onClick={() => {
              logout();
              navigate('/accueil');
            }}
            style={{ marginBottom: 4 }}
          >
            {Icon.logout(P.danger)}
            {!col && <span style={{ color: P.danger }}>Déconnexion</span>}
          </button>
        </div>

        {/* User pill */}
        {!col && (
          <div
            style={{
              margin: '0 12px 14px',
              background: P.sidebarUser,
              borderRadius: 12,
              padding: '11px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 9,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: P.accentLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: '#fff',
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#fff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                Dr. {user?.prenom} {user?.nom}
              </p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>Encadrant senior</p>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════ MAIN ══════════════ */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div
          style={{
            background: P.white,
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '0.5px solid rgba(0,0,0,.07)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            <p style={{ fontSize: 11, color: P.textMuted }}>
              Accueil / {NAV_ITEMS.find((n) => n.id === active)?.label || 'Profil'}
            </p>
            <h1 style={{ fontSize: 15, fontWeight: 800, color: P.text }}>
              {NAV_ITEMS.find((n) => n.id === active)?.label || 'Mon Profil'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: P.bg,
                border: '0.5px solid rgba(0,0,0,.08)',
                borderRadius: 10,
                padding: '7px 12px',
                gap: 7,
              }}
            >
              {Icon.search('#94a3b8')}
              <input
                placeholder="Rechercher…"
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: 12,
                  color: P.text,
                  outline: 'none',
                  width: 130,
                }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <button className="tbtn" onClick={() => navigate('/notifications')}>
                {Icon.bell('#64748b')}
              </button>
              {notifications.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 6,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: P.danger,
                    border: '1.5px solid #fff',
                  }}
                />
              )}
            </div>
            <button className="tbtn" onClick={() => navigate('/messagerie')}>
              {Icon.msg('#64748b')}
            </button>
            <div
              onClick={() => setActive('profil')}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: P.accentLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: '#fff',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {initials}
            </div>
          </div>
        </div>

        {/* Toast */}
        {msg && (
          <div
            style={{
              margin: '12px 20px 0',
              background: P.successBg,
              border: `0.5px solid ${P.accentBg2}`,
              color: P.successText,
              padding: '.65rem .95rem',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {Icon.checkSmall(P.success)} {msg}
          </div>
        )}

        <div style={{ padding: '18px 20px', flex: 1 }}>
          {/* ── ACCUEIL ── */}
          {active === 'accueil' && (
            <div className="anim">
              {/* Hero banner */}
              <div
                style={{
                  background: P.accent,
                  borderRadius: 14,
                  padding: '20px 22px',
                  marginBottom: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: -20,
                    top: -30,
                    width: 160,
                    height: 160,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,.07)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: 80,
                    bottom: -50,
                    width: 110,
                    height: 110,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,.05)',
                  }}
                />
                <div style={{ position: 'relative' }}>
                  <p
                    style={{
                      color: 'rgba(255,255,255,.7)',
                      fontSize: 12,
                      fontWeight: 500,
                      marginBottom: 3,
                    }}
                  >
                    Bonjour,
                  </p>
                  <h2
                    style={{
                      color: '#fff',
                      fontSize: 19,
                      fontWeight: 800,
                      marginBottom: 6,
                      letterSpacing: '-.02em',
                    }}
                  >
                    Dr. {user?.prenom} {user?.nom}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 12, marginBottom: 14 }}>
                    Supervisez vos projets, étudiants et plannings depuis un seul espace.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setActive('etudiants')}
                      style={{
                        background: 'rgba(255,255,255,.18)',
                        border: '0.5px solid rgba(255,255,255,.3)',
                        borderRadius: 999,
                        padding: '5px 14px',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontFamily: 'Nunito, sans-serif',
                      }}
                    >
                      {Icon.users('#fff')} Voir mes étudiants
                    </button>
                    <button
                      onClick={() => setShowTaskModal(true)}
                      style={{
                        background: 'rgba(255,255,255,.1)',
                        border: '0.5px solid rgba(255,255,255,.2)',
                        borderRadius: 999,
                        padding: '5px 14px',
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontFamily: 'Nunito, sans-serif',
                      }}
                    >
                      {Icon.plus('#fff')} Nouvelle tâche
                    </button>
                  </div>
                </div>
                <div style={{ position: 'relative', textAlign: 'center' }}>
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 80 80"
                    fill="none"
                    style={{ opacity: 0.85 }}
                  >
                    <rect
                      x="10"
                      y="38"
                      width="60"
                      height="28"
                      rx="5"
                      fill="rgba(255,255,255,.22)"
                    />
                    <rect
                      x="20"
                      y="44"
                      width="40"
                      height="3"
                      rx="1.5"
                      fill="rgba(255,255,255,.5)"
                    />
                    <rect
                      x="20"
                      y="51"
                      width="28"
                      height="3"
                      rx="1.5"
                      fill="rgba(255,255,255,.35)"
                    />
                    <polygon points="40,8 68,36 12,36" fill="rgba(255,255,255,.3)" />
                    <rect
                      x="34"
                      y="52"
                      width="12"
                      height="14"
                      rx="2"
                      fill="rgba(255,255,255,.18)"
                    />
                  </svg>
                  <div
                    style={{
                      background: 'rgba(255,255,255,.15)',
                      border: '0.5px solid rgba(255,255,255,.25)',
                      borderRadius: 10,
                      padding: '5px 12px',
                      marginTop: 4,
                    }}
                  >
                    <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 10, fontWeight: 600 }}>
                      Année 2024-25
                    </p>
                    <p style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>Semestre 2</p>
                  </div>
                </div>
              </div>

              {/* Statistiques */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))',
                  gap: 11,
                  marginBottom: 18,
                }}
              >
                <StatCard
                  icon={Icon.doc}
                  value={sujets.length}
                  label="Sujets proposés"
                  sub={`↑ ${totalValides} validés`}
                  subColor={P.accent}
                  iconBg={P.accentBg}
                  iconColor={P.accent}
                  valueColor={P.accentText}
                />
                <StatCard
                  icon={Icon.users}
                  value={mesEtudiants.length}
                  label="Étudiants encadrés"
                  sub="Tous actifs"
                  subColor={P.accent}
                  iconBg={P.accentBg2}
                  iconColor={P.accentText}
                  valueColor={P.accentText}
                />
                <StatCard
                  icon={Icon.check}
                  value={14}
                  label="Tâches en cours"
                  sub="3 en retard"
                  subColor={P.danger}
                  iconBg={P.warningBg}
                  iconColor={P.warning}
                  valueColor={P.warningText}
                />
                <StatCard
                  icon={Icon.bell}
                  value={notifications.length}
                  label="Notifications"
                  sub="Non lues"
                  subColor={P.danger}
                  iconBg={P.dangerBg}
                  iconColor={P.dangerText}
                  valueColor={P.dangerText}
                />
              </div>

              {/* Grille basse */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Étudiants */}
                <div className="card">
                  <div className="card-hdr">
                    <span className="ct">{Icon.users(P.accent)} Étudiants encadrés</span>
                    <button
                      onClick={() => setActive('etudiants')}
                      style={{
                        fontSize: 11,
                        color: P.accent,
                        fontWeight: 700,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'Nunito, sans-serif',
                      }}
                    >
                      Voir tout →
                    </button>
                  </div>
                  {mesEtudiants.slice(0, 4).map((x, i) => {
                    const { bg, tc, bar } = etColors[i % 4];
                    const progress = [72, 45, 88, 30][i] ?? 50;
                    const prenom = x.etudiant?.utilisateur?.prenom || '?';
                    const nom = x.etudiant?.utilisateur?.nom || '';
                    return (
                      <div key={i} className="row">
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: bg,
                            color: tc,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 11,
                            flexShrink: 0,
                          }}
                        >
                          {prenom[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: P.text }}>
                            {prenom} {nom}
                          </p>
                          <p style={{ fontSize: 10, color: P.textMuted }}>
                            {x.projet?.titre || 'Projet non affecté'}
                          </p>
                          <div className="pb">
                            <div
                              className="pf"
                              style={{ width: `${progress}%`, background: bar }}
                            />
                          </div>
                        </div>
                        <span className="bdg" style={{ background: bg, color: tc }}>
                          {progress}%
                        </span>
                      </div>
                    );
                  })}
                  {mesEtudiants.length === 0 && (
                    <p
                      style={{
                        color: P.textMuted,
                        fontSize: 12,
                        textAlign: 'center',
                        padding: '1rem',
                      }}
                    >
                      Aucun étudiant encadré.
                    </p>
                  )}
                </div>

                {/* Calendrier */}
                <div className="card">
                  <div className="card-hdr">
                    <span className="ct">{Icon.cal(P.accent)} Calendrier — Avril 2025</span>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {[Icon.chevLeft, Icon.chevRight].map((Ic, i) => (
                        <div
                          key={i}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 7,
                            border: '0.5px solid rgba(0,0,0,.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          {Ic('#64748b')}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7,1fr)',
                      gap: 1,
                      marginBottom: 4,
                    }}
                  >
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                      <div
                        key={i}
                        style={{
                          textAlign: 'center',
                          fontSize: 10,
                          fontWeight: 700,
                          color: P.textMuted,
                          padding: '2px 0',
                        }}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
                    {[...Array(3)].map((_, i) => (
                      <div key={i} />
                    ))}
                    {Array.from({ length: 30 }, (_, i) => {
                      const d = i + 1;
                      const isToday = d === 29;
                      const hasEvent = [3, 7, 12, 18, 22, 29].includes(d);
                      return (
                        <div
                          key={d}
                          style={{
                            height: 28,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 7,
                            cursor: 'pointer',
                            background: isToday ? P.accent : 'transparent',
                            fontSize: 11,
                            fontWeight: isToday ? 700 : 500,
                            color: isToday ? '#fff' : P.textSoft,
                          }}
                        >
                          {d}
                          {hasEvent && (
                            <div
                              style={{
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                background: isToday ? 'rgba(255,255,255,.8)' : P.accentLight,
                                marginTop: 1,
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div
                    style={{ marginTop: 11, paddingTop: 10, borderTop: `0.5px solid ${P.border}` }}
                  >
                    <p
                      style={{ fontSize: 10, fontWeight: 700, color: P.textMuted, marginBottom: 7 }}
                    >
                      Prochains événements
                    </p>
                    {[
                      {
                        color: P.accent,
                        title: 'Soutenance mi-parcours',
                        date: '29 avril — 10h00',
                      },
                      {
                        color: '#EF9F27',
                        title: 'Remise rapports finaux',
                        date: '03 mai — Date limite',
                      },
                    ].map((ev) => (
                      <div
                        key={ev.title}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}
                      >
                        <div
                          style={{
                            width: 3,
                            height: 32,
                            borderRadius: 2,
                            background: ev.color,
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: P.text }}>{ev.title}</p>
                          <p
                            style={{
                              fontSize: 10,
                              color: P.textMuted,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            {Icon.clock('#94a3b8')} {ev.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ÉTUDIANTS ── */}
          {active === 'etudiants' && (
            <div className="anim">
              <h2
                style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: P.text,
                  marginBottom: '1.1rem',
                }}
              >
                Mes étudiants
              </h2>
              <div className="card">
                {mesEtudiants.map((x, i) => (
                  <div key={i} className="row">
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: P.accentBg,
                        color: P.accentText,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {(x.etudiant?.utilisateur?.prenom?.[0] || '?').toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, color: P.text, fontSize: 13 }}>
                        {x.etudiant?.utilisateur?.prenom} {x.etudiant?.utilisateur?.nom}
                      </p>
                      <p style={{ color: P.textMuted, fontSize: 11 }}>
                        {x.projet?.titre || 'Projet non affecté'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span
                        className="bdg"
                        style={{ background: P.successBg, color: P.successText }}
                      >
                        Actif
                      </span>
                      <button
                        onClick={() => navigate('/messagerie')}
                        style={{
                          background: P.accentBg,
                          color: P.accent,
                          border: `0.5px solid ${P.accentBg2}`,
                          borderRadius: 8,
                          padding: '4px 10px',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontFamily: 'Nunito, sans-serif',
                        }}
                      >
                        {Icon.msg(P.accent)} Écrire
                      </button>
                    </div>
                  </div>
                ))}
                {mesEtudiants.length === 0 && (
                  <p
                    style={{
                      color: P.textMuted,
                      textAlign: 'center',
                      padding: '2rem',
                      fontSize: 13,
                    }}
                  >
                    Aucun étudiant encadré.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── SUJETS ── */}
          {active === 'sujets' && (
            <div className="anim">
              <h2
                style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: P.text,
                  marginBottom: '1.1rem',
                }}
              >
                Mes sujets
              </h2>
              <div className="card">
                {sujets.map((s) => (
                  <div key={s._id} className="row">
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 2,
                        background: s.valide ? P.accentLight : '#EF9F27',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: P.text, fontSize: 13 }}>{s.titre}</p>
                      <p
                        style={{
                          color: P.textSoft,
                          fontSize: 11,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginTop: 2,
                        }}
                      >
                        {s.description}
                      </p>
                    </div>
                    <span
                      className="bdg"
                      style={
                        s.valide
                          ? { background: P.accentBg2, color: P.successText }
                          : { background: P.warningBg, color: P.warningText }
                      }
                    >
                      {s.valide ? <>{Icon.checkSmall(P.successText)} Validé</> : 'En attente'}
                    </span>
                  </div>
                ))}
                {sujets.length === 0 && (
                  <p
                    style={{
                      color: P.textMuted,
                      textAlign: 'center',
                      padding: '2rem',
                      fontSize: 13,
                    }}
                  >
                    Aucun sujet proposé.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── TÂCHES ── */}
          {active === 'taches' && (
            <div className="anim">
              <h2
                style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: P.text,
                  marginBottom: '1.1rem',
                }}
              >
                Gestion des tâches
              </h2>
              <div className="card">
                <div className="card-hdr">
                  <span className="ct">{Icon.check(P.accent)} Tâches assignées</span>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    style={{
                      background: P.accent,
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: 9,
                      cursor: 'pointer',
                      fontFamily: 'Nunito, sans-serif',
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    {Icon.plus('#fff')} Nouvelle tâche
                  </button>
                </div>
                <p
                  style={{
                    color: P.textSoft,
                    fontSize: 13,
                    lineHeight: 1.7,
                    background: P.accentBg,
                    borderRadius: 9,
                    padding: '10px 14px',
                    border: `0.5px solid ${P.accentBg2}`,
                  }}
                >
                  Assignez des tâches à vos étudiants et définissez des échéances pour suivre
                  l'avancement de leurs projets.
                </p>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {active === 'notifications' && (
            <div className="anim">
              <h2
                style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: P.text,
                  marginBottom: '1.1rem',
                }}
              >
                Notifications
              </h2>
              <div className="card">
                {notifications.map((n) => (
                  <div key={n._id} className="row">
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: n.lu ? '#f0f3f6' : P.accentBg,
                        border: `0.5px solid ${n.lu ? P.border : P.accentBg2}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: n.lu ? P.textMuted : P.accent,
                      }}
                    >
                      {Icon.bell('currentColor')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, color: P.text, fontSize: 13 }}>{n.titre}</p>
                      <p style={{ color: P.textSoft, fontSize: 11 }}>{n.contenu}</p>
                    </div>
                    {!n.lu && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: P.accent,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p
                    style={{
                      color: P.textMuted,
                      textAlign: 'center',
                      padding: '2rem',
                      fontSize: 13,
                    }}
                  >
                    Aucune notification.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── CALENDRIER ── */}
          {active === 'calendrier' && (
            <div className="anim">
              <h2
                style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: P.text,
                  marginBottom: '1.1rem',
                }}
              >
                Calendrier
              </h2>
              <CalendrierPage role="ENCADRANT" accentColor={P.accent} />
            </div>
          )}

          {/* ── PROFIL ── */}
          {active === 'profil' && (
            <div className="anim">
              <h2
                style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: P.text,
                  marginBottom: '1.1rem',
                }}
              >
                Mon profil
              </h2>

              {/* Header */}
              <div className="card" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${P.accent}, ${P.accentLight})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 22,
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: 16, color: P.text }}>
                      Dr. {user?.prenom} {user?.nom}
                    </p>
                    <p style={{ color: P.textSoft, fontSize: 12, marginTop: 3 }}>{user?.email}</p>
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {[
                        'Encadrant',
                        profilEncadrant?.typeEncadrant,
                        profilEncadrant?.departement && `Dép. ${profilEncadrant.departement}`,
                      ]
                        .filter(Boolean)
                        .map((tag) => (
                          <span
                            key={tag}
                            style={{
                              background: P.accentBg,
                              color: P.accentText,
                              padding: '3px 10px',
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 700,
                              border: `0.5px solid ${P.accentBg2}`,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[
                      { label: 'Étudiants', value: mesEtudiants.length },
                      { label: 'Sujets', value: sujets.length },
                      { label: 'Validés', value: totalValides },
                    ].map((s) => (
                      <div
                        key={s.label}
                        style={{
                          background: P.bg,
                          border: `0.5px solid ${P.border}`,
                          borderRadius: 12,
                          padding: '8px 14px',
                          textAlign: 'center',
                          minWidth: 64,
                        }}
                      >
                        <p
                          style={{
                            fontWeight: 800,
                            fontSize: 20,
                            color: P.accent,
                            letterSpacing: '-.02em',
                            lineHeight: 1,
                          }}
                        >
                          {s.value}
                        </p>
                        <p
                          style={{
                            fontSize: 10,
                            color: P.textMuted,
                            fontWeight: 600,
                            marginTop: 3,
                          }}
                        >
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Infos */}
              <div className="card" style={{ marginBottom: 14 }}>
                <p style={{ fontWeight: 700, color: P.text, fontSize: 13, marginBottom: 12 }}>
                  Informations personnelles
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
                    gap: 10,
                  }}
                >
                  {[
                    ['Prénom', user?.prenom || '—'],
                    ['Nom', user?.nom || '—'],
                    ['Adresse e-mail', user?.email || '—'],
                    ['Matricule', profilEncadrant?.matriculeProf || '—'],
                    ['Spécialité', profilEncadrant?.specialite || '—'],
                    ['Département', profilEncadrant?.departement || '—'],
                    ['Statut', profilEncadrant?.typeEncadrant || '—'],
                    ['Grade', profilEncadrant?.grade || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="pf-field">
                      <div className="pf-lbl">{label}</div>
                      <div className="pf-val">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Étudiants */}
              <div className="card">
                <p style={{ fontWeight: 700, color: P.text, fontSize: 13, marginBottom: 12 }}>
                  Étudiants encadrés
                </p>
                {mesEtudiants.map((x, i) => (
                  <div key={i} className="row">
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: P.accentBg,
                        color: P.accentText,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 12,
                        flexShrink: 0,
                      }}
                    >
                      {(x.etudiant?.utilisateur?.prenom?.[0] || '?').toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, color: P.text, fontSize: 13 }}>
                        {x.etudiant?.utilisateur?.prenom} {x.etudiant?.utilisateur?.nom}
                      </p>
                      <p style={{ color: P.textMuted, fontSize: 11 }}>
                        {x.projet?.titre || 'Projet non affecté'}
                      </p>
                    </div>
                    <span className="bdg" style={{ background: P.successBg, color: P.successText }}>
                      Actif
                    </span>
                  </div>
                ))}
                {mesEtudiants.length === 0 && (
                  <p
                    style={{
                      color: P.textMuted,
                      textAlign: 'center',
                      padding: '1.5rem',
                      fontSize: 13,
                    }}
                  >
                    Aucun étudiant encadré.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ MODAL TÂCHE ══════════════ */}
      {showTaskModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,25,20,.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={(e) => e.target === e.currentTarget && setShowTaskModal(false)}
        >
          <div
            style={{
              width: 500,
              background: P.white,
              borderRadius: 16,
              padding: '1.8rem',
              boxShadow: '0 24px 60px rgba(0,0,0,.18)',
              border: `0.5px solid ${P.border}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.35rem',
              }}
            >
              <h3
                style={{
                  fontWeight: 800,
                  fontSize: 15,
                  color: P.text,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                {Icon.check(P.accent)} Créer une tâche
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                style={{
                  background: '#f0f3f6',
                  border: 'none',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: P.textSoft,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Nunito, sans-serif',
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={createTask} style={{ display: 'grid', gap: '.7rem' }}>
              <select
                value={taskForm.idEtudiant}
                onChange={(e) => onChooseStudentForTask(e.target.value)}
                required
                className="mi"
              >
                <option value="">Choisir un étudiant encadré…</option>
                {optionsEtudiants.map((o) => (
                  <option key={o.idEtudiant} value={o.idEtudiant}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input
                placeholder="Titre de la tâche"
                required
                value={taskForm.titre}
                onChange={(e) => setTaskForm((p) => ({ ...p, titre: e.target.value }))}
                className="mi"
              />
              <textarea
                placeholder="Description (optionnel)"
                value={taskForm.description}
                onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                className="mi"
                style={{ resize: 'vertical' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.7rem' }}>
                {[
                  ['dateDebut', 'Date de début'],
                  ['dateLimite', 'Date limite'],
                ].map(([field, label]) => (
                  <div key={field}>
                    <p
                      style={{ fontSize: 11, color: P.textMuted, marginBottom: 4, fontWeight: 600 }}
                    >
                      {label}
                    </p>
                    <input
                      type="date"
                      value={taskForm[field]}
                      onChange={(e) => setTaskForm((p) => ({ ...p, [field]: e.target.value }))}
                      required
                      className="mi"
                      style={{ width: '100%' }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '.65rem', marginTop: '.3rem' }}>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  style={{
                    flex: 1,
                    padding: '.7rem',
                    borderRadius: 9,
                    border: `0.5px solid ${P.border}`,
                    background: 'transparent',
                    color: P.textSoft,
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: 13,
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '.7rem',
                    borderRadius: 9,
                    border: 'none',
                    background: P.accent,
                    color: '#fff',
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  {Icon.checkSmall('#fff')} Créer la tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
