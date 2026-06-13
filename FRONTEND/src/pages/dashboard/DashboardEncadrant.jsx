import { useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import CalendrierPage from './CalendrierPage';
import FicheAppreciation from '../../components/FicheAppreciation';

// ─── RESPONSIVE HOOK ────────────────────────────────────────
function useWindowSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const fn = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return size;
}

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

const TASK_PALETTE = [
  { bg: '#F3E8FF', border: '#D8B4FE', text: '#6B21A8', dot: '#9333EA' },
  { bg: '#FFE4E6', border: '#FECDD3', text: '#9F1239', dot: '#F43F5E' },
  { bg: '#FEF3C7', border: '#FDE68A', text: '#92400E', dot: '#F59E0B' },
  { bg: '#DBEAFE', border: '#BFDBFE', text: '#1E40AF', dot: '#3B82F6' },
];

const STATUT_TACHE = {
  A_FAIRE: { label: 'À faire', bg: '#F3E8FF', color: '#6B21A8', border: '#D8B4FE' },
  EN_COURS: { label: 'En cours', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  TERMINEE: { label: 'Terminée', bg: '#DCFCE7', color: '#166534', border: '#86EFAC' },
};

const DOMAINES = ['Web', 'IA', 'Mobile', 'IoT', 'Securite', 'Blockchain', 'Sante'];
const NIVEAUX = ['Licence 3', 'Master 1', 'Master 2'];

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

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
  link: (c = 'currentColor') => (
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  award: (c = 'currentColor') => (
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
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  trash: (c = 'currentColor') => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  ),
  edit: (c = 'currentColor') => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  warn: (c = 'currentColor') => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  menu: (c = 'currentColor') => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  close: (c = 'currentColor') => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: 'accueil', label: 'Tableau de bord', icon: Icon.grid, section: 'principal' },
  { id: 'etudiants', label: 'Mes étudiants', icon: Icon.users, section: 'principal' },
  { id: 'sujets', label: 'Mes sujets', icon: Icon.doc, section: 'principal' },
  { id: 'taches', label: 'Tâches', icon: Icon.check, section: 'principal' },
  { id: 'candidatures', label: 'Candidatures', icon: Icon.link, section: 'principal' },
  { id: 'evaluations', label: 'Évaluations', icon: Icon.award, section: 'principal' },
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

// ─── STAT CARD ───────────────────────────────────────────────
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

// ─── MODAL EVALUATION ───────────────────────────────────────
function ModalEvaluation({ show, onClose, mesEtudiants, onSaved }) {
  const [form, setForm] = useState({ idProjet: '', note: '', observations: '' });
  if (!show) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,25,20,.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '1rem',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: '#fff',
          borderRadius: 16,
          padding: '1.5rem',
          boxShadow: '0 24px 60px rgba(0,0,0,.18)',
          border: `0.5px solid ${P.border}`,
          maxHeight: '90vh',
          overflowY: 'auto',
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
          <h3 style={{ fontWeight: 800, fontSize: 15, color: P.text }}>Nouvelle évaluation</h3>
          <button
            onClick={onClose}
            style={{
              background: '#f0f3f6',
              border: 'none',
              width: 28,
              height: 28,
              borderRadius: '50%',
              cursor: 'pointer',
              color: P.textSoft,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ display: 'grid', gap: '.7rem' }}>
          <select
            className="mi"
            value={form.idProjet}
            onChange={(e) => setForm((p) => ({ ...p, idProjet: e.target.value }))}
          >
            <option value="">Choisir un étudiant…</option>
            {mesEtudiants.map((x, i) => (
              <option key={i} value={x.projet?._id || ''}>
                {x.etudiant?.utilisateur?.prenom} {x.etudiant?.utilisateur?.nom}
              </option>
            ))}
          </select>
          <input
            className="mi"
            type="number"
            min="0"
            max="20"
            step="0.5"
            placeholder="Note /20"
            value={form.note}
            onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
          />
          <textarea
            className="mi"
            rows={3}
            placeholder="Observations"
            value={form.observations}
            onChange={(e) => setForm((p) => ({ ...p, observations: e.target.value }))}
            style={{ resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '.65rem', marginTop: '.3rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '.7rem',
                borderRadius: 9,
                border: `0.5px solid ${P.border}`,
                background: 'transparent',
                color: P.textSoft,
                fontFamily: 'Nunito,sans-serif',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await API.post('/evaluations', form);
                  onSaved('Évaluation enregistrée.');
                  setForm({ idProjet: '', note: '', observations: '' });
                  onClose();
                } catch {
                  onSaved('Erreur.');
                }
              }}
              style={{
                flex: 1,
                padding: '.7rem',
                borderRadius: 9,
                border: 'none',
                background: P.accent,
                color: '#fff',
                fontFamily: 'Nunito,sans-serif',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {Icon.checkSmall('#fff')} Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ALERTE ERREUR ───────────────────────────────────────────
function AlerteErreur({ message, onClose }) {
  if (!message) return null;
  return (
    <div
      style={{
        background: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: 9,
        padding: '10px 14px',
        marginBottom: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: P.danger,
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      {Icon.warn(P.danger)}
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: P.danger,
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ─── BOTTOM NAV MOBILE ───────────────────────────────────────
function BottomNav({ active, setActive, navigate, notifications }) {
  const items = [
    { id: 'accueil', icon: Icon.grid, label: 'Accueil' },
    { id: 'taches', icon: Icon.check, label: 'Tâches' },
    { id: 'etudiants', icon: Icon.users, label: 'Étudiants' },
    { id: 'calendrier', icon: Icon.cal, label: 'Calendrier' },
    {
      id: 'notifications',
      icon: Icon.bell,
      label: 'Notifs',
      badge: notifications.filter((n) => !n.lu).length,
    },
  ];
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: P.sidebar,
        borderTop: `1px solid ${P.sidebarBorder}`,
        display: 'flex',
        height: 60,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setActive(item.id)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: active === item.id ? '#fff' : P.sidebarText,
            position: 'relative',
            padding: '4px 0',
          }}
        >
          <div style={{ opacity: active === item.id ? 1 : 0.5 }}>
            {item.icon(active === item.id ? P.sidebarAccent : 'currentColor')}
          </div>
          <span
            style={{
              fontSize: 9,
              fontWeight: active === item.id ? 700 : 500,
              fontFamily: 'Nunito,sans-serif',
            }}
          >
            {item.label}
          </span>
          {item.badge > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: '50%',
                transform: 'translateX(8px)',
                background: P.danger,
                color: '#fff',
                borderRadius: 999,
                fontSize: 8,
                fontWeight: 800,
                padding: '1px 5px',
                minWidth: 14,
                textAlign: 'center',
              }}
            >
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────
export default function DashboardEncadrant() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { w } = useWindowSize();

  const isMobile = w < 768;
  const isTablet = w >= 768 && w < 1024;
  const isDesktop = w >= 1024;

  const [active, setActive] = useState('accueil');
  const [col, setCol] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [sujets, setSujets] = useState([]);
  const [mesEtudiants, setMesEtudiants] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [profilEncadrant, setProfilEncadrant] = useState(null);
  const [taches, setTaches] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [candidaturesEnc, setCandidaturesEnc] = useState([]);
  const [ficheEtudiant, setFicheEtudiant] = useState(null);
  const [tacheDetail, setTacheDetail] = useState(null);
  const [showEvalModal, setShowEvalModal] = useState(false);

  // ── États tâches ──
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    idEtudiant: '',
    idProjet: '',
    titre: '',
    description: '',
    dateDebut: '',
    dateLimite: '',
  });
  const [taskError, setTaskError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    _id: '',
    titre: '',
    description: '',
    dateDebut: '',
    dateLimite: '',
  });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // ── ❶ États sujets (patch) ──
  const [showNouveauSujet, setShowNouveauSujet] = useState(false);
  const [sujetDetail, setSujetDetail] = useState(null);
  const [sujetForm, setSujetForm] = useState({
    titre: '',
    description: '',
    reference: '',
    technologies: '',
    domaine: '',
    niveau: '',
    places: 1,
  });
  const [sujetError, setSujetError] = useState('');
  const [sujetLoading, setSujetLoading] = useState(false);
  const [showEditSujet, setShowEditSujet] = useState(false);
  const [editSujetForm, setEditSujetForm] = useState({
    _id: '',
    titre: '',
    description: '',
    technologies: '',
    domaine: '',
    niveau: '',
    places: 1,
  });
  const [editSujetError, setEditSujetError] = useState('');
  const [editSujetLoading, setEditSujetLoading] = useState(false);
  const goTo = useCallback((id) => {
    setActive(id);
    setMobileMenuOpen(false);
  }, []);

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
      try {
        const evR = await API.get('/evaluations/encadrant');
        setEvaluations(evR.data || []);
      } catch {}
      try {
        const cR = await API.get('/candidatures/sujet/all');
        setCandidaturesEnc(cR.data || []);
      } catch {}
      try {
        const tR = await API.get('/taches/mes-taches-encadrant');
        setTaches(tR.data || []);
      } catch {}
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const refreshTaches = async () => {
    try {
      const tR = await API.get('/taches/mes-taches-encadrant');
      setTaches(tR.data || []);
    } catch {}
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

  function isDatetimePassee(date, heure) {
    if (!date || !heure) return false;
    return new Date(`${date}T${heure}:00`) < new Date();
  }

  function validerDates(dateDebut, dateLimite) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateDebut && new Date(dateDebut) < today)
      return 'La date de début ne peut pas être une date passée.';
    if (dateLimite && new Date(dateLimite) < today)
      return 'La date limite ne peut pas être une date passée.';
    if (dateDebut && dateLimite && new Date(dateLimite) < new Date(dateDebut))
      return 'La date limite doit être après la date de début.';
    return null;
  }

  const createTask = async (e) => {
    e.preventDefault();
    setTaskError('');
    const errDate = validerDates(taskForm.dateDebut, taskForm.dateLimite);
    if (errDate) {
      setTaskError(errDate);
      return;
    }
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
      setMsg("Tâche créée ! L'étudiant a été notifié.");
      await refreshTaches();
    } catch (err) {
      setTaskError(err.response?.data?.message || 'Erreur lors de la création.');
    }
    setTimeout(() => setMsg(''), 4000);
  };

  const ouvrirEdition = (tache) => {
    setEditForm({
      _id: tache._id,
      titre: tache.titre,
      description: tache.description || '',
      dateDebut: tache.dateDebut ? tache.dateDebut.split('T')[0] : '',
      dateLimite: tache.dateLimite ? tache.dateLimite.split('T')[0] : '',
    });
    setEditError('');
    setShowEditModal(true);
    setTacheDetail(null);
  };

  const sauvegarderEdition = async (e) => {
    e.preventDefault();
    setEditError('');
    const errDate = validerDates(editForm.dateDebut, editForm.dateLimite);
    if (errDate) {
      setEditError(errDate);
      return;
    }
    setEditLoading(true);
    try {
      await API.put('/taches/' + editForm._id, {
        titre: editForm.titre,
        description: editForm.description,
        dateDebut: editForm.dateDebut,
        dateLimite: editForm.dateLimite,
      });
      setShowEditModal(false);
      setMsg('Tâche modifiée avec succès.');
      await refreshTaches();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Erreur lors de la modification.');
    } finally {
      setEditLoading(false);
    }
    setTimeout(() => setMsg(''), 4000);
  };

  const deleteTache = async (id) => {
    if (!window.confirm('Supprimer cette tâche ?')) return;
    try {
      await API.delete('/taches/' + id);
      setTaches((p) => p.filter((t) => t._id !== id));
      setTacheDetail(null);
      setMsg('Tâche supprimée.');
    } catch {
      setMsg('Erreur suppression.');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const ouvrirEditSujet = (s) => {
    setEditSujetForm({
      _id: s._id,
      titre: s.titre || '',
      description: s.description || '',
      technologies: (s.technologies || []).join(', '),
      domaine: s.domaine || '',
      niveau: s.niveau || '',
      places: s.places || 1,
    });
    setEditSujetError('');
    setShowEditSujet(true);
    setSujetDetail(null);
  };

  const sauvegarderSujet = async (e) => {
    e.preventDefault();
    setEditSujetError('');
    if (!editSujetForm.titre.trim()) return setEditSujetError('Le titre est obligatoire.');
    setEditSujetLoading(true);
    try {
      const payload = {
        titre: editSujetForm.titre,
        description: editSujetForm.description,
        technologies: editSujetForm.technologies
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        domaine: editSujetForm.domaine,
        niveau: editSujetForm.niveau,
        places: Number(editSujetForm.places) || 1,
      };
      await API.put(`/sujets/${editSujetForm._id}`, payload);
      setSujets((prev) =>
        prev.map((s) => (s._id === editSujetForm._id ? { ...s, ...payload } : s))
      );
      setShowEditSujet(false);
      setMsg('Sujet modifié avec succès.');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setEditSujetError(err.response?.data?.message || 'Erreur lors de la modification.');
    } finally {
      setEditSujetLoading(false);
    }
  };

  const supprimerSujet = async (s) => {
    const candidatures = candidaturesEnc.filter((c) => c.idSujet?._id === s._id);
    if (candidatures.length > 0) {
      alert(
        `⚠ Ce sujet possède ${candidatures.length} candidature(s) active(s). Impossible de le supprimer.`
      );
      return;
    }
    if (!window.confirm(`Supprimer le sujet "${s.titre}" ? Cette action est irréversible.`)) return;
    try {
      await API.delete(`/sujets/${s._id}`);
      setSujets((prev) => prev.filter((x) => x._id !== s._id));
      setSujetDetail(null);
      setMsg('Sujet supprimé.');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  // ── ❷ Fonction proposerNouveauSujet (patch) ──
  const proposerNouveauSujet = async (e) => {
    e.preventDefault();
    setSujetError('');
    if (!sujetForm.titre.trim()) return setSujetError('Le titre est obligatoire.');
    if (!sujetForm.description.trim()) return setSujetError('La description est obligatoire.');
    setSujetLoading(true);
    try {
      const payload = {
        ...sujetForm,
        technologies: sujetForm.technologies
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        places: Number(sujetForm.places) || 1,
      };
      const res = await API.post('/sujets', payload);
      setSujets((prev) => [res.data, ...prev]);
      setShowNouveauSujet(false);
      setSujetForm({
        titre: '',
        description: '',
        reference: '',
        technologies: '',
        domaine: '',
        niveau: '',
        places: 1,
      });
      setMsg('Sujet proposé avec succès ! En attente de validation.');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setSujetError(err.response?.data?.message || 'Erreur lors de la proposition.');
    } finally {
      setSujetLoading(false);
    }
  };

  const totalValides = sujets.filter((s) => s.valide).length;
  const initials = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase();
  const tachesTerminees = taches.filter((t) => t.statutTache === 'TERMINEE').length;
  const etColors = [
    { bg: P.accentBg, tc: P.accentText, bar: P.accentLight },
    { bg: P.warningBg, tc: P.warningText, bar: '#EF9F27' },
    { bg: P.accentBg2, tc: P.successText, bar: P.accent },
    { bg: P.coralBg, tc: P.coralText, bar: P.coral },
  ];

  const sidebarW = isMobile ? 0 : isTablet ? (col ? 58 : 200) : col ? 58 : 220;

  if (loading)
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: P.bg,
          fontFamily: 'Nunito,sans-serif',
        }}
      >
        <p style={{ color: P.accent }}>Chargement…</p>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap')`}</style>
      </div>
    );

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: 'Nunito,sans-serif',
        background: P.bg,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
        @keyframes slideIn{from{transform:translateX(-100%);}to{transform:translateX(0);}}
        .ni{display:flex;align-items:center;gap:11px;padding:9px 14px 9px 18px;cursor:pointer;border:none;background:transparent;width:100%;text-align:left;color:${P.sidebarText};font-family:'Nunito',sans-serif;font-size:13px;font-weight:500;border-left:3px solid transparent;transition:background .12s,color .12s;}
        .ni:hover{background:${P.sidebarHover};color:#fff;}
        .ni.on{background:${P.sidebarActive};color:#fff;font-weight:700;border-left:3px solid ${P.sidebarAccent};}
        .ni svg{flex-shrink:0;opacity:.6;}.ni.on svg,.ni:hover svg{opacity:1;}
        .nb{margin-left:auto;background:${P.danger};color:#fff;border-radius:999px;font-size:10px;font-weight:700;padding:1px 7px;min-width:18px;text-align:center;}
        .nb.warn{background:${P.warning};}
        .card{background:${P.white};border-radius:14px;padding:16px;border:0.5px solid ${P.border};}
        .card-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;flex-wrap:wrap;gap:8px;}
        .ct{font-size:13px;font-weight:700;color:${P.text};display:flex;align-items:center;gap:6px;}
        .row{display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:0.5px solid ${P.border};}
        .row:last-child{border-bottom:none;padding-bottom:0;}
        .pb{height:4px;border-radius:999px;background:#f1f5f9;margin-top:4px;overflow:hidden;}
        .pf{height:100%;border-radius:999px;}
        .bdg{display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;}
        .tbtn{background:transparent;border:0.5px solid ${P.border};border-radius:10px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:${P.textSoft};transition:background .12s;}
        .tbtn:hover{background:${P.accentBg};}
        .mi{width:100%;padding:.7rem .9rem;border-radius:9px;border:0.5px solid #d1d5db;font-family:'Nunito',sans-serif;font-size:13px;color:${P.text};outline:none;background:#f9fafb;transition:border-color .14s,box-shadow .14s;}
        .mi:focus{border-color:${P.accent};box-shadow:0 0 0 3px rgba(46,125,82,.12);background:#fff;}
        .pf-field{background:#f8fafc;border:0.5px solid ${P.border};border-radius:10px;padding:.8rem 1rem;}
        .pf-lbl{font-size:.63rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${P.textMuted};margin-bottom:.28rem;}
        .pf-val{font-size:.85rem;font-weight:600;color:${P.text};}
        .anim{animation:fadeIn .22s ease;}
        .task-card{transition:transform .15s,box-shadow .15s;cursor:pointer;}
        .task-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.1);}
        .mob-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:40;backdrop-filter:blur(2px);}
        .mob-sidebar{position:fixed;top:0;left:0;bottom:0;width:260px;background:${P.sidebar};z-index:41;animation:slideIn .22s ease;overflow-y:auto;display:flex;flex-direction:column;}
        @media(max-width:767px){
          .main-content{padding:12px !important;}
          .topbar-search{display:none !important;}
          .stat-grid{grid-template-columns:1fr 1fr !important;}
          .accueil-grid{grid-template-columns:1fr !important;}
          .task-grid{grid-template-columns:1fr !important;}
          .date-grid{grid-template-columns:1fr !important;}
          .modal-inner{width:calc(100vw - 2rem) !important;max-width:100% !important;}
          .action-grid{grid-template-columns:1fr 1fr !important;}
        }
        @media(min-width:768px) and (max-width:1023px){
          .stat-grid{grid-template-columns:repeat(2,1fr) !important;}
          .task-grid{grid-template-columns:repeat(2,1fr) !important;}
          .accueil-grid{grid-template-columns:1fr !important;}
        }
      `}</style>

      {/* ── SIDEBAR DESKTOP / TABLETTE ── */}
      {!isMobile && (
        <div
          style={{
            width: sidebarW,
            minHeight: '100vh',
            background: P.sidebar,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            transition: 'width .22s ease',
            borderRight: `0.5px solid ${P.sidebarBorder}`,
            overflow: 'hidden',
          }}
        >
          <SidebarContent
            col={col}
            setCol={setCol}
            user={user}
            initials={initials}
            active={active}
            goTo={goTo}
            navigate={navigate}
            logout={logout}
            notifications={notifications}
            isMobile={false}
          />
        </div>
      )}

      {/* ── SIDEBAR MOBILE (drawer) ── */}
      {isMobile && mobileMenuOpen && (
        <>
          <div className="mob-overlay" onClick={() => setMobileMenuOpen(false)} />
          <div className="mob-sidebar">
            <SidebarContent
              col={false}
              setCol={() => {}}
              user={user}
              initials={initials}
              active={active}
              goTo={goTo}
              navigate={navigate}
              logout={logout}
              notifications={notifications}
              isMobile={true}
              onClose={() => setMobileMenuOpen(false)}
            />
          </div>
        </>
      )}

      {/* ── MAIN ── */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          paddingBottom: isMobile ? 60 : 0,
        }}
      >
        {/* TOPBAR */}
        <div
          style={{
            background: P.white,
            padding: isMobile ? '10px 14px' : '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '0.5px solid rgba(0,0,0,.07)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: P.textSoft,
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                {Icon.menu(P.text)}
              </button>
            )}
            <div style={{ minWidth: 0 }}>
              {!isMobile && (
                <p style={{ fontSize: 11, color: P.textMuted }}>
                  Accueil / {NAV_ITEMS.find((n) => n.id === active)?.label || 'Profil'}
                </p>
              )}
              <h1
                style={{
                  fontSize: isMobile ? 14 : 15,
                  fontWeight: 800,
                  color: P.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {NAV_ITEMS.find((n) => n.id === active)?.label || 'Mon Profil'}
              </h1>
            </div>
          </div>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 9, flexShrink: 0 }}
          >
            {!isMobile && (
              <div
                className="topbar-search"
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
                    fontFamily: 'Nunito,sans-serif',
                    fontSize: 12,
                    color: P.text,
                    outline: 'none',
                    width: isTablet ? 100 : 130,
                  }}
                />
              </div>
            )}
            {!isMobile && (
              <div style={{ position: 'relative' }}>
                <button className="tbtn" onClick={() => goTo('notifications')}>
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
            )}
            {!isMobile && (
              <button className="tbtn" onClick={() => navigate('/messagerie')}>
                {Icon.msg('#64748b')}
              </button>
            )}
            <div
              onClick={() => goTo('profil')}
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
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
          </div>
        </div>

        {/* Message succès */}
        {msg && (
          <div
            style={{
              margin: isMobile ? '10px 14px 0' : '12px 20px 0',
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

        {/* CONTENU PAGES */}
        <div className="main-content" style={{ padding: isMobile ? '12px' : '18px 20px', flex: 1 }}>
          {/* ACCUEIL */}
          {active === 'accueil' && (
            <div className="anim">
              <div
                style={{
                  background: P.accent,
                  borderRadius: 14,
                  padding: isMobile ? '16px' : '20px 22px',
                  marginBottom: 16,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: -20,
                    top: -30,
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,.07)',
                    pointerEvents: 'none',
                  }}
                />
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
                    fontSize: isMobile ? 16 : 19,
                    fontWeight: 800,
                    marginBottom: 6,
                  }}
                >
                  Dr. {user?.prenom} {user?.nom}
                </h2>
                <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 12, marginBottom: 14 }}>
                  Supervisez vos projets, étudiants et plannings.
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => goTo('etudiants')}
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
                      fontFamily: 'Nunito,sans-serif',
                    }}
                  >
                    {Icon.users('#fff')} Mes étudiants
                  </button>
                  <button
                    onClick={() => {
                      setTaskError('');
                      setShowTaskModal(true);
                    }}
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
                      fontFamily: 'Nunito,sans-serif',
                    }}
                  >
                    {Icon.plus('#fff')} Nouvelle tâche
                  </button>
                </div>
              </div>

              <div
                className="stat-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))',
                  gap: 11,
                  marginBottom: 16,
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
                  value={taches.length}
                  label="Tâches créées"
                  sub={`${tachesTerminees} terminées`}
                  subColor={P.success}
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

              <div
                className="accueil-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: 16,
                }}
              >
                <div className="card">
                  <div className="card-hdr">
                    <span className="ct">{Icon.users(P.accent)} Étudiants encadrés</span>
                    <button
                      onClick={() => goTo('etudiants')}
                      style={{
                        fontSize: 11,
                        color: P.accent,
                        fontWeight: 700,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'Nunito,sans-serif',
                        whiteSpace: 'nowrap',
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
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: P.text,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {prenom} {nom}
                          </p>
                          <p
                            style={{
                              fontSize: 10,
                              color: P.textMuted,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {x.projet?.titre || 'Projet non affecté'}
                          </p>
                          <div className="pb">
                            <div
                              className="pf"
                              style={{ width: `${progress}%`, background: bar }}
                            />
                          </div>
                        </div>
                        <span className="bdg" style={{ background: bg, color: tc, flexShrink: 0 }}>
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

                {!isMobile && (
                  <div className="card">
                    <div className="card-hdr">
                      <span className="ct">{Icon.cal(P.accent)} Calendrier</span>
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
                        const isToday = d === new Date().getDate();
                        return (
                          <div
                            key={d}
                            style={{
                              height: 28,
                              display: 'flex',
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
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ÉTUDIANTS */}
          {active === 'etudiants' && (
            <div className="anim">
              <div className="card">
                {mesEtudiants.map((x, i) => (
                  <div key={i} className="row" style={{ flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
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
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: 700,
                          color: P.text,
                          fontSize: 13,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {x.etudiant?.utilisateur?.prenom} {x.etudiant?.utilisateur?.nom}
                      </p>
                      <p
                        style={{
                          color: P.textMuted,
                          fontSize: 11,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {x.projet?.titre || 'Projet non affecté'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
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
                          fontFamily: 'Nunito,sans-serif',
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

          {/* ── ❸ SUJETS (patch complet) ── */}
          {active === 'sujets' && (
            <div className="anim">
              {/* En-tête + bouton Proposer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.1rem',
                  flexWrap: 'wrap',
                  gap: '.75rem',
                }}
              >
                <h2 style={{ fontWeight: 800, fontSize: '1.05rem', color: P.text }}>Mes sujets</h2>
                <button
                  onClick={() => {
                    setSujetError('');
                    setShowNouveauSujet(true);
                  }}
                  style={{
                    background: P.accent,
                    color: '#fff',
                    border: 'none',
                    padding: '7px 16px',
                    borderRadius: 9,
                    cursor: 'pointer',
                    fontFamily: 'Nunito,sans-serif',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {Icon.plus('#fff')} Proposer un sujet
                </button>
              </div>

              {/* Liste */}
              <div
                style={{
                  background: P.white,
                  borderRadius: 14,
                  border: `0.5px solid ${P.border}`,
                  boxShadow: '0 2px 16px rgba(0,0,0,.06)',
                }}
              >
                {sujets.length === 0 && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '3rem',
                      color: P.textMuted,
                      fontSize: 13,
                    }}
                  >
                    <p style={{ fontSize: '2rem', marginBottom: '.65rem', opacity: 0.35 }}>📄</p>
                    Vous n'avez pas encore proposé de sujet.
                  </div>
                )}
                {sujets.map((s, idx) => (
                  <div
                    key={s._id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '14px 18px',
                      borderBottom: idx < sujets.length - 1 ? `0.5px solid ${P.border}` : 'none',
                      cursor: 'pointer',
                      transition: 'background .12s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = P.bg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => setSujetDetail(s)}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: s.valide ? P.accentLight : '#EF9F27',
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          flexWrap: 'wrap',
                          marginBottom: 4,
                        }}
                      >
                        <p style={{ fontWeight: 700, color: P.text, fontSize: 13 }}>{s.titre}</p>
                        {s.domaine && (
                          <span
                            style={{
                              background: P.accentBg,
                              color: P.accentText,
                              padding: '1px 8px',
                              borderRadius: 999,
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            {s.domaine}
                          </span>
                        )}
                        {s.niveau && (
                          <span
                            style={{
                              background: '#f0f3f6',
                              color: P.textSoft,
                              padding: '1px 8px',
                              borderRadius: 999,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            {s.niveau}
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          color: P.textSoft,
                          fontSize: 11,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginBottom: 4,
                        }}
                      >
                        {s.description}
                      </p>
                      {s.technologies?.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {s.technologies.slice(0, 4).map((t, i) => (
                            <span
                              key={i}
                              style={{
                                background: 'rgba(46,125,82,.08)',
                                color: P.accent,
                                padding: '1px 7px',
                                borderRadius: 100,
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            >
                              {t}
                            </span>
                          ))}
                          {s.technologies.length > 4 && (
                            <span style={{ color: P.textMuted, fontSize: 10 }}>
                              +{s.technologies.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 6,
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          background: s.valide ? P.accentBg2 : P.warningBg,
                          color: s.valide ? P.successText : P.warningText,
                          padding: '2px 10px',
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {s.valide ? '✔ Validé' : '⏳ En attente'}
                      </span>
                      {s.places > 0 && (
                        <span style={{ color: P.textMuted, fontSize: 10 }}>
                          {s.places} place{s.places > 1 ? 's' : ''}
                        </span>
                      )}
                      <div
                        style={{ display: 'flex', gap: 5, marginTop: 4 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => ouvrirEditSujet(s)}
                          style={{
                            background: P.accentBg,
                            color: P.accent,
                            border: `0.5px solid ${P.accentBg2}`,
                            borderRadius: 7,
                            padding: '3px 9px',
                            fontSize: 10,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            fontFamily: 'Nunito,sans-serif',
                          }}
                        >
                          {Icon.edit(P.accent)} Modifier
                        </button>
                        <button
                          onClick={() => supprimerSujet(s)}
                          style={{
                            background: P.dangerBg,
                            color: P.danger,
                            border: `0.5px solid ${P.dangerBg}`,
                            borderRadius: 7,
                            padding: '3px 9px',
                            fontSize: 10,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            fontFamily: 'Nunito,sans-serif',
                          }}
                        >
                          {Icon.trash(P.danger)} Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* MODAL Détail sujet */}
              {sujetDetail && (
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(10,25,20,.5)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 200,
                    padding: '1rem',
                  }}
                  onClick={(e) => e.target === e.currentTarget && setSujetDetail(null)}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 560,
                      background: '#fff',
                      borderRadius: 18,
                      overflow: 'hidden',
                      boxShadow: '0 24px 64px rgba(0,0,0,.2)',
                      maxHeight: '90vh',
                      overflowY: 'auto',
                    }}
                  >
                    {/* Header modal */}
                    <div
                      style={{
                        background: sujetDetail.valide ? P.accentBg : P.warningBg,
                        padding: '1.2rem 1.4rem',
                        borderBottom: `1px solid ${sujetDetail.valide ? P.accentBg2 : '#FDE68A'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                          <span
                            style={{
                              background: sujetDetail.valide ? P.accentBg2 : P.warningBg,
                              color: sujetDetail.valide ? P.successText : P.warningText,
                              border: `1px solid ${sujetDetail.valide ? P.accentLight : '#FDE68A'}`,
                              padding: '2px 10px',
                              borderRadius: 999,
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            {sujetDetail.valide ? '✔ Sujet vérifié' : '⏳ En attente de validation'}
                          </span>
                          {sujetDetail.domaine && (
                            <span
                              style={{
                                background: P.accentBg,
                                color: P.accentText,
                                padding: '2px 9px',
                                borderRadius: 999,
                                fontSize: 10,
                                fontWeight: 700,
                              }}
                            >
                              {sujetDetail.domaine}
                            </span>
                          )}
                          {sujetDetail.niveau && (
                            <span
                              style={{
                                background: 'rgba(0,0,0,.07)',
                                color: P.textSoft,
                                padding: '2px 9px',
                                borderRadius: 999,
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            >
                              {sujetDetail.niveau}
                            </span>
                          )}
                        </div>
                        <h3
                          style={{
                            fontWeight: 800,
                            fontSize: '1rem',
                            color: P.text,
                            lineHeight: 1.35,
                          }}
                        >
                          {sujetDetail.titre}
                        </h3>
                        {sujetDetail.reference && (
                          <p style={{ color: P.textMuted, fontSize: 11, marginTop: 4 }}>
                            Réf. :{' '}
                            <strong style={{ color: P.accent }}>{sujetDetail.reference}</strong>
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setSujetDetail(null)}
                        style={{
                          background: 'rgba(0,0,0,.08)',
                          border: 'none',
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: P.textSoft,
                          flexShrink: 0,
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    <div style={{ padding: '1.25rem 1.4rem' }}>
                      {sujetDetail.description && (
                        <p
                          style={{
                            color: P.textSoft,
                            fontSize: '.87rem',
                            lineHeight: 1.7,
                            marginBottom: '1rem',
                          }}
                        >
                          {sujetDetail.description}
                        </p>
                      )}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))',
                          gap: 8,
                          marginBottom: '1rem',
                        }}
                      >
                        {[
                          {
                            l: 'Places',
                            v:
                              sujetDetail.places > 0
                                ? `${sujetDetail.places} place${sujetDetail.places > 1 ? 's' : ''}`
                                : '—',
                          },
                          {
                            l: 'Proposé le',
                            v: sujetDetail.createdAt
                              ? new Date(sujetDetail.createdAt).toLocaleDateString('fr-FR')
                              : '—',
                          },
                        ].map((item) => (
                          <div
                            key={item.l}
                            style={{
                              background: P.bg,
                              borderRadius: 9,
                              padding: '8px 12px',
                              border: `0.5px solid ${P.border}`,
                            }}
                          >
                            <p
                              style={{
                                color: P.textMuted,
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '.07em',
                                marginBottom: 4,
                              }}
                            >
                              {item.l}
                            </p>
                            <p style={{ fontWeight: 700, color: P.text, fontSize: 12 }}>{item.v}</p>
                          </div>
                        ))}
                      </div>
                      {sujetDetail.technologies?.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <p
                            style={{
                              color: P.textMuted,
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '.07em',
                              marginBottom: 6,
                            }}
                          >
                            Technologies
                          </p>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {sujetDetail.technologies.map((t, i) => (
                              <span
                                key={i}
                                style={{
                                  background: 'rgba(46,125,82,.08)',
                                  color: P.accent,
                                  padding: '3px 10px',
                                  borderRadius: 100,
                                  fontSize: 11,
                                  fontWeight: 600,
                                }}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => setSujetDetail(null)}
                        style={{
                          width: '100%',
                          padding: '.7rem',
                          borderRadius: 9,
                          border: `0.5px solid ${P.border}`,
                          background: 'transparent',
                          color: P.textSoft,
                          fontFamily: 'Nunito,sans-serif',
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL Proposer un nouveau sujet */}
              {showNouveauSujet && (
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(10,25,20,.5)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 200,
                    padding: '1rem',
                  }}
                  onClick={(e) => e.target === e.currentTarget && setShowNouveauSujet(false)}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 540,
                      background: '#fff',
                      borderRadius: 18,
                      padding: '1.5rem',
                      boxShadow: '0 24px 64px rgba(0,0,0,.2)',
                      maxHeight: '92vh',
                      overflowY: 'auto',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1.25rem',
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
                        {Icon.doc(P.accent)} Proposer un nouveau sujet
                      </h3>
                      <button
                        onClick={() => setShowNouveauSujet(false)}
                        style={{
                          background: '#f0f3f6',
                          border: 'none',
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          cursor: 'pointer',
                          color: P.textSoft,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {sujetError && (
                      <div
                        style={{
                          background: '#FEF2F2',
                          border: '1px solid #FECACA',
                          borderRadius: 9,
                          padding: '10px 14px',
                          marginBottom: 12,
                          color: P.danger,
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        ⚠ {sujetError}
                        <button
                          onClick={() => setSujetError('')}
                          style={{
                            float: 'right',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: P.danger,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    <form
                      onSubmit={proposerNouveauSujet}
                      style={{ display: 'grid', gap: '.75rem' }}
                    >
                      {/* Titre */}
                      <div>
                        <label
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: P.textMuted,
                            textTransform: 'uppercase',
                            letterSpacing: '.07em',
                            display: 'block',
                            marginBottom: 4,
                          }}
                        >
                          Titre *
                        </label>
                        <input
                          required
                          placeholder="Ex: Plateforme MERN de gestion PFE"
                          value={sujetForm.titre}
                          onChange={(e) => setSujetForm((p) => ({ ...p, titre: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '.7rem .9rem',
                            borderRadius: 9,
                            border: `0.5px solid #d1d5db`,
                            fontFamily: 'Nunito,sans-serif',
                            fontSize: 13,
                            color: P.text,
                            outline: 'none',
                            background: '#f9fafb',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = P.accent;
                            e.target.style.boxShadow = '0 0 0 3px rgba(46,125,82,.12)';
                            e.target.style.background = '#fff';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.boxShadow = 'none';
                            e.target.style.background = '#f9fafb';
                          }}
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: P.textMuted,
                            textTransform: 'uppercase',
                            letterSpacing: '.07em',
                            display: 'block',
                            marginBottom: 4,
                          }}
                        >
                          Description *
                        </label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Décrivez le sujet, les objectifs et les livrables attendus..."
                          value={sujetForm.description}
                          onChange={(e) =>
                            setSujetForm((p) => ({ ...p, description: e.target.value }))
                          }
                          style={{
                            width: '100%',
                            padding: '.7rem .9rem',
                            borderRadius: 9,
                            border: `0.5px solid #d1d5db`,
                            fontFamily: 'Nunito,sans-serif',
                            fontSize: 13,
                            color: P.text,
                            outline: 'none',
                            background: '#f9fafb',
                            resize: 'vertical',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = P.accent;
                            e.target.style.boxShadow = '0 0 0 3px rgba(46,125,82,.12)';
                            e.target.style.background = '#fff';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.boxShadow = 'none';
                            e.target.style.background = '#f9fafb';
                          }}
                        />
                      </div>

                      {/* Référence */}
                      <div>
                        <label
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: P.textMuted,
                            textTransform: 'uppercase',
                            letterSpacing: '.07em',
                            display: 'block',
                            marginBottom: 4,
                          }}
                        >
                          Référence{' '}
                          <span style={{ fontWeight: 400, textTransform: 'none' }}>
                            (optionnel)
                          </span>
                        </label>
                        <input
                          placeholder="Ex: REF-2025-001, lien vers un projet réel..."
                          value={sujetForm.reference}
                          onChange={(e) =>
                            setSujetForm((p) => ({ ...p, reference: e.target.value }))
                          }
                          style={{
                            width: '100%',
                            padding: '.7rem .9rem',
                            borderRadius: 9,
                            border: `0.5px solid #d1d5db`,
                            fontFamily: 'Nunito,sans-serif',
                            fontSize: 13,
                            color: P.text,
                            outline: 'none',
                            background: '#f9fafb',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = P.accent;
                            e.target.style.boxShadow = '0 0 0 3px rgba(46,125,82,.12)';
                            e.target.style.background = '#fff';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.boxShadow = 'none';
                            e.target.style.background = '#f9fafb';
                          }}
                        />
                        <p style={{ color: P.textMuted, fontSize: 10, marginTop: 3 }}>
                          Aide à garantir l'authenticité du sujet (lien GitHub, rapport, article...)
                        </p>
                      </div>

                      {/* Technologies */}
                      <div>
                        <label
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: P.textMuted,
                            textTransform: 'uppercase',
                            letterSpacing: '.07em',
                            display: 'block',
                            marginBottom: 4,
                          }}
                        >
                          Technologies{' '}
                          <span style={{ fontWeight: 400, textTransform: 'none' }}>
                            (séparées par des virgules)
                          </span>
                        </label>
                        <input
                          placeholder="React, Node.js, MongoDB, Python..."
                          value={sujetForm.technologies}
                          onChange={(e) =>
                            setSujetForm((p) => ({ ...p, technologies: e.target.value }))
                          }
                          style={{
                            width: '100%',
                            padding: '.7rem .9rem',
                            borderRadius: 9,
                            border: `0.5px solid #d1d5db`,
                            fontFamily: 'Nunito,sans-serif',
                            fontSize: 13,
                            color: P.text,
                            outline: 'none',
                            background: '#f9fafb',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = P.accent;
                            e.target.style.boxShadow = '0 0 0 3px rgba(46,125,82,.12)';
                            e.target.style.background = '#fff';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.boxShadow = 'none';
                            e.target.style.background = '#f9fafb';
                          }}
                        />
                      </div>

                      {/* Domaine + Niveau + Places */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr',
                          gap: '.65rem',
                        }}
                      >
                        <div>
                          <label
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: P.textMuted,
                              textTransform: 'uppercase',
                              letterSpacing: '.07em',
                              display: 'block',
                              marginBottom: 4,
                            }}
                          >
                            Domaine
                          </label>
                          <select
                            value={sujetForm.domaine}
                            onChange={(e) =>
                              setSujetForm((p) => ({ ...p, domaine: e.target.value }))
                            }
                            style={{
                              width: '100%',
                              padding: '.65rem .75rem',
                              borderRadius: 9,
                              border: `0.5px solid #d1d5db`,
                              fontFamily: 'Nunito,sans-serif',
                              fontSize: 12,
                              color: P.text,
                              outline: 'none',
                              background: '#f9fafb',
                            }}
                          >
                            <option value="">—</option>
                            {DOMAINES.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: P.textMuted,
                              textTransform: 'uppercase',
                              letterSpacing: '.07em',
                              display: 'block',
                              marginBottom: 4,
                            }}
                          >
                            Niveau
                          </label>
                          <select
                            value={sujetForm.niveau}
                            onChange={(e) =>
                              setSujetForm((p) => ({ ...p, niveau: e.target.value }))
                            }
                            style={{
                              width: '100%',
                              padding: '.65rem .75rem',
                              borderRadius: 9,
                              border: `0.5px solid #d1d5db`,
                              fontFamily: 'Nunito,sans-serif',
                              fontSize: 12,
                              color: P.text,
                              outline: 'none',
                              background: '#f9fafb',
                            }}
                          >
                            <option value="">—</option>
                            {NIVEAUX.map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: P.textMuted,
                              textTransform: 'uppercase',
                              letterSpacing: '.07em',
                              display: 'block',
                              marginBottom: 4,
                            }}
                          >
                            Places
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={sujetForm.places}
                            onChange={(e) =>
                              setSujetForm((p) => ({ ...p, places: e.target.value }))
                            }
                            style={{
                              width: '100%',
                              padding: '.65rem .75rem',
                              borderRadius: 9,
                              border: `0.5px solid #d1d5db`,
                              fontFamily: 'Nunito,sans-serif',
                              fontSize: 12,
                              color: P.text,
                              outline: 'none',
                              background: '#f9fafb',
                            }}
                          />
                        </div>
                      </div>

                      {/* Info authenticité */}
                      <div
                        style={{
                          background: P.accentBg,
                          border: `1px solid ${P.accentBg2}`,
                          borderRadius: 10,
                          padding: '10px 14px',
                          display: 'flex',
                          gap: 8,
                          alignItems: 'flex-start',
                        }}
                      >
                        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🔍</span>
                        <p style={{ color: P.accentText, fontSize: 11, lineHeight: 1.6 }}>
                          <strong>Authenticité garantie :</strong> votre sujet sera soumis à
                          l'administrateur pour validation avant d'être visible par les étudiants.
                          Ajoutez une référence pour accélérer la validation.
                        </p>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '.65rem', marginTop: '.25rem' }}>
                        <button
                          type="button"
                          onClick={() => setShowNouveauSujet(false)}
                          style={{
                            flex: 1,
                            padding: '.7rem',
                            borderRadius: 9,
                            border: `0.5px solid ${P.border}`,
                            background: 'transparent',
                            color: P.textSoft,
                            fontFamily: 'Nunito,sans-serif',
                            fontSize: 13,
                            cursor: 'pointer',
                          }}
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={sujetLoading}
                          style={{
                            flex: 2,
                            padding: '.7rem',
                            borderRadius: 9,
                            border: 'none',
                            background: P.accent,
                            color: '#fff',
                            fontFamily: 'Nunito,sans-serif',
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: 'pointer',
                            opacity: sujetLoading ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                          }}
                        >
                          {sujetLoading ? '⏳ Envoi...' : '📨 Soumettre le sujet'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {showEditSujet && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(10,25,20,.5)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 200,
                padding: '1rem',
              }}
              onClick={(e) => e.target === e.currentTarget && setShowEditSujet(false)}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: 540,
                  background: '#fff',
                  borderRadius: 18,
                  padding: '1.5rem',
                  boxShadow: '0 24px 64px rgba(0,0,0,.2)',
                  maxHeight: '92vh',
                  overflowY: 'auto',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem',
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
                    {Icon.edit(P.accent)} Modifier le sujet
                  </h3>
                  <button
                    onClick={() => setShowEditSujet(false)}
                    style={{
                      background: '#f0f3f6',
                      border: 'none',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      color: P.textSoft,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                    }}
                  >
                    ✕
                  </button>
                </div>
                {editSujetError && (
                  <div
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: 9,
                      padding: '10px 14px',
                      marginBottom: 12,
                      color: P.danger,
                      fontSize: 13,
                    }}
                  >
                    ⚠ {editSujetError}
                  </div>
                )}
                <form onSubmit={sauvegarderSujet} style={{ display: 'grid', gap: '.75rem' }}>
                  <input
                    required
                    placeholder="Titre *"
                    value={editSujetForm.titre}
                    onChange={(e) => setEditSujetForm((p) => ({ ...p, titre: e.target.value }))}
                    className="mi"
                  />
                  <textarea
                    required
                    rows={4}
                    placeholder="Description *"
                    value={editSujetForm.description}
                    onChange={(e) =>
                      setEditSujetForm((p) => ({ ...p, description: e.target.value }))
                    }
                    className="mi"
                    style={{ resize: 'vertical' }}
                  />
                  <input
                    placeholder="Technologies (séparées par des virgules)"
                    value={editSujetForm.technologies}
                    onChange={(e) =>
                      setEditSujetForm((p) => ({ ...p, technologies: e.target.value }))
                    }
                    className="mi"
                  />
                  <div
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.65rem' }}
                  >
                    <select
                      value={editSujetForm.domaine}
                      onChange={(e) => setEditSujetForm((p) => ({ ...p, domaine: e.target.value }))}
                      className="mi"
                    >
                      <option value="">Domaine</option>
                      {DOMAINES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <select
                      value={editSujetForm.niveau}
                      onChange={(e) => setEditSujetForm((p) => ({ ...p, niveau: e.target.value }))}
                      className="mi"
                    >
                      <option value="">Niveau</option>
                      {NIVEAUX.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      placeholder="Places"
                      value={editSujetForm.places}
                      onChange={(e) => setEditSujetForm((p) => ({ ...p, places: e.target.value }))}
                      className="mi"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '.65rem', marginTop: '.25rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowEditSujet(false)}
                      style={{
                        flex: 1,
                        padding: '.7rem',
                        borderRadius: 9,
                        border: `0.5px solid ${P.border}`,
                        background: 'transparent',
                        color: P.textSoft,
                        fontFamily: 'Nunito,sans-serif',
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={editSujetLoading}
                      style={{
                        flex: 2,
                        padding: '.7rem',
                        borderRadius: 9,
                        border: 'none',
                        background: P.accent,
                        color: '#fff',
                        fontFamily: 'Nunito,sans-serif',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        opacity: editSujetLoading ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      {Icon.checkSmall('#fff')}{' '}
                      {editSujetLoading ? 'Enregistrement...' : 'Sauvegarder'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TÂCHES */}
          {active === 'taches' && (
            <div className="anim">
              <div className="card">
                <div className="card-hdr">
                  <span className="ct">{Icon.check(P.accent)} Tâches assignées</span>
                  <button
                    onClick={() => {
                      setTaskError('');
                      setShowTaskModal(true);
                    }}
                    style={{
                      background: P.accent,
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: 9,
                      cursor: 'pointer',
                      fontFamily: 'Nunito,sans-serif',
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    {Icon.plus('#fff')} {isMobile ? 'Créer' : 'Nouvelle tâche'}
                  </button>
                </div>
                {taches.length === 0 ? (
                  <p
                    style={{
                      color: P.textSoft,
                      fontSize: 13,
                      background: P.accentBg,
                      borderRadius: 9,
                      padding: '10px 14px',
                      border: `0.5px solid ${P.accentBg2}`,
                    }}
                  >
                    Aucune tâche. Cliquez sur "{isMobile ? 'Créer' : '+ Nouvelle tâche'}" pour
                    commencer.
                  </p>
                ) : (
                  <div
                    className="task-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))',
                      gap: 12,
                      marginTop: 4,
                    }}
                  >
                    {taches.map((t, i) => {
                      const pal = TASK_PALETTE[i % 4];
                      const st = STATUT_TACHE[t.statutTache] || STATUT_TACHE.A_FAIRE;
                      const etNom = t.idEtudiant?.utilisateur
                        ? `${t.idEtudiant.utilisateur.prenom || ''} ${t.idEtudiant.utilisateur.nom || ''}`.trim()
                        : '—';
                      const dl = t.dateLimite
                        ? Math.ceil((new Date(t.dateLimite) - new Date()) / 86400000)
                        : null;
                      return (
                        <div
                          key={t._id}
                          className="task-card"
                          style={{
                            background: pal.bg,
                            border: `1.5px solid ${pal.border}`,
                            borderRadius: 12,
                            padding: '12px 14px',
                          }}
                          onClick={() => setTacheDetail(t)}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: 8,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div
                                style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  background: pal.dot,
                                }}
                              />
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: pal.text,
                                  textTransform: 'uppercase',
                                  letterSpacing: '.05em',
                                }}
                              >
                                Tâche
                              </span>
                            </div>
                            <span
                              style={{
                                background: st.bg,
                                color: st.color,
                                border: `1px solid ${st.border}`,
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 999,
                              }}
                            >
                              {st.label}
                            </span>
                          </div>
                          <p
                            style={{
                              fontWeight: 700,
                              color: '#1e293b',
                              fontSize: 13,
                              marginBottom: 4,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {t.titre}
                          </p>
                          <p
                            style={{
                              fontSize: 11,
                              color: '#64748b',
                              marginBottom: dl !== null ? 6 : 0,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            {etNom}
                          </p>
                          {dl !== null && (
                            <p
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: dl <= 0 ? P.danger : dl <= 3 ? P.warning : pal.text,
                                marginBottom: 8,
                              }}
                            >
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                {dl <= 0 ? (
                                  <>
                                    <svg
                                      width="10"
                                      height="10"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                    >
                                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                      <line x1="12" y1="9" x2="12" y2="13" />
                                      <line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>{' '}
                                    Délai dépassé
                                  </>
                                ) : dl === 1 ? (
                                  <>
                                    <svg
                                      width="10"
                                      height="10"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    >
                                      <circle cx="12" cy="12" r="10" />
                                      <polyline points="12 6 12 12 16 14" />
                                    </svg>{' '}
                                    Demain
                                  </>
                                ) : (
                                  <>
                                    <svg
                                      width="10"
                                      height="10"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    >
                                      <rect x="3" y="4" width="18" height="18" rx="2" />
                                      <line x1="16" y1="2" x2="16" y2="6" />
                                      <line x1="8" y1="2" x2="8" y2="6" />
                                      <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>{' '}
                                    {`Limite J-${dl}`}
                                  </>
                                )}
                              </span>
                            </p>
                          )}
                          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                ouvrirEdition(t);
                              }}
                              style={{
                                flex: 1,
                                background: 'transparent',
                                border: `1px solid ${pal.border}`,
                                borderRadius: 7,
                                padding: '3px 8px',
                                fontSize: 10,
                                color: pal.text,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 4,
                                fontFamily: 'Nunito,sans-serif',
                              }}
                            >
                              {Icon.edit(pal.text)} Modifier
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTache(t._id);
                              }}
                              style={{
                                flex: 1,
                                background: 'transparent',
                                border: `1px solid ${pal.border}`,
                                borderRadius: 7,
                                padding: '3px 8px',
                                fontSize: 10,
                                color: pal.text,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 4,
                                fontFamily: 'Nunito,sans-serif',
                              }}
                            >
                              {Icon.trash(pal.text)} Supprimer
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CANDIDATURES */}
          {active === 'candidatures' && (
            <div className="anim">
              <h2
                style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: P.text,
                  marginBottom: '1.1rem',
                }}
              >
                Candidatures
              </h2>
              {candidaturesEnc.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      margin: '0 auto .65rem',
                      opacity: 0.35,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <p style={{ color: P.textMuted, fontSize: 13 }}>Aucune candidature reçue.</p>
                </div>
              ) : (
                candidaturesEnc.map((c) => {
                  const sc = {
                    EN_ATTENTE: { c: P.warning, bg: P.warningBg },
                    QUIZ_REQUIS: { c: '#7c3aed', bg: '#ede9fe' },
                    INTERVIEW: { c: P.success, bg: P.successBg },
                    ACCEPTE: { c: P.success, bg: P.successBg },
                    REFUSE: { c: P.danger, bg: P.dangerBg },
                  }[c.statut] || { c: P.textMuted, bg: P.border };
                  return (
                    <div key={c._id} className="card" style={{ marginBottom: 10 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: 10,
                          marginBottom: 10,
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: 700, color: P.text, fontSize: 13 }}>
                            {c.idEtudiant?.utilisateur?.prenom} {c.idEtudiant?.utilisateur?.nom}
                          </p>
                          <p style={{ color: P.textMuted, fontSize: 11, marginTop: 3 }}>
                            Sujet : {c.idSujet?.titre || '—'}
                          </p>
                          <p style={{ color: P.textMuted, fontSize: 11 }}>
                            Score IA : <strong style={{ color: P.accent }}>{c.scoreIA}/100</strong>
                          </p>
                        </div>
                        <span className="bdg" style={{ background: sc.bg, color: sc.c }}>
                          {c.statut?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                        {c.statut === 'EN_ATTENTE' && (
                          <>
                            <button
                              onClick={async () => {
                                await API.put(`/candidatures/${c._id}/statut`, {
                                  statut: 'INTERVIEW',
                                });
                                const r = await API.get('/candidatures/sujet/all');
                                setCandidaturesEnc(r.data || []);
                              }}
                              style={{
                                background: P.accentBg,
                                color: P.accent,
                                border: `0.5px solid ${P.accentBg2}`,
                                borderRadius: 7,
                                padding: '4px 12px',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: 'Nunito,sans-serif',
                              }}
                            >
                              ✓ Convoquer
                            </button>
                            <button
                              onClick={async () => {
                                await API.put(`/candidatures/${c._id}/statut`, {
                                  statut: 'REFUSE',
                                });
                                const r = await API.get('/candidatures/sujet/all');
                                setCandidaturesEnc(r.data || []);
                              }}
                              style={{
                                background: P.dangerBg,
                                color: P.danger,
                                border: `0.5px solid ${P.dangerBg}`,
                                borderRadius: 7,
                                padding: '4px 12px',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: 'Nunito,sans-serif',
                              }}
                            >
                              ✗ Refuser
                            </button>
                          </>
                        )}
                        {c.statut === 'INTERVIEW' && (
                          <button
                            onClick={async () => {
                              await API.put(`/candidatures/${c._id}/statut`, { statut: 'ACCEPTE' });
                              const r = await API.get('/candidatures/sujet/all');
                              setCandidaturesEnc(r.data || []);
                            }}
                            style={{
                              background: P.successBg,
                              color: P.success,
                              border: `0.5px solid ${P.accentBg2}`,
                              borderRadius: 7,
                              padding: '4px 12px',
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontFamily: 'Nunito,sans-serif',
                            }}
                          >
                            ✓ Accepter
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ÉVALUATIONS */}
          {active === 'evaluations' && (
            <div className="anim">
              {ficheEtudiant ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: '1.1rem',
                    }}
                  >
                    <button
                      onClick={() => setFicheEtudiant(null)}
                      style={{
                        background: 'transparent',
                        border: `0.5px solid ${P.border}`,
                        borderRadius: 8,
                        padding: '5px 12px',
                        cursor: 'pointer',
                        fontSize: 12,
                        color: P.textSoft,
                        fontFamily: 'Nunito,sans-serif',
                      }}
                    >
                      ← Retour
                    </button>
                    <h2 style={{ fontWeight: 800, fontSize: '1.05rem', color: P.text }}>
                      Fiche d'appréciation
                    </h2>
                  </div>
                  <FicheAppreciation
                    etudiantData={ficheEtudiant}
                    onSaved={() => {
                      setFicheEtudiant(null);
                      loadAll();
                      setMsg('Fiche enregistrée.');
                      setTimeout(() => setMsg(''), 4000);
                    }}
                    onCancel={() => setFicheEtudiant(null)}
                  />
                </>
              ) : (
                <>
                  <h2
                    style={{
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      color: P.text,
                      marginBottom: '1.1rem',
                    }}
                  >
                    Évaluations
                  </h2>
                  <div className="card">
                    {mesEtudiants.length === 0 ? (
                      <p
                        style={{
                          color: P.textMuted,
                          textAlign: 'center',
                          padding: '2rem',
                          fontSize: 13,
                        }}
                      >
                        Aucun étudiant à évaluer.
                      </p>
                    ) : (
                      mesEtudiants.map((x, i) => {
                        const eval_ = evaluations.find(
                          (e) =>
                            e.idEtudiant?._id === x.etudiant?._id ||
                            e.idEtudiant === x.etudiant?._id
                        );
                        const hasNote = eval_?.note !== undefined;
                        return (
                          <div key={i} className="row" style={{ flexWrap: 'wrap' }}>
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
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontWeight: 700, color: P.text, fontSize: 13 }}>
                                {x.etudiant?.utilisateur?.prenom} {x.etudiant?.utilisateur?.nom}
                              </p>
                              <p style={{ color: P.textMuted, fontSize: 11 }}>
                                {x.projet?.titre || 'Projet non affecté'}
                              </p>
                            </div>
                            {hasNote && (
                              <div style={{ textAlign: 'center', marginRight: 10 }}>
                                <span style={{ fontWeight: 800, fontSize: 15, color: P.accent }}>
                                  {eval_.note}/20
                                </span>
                              </div>
                            )}
                            <button
                              onClick={() =>
                                setFicheEtudiant({
                                  etudiant: x.etudiant,
                                  projet: x.projet,
                                  evaluation: eval_ || null,
                                })
                              }
                              style={{
                                background: hasNote ? P.accentBg : P.accent,
                                color: hasNote ? P.accent : '#fff',
                                border: `0.5px solid ${hasNote ? P.accentBg2 : P.accent}`,
                                borderRadius: 9,
                                padding: '6px 14px',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: 'Nunito,sans-serif',
                              }}
                            >
                              {hasNote ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <svg
                                    width="11"
                                    height="11"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>{' '}
                                  Modifier
                                </span>
                              ) : (
                                '+ Évaluer'
                              )}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* NOTIFICATIONS */}
          {active === 'notifications' && (
            <div className="anim">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.1rem',
                }}
              >
                <h2 style={{ fontWeight: 800, fontSize: '1.05rem', color: P.text }}>
                  Notifications
                </h2>
                {notifications.filter((n) => !n.lu).length > 0 && (
                  <button
                    onClick={async () => {
                      setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
                      try {
                        await API.put('/notifications/toutes-lues');
                      } catch {}
                    }}
                    style={{
                      background: P.accent,
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: 9,
                      cursor: 'pointer',
                      fontFamily: 'Nunito,sans-serif',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    ✓ Tout marquer lu
                  </button>
                )}
              </div>
              <div className="card">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className="row"
                    onClick={async () => {
                      if (!n.lu) {
                        setNotifications((prev) =>
                          prev.map((x) => (x._id === n._id ? { ...x, lu: true } : x))
                        );
                        try {
                          await API.put(`/notifications/${n._id}/lue`);
                        } catch {}
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: n.lu ? '#f0f3f6' : P.accentBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: n.lu ? P.textMuted : P.accent,
                      }}
                    >
                      {Icon.bell('currentColor')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: P.text, fontSize: 13 }}>{n.titre}</p>
                      <p
                        style={{
                          color: P.textSoft,
                          fontSize: 11,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {n.contenu}
                      </p>
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

          {/* CALENDRIER */}
          {active === 'calendrier' && (
            <div className="anim">
              <CalendrierPage role="ENCADRANT" accentColor={P.accent} />
            </div>
          )}

          {/* PROFIL */}
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
              <div className="card" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg,${P.accent},${P.accentLight})`,
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
                    <p
                      style={{
                        color: P.textSoft,
                        fontSize: 12,
                        marginTop: 3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))',
                    gap: 10,
                  }}
                >
                  {[
                    ['Prénom', user?.prenom || '—'],
                    ['Nom', user?.nom || '—'],
                    ['Email', user?.email || '—'],
                    ['Matricule', profilEncadrant?.matriculeProf || '—'],
                    ['Spécialité', profilEncadrant?.specialite || '—'],
                    ['Département', profilEncadrant?.departement || '—'],
                  ].map(([l, v]) => (
                    <div key={l} className="pf-field">
                      <div className="pf-lbl">{l}</div>
                      <div
                        className="pf-val"
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM NAV MOBILE ── */}
      {isMobile && (
        <BottomNav
          active={active}
          setActive={goTo}
          navigate={navigate}
          notifications={notifications}
        />
      )}

      {/* ── MODAL DÉTAIL TÂCHE ── */}
      {tacheDetail &&
        (() => {
          const i = taches.findIndex((t) => t._id === tacheDetail._id);
          const pal = TASK_PALETTE[i % 4] || TASK_PALETTE[0];
          const st = STATUT_TACHE[tacheDetail.statutTache] || STATUT_TACHE.A_FAIRE;
          const etNom = tacheDetail.idEtudiant?.utilisateur
            ? `${tacheDetail.idEtudiant.utilisateur.prenom || ''} ${tacheDetail.idEtudiant.utilisateur.nom || ''}`.trim()
            : '—';
          return (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(10,25,20,.5)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 200,
                padding: '1rem',
              }}
              onClick={(e) => e.target === e.currentTarget && setTacheDetail(null)}
            >
              <div
                className="modal-inner"
                style={{
                  width: '100%',
                  maxWidth: 460,
                  background: P.white,
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 24px 60px rgba(0,0,0,.18)',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                }}
              >
                <div
                  style={{
                    background: pal.bg,
                    padding: '1.2rem 1.4rem',
                    borderBottom: `1px solid ${pal.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span
                      style={{
                        background: st.bg,
                        color: st.color,
                        border: `1px solid ${st.border}`,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        marginBottom: 6,
                        display: 'inline-block',
                      }}
                    >
                      {st.label}
                    </span>
                    <h3 style={{ fontWeight: 800, fontSize: 15, color: P.text }}>
                      {tacheDetail.titre}
                    </h3>
                  </div>
                  <button
                    onClick={() => setTacheDetail(null)}
                    style={{
                      background: 'rgba(0,0,0,.08)',
                      border: 'none',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: P.textSoft,
                      flexShrink: 0,
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ padding: '1.2rem 1.4rem' }}>
                  {tacheDetail.description && (
                    <p
                      style={{
                        color: P.textSoft,
                        fontSize: 13,
                        lineHeight: 1.7,
                        marginBottom: '1rem',
                      }}
                    >
                      {tacheDetail.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div
                      style={{
                        background: P.bg,
                        borderRadius: 9,
                        padding: '8px 12px',
                        fontSize: 12,
                        color: P.text,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={P.accent}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flexShrink: 0 }}
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>
                        <strong>Étudiant :</strong> {etNom}
                      </span>
                    </div>
                    {tacheDetail.dateDebut && (
                      <div
                        style={{
                          background: P.bg,
                          borderRadius: 9,
                          padding: '8px 12px',
                          fontSize: 12,
                          color: P.text,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={P.accent}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ flexShrink: 0 }}
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>
                          <strong>Début :</strong>{' '}
                          {new Date(tacheDetail.dateDebut).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                    {tacheDetail.dateLimite && (
                      <div
                        style={{
                          background: P.bg,
                          borderRadius: 9,
                          padding: '8px 12px',
                          fontSize: 12,
                          color: P.text,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={P.danger}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ flexShrink: 0 }}
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>
                          <strong>Limite :</strong>{' '}
                          {new Date(tacheDetail.dateLimite).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: '1rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setTacheDetail(null)}
                      style={{
                        flex: 1,
                        minWidth: 80,
                        padding: '.65rem',
                        borderRadius: 9,
                        border: `0.5px solid ${P.border}`,
                        background: 'transparent',
                        color: P.textSoft,
                        fontFamily: 'Nunito,sans-serif',
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      Fermer
                    </button>
                    <button
                      onClick={() => ouvrirEdition(tacheDetail)}
                      style={{
                        flex: 1,
                        minWidth: 80,
                        padding: '.65rem',
                        borderRadius: 9,
                        border: `0.5px solid ${P.accentBg2}`,
                        background: P.accentBg,
                        color: P.accent,
                        fontFamily: 'Nunito,sans-serif',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                      }}
                    >
                      {Icon.edit(P.accent)} Modifier
                    </button>
                    <button
                      onClick={() => deleteTache(tacheDetail._id)}
                      style={{
                        flex: 1,
                        minWidth: 80,
                        padding: '.65rem',
                        borderRadius: 9,
                        border: `0.5px solid ${P.dangerBg}`,
                        background: P.dangerBg,
                        color: P.danger,
                        fontFamily: 'Nunito,sans-serif',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                      }}
                    >
                      {Icon.trash(P.danger)} Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* ── MODAL MODIFICATION TÂCHE ── */}
      {showEditModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,25,20,.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '1rem',
          }}
          onClick={(e) => e.target === e.currentTarget && setShowEditModal(false)}
        >
          <div
            className="modal-inner"
            style={{
              width: '100%',
              maxWidth: 500,
              background: P.white,
              borderRadius: 16,
              padding: '1.5rem',
              boxShadow: '0 24px 60px rgba(0,0,0,.18)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.2rem',
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
                {Icon.edit(P.accent)} Modifier la tâche
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
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
                }}
              >
                ✕
              </button>
            </div>
            <AlerteErreur message={editError} onClose={() => setEditError('')} />
            <form onSubmit={sauvegarderEdition} style={{ display: 'grid', gap: '.7rem' }}>
              <input
                placeholder="Titre de la tâche"
                required
                value={editForm.titre}
                onChange={(e) => setEditForm((p) => ({ ...p, titre: e.target.value }))}
                className="mi"
              />
              <textarea
                placeholder="Description (optionnel)"
                value={editForm.description}
                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                className="mi"
                style={{ resize: 'vertical' }}
              />
              <div
                className="date-grid"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.7rem' }}
              >
                <div>
                  <p style={{ fontSize: 11, color: P.textMuted, marginBottom: 4, fontWeight: 600 }}>
                    Date de début
                  </p>
                  <input
                    type="date"
                    min={todayStr()}
                    value={editForm.dateDebut}
                    onChange={(e) => setEditForm((p) => ({ ...p, dateDebut: e.target.value }))}
                    required
                    className="mi"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: P.textMuted, marginBottom: 4, fontWeight: 600 }}>
                    Date limite
                  </p>
                  <input
                    type="date"
                    min={editForm.dateDebut || todayStr()}
                    value={editForm.dateLimite}
                    onChange={(e) => setEditForm((p) => ({ ...p, dateLimite: e.target.value }))}
                    required
                    className="mi"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '.65rem', marginTop: '.3rem' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    flex: 1,
                    padding: '.7rem',
                    borderRadius: 9,
                    border: `0.5px solid ${P.border}`,
                    background: 'transparent',
                    color: P.textSoft,
                    fontFamily: 'Nunito,sans-serif',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  style={{
                    flex: 1,
                    padding: '.7rem',
                    borderRadius: 9,
                    border: 'none',
                    background: P.accent,
                    color: '#fff',
                    fontFamily: 'Nunito,sans-serif',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    opacity: editLoading ? 0.6 : 1,
                  }}
                >
                  {Icon.checkSmall('#fff')} {editLoading ? 'Enregistrement…' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL CRÉATION TÂCHE ── */}
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
            zIndex: 200,
            padding: '1rem',
          }}
          onClick={(e) => e.target === e.currentTarget && setShowTaskModal(false)}
        >
          <div
            className="modal-inner"
            style={{
              width: '100%',
              maxWidth: 500,
              background: P.white,
              borderRadius: 16,
              padding: '1.5rem',
              boxShadow: '0 24px 60px rgba(0,0,0,.18)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.2rem',
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
                }}
              >
                ✕
              </button>
            </div>
            <AlerteErreur message={taskError} onClose={() => setTaskError('')} />
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
              <div
                className="date-grid"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.7rem' }}
              >
                <div>
                  <p style={{ fontSize: 11, color: P.textMuted, marginBottom: 4, fontWeight: 600 }}>
                    Date de début
                  </p>
                  <input
                    type="date"
                    min={todayStr()}
                    value={taskForm.dateDebut}
                    onChange={(e) => setTaskForm((p) => ({ ...p, dateDebut: e.target.value }))}
                    required
                    className="mi"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: P.textMuted, marginBottom: 4, fontWeight: 600 }}>
                    Date limite
                  </p>
                  <input
                    type="date"
                    min={taskForm.dateDebut || todayStr()}
                    value={taskForm.dateLimite}
                    onChange={(e) => setTaskForm((p) => ({ ...p, dateLimite: e.target.value }))}
                    required
                    className="mi"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div
                style={{
                  background: '#F0FDF4',
                  border: '1px solid #86EFAC',
                  borderRadius: 9,
                  padding: '8px 12px',
                  fontSize: 12,
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#166534"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                L'étudiant recevra une notification automatique.
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
                    fontFamily: 'Nunito,sans-serif',
                    fontSize: 13,
                    cursor: 'pointer',
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
                    fontFamily: 'Nunito,sans-serif',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  {Icon.checkSmall('#fff')} Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ModalEvaluation
        show={showEvalModal}
        onClose={() => setShowEvalModal(false)}
        mesEtudiants={mesEtudiants}
        onSaved={(m) => {
          API.get('/evaluations/encadrant').then((r) => setEvaluations(r.data || []));
        }}
      />
    </div>
  );
}

// ─── SIDEBAR CONTENT (partagé desktop + drawer mobile) ──────
function SidebarContent({
  col,
  setCol,
  user,
  initials,
  active,
  goTo,
  navigate,
  logout,
  notifications,
  isMobile,
  onClose,
}) {
  const P_local = {
    sidebar: '#1a3d2b',
    sidebarBorder: 'rgba(255,255,255,.07)',
    sidebarText: 'rgba(255,255,255,.55)',
    sidebarHover: 'rgba(255,255,255,.07)',
    sidebarActive: 'rgba(255,255,255,.12)',
    sidebarAccent: '#4caf82',
    sidebarUser: 'rgba(255,255,255,.08)',
    accent: '#2e7d52',
    accentLight: '#4caf82',
    danger: '#d03030',
    warning: '#c47c0a',
  };

  return (
    <>
      <div
        style={{
          padding: '18px 16px 14px',
          borderBottom: `0.5px solid ${P_local.sidebarBorder}`,
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
            background: P_local.accentLight,
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
              SmartPFE
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
              Espace encadrant
            </div>
          </div>
        )}
        {isMobile ? (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,.5)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 2,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : (
          !col && (
            <button
              onClick={() => setCol(true)}
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
              ‹
            </button>
          )
        )}
        {!isMobile && col && (
          <button
            onClick={() => setCol(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,.35)',
              cursor: 'pointer',
              fontSize: 14,
              padding: 2,
            }}
          >
            ›
          </button>
        )}
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', paddingTop: 8 }}>
        {['principal', 'gestion'].map((section) => (
          <div key={section}>
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
                    if (isMobile) onClose();
                    return;
                  }
                  goTo(item.id);
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
                    {item.badgeDynamic === 'notifications' &&
                      notifications.filter((n) => !n.lu).length > 0 && (
                        <span className="nb warn">{notifications.filter((n) => !n.lu).length}</span>
                      )}{' '}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
        <div style={{ height: 1, background: 'rgba(255,255,255,.07)', margin: '6px 12px' }} />
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
        <button className={`ni${active === 'profil' ? ' on' : ''}`} onClick={() => goTo('profil')}>
          {Icon.user('currentColor')}
          {!col && <span>Profil</span>}
        </button>
        <button
          className="ni"
          onClick={() => {
            navigate('/parametres');
            if (isMobile) onClose();
          }}
        >
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
          {Icon.logout(P_local.danger)}
          {!col && <span style={{ color: P_local.danger }}>Déconnexion</span>}
        </button>
      </nav>

      {!col && (
        <div
          style={{
            margin: '0 12px 14px',
            background: P_local.sidebarUser,
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
              background: P_local.accentLight,
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
    </>
  );
}
