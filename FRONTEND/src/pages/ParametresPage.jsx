// ═══════════════════════════════════════════════════════════
//  FRONTEND/src/pages/ParametresPage.jsx
//  ✅ Redesign identique DashboardAdmin — palette verte,
//     icônes SVG, Plus Jakarta Sans
// ═══════════════════════════════════════════════════════════
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

// ─── THÈME ────────────────────────────────────────────────
const T = {
  accent: '#2d9e6b',
  accentLight: '#e6f5ef',
  accentMid: '#4caf82',
  accentGrad: 'linear-gradient(135deg,#1a7a4f,#2d9e6b,#4caf82)',
  accentSoft: 'rgba(45,158,107,.12)',
  sidebar: '#1a3d2b',
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
  shadow: '0 2px 16px rgba(45,158,107,.10)',
  shadowMd: '0 6px 28px rgba(45,158,107,.16)',
};

// ─── ICÔNES SVG ────────────────────────────────────────────
const I = {
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
  user: () => (
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  link: () => (
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  lock: () => (
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
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
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
  shield: () => (
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  alertTriangle: () => (
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
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  laptop: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  check: () => (
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
  eye: (show) =>
    show ? (
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
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ) : (
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
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  download: () => (
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
      <polyline points="8 17 12 21 16 17" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" />
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

// ─── COMPOSANTS ────────────────────────────────────────────
function Btn({ children, variant = 'accent', onClick, disabled, style = {}, type = 'button' }) {
  const styles = {
    accent: {
      background: T.accentGrad,
      color: '#fff',
      border: 'none',
      boxShadow: '0 4px 14px rgba(45,158,107,.3)',
    },
    ghost: { background: 'transparent', color: T.textSoft, border: `1px solid ${T.cardBorder}` },
    danger: { background: T.dangerLight, color: T.danger, border: `1px solid ${T.danger}40` },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '.38rem',
        padding: '.52rem 1.1rem',
        borderRadius: 9,
        fontFamily: 'inherit',
        fontSize: '.82rem',
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
        padding: '1.25rem',
        marginBottom: '1rem',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon: IconComp, title }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontWeight: 800,
        fontSize: '1rem',
        color: T.text,
        marginBottom: '1.25rem',
      }}
    >
      <span style={{ color: T.accent }}>
        <IconComp />
      </span>{' '}
      {title}
    </div>
  );
}

function Toggle({ val, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!val)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 100,
        background: val ? T.accent : T.cardBorder,
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background .22s',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: val ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left .22s',
          boxShadow: '0 1px 4px rgba(0,0,0,.2)',
        }}
      />
    </button>
  );
}

function NotifRow({ label, desc, val, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '.75rem 0',
        borderBottom: `1px solid ${T.cardBorder}`,
      }}
    >
      <div style={{ paddingRight: '1rem' }}>
        <p style={{ fontWeight: 600, color: T.text, fontSize: '.85rem' }}>{label}</p>
        <p style={{ color: T.textMuted, fontSize: '.73rem', marginTop: '.12rem' }}>{desc}</p>
      </div>
      <Toggle val={val} onChange={onChange} />
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ────────────────────────────────────
export default function ParametresPage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profil');

  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    linkedin: user?.linkedin || '',
    portfolio: user?.portfolio || '',
    bio: user?.bio || '',
  });
  const [mdpData, setMdpData] = useState({ nouveau: '', confirmer: '' });
  const [voir1, setVoir1] = useState(false);
  const [voir2, setVoir2] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    candidature: true,
    interview: true,
    quiz: true,
    refuse: true,
    info: false,
    email: true,
    push: false,
  });
  const [privacy, setPrivacy] = useState({
    profilPublic: true,
    cvVisible: true,
    contactVisible: false,
  });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const showMsg = (text, type) => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const handleSaveProfil = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.put('/auth/profile', formData);
      login(data, localStorage.getItem('token'));
      showMsg('Informations sauvegardées avec succès !', 'success');
    } catch (err) {
      showMsg('Erreur : ' + (err.response?.data?.message || 'Échec'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeMdp = async (e) => {
    e.preventDefault();
    if (mdpData.nouveau !== mdpData.confirmer)
      return showMsg('Les mots de passe ne correspondent pas', 'error');
    if (mdpData.nouveau.length < 8) return showMsg('Minimum 8 caractères requis', 'error');
    setSaving(true);
    try {
      await API.put('/auth/profile', { mot_de_passe: mdpData.nouveau });
      showMsg('Mot de passe changé avec succès !', 'success');
      setMdpData({ nouveau: '', confirmer: '' });
    } catch (err) {
      showMsg('Erreur : ' + (err.response?.data?.message || 'Échec'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'profil', icon: I.user, label: 'Informations personnelles' },
    { id: 'liens', icon: I.link, label: 'Liens & Réseaux' },
    { id: 'securite', icon: I.lock, label: 'Sécurité' },
    { id: 'notifs', icon: I.bell, label: 'Notifications' },
    { id: 'vie_privee', icon: I.shield, label: 'Vie privée' },
    { id: 'danger', icon: I.alertTriangle, label: 'Zone dangereuse' },
  ];

  const iStyle = {
    width: '100%',
    padding: '.65rem .9rem',
    borderRadius: 9,
    border: `1.5px solid ${T.cardBorder}`,
    fontSize: '.85rem',
    outline: 'none',
    fontFamily: 'inherit',
    color: T.text,
    background: T.card,
    transition: 'border-color .18s',
  };
  const lStyle = {
    display: 'block',
    color: T.textSoft,
    fontSize: '.75rem',
    fontWeight: 700,
    marginBottom: '.3rem',
  };

  const MsgBox = () =>
    msg.text ? (
      <div
        style={{
          padding: '.72rem 1rem',
          borderRadius: 9,
          marginBottom: '1rem',
          fontSize: '.82rem',
          fontWeight: 600,
          background: msg.type === 'success' ? T.successLight : T.dangerLight,
          color: msg.type === 'success' ? T.success : T.danger,
          border: `1px solid ${msg.type === 'success' ? T.success : T.danger}40`,
          display: 'flex',
          alignItems: 'center',
          gap: '.4rem',
        }}
      >
        {msg.type === 'success' ? <I.check /> : '⚠'} {msg.text}
      </div>
    ) : null;

  const initials = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase();

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
        .inp-f:focus{border-color:${T.accent}!important;box-shadow:0 0 0 3px ${T.accentSoft};outline:none;}
        .inp-f::placeholder{color:${T.textMuted};}
        textarea{resize:vertical;font-family:inherit;}
        select option{background:#fff;color:${T.text};}
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:rgba(45,158,107,.25);border-radius:3px;}
        .sect-btn{width:100%;display:flex;align-items:center;gap:.75rem;padding:.72rem .85rem;border-radius:10px;border:none;cursor:pointer;font-family:inherit;font-size:.83rem;font-weight:500;transition:all .18s;text-align:left;}
        .sect-btn.on{background:${T.accentLight};color:${T.accent};font-weight:700;}
        .sect-btn:not(.on){background:transparent;color:${T.textSoft};}
        .sect-btn:not(.on):hover{background:${T.bg};color:${T.text};}
        .pwd-wrap{position:relative;}
        .pwd-wrap input{padding-right:3rem;}
        .pwd-eye{position:absolute;right:.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:${T.textMuted};display:flex;align-items:center;}
        .pwd-eye:hover{color:${T.accent};}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
        .sect-anim{animation:fadeSlide .2s ease;}
        @media(max-width:768px){
          .param-layout{grid-template-columns:1fr!important;}
          .param-sidebar{position:static!important;display:flex;flex-wrap:wrap;gap:.35rem;height:auto!important;}
          .sect-btn{flex:none;width:auto;padding:.5rem .85rem!important;}
          .param-header{padding:.75rem 1rem!important;}
          .param-content{padding:1rem!important;}
          .infos-grid{grid-template-columns:1fr!important;}
        }
        @media(max-width:480px){.param-content{padding:.75rem!important;}}
      `}</style>

      {/* ── HEADER ── */}
      <div
        className="param-header"
        style={{
          background: T.sidebar,
          padding: '.85rem 1.5rem',
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
              padding: '.42rem .7rem',
              borderRadius: 9,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '.4rem',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.18)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.1)')}
          >
            <I.arrowLeft /> Retour
          </button>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: T.accentGrad,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(45,158,107,.4)',
            }}
          >
            <I.lock />
          </div>
          <div>
            <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>
              Paramètres
            </h1>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.68rem', marginTop: '.1rem' }}>
              Gérez vos informations et préférences
            </p>
          </div>
        </div>
      </div>

      <div
        className="param-layout"
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          padding: '1.5rem',
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          gap: '1.25rem',
        }}
      >
        {/* ── SIDEBAR ── */}
        <div
          className="param-sidebar"
          style={{
            background: T.card,
            borderRadius: 14,
            border: `1px solid ${T.cardBorder}`,
            boxShadow: T.shadow,
            padding: '1rem',
            height: 'fit-content',
            position: 'sticky',
            top: '5rem',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              textAlign: 'center',
              padding: '1rem .75rem',
              borderBottom: `1px solid ${T.cardBorder}`,
              marginBottom: '.75rem',
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                background: T.accentGrad,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                fontWeight: 800,
                color: '#fff',
                margin: '0 auto .7rem',
                boxShadow: '0 4px 14px rgba(45,158,107,.35)',
              }}
            >
              {initials}
            </div>
            <p style={{ fontWeight: 700, color: T.text, fontSize: '.85rem' }}>
              {user?.prenom} {user?.nom}
            </p>
            <p style={{ color: T.textMuted, fontSize: '.7rem', marginTop: '.12rem' }}>
              {user?.role}
            </p>
          </div>
          {sections.map((s) => (
            <button
              key={s.id}
              className={'sect-btn' + (activeSection === s.id ? ' on' : '')}
              onClick={() => setActiveSection(s.id)}
            >
              <span style={{ color: activeSection === s.id ? T.accent : T.textMuted }}>
                <s.icon />
              </span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* ── CONTENU ── */}
        <div className="param-content sect-anim">
          <MsgBox />

          {/* PROFIL */}
          {activeSection === 'profil' && (
            <Card>
              <SectionTitle icon={I.user} title="Informations personnelles" />
              <form
                onSubmit={handleSaveProfil}
                style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}
              >
                <div
                  className="infos-grid"
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}
                >
                  <div>
                    <label style={lStyle}>Nom</label>
                    <input
                      style={iStyle}
                      className="inp-f"
                      placeholder="Votre nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={lStyle}>Prénom</label>
                    <input
                      style={iStyle}
                      className="inp-f"
                      placeholder="Votre prénom"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label style={lStyle}>Adresse email</label>
                  <input
                    type="email"
                    style={iStyle}
                    className="inp-f"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label style={lStyle}>Numéro de téléphone</label>
                  <input
                    style={iStyle}
                    className="inp-f"
                    placeholder="+216 XX XXX XXX"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  />
                </div>
                <div>
                  <label style={lStyle}>Bio / Présentation</label>
                  <textarea
                    rows={3}
                    style={iStyle}
                    className="inp-f"
                    placeholder="Décrivez-vous en quelques mots…"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
                <Btn type="submit" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                  {saving ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
                </Btn>
              </form>
            </Card>
          )}

          {/* LIENS */}
          {activeSection === 'liens' && (
            <Card>
              <SectionTitle icon={I.link} title="Liens & Réseaux sociaux" />
              <p
                style={{
                  color: T.textMuted,
                  fontSize: '.8rem',
                  lineHeight: 1.65,
                  marginBottom: '1.25rem',
                }}
              >
                Ajoutez vos liens professionnels pour enrichir votre profil et améliorer vos chances
                de sélection.
              </p>
              <form
                onSubmit={handleSaveProfil}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {[
                  {
                    label: 'LinkedIn',
                    key: 'linkedin',
                    placeholder: 'https://linkedin.com/in/votre-profil',
                    prefix: 'in',
                    prefixColor: '#0077B5',
                  },
                  {
                    label: 'Portfolio personnel',
                    key: 'portfolio',
                    placeholder: 'https://votre-portfolio.com',
                    prefix: '🌐',
                    prefixColor: T.accent,
                  },
                  {
                    label: 'GitHub',
                    key: 'github',
                    placeholder: 'https://github.com/votre-username',
                    prefix: 'GH',
                    prefixColor: '#333',
                  },
                ].map(({ label, key, placeholder, prefix, prefixColor }) => (
                  <div key={key}>
                    <label style={lStyle}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: '.85rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: prefixColor,
                          fontWeight: 700,
                          fontSize: '.82rem',
                        }}
                      >
                        {prefix}
                      </span>
                      <input
                        style={{ ...iStyle, paddingLeft: '2.5rem' }}
                        className="inp-f"
                        placeholder={placeholder}
                        value={formData[key] || ''}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      />
                    </div>
                  </div>
                ))}
                {(formData.linkedin || formData.portfolio) && (
                  <div
                    style={{
                      background: T.accentLight,
                      border: `1px solid ${T.accent}30`,
                      borderRadius: 10,
                      padding: '1rem',
                    }}
                  >
                    <p
                      style={{
                        color: T.accent,
                        fontWeight: 700,
                        fontSize: '.8rem',
                        marginBottom: '.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <I.info /> Aperçu de votre profil :
                    </p>
                    {formData.linkedin && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '.5rem',
                          marginBottom: '.3rem',
                        }}
                      >
                        <span style={{ color: '#0077B5', fontWeight: 700, fontSize: '.8rem' }}>
                          LinkedIn
                        </span>
                        <a
                          href={formData.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: T.accent, fontSize: '.78rem' }}
                        >
                          → Voir
                        </a>
                      </div>
                    )}
                    {formData.portfolio && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <span style={{ color: T.accent, fontWeight: 700, fontSize: '.8rem' }}>
                          Portfolio
                        </span>
                        <a
                          href={formData.portfolio}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: T.accent, fontSize: '.78rem' }}
                        >
                          → Voir
                        </a>
                      </div>
                    )}
                  </div>
                )}
                <Btn type="submit" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                  {saving ? 'Sauvegarde…' : 'Sauvegarder les liens'}
                </Btn>
              </form>
            </Card>
          )}

          {/* SÉCURITÉ */}
          {activeSection === 'securite' && (
            <Card>
              <SectionTitle icon={I.lock} title="Changer le mot de passe" />
              <form
                onSubmit={handleChangeMdp}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <div>
                  <label style={lStyle}>Nouveau mot de passe</label>
                  <div className="pwd-wrap">
                    <input
                      type={voir1 ? 'text' : 'password'}
                      style={iStyle}
                      className="inp-f"
                      placeholder="Minimum 8 caractères"
                      value={mdpData.nouveau}
                      onChange={(e) => setMdpData({ ...mdpData, nouveau: e.target.value })}
                      required
                    />
                    <button type="button" className="pwd-eye" onClick={() => setVoir1(!voir1)}>
                      <I.eye show={voir1} />
                    </button>
                  </div>
                  {mdpData.nouveau.length > 0 && (
                    <div style={{ marginTop: '.4rem' }}>
                      <div
                        style={{
                          height: 4,
                          borderRadius: 2,
                          background: T.cardBorder,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            borderRadius: 2,
                            transition: 'all .3s',
                            width:
                              mdpData.nouveau.length < 6
                                ? '30%'
                                : mdpData.nouveau.length < 10
                                  ? '65%'
                                  : '100%',
                            background:
                              mdpData.nouveau.length < 6
                                ? T.danger
                                : mdpData.nouveau.length < 10
                                  ? T.warning
                                  : T.success,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: '.7rem',
                          fontWeight: 600,
                          color:
                            mdpData.nouveau.length < 6
                              ? T.danger
                              : mdpData.nouveau.length < 10
                                ? T.warning
                                : T.success,
                        }}
                      >
                        {mdpData.nouveau.length < 6
                          ? 'Faible'
                          : mdpData.nouveau.length < 10
                            ? 'Moyen'
                            : 'Fort'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label style={lStyle}>Confirmer le mot de passe</label>
                  <div className="pwd-wrap">
                    <input
                      type={voir2 ? 'text' : 'password'}
                      style={{
                        ...iStyle,
                        borderColor:
                          mdpData.confirmer && mdpData.nouveau !== mdpData.confirmer
                            ? T.danger
                            : undefined,
                      }}
                      className="inp-f"
                      placeholder="Répétez le mot de passe"
                      value={mdpData.confirmer}
                      onChange={(e) => setMdpData({ ...mdpData, confirmer: e.target.value })}
                      required
                    />
                    <button type="button" className="pwd-eye" onClick={() => setVoir2(!voir2)}>
                      <I.eye show={voir2} />
                    </button>
                  </div>
                  {mdpData.confirmer && mdpData.nouveau !== mdpData.confirmer && (
                    <p style={{ color: T.danger, fontSize: '.72rem', marginTop: '.25rem' }}>
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
                </div>
                <Btn type="submit" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                  {saving ? 'Changement…' : 'Changer le mot de passe'}
                </Btn>
              </form>

              <div
                style={{
                  marginTop: '1.75rem',
                  paddingTop: '1.25rem',
                  borderTop: `1px solid ${T.cardBorder}`,
                }}
              >
                <h3
                  style={{
                    fontWeight: 700,
                    color: T.text,
                    fontSize: '.88rem',
                    marginBottom: '.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <I.laptop /> Session active
                </h3>
                <div
                  style={{
                    background: T.bg,
                    borderRadius: 10,
                    padding: '.9rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    border: `1px solid ${T.cardBorder}`,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 9,
                      background: T.accentLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: T.accent,
                      flexShrink: 0,
                    }}
                  >
                    <I.laptop />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: T.text, fontSize: '.83rem' }}>
                      Session actuelle
                    </p>
                    <p style={{ color: T.textMuted, fontSize: '.72rem', marginTop: '.1rem' }}>
                      Chrome — Tunis, Tunisie — Maintenant
                    </p>
                  </div>
                  <span
                    style={{
                      background: T.successLight,
                      color: T.success,
                      padding: '.18rem .6rem',
                      borderRadius: 999,
                      fontSize: '.68rem',
                      fontWeight: 700,
                    }}
                  >
                    Active
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === 'notifs' && (
            <Card>
              <SectionTitle icon={I.bell} title="Préférences de notifications" />
              <h3
                style={{
                  fontWeight: 700,
                  color: T.textMuted,
                  fontSize: '.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '.1em',
                  marginBottom: '.65rem',
                }}
              >
                Types de notifications
              </h3>
              {[
                {
                  key: 'candidature',
                  l: 'Candidature reçue',
                  d: 'Notifié quand votre candidature est envoyée',
                },
                {
                  key: 'interview',
                  l: 'Invitation entretien',
                  d: 'Notifié pour les convocations à un entretien',
                },
                {
                  key: 'quiz',
                  l: 'Quiz de sélection',
                  d: 'Notifié quand un quiz vous est assigné',
                },
                {
                  key: 'refuse',
                  l: 'Candidature refusée',
                  d: "Notifié si votre candidature n'est pas retenue",
                },
                {
                  key: 'info',
                  l: 'Informations générales',
                  d: 'Nouveaux sujets, mises à jour plateforme',
                },
              ].map((item) => (
                <NotifRow
                  key={item.key}
                  label={item.l}
                  desc={item.d}
                  val={notifPrefs[item.key]}
                  onChange={(v) => setNotifPrefs({ ...notifPrefs, [item.key]: v })}
                />
              ))}

              <h3
                style={{
                  fontWeight: 700,
                  color: T.textMuted,
                  fontSize: '.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '.1em',
                  margin: '1.25rem 0 .65rem',
                }}
              >
                Canaux de notification
              </h3>
              {[
                {
                  key: 'email',
                  l: 'Notifications par email',
                  d: 'Recevoir les notifications sur ' + (user?.email || 'votre email'),
                },
                { key: 'push', l: 'Notifications push', d: 'Notifications dans le navigateur' },
              ].map((item) => (
                <NotifRow
                  key={item.key}
                  label={item.l}
                  desc={item.d}
                  val={notifPrefs[item.key]}
                  onChange={(v) => setNotifPrefs({ ...notifPrefs, [item.key]: v })}
                />
              ))}

              <Btn
                style={{ marginTop: '1.1rem' }}
                onClick={() => showMsg('Préférences de notifications sauvegardées !', 'success')}
              >
                Sauvegarder les préférences
              </Btn>
            </Card>
          )}

          {/* VIE PRIVÉE */}
          {activeSection === 'vie_privee' && (
            <Card>
              <SectionTitle icon={I.shield} title="Confidentialité" />
              <p
                style={{
                  color: T.textMuted,
                  fontSize: '.8rem',
                  lineHeight: 1.65,
                  marginBottom: '1.25rem',
                }}
              >
                Contrôlez qui peut voir vos informations sur la plateforme.
              </p>
              {[
                {
                  key: 'profilPublic',
                  l: 'Profil public',
                  d: 'Les encadrants peuvent voir votre profil complet',
                },
                {
                  key: 'cvVisible',
                  l: 'CV visible',
                  d: 'Votre CV est accessible aux encadrants après candidature',
                },
                {
                  key: 'contactVisible',
                  l: 'Coordonnées visibles',
                  d: 'Email et téléphone visibles sur votre profil',
                },
              ].map((item) => (
                <NotifRow
                  key={item.key}
                  label={item.l}
                  desc={item.d}
                  val={privacy[item.key]}
                  onChange={(v) => setPrivacy({ ...privacy, [item.key]: v })}
                />
              ))}

              <div
                style={{
                  marginTop: '1.25rem',
                  background: T.accentLight,
                  border: `1px solid ${T.accent}30`,
                  borderRadius: 10,
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '.6rem',
                }}
              >
                <span style={{ color: T.accent, flexShrink: 0, marginTop: 2 }}>
                  <I.info />
                </span>
                <div>
                  <p
                    style={{
                      color: T.accent,
                      fontWeight: 700,
                      fontSize: '.8rem',
                      marginBottom: '.25rem',
                    }}
                  >
                    Protection des données
                  </p>
                  <p style={{ color: T.textSoft, fontSize: '.76rem', lineHeight: 1.65 }}>
                    Vos données sont protégées conformément aux lois tunisiennes. Nous ne partageons
                    jamais vos informations avec des tiers sans votre consentement.
                  </p>
                </div>
              </div>
              <Btn
                style={{ marginTop: '1.1rem' }}
                onClick={() => showMsg('Préférences de confidentialité sauvegardées !', 'success')}
              >
                Sauvegarder
              </Btn>
            </Card>
          )}

          {/* ZONE DANGEREUSE */}
          {activeSection === 'danger' && (
            <Card style={{ borderColor: `${T.danger}40`, borderWidth: 1.5 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 800,
                  fontSize: '1rem',
                  color: T.danger,
                  marginBottom: '.65rem',
                }}
              >
                <I.alertTriangle /> Zone dangereuse
              </div>
              <p
                style={{
                  color: T.textMuted,
                  fontSize: '.8rem',
                  lineHeight: 1.7,
                  marginBottom: '1.25rem',
                }}
              >
                Les actions ci-dessous sont permanentes et irréversibles. Agissez avec prudence.
              </p>

              {/* Export */}
              <div
                style={{
                  background: T.bg,
                  borderRadius: 10,
                  padding: '1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: `1px solid ${T.cardBorder}`,
                  flexWrap: 'wrap',
                  gap: '.75rem',
                }}
              >
                <div>
                  <p style={{ fontWeight: 700, color: T.text, fontSize: '.85rem' }}>
                    Télécharger mes données
                  </p>
                  <p style={{ color: T.textMuted, fontSize: '.73rem', marginTop: '.15rem' }}>
                    Exportez toutes vos données au format JSON
                  </p>
                </div>
                <Btn
                  variant="ghost"
                  onClick={() => alert('Export en cours…')}
                  style={{ fontSize: '.8rem' }}
                >
                  <I.download /> Exporter
                </Btn>
              </div>

              {/* Suppression */}
              <div
                style={{
                  background: T.dangerLight,
                  border: `1px solid ${T.danger}40`,
                  borderRadius: 10,
                  padding: '1.1rem',
                }}
              >
                <p
                  style={{
                    fontWeight: 700,
                    color: T.danger,
                    fontSize: '.88rem',
                    marginBottom: '.4rem',
                  }}
                >
                  Supprimer mon compte
                </p>
                <p
                  style={{
                    color: T.textMuted,
                    fontSize: '.78rem',
                    lineHeight: 1.65,
                    marginBottom: '1rem',
                  }}
                >
                  Cette action supprimera définitivement votre compte, vos candidatures et toutes
                  vos données. Irréversible.
                </p>
                {!showDelete ? (
                  <Btn variant="danger" onClick={() => setShowDelete(true)}>
                    Supprimer mon compte
                  </Btn>
                ) : (
                  <div>
                    <p
                      style={{
                        color: T.danger,
                        fontWeight: 600,
                        fontSize: '.82rem',
                        marginBottom: '.65rem',
                      }}
                    >
                      Tapez <strong>SUPPRIMER</strong> pour confirmer :
                    </p>
                    <input
                      style={{ ...iStyle, marginBottom: '.75rem', borderColor: T.danger }}
                      className="inp-f"
                      placeholder="Tapez SUPPRIMER"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '.65rem', flexWrap: 'wrap' }}>
                      <Btn
                        variant="danger"
                        disabled={deleteConfirm !== 'SUPPRIMER'}
                        onClick={() => {
                          if (deleteConfirm === 'SUPPRIMER') {
                            logout();
                            navigate('/accueil');
                          }
                        }}
                      >
                        Confirmer la suppression
                      </Btn>
                      <Btn
                        variant="ghost"
                        onClick={() => {
                          setShowDelete(false);
                          setDeleteConfirm('');
                        }}
                      >
                        Annuler
                      </Btn>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
