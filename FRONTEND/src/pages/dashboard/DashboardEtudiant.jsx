import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import CalendrierPage from './CalendrierPage';

const P = {
  sidebar: '#f0f9fa',
  sidebarBorder: '#d4eaed',
  accent: '#1a7a8a',
  accentLight: '#e6f4f6',
  text: '#1e293b',
  textSoft: '#64748b',
  textMuted: '#94a3b8',
  bg: '#f8fafc',
  white: '#ffffff',
  border: '#e2e8f0',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  purple: '#7c3aed',
};

const NAV = [
  { id: 'accueil', icon: '🏠', label: 'Accueil' },
  { id: 'projet', icon: '📝', label: 'Mon Projet' },
  { id: 'taches', icon: '✅', label: 'Taches' },
  { id: 'calendrier', icon: '📅', label: 'Calendrier' },
  { id: 'messages', icon: '💬', label: 'Messages' },
];

function Sidebar({ active, setActive, user, logout, navigate }) {
  const [col, setCol] = useState(false);
  return (
    <div
      style={{
        width: col ? 60 : 220,
        minHeight: '100vh',
        background: P.sidebar,
        borderRight: `1px solid ${P.sidebarBorder}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width .22s',
        flexShrink: 0,
      }}
    >
      <style>{`
        .sn { display:flex; align-items:center; gap:.7rem; padding:.68rem .85rem; border-radius:8px; cursor:pointer; border:none; background:transparent; width:100%; text-align:left; font-family:Poppins,sans-serif; transition:background .12s; margin-bottom:.15rem; }
        .sn:hover { background:${P.accentLight}; }
        .sn.on { background:${P.accentLight}; border-left:3px solid ${P.accent}; padding-left:calc(.85rem - 3px); }
        .sn .nl { font-size:.84rem; white-space:nowrap; overflow:hidden; }
        .sn.on .nl { color:${P.accent}; font-weight:700; }
        .sn:not(.on) .nl { color:${P.textSoft}; font-weight:500; }
        .sn-icon { font-size:1.05rem; flex-shrink:0; }
      `}</style>

      <div
        style={{
          padding: '1rem .85rem',
          borderBottom: `1px solid ${P.sidebarBorder}`,
          display: 'flex',
          alignItems: 'center',
          gap: '.6rem',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: P.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            flexShrink: 0,
          }}
        >
          🎓
        </div>
        {!col && (
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '.9rem', color: P.text, lineHeight: 1 }}>
              Project
            </div>
            <div
              style={{
                fontWeight: 600,
                fontSize: '.52rem',
                color: P.accent,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
              }}
            >
              Finder
            </div>
          </div>
        )}
        <button
          onClick={() => setCol(!col)}
          style={{
            background: 'transparent',
            border: 'none',
            color: P.textMuted,
            cursor: 'pointer',
            fontSize: '.8rem',
            flexShrink: 0,
            padding: '.2rem',
          }}
        >
          {col ? '›' : '‹'}
        </button>
      </div>

      <div style={{ padding: '.65rem .55rem', flex: 1 }}>
        {!col && (
          <p
            style={{
              color: P.textMuted,
              fontSize: '.64rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              padding: '.3rem .45rem .4rem',
            }}
          >
            Menu
          </p>
        )}
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`sn${active === item.id ? ' on' : ''}`}
            onClick={() => {
              if (item.id === 'messages') {
                navigate('/messagerie');
                return;
              }
              setActive(item.id);
            }}
          >
            <span className="sn-icon">{item.icon}</span>
            {!col && <span className="nl">{item.label}</span>}
          </button>
        ))}
      </div>

      <div style={{ padding: '.55rem', borderTop: `1px solid ${P.sidebarBorder}` }}>
        <button
          className="sn"
          onClick={() => navigate('/profil')}
          style={{ marginBottom: '.1rem' }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: P.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: '#fff',
              fontSize: '.75rem',
              flexShrink: 0,
            }}
          >
            {user?.prenom?.[0]}
            {user?.nom?.[0]}
          </div>
          {!col && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  color: P.text,
                  fontWeight: 600,
                  fontSize: '.78rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.prenom} {user?.nom}
              </p>
              <p style={{ color: P.textMuted, fontSize: '.66rem' }}>Etudiant</p>
            </div>
          )}
        </button>
        <button
          className="sn"
          onClick={() => {
            logout();
            navigate('/accueil');
          }}
        >
          <span className="sn-icon" style={{ fontSize: '.95rem' }}>
            🚪
          </span>
          {!col && (
            <span className="nl" style={{ color: P.danger }}>
              Deconnexion
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color, sub }) {
  return (
    <div
      style={{
        background: P.white,
        borderRadius: 10,
        padding: '1.1rem',
        boxShadow: '0 1px 4px rgba(0,0,0,.05)',
        border: `1px solid ${P.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: '.85rem',
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: color + '14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontWeight: 800, fontSize: '1.45rem', color, lineHeight: 1 }}>{value}</p>
        <p style={{ color: P.text, fontWeight: 600, fontSize: '.78rem', marginTop: '.18rem' }}>
          {label}
        </p>
        {sub && <p style={{ color: P.textMuted, fontSize: '.68rem', marginTop: '.1rem' }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardEtudiant() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('accueil');
  const [profilExtra, setProfilExtra] = useState(null);
  const [projet, setProjet] = useState(null);
  const [taches, setTaches] = useState([]);
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const { data: e } = await API.get('/etudiants/mon-profil');
      setProfilExtra(e);
      try {
        const { data: p } = await API.get('/projets/mon-projet');
        setProjet(p);
      } catch {}
      try {
        const { data: t } = await API.get('/taches/mes-taches');
        setTaches(t);
      } catch {}
      try {
        const { data: c } = await API.get('/candidatures/mes-candidatures');
        setCandidatures(c);
      } catch {}
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const DEMO_TACHES = [
    {
      _id: 't1',
      titre: 'Rediger le chapitre 1 - Introduction',
      statutTache: 'TERMINEE',
      dateEcheance: '2026-03-01',
    },
    {
      _id: 't2',
      titre: 'Developper le module authentification',
      statutTache: 'EN_COURS',
      dateEcheance: '2026-04-25',
    },
    { _id: 't3', titre: 'Tester les API REST', statutTache: 'A_FAIRE', dateEcheance: '2026-05-05' },
    {
      _id: 't4',
      titre: 'Rediger le rapport final',
      statutTache: 'A_FAIRE',
      dateEcheance: '2026-05-20',
    },
  ];

  const tachesAff = taches.length > 0 ? taches : DEMO_TACHES;
  const done = tachesAff.filter((t) => t.statutTache === 'TERMINEE').length;
  const prog = tachesAff.length > 0 ? Math.round((done / tachesAff.length) * 100) : 0;

  const tStatCfg = {
    TERMINEE: { c: P.success, bg: '#ecfdf5' },
    EN_COURS: { c: P.accent, bg: '#e6f4f6' },
    A_FAIRE: { c: P.warning, bg: '#fffbeb' },
  };

  const candCfg = {
    EN_ATTENTE: { c: P.warning, bg: '#fffbeb', l: 'En attente' },
    QUIZ_REQUIS: { c: P.purple, bg: '#ede9fe', l: 'Quiz requis' },
    INTERVIEW: { c: P.success, bg: '#ecfdf5', l: 'Interview' },
    ACCEPTE: { c: P.success, bg: '#ecfdf5', l: 'Accepte' },
    REFUSE: { c: P.danger, bg: '#fef2f2', l: 'Refuse' },
  };

  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          background: P.bg,
          fontFamily: 'Poppins',
        }}
      >
        <p style={{ color: P.accent }}>Chargement...</p>
      </div>
    );

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: 'Poppins, sans-serif',
        background: P.bg,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        .card { background:${P.white}; border-radius:10px; padding:1.2rem; box-shadow:0 1px 4px rgba(0,0,0,.05); border:1px solid ${P.border}; margin-bottom:1.1rem; }
        .t-row { display:flex; align-items:center; gap:.75rem; padding:.72rem .8rem; background:#f8fafc; border-radius:7px; margin-bottom:.38rem; border:1px solid ${P.border}; transition:background .12s; }
        .t-row:hover { background:#f0f9fa; }
        .pg-title { font-weight:700; font-size:1.05rem; color:${P.text}; margin-bottom:1.1rem; }
        .topbar-btn { background:transparent; border:1px solid ${P.border}; color:${P.textSoft}; padding:.4rem .8rem; border-radius:7px; cursor:pointer; font-family:Poppins,sans-serif; font-size:.77rem; font-weight:500; transition:background .12s; }
        .topbar-btn:hover { background:#f1f5f9; }
        .msg-card { background:linear-gradient(135deg,${P.accent},#16A085); border-radius:14px; padding:2.5rem 2rem; text-align:center; cursor:pointer; transition:transform .2s, box-shadow .2s; box-shadow:0 4px 20px rgba(26,122,138,.25); }
        .msg-card:hover { transform:translateY(-3px); box-shadow:0 10px 32px rgba(26,122,138,.35); }
      `}</style>

      <Sidebar
        active={active}
        setActive={setActive}
        user={user}
        logout={logout}
        navigate={navigate}
      />

      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Topbar */}
        <div
          style={{
            background: P.white,
            borderBottom: `1px solid ${P.border}`,
            padding: '.8rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            boxShadow: '0 1px 4px rgba(0,0,0,.04)',
          }}
        >
          <h1 style={{ fontWeight: 700, color: P.text, fontSize: '.97rem' }}>
            {NAV.find((n) => n.id === active)?.icon} {NAV.find((n) => n.id === active)?.label}
          </h1>
          <div style={{ display: 'flex', gap: '.55rem', alignItems: 'center' }}>
            <button className="topbar-btn" onClick={() => navigate('/notifications')}>
              🔔
            </button>
            <button className="topbar-btn" onClick={() => navigate('/messagerie')}>
              💬
            </button>
            <button className="topbar-btn" onClick={() => navigate('/parametres')}>
              ⚙️
            </button>
            <button
              onClick={() => navigate('/profil')}
              style={{
                background: P.accent,
                color: '#fff',
                border: 'none',
                padding: '.42rem .95rem',
                borderRadius: 7,
                cursor: 'pointer',
                fontFamily: 'Poppins,sans-serif',
                fontSize: '.78rem',
                fontWeight: 600,
              }}
            >
              Mon profil
            </button>
          </div>
        </div>

        <div style={{ padding: '1.5rem 1.75rem' }}>
          {/* ── ACCUEIL ── */}
          {active === 'accueil' && (
            <div>
              <div
                style={{
                  background: `linear-gradient(135deg,${P.accent},#16A085)`,
                  borderRadius: 12,
                  padding: '1.5rem 1.75rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -30,
                    right: 120,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,.07)',
                    pointerEvents: 'none',
                  }}
                />
                <div>
                  <p
                    style={{
                      color: 'rgba(255,255,255,.72)',
                      fontSize: '.8rem',
                      marginBottom: '.3rem',
                    }}
                  >
                    Bonjour 👋
                  </p>
                  <h2
                    style={{
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '1.3rem',
                      marginBottom: '.3rem',
                    }}
                  >
                    {user?.prenom} {user?.nom}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,.72)', fontSize: '.83rem' }}>
                    Statut :{' '}
                    <strong style={{ color: '#F5C518' }}>
                      {profilExtra?.statutPFE?.replace(/_/g, ' ') || 'Non affecte'}
                    </strong>
                  </p>
                </div>
                <div style={{ fontSize: '2.8rem', opacity: 0.18 }}>🎓</div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(175px,1fr))',
                  gap: '.9rem',
                  marginBottom: '1.5rem',
                }}
              >
                <StatCard
                  icon="✅"
                  value={`${prog}%`}
                  label="Progression"
                  color={P.success}
                  sub={`${done}/${tachesAff.length} taches`}
                />
                <StatCard
                  icon="📨"
                  value={candidatures.length || 0}
                  label="Candidatures"
                  color={P.purple}
                  sub="Soumises"
                />
                <StatCard
                  icon="📝"
                  value={tachesAff.length}
                  label="Taches totales"
                  color={P.accent}
                  sub={`${tachesAff.filter((t) => t.statutTache === 'A_FAIRE').length} a faire`}
                />
                <StatCard icon="📅" value="3" label="Reunions" color={P.warning} sub="Ce mois" />
              </div>

              <div className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '.8rem',
                  }}
                >
                  <div>
                    <h3 style={{ fontWeight: 700, color: P.text, fontSize: '.88rem' }}>
                      Avancement PFE
                    </h3>
                    <p style={{ color: P.textMuted, fontSize: '.72rem', marginTop: '.12rem' }}>
                      {done}/{tachesAff.length} taches terminees
                    </p>
                  </div>
                  <span style={{ fontWeight: 800, color: P.accent, fontSize: '1.2rem' }}>
                    {prog}%
                  </span>
                </div>
                <div
                  style={{
                    background: '#f1f5f9',
                    borderRadius: 100,
                    height: 9,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${prog}%`,
                      background: `linear-gradient(90deg,${P.accent},${P.success})`,
                      height: '100%',
                      borderRadius: 100,
                      transition: 'width .5s',
                    }}
                  />
                </div>
              </div>

              <div className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '.9rem',
                  }}
                >
                  <h3 style={{ fontWeight: 700, color: P.text, fontSize: '.88rem' }}>
                    Taches recentes
                  </h3>
                  <button
                    onClick={() => setActive('taches')}
                    style={{
                      color: P.accent,
                      fontSize: '.76rem',
                      fontWeight: 600,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Voir tout →
                  </button>
                </div>
                {tachesAff.slice(0, 4).map((t) => {
                  const ts = tStatCfg[t.statutTache] || { c: '#64748b', bg: '#f8fafc' };
                  return (
                    <div key={t._id} className="t-row">
                      <div
                        style={{
                          width: 17,
                          height: 17,
                          borderRadius: 4,
                          border:
                            t.statutTache === 'TERMINEE'
                              ? `2px solid ${P.success}`
                              : '2px solid #cbd5e1',
                          background: t.statutTache === 'TERMINEE' ? P.success : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {t.statutTache === 'TERMINEE' && (
                          <span style={{ color: '#fff', fontSize: '.55rem' }}>✓</span>
                        )}
                      </div>
                      <span
                        style={{
                          flex: 1,
                          color: t.statutTache === 'TERMINEE' ? P.textMuted : P.text,
                          fontSize: '.82rem',
                          fontWeight: 500,
                          textDecoration: t.statutTache === 'TERMINEE' ? 'line-through' : 'none',
                        }}
                      >
                        {t.titre}
                      </span>
                      <span
                        style={{
                          background: ts.bg,
                          color: ts.c,
                          padding: '.14rem .58rem',
                          borderRadius: 100,
                          fontSize: '.68rem',
                          fontWeight: 700,
                        }}
                      >
                        {t.statutTache?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {candidatures.length > 0 && (
                <div className="card">
                  <h3
                    style={{
                      fontWeight: 700,
                      color: P.text,
                      fontSize: '.88rem',
                      marginBottom: '.9rem',
                    }}
                  >
                    Mes candidatures
                  </h3>
                  {candidatures.map((c) => {
                    const sc = candCfg[c.statut] || { c: '#64748b', bg: '#f8fafc', l: c.statut };
                    return (
                      <div
                        key={c._id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '.7rem .8rem',
                          background: '#f8fafc',
                          borderRadius: 7,
                          marginBottom: '.38rem',
                          border: `1px solid ${P.border}`,
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: 600, color: P.text, fontSize: '.82rem' }}>
                            {c.idSujet?.titre || 'Sujet PFE'}
                          </p>
                          <p style={{ color: P.textMuted, fontSize: '.71rem', marginTop: '.1rem' }}>
                            Score IA : <strong style={{ color: P.accent }}>{c.scoreIA}/100</strong>
                          </p>
                        </div>
                        <span
                          style={{
                            background: sc.bg,
                            color: sc.c,
                            padding: '.18rem .65rem',
                            borderRadius: 100,
                            fontSize: '.68rem',
                            fontWeight: 700,
                          }}
                        >
                          {sc.l}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── PROJET ── */}
          {active === 'projet' && (
            <div>
              <h2 className="pg-title">Mon Projet PFE</h2>
              {projet ? (
                <div className="card">
                  <h3
                    style={{
                      fontWeight: 700,
                      color: P.text,
                      fontSize: '.97rem',
                      marginBottom: '.6rem',
                    }}
                  >
                    {projet.titre || projet.idSujet?.titre}
                  </h3>
                  <p
                    style={{
                      color: P.textSoft,
                      fontSize: '.85rem',
                      lineHeight: 1.7,
                      marginBottom: '.9rem',
                    }}
                  >
                    {projet.idSujet?.description}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      gap: '.3rem',
                      flexWrap: 'wrap',
                      marginBottom: '.9rem',
                    }}
                  >
                    {projet.idSujet?.technologies?.map((t, i) => (
                      <span
                        key={i}
                        style={{
                          background: P.accentLight,
                          color: P.accent,
                          padding: '.16rem .55rem',
                          borderRadius: 100,
                          fontSize: '.71rem',
                          fontWeight: 600,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.9rem' }}
                  >
                    {[
                      { l: 'Statut', v: projet.statutProjet },
                      {
                        l: 'Debut',
                        v: projet.dateDebut
                          ? new Date(projet.dateDebut).toLocaleDateString('fr-FR')
                          : '-',
                      },
                      {
                        l: 'Fin',
                        v: projet.dateFin
                          ? new Date(projet.dateFin).toLocaleDateString('fr-FR')
                          : '-',
                      },
                    ].map((item) => (
                      <div
                        key={item.l}
                        style={{
                          background: '#f8fafc',
                          borderRadius: 7,
                          padding: '.85rem',
                          textAlign: 'center',
                        }}
                      >
                        <p style={{ color: P.textMuted, fontSize: '.7rem', marginBottom: '.3rem' }}>
                          {item.l}
                        </p>
                        <p style={{ fontWeight: 700, color: P.text, fontSize: '.82rem' }}>
                          {item.v || '-'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>📝</div>
                  <p style={{ color: P.textMuted, fontSize: '.9rem', marginBottom: '1.1rem' }}>
                    Pas encore de projet PFE
                  </p>
                  <button
                    onClick={() => navigate('/sujets')}
                    style={{
                      background: P.accent,
                      color: '#fff',
                      border: 'none',
                      padding: '.75rem 1.5rem',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontFamily: 'Poppins,sans-serif',
                      fontWeight: 600,
                      fontSize: '.85rem',
                    }}
                  >
                    Voir les sujets →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── TACHES ── */}
          {active === 'taches' && (
            <div>
              <h2 className="pg-title">Mes Taches</h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3,1fr)',
                  gap: '.9rem',
                  marginBottom: '1.25rem',
                }}
              >
                {[
                  {
                    l: 'A faire',
                    n: tachesAff.filter((t) => t.statutTache === 'A_FAIRE').length,
                    c: P.warning,
                    bg: '#fffbeb',
                  },
                  {
                    l: 'En cours',
                    n: tachesAff.filter((t) => t.statutTache === 'EN_COURS').length,
                    c: P.accent,
                    bg: P.accentLight,
                  },
                  {
                    l: 'Terminees',
                    n: tachesAff.filter((t) => t.statutTache === 'TERMINEE').length,
                    c: P.success,
                    bg: '#ecfdf5',
                  },
                ].map((s) => (
                  <div
                    key={s.l}
                    style={{
                      background: s.bg,
                      borderRadius: 10,
                      padding: '1.1rem',
                      textAlign: 'center',
                      border: `1px solid ${P.border}`,
                    }}
                  >
                    <p style={{ fontWeight: 800, fontSize: '1.8rem', color: s.c }}>{s.n}</p>
                    <p
                      style={{
                        color: P.textSoft,
                        fontSize: '.78rem',
                        fontWeight: 500,
                        marginTop: '.2rem',
                      }}
                    >
                      {s.l}
                    </p>
                  </div>
                ))}
              </div>
              <div className="card">
                {tachesAff.map((t) => {
                  const ts = tStatCfg[t.statutTache] || { c: '#64748b', bg: '#f8fafc' };
                  return (
                    <div key={t._id} className="t-row">
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          border:
                            t.statutTache === 'TERMINEE'
                              ? `2px solid ${P.success}`
                              : '2px solid #cbd5e1',
                          background: t.statutTache === 'TERMINEE' ? P.success : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {t.statutTache === 'TERMINEE' && (
                          <span style={{ color: '#fff', fontSize: '.57rem' }}>✓</span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            color: t.statutTache === 'TERMINEE' ? P.textMuted : P.text,
                            fontWeight: 600,
                            fontSize: '.83rem',
                            textDecoration: t.statutTache === 'TERMINEE' ? 'line-through' : 'none',
                          }}
                        >
                          {t.titre}
                        </p>
                        {t.dateEcheance && (
                          <p style={{ color: P.textMuted, fontSize: '.69rem', marginTop: '.1rem' }}>
                            Echeance : {new Date(t.dateEcheance).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                      <span
                        style={{
                          background: ts.bg,
                          color: ts.c,
                          padding: '.16rem .62rem',
                          borderRadius: 100,
                          fontSize: '.68rem',
                          fontWeight: 700,
                        }}
                      >
                        {t.statutTache?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── CALENDRIER ── */}
          {active === 'calendrier' && (
            <div>
              <h2 className="pg-title">Calendrier</h2>
              <CalendrierPage role="ETUDIANT" accentColor={P.accent} />
            </div>
          )}

          {/* ── MESSAGES → redirige vers /messagerie ── */}
          {active === 'messages' && (
            <div>
              <h2 className="pg-title">Messages</h2>
              <div className="msg-card" onClick={() => navigate('/messagerie')}>
                <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>💬</div>
                <h3
                  style={{
                    fontWeight: 800,
                    color: '#fff',
                    fontSize: '1.1rem',
                    marginBottom: '.4rem',
                  }}
                >
                  Ouvrir la Messagerie
                </h3>
                <p
                  style={{
                    color: 'rgba(255,255,255,.75)',
                    fontSize: '.85rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  Communiquez directement avec votre encadrant
                </p>
                <span
                  style={{
                    background: 'rgba(255,255,255,.2)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,.3)',
                    borderRadius: 8,
                    padding: '.55rem 1.4rem',
                    fontSize: '.85rem',
                    fontWeight: 600,
                  }}
                >
                  Acceder a la messagerie →
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
