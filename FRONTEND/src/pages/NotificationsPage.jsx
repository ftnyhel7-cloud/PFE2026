// ═══════════════════════════════════════════════════════════
//  FRONTEND/src/pages/NotificationsPage.jsx
//  ✅ Design identique au DashboardAdmin — palette verte,
//     icônes SVG, Plus Jakarta Sans, mêmes composants
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

// ─── THÈME (identique DashboardAdmin / DashboardEtudiant) ──
const T = {
  sidebar: '#1a3d2b',
  accent: '#2d9e6b',
  accentLight: '#e6f5ef',
  accentMid: '#4caf82',
  accentGrad: 'linear-gradient(135deg,#1a7a4f,#2d9e6b,#4caf82)',
  accentSoft: 'rgba(45,158,107,.12)',
  bg: '#f4faf7',
  card: '#ffffff',
  cardBorder: '#e0efe8',
  text: '#0f2d1e',
  textSoft: '#3d6b52',
  textMuted: '#7fa98e',
  success: '#16a34a',
  successLight: '#dcfce7',
  warning: '#d97706',
  warningLight: '#fef3c7',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  info: '#0891b2',
  infoLight: '#e0f7fa',
  purple: '#7c3aed',
  purpleLight: '#ede9fe',
  shadow: '0 2px 16px rgba(45,158,107,.10)',
  shadowMd: '0 6px 28px rgba(45,158,107,.16)',
};

// ─── ICÔNES SVG ────────────────────────────────────────────
const I = {
  bell: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  check: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  checkSm: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  trash: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  ),
  clock: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  refresh: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  arrowLeft: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  // Icônes par type de notification
  validation: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  tache: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  reunion: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
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
  livrable: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  ),
  systeme: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  affectation: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  candidature: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  quiz: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  info: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

// ─── CONFIG PAR TYPE ────────────────────────────────────────
function notifCfg(type) {
  return (
    {
      VALIDATION: { label: 'Validation', color: T.success, bg: T.successLight, icon: I.validation },
      TACHE: { label: 'Tâche', color: T.warning, bg: T.warningLight, icon: I.tache },
      REUNION: { label: 'Réunion', color: T.purple, bg: T.purpleLight, icon: I.reunion },
      LIVRABLE: { label: 'Livrable', color: T.info, bg: T.infoLight, icon: I.livrable },
      SYSTEME: { label: 'Système', color: T.accent, bg: T.accentLight, icon: I.systeme },
      AFFECTATION: { label: 'Affectation', color: '#db2777', bg: '#fce7f3', icon: I.affectation },
      EVALUATION: { label: 'Évaluation', color: T.purple, bg: T.purpleLight, icon: I.validation },

      ACCEPTE: { label: 'Accepté', color: T.success, bg: T.successLight, icon: I.validation },
      REFUSE: { label: 'Refusé', color: T.danger, bg: T.dangerLight, icon: I.info },
      INTERVIEW: { label: 'Entretien', color: T.info, bg: T.infoLight, icon: I.reunion },
      QUIZ: { label: 'Quiz', color: T.purple, bg: T.purpleLight, icon: I.quiz },
      CANDIDATURE: {
        label: 'Candidature',
        color: T.accent,
        bg: T.accentLight,
        icon: I.candidature,
      },
      INFO: { label: 'Info', color: T.warning, bg: T.warningLight, icon: I.info },
      MESSAGE: { label: 'Message', color: T.info, bg: T.infoLight, icon: I.systeme },
    }[type] || { label: type || 'Système', color: T.textMuted, bg: T.cardBorder, icon: I.bell }
  );
}

// ─── COMPOSANTS (identiques Admin) ─────────────────────────
function Badge({ children, color, bg }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        padding: '.18rem .58rem',
        borderRadius: 999,
        fontSize: '.66rem',
        fontWeight: 700,
        color,
        background: bg,
      }}
    >
      {children}
    </span>
  );
}

function Btn({ children, variant = 'accent', onClick, disabled, style = {} }) {
  const styles = {
    accent: {
      background: T.accentGrad,
      color: '#fff',
      border: 'none',
      boxShadow: '0 4px 14px rgba(45,158,107,.3)',
    },
    ghost: { background: 'transparent', color: T.textSoft, border: `1px solid ${T.cardBorder}` },
    danger: { background: T.dangerLight, color: T.danger, border: `1px solid ${T.danger}` },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '.38rem',
        padding: '.48rem .95rem',
        borderRadius: 8,
        fontFamily: 'inherit',
        fontSize: '.79rem',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all .15s',
        ...styles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: T.card,
        borderRadius: 14,
        border: `1px solid ${T.cardBorder}`,
        boxShadow: T.shadow,
        padding: '1.1rem',
        marginBottom: '.95rem',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ────────────────────────────────────
export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('ALL');
  const [error, setError] = useState('');

  const unread = notifs.filter((n) => !n.lu);
  const unreadCount = unread.length;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/notifications');
      const liste = Array.isArray(data) ? data : data.notifications || [];
      setNotifs(liste);
    } catch {
      setError('Impossible de charger les notifications.');
    } finally {
      setLoading(false);
    }
  };

  const marquerLue = async (id) => {
    setNotifs((prev) => prev.map((n) => (n._id === id ? { ...n, lu: true } : n)));
    try {
      await API.put(`/notifications/${id}/lue`);
    } catch {
      setNotifs((prev) => prev.map((n) => (n._id === id ? { ...n, lu: false } : n)));
    }
  };

  const marquerToutesLues = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, lu: true })));
    try {
      await API.put('/notifications/toutes-lues');
    } catch {
      fetchNotifications();
    }
  };

  const supprimer = async (id) => {
    setNotifs((prev) => prev.filter((n) => n._id !== id));
    try {
      await API.delete(`/notifications/${id}`);
    } catch {
      fetchNotifications();
    }
  };

  // Filtres
  const TABS = [
    { val: 'ALL', label: 'Toutes', cnt: notifs.length },
    { val: 'unread', label: 'Non lues', cnt: unreadCount },
    { val: 'TACHE', label: 'Tâches', cnt: notifs.filter((n) => n.type === 'TACHE').length },
    { val: 'REUNION', label: 'Réunions', cnt: notifs.filter((n) => n.type === 'REUNION').length },
    { val: 'SYSTEME', label: 'Système', cnt: notifs.filter((n) => n.type === 'SYSTEME').length },
    {
      val: 'EVALUATION',
      label: 'Évaluations',
      cnt: notifs.filter((n) => n.type === 'EVALUATION').length,
    },
    {
      val: 'CANDIDATURE',
      label: 'Candidatures',
      cnt: notifs.filter(
        (n) =>
          n.type === 'CANDIDATURE' ||
          n.type === 'ACCEPTE' ||
          n.type === 'REFUSE' ||
          n.type === 'QUIZ_REQUIS' ||
          n.type === 'QUIZ' ||
          n.type === 'INTERVIEW'
      ).length,
    },
  ];

  const notifsFiltrees = notifs.filter((n) => {
    if (filtre === 'ALL') return true;
    if (filtre === 'unread') return !n.lu;
    if (filtre === 'CANDIDATURE')
      return ['CANDIDATURE', 'ACCEPTE', 'REFUSE', 'QUIZ_REQUIS', 'QUIZ', 'INTERVIEW'].includes(
        n.type
      );
    return n.type === filtre;
  });

  const nonLuesFiltrees = notifsFiltrees.filter((n) => !n.lu);
  const luesFiltrees = notifsFiltrees.filter((n) => n.lu);

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        color: T.text,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
        .notif-anim{animation:fadeSlide .22s ease;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(45,158,107,.25);border-radius:3px;}

        .notif-unread-row {
          background:${T.card};
          border:1px solid ${T.cardBorder};
          border-left:3px solid var(--cfg-color);
          border-radius:12px;
          padding:.9rem 1rem;
          margin-bottom:.46rem;
          display:flex;
          align-items:flex-start;
          gap:.85rem;
          cursor:pointer;
          transition:background .15s, box-shadow .15s;
        }
        .notif-unread-row:hover { background:#f8fdf9; box-shadow:${T.shadowMd}; }

        .notif-read-row {
          background:${T.card};
          border:1px solid ${T.cardBorder};
          border-radius:12px;
          padding:.8rem 1rem;
          margin-bottom:.4rem;
          display:flex;
          align-items:flex-start;
          gap:.85rem;
          opacity:.7;
          transition:opacity .15s;
        }
        .notif-read-row:hover { opacity:1; }

        .tab-btn {
          flex:1;
          padding:.42rem .6rem;
          border-radius:8px;
          border:none;
          font-family:inherit;
          font-size:.76rem;
          cursor:pointer;
          transition:all .15s;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:5px;
        }
        .tab-btn.active {
          background:${T.card};
          color:${T.accent};
          font-weight:700;
          box-shadow:${T.shadow};
        }
        .tab-btn:not(.active) {
          background:transparent;
          color:${T.textSoft};
          font-weight:500;
        }
        .cnt-badge {
          border-radius:999px;
          padding:0 6px;
          font-size:.63rem;
          font-weight:800;
        }

        @media (max-width:768px) {
          .notif-header { padding:.75rem 1rem !important; flex-wrap:wrap; gap:.5rem; }
          .notif-header h1 { font-size:1rem !important; }
          .notif-tabs { flex-wrap:wrap; gap:.25rem; }
          .tab-btn { flex:none; }
          .notif-content { padding:1rem !important; }
          .notif-actions { flex-wrap:wrap; gap:.35rem; }
        }
        @media (max-width:480px) {
          .notif-content { padding:.75rem !important; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div
        className="notif-header"
        style={{
          background: T.sidebar,
          padding: '.9rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '.75rem',
          boxShadow: '0 2px 12px rgba(26,61,43,.3)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,.18)',
              color: '#fff',
              padding: '.45rem .75rem',
              borderRadius: 9,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '.4rem',
              transition: 'background .14s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.18)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.1)')}
          >
            <I.arrowLeft /> Retour
          </button>
          <div>
            <h1
              style={{
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.15rem',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '.5rem',
              }}
            >
              Notifications
              {unreadCount > 0 && (
                <span
                  style={{
                    background: T.accentMid,
                    color: '#fff',
                    borderRadius: 999,
                    fontSize: '.6rem',
                    fontWeight: 800,
                    padding: '.1rem .52rem',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </h1>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.7rem', marginTop: '.15rem' }}>
              {notifs.length} notification{notifs.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        <div
          className="notif-actions"
          style={{ display: 'flex', gap: '.45rem', alignItems: 'center' }}
        >
          <button
            onClick={fetchNotifications}
            style={{
              background: 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,.18)',
              color: '#fff',
              padding: '.45rem .75rem',
              borderRadius: 9,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '.78rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '.4rem',
            }}
          >
            <I.refresh /> Actualiser
          </button>
          {unreadCount > 0 && (
            <button
              onClick={marquerToutesLues}
              style={{
                background: T.accentGrad,
                border: 'none',
                color: '#fff',
                padding: '.45rem .95rem',
                borderRadius: 9,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '.4rem',
                boxShadow: '0 4px 12px rgba(45,158,107,.4)',
              }}
            >
              <I.checkSm /> Tout marquer lu
            </button>
          )}
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div className="notif-content" style={{ maxWidth: 820, margin: '0 auto', padding: '1.5rem' }}>
        {/* Erreur */}
        {error && (
          <div
            style={{
              background: T.dangerLight,
              border: `1px solid ${T.danger}`,
              color: T.danger,
              padding: '.75rem 1rem',
              borderRadius: 10,
              marginBottom: '1rem',
              fontSize: '.83rem',
              fontWeight: 600,
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Tabs */}
        <div
          className="notif-tabs"
          style={{
            display: 'flex',
            gap: '.3rem',
            marginBottom: '1.25rem',
            background: '#e8f5ef',
            borderRadius: 11,
            padding: '.28rem',
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.val}
              onClick={() => setFiltre(tab.val)}
              className={`tab-btn${filtre === tab.val ? ' active' : ''}`}
            >
              {tab.label}
              {tab.cnt > 0 && (
                <span
                  className="cnt-badge"
                  style={{
                    background: filtre === tab.val ? T.accentLight : '#d4eddf',
                    color: filtre === tab.val ? T.accent : T.textMuted,
                  }}
                >
                  {tab.cnt}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                border: `3px solid ${T.accentLight}`,
                borderTopColor: T.accent,
                borderRadius: '50%',
                animation: 'spin .7s linear infinite',
                margin: '0 auto .75rem',
              }}
            />
            <p style={{ color: T.textMuted, fontSize: '.82rem' }}>Chargement…</p>
          </div>
        )}

        {/* Vide */}
        {!loading && notifsFiltrees.length === 0 && (
          <Card style={{ textAlign: 'center', padding: '4rem' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: T.accentLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: T.accent,
              }}
            >
              <I.bell />
            </div>
            <p
              style={{ fontWeight: 700, color: T.text, fontSize: '.9rem', marginBottom: '.35rem' }}
            >
              Aucune notification
            </p>
            <p
              style={{
                color: T.textMuted,
                fontSize: '.8rem',
                marginBottom: filtre !== 'ALL' ? '1rem' : 0,
              }}
            >
              {filtre !== 'ALL' ? 'Aucune notification pour ce filtre.' : 'Vous êtes à jour !'}
            </p>
            {filtre !== 'ALL' && (
              <Btn variant="ghost" onClick={() => setFiltre('ALL')} style={{ fontSize: '.78rem' }}>
                Voir toutes
              </Btn>
            )}
          </Card>
        )}

        {/* Non lues */}
        {!loading && nonLuesFiltrees.length > 0 && (
          <div className="notif-anim" style={{ marginBottom: '1.3rem' }}>
            <p
              style={{
                fontSize: '.67rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.1em',
                color: T.textMuted,
                marginBottom: '.6rem',
              }}
            >
              Non lues · {nonLuesFiltrees.length}
            </p>
            {nonLuesFiltrees.map((notif) => {
              const cfg = notifCfg(notif.type);
              const id = notif._id || notif.id;
              return (
                <div
                  key={id}
                  className="notif-unread-row"
                  style={{ '--cfg-color': cfg.color }}
                  onClick={() => marquerLue(id)}
                >
                  {/* Icône */}
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: cfg.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cfg.color,
                      flexShrink: 0,
                    }}
                  >
                    <cfg.icon />
                  </div>
                  {/* Contenu */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.5rem',
                        marginBottom: '.2rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Badge color={cfg.color} bg={cfg.bg}>
                        {cfg.label}
                      </Badge>
                      <span style={{ fontWeight: 700, color: T.text, fontSize: '.82rem' }}>
                        {notif.titre}
                      </span>
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: T.accent,
                          display: 'inline-block',
                          flexShrink: 0,
                        }}
                      />
                    </div>
                    <p
                      style={{
                        color: T.textSoft,
                        fontSize: '.78rem',
                        lineHeight: 1.55,
                        marginBottom: '.2rem',
                      }}
                    >
                      {notif.contenu || notif.message || notif.description || '—'}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.5rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          color: T.textMuted,
                          fontSize: '.67rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <I.clock /> {formatDate(notif.createdAt || notif.date)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          marquerLue(id);
                        }}
                        style={{
                          background: 'none',
                          border: `1px solid ${T.successLight}`,
                          color: T.success,
                          borderRadius: 6,
                          padding: '.15rem .55rem',
                          fontSize: '.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <I.checkSm /> Marquer lu
                      </button>
                    </div>
                  </div>
                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '.4rem',
                      flexShrink: 0,
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        supprimer(id);
                      }}
                      style={{
                        background: T.dangerLight,
                        border: 'none',
                        borderRadius: 6,
                        padding: '.22rem .42rem',
                        cursor: 'pointer',
                        color: T.danger,
                        fontSize: '.68rem',
                        fontFamily: 'inherit',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <I.trash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lues */}
        {!loading && luesFiltrees.length > 0 && (
          <div className="notif-anim">
            <p
              style={{
                fontSize: '.67rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.1em',
                color: T.textMuted,
                marginBottom: '.6rem',
              }}
            >
              Lues · {luesFiltrees.length}
            </p>
            {luesFiltrees.map((notif) => {
              const cfg = notifCfg(notif.type);
              const id = notif._id || notif.id;
              return (
                <div key={id} className="notif-read-row">
                  <div
                    style={{
                      width: 35,
                      height: 35,
                      borderRadius: 9,
                      background: cfg.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cfg.color,
                      flexShrink: 0,
                      opacity: 0.8,
                    }}
                  >
                    <cfg.icon />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.5rem',
                        marginBottom: '.18rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ fontWeight: 700, color: T.text, fontSize: '.8rem' }}>
                        {notif.titre}
                      </span>
                    </div>
                    <p
                      style={{
                        color: T.textMuted,
                        fontSize: '.76rem',
                        lineHeight: 1.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {notif.contenu || notif.message || notif.description || '—'}
                    </p>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '.4rem',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ color: T.textMuted, fontSize: '.66rem', whiteSpace: 'nowrap' }}>
                      {formatDateShort(notif.createdAt || notif.date)}
                    </span>
                    <button
                      onClick={() => supprimer(id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: T.textMuted,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <I.trash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
