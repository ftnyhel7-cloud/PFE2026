import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const TEAL = '#1a7a8a';
const YELLOW = '#F5C518';
const DARK = '#0d1f30';

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
      showMsg('Informations sauvegardees avec succes !', 'success');
    } catch (err) {
      showMsg('Erreur : ' + (err.response?.data?.message || 'Echec'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeMdp = async (e) => {
    e.preventDefault();
    if (mdpData.nouveau !== mdpData.confirmer)
      return showMsg('Les mots de passe ne correspondent pas', 'error');
    if (mdpData.nouveau.length < 8) return showMsg('Minimum 8 caracteres requis', 'error');
    setSaving(true);
    try {
      await API.put('/auth/profile', { mot_de_passe: mdpData.nouveau });
      showMsg('Mot de passe change avec succes !', 'success');
      setMdpData({ nouveau: '', confirmer: '' });
    } catch (err) {
      showMsg('Erreur : ' + (err.response?.data?.message || 'Echec'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'profil', icon: '👤', label: 'Informations personnelles' },
    { id: 'liens', icon: '🔗', label: 'Liens & Reseaux' },
    { id: 'securite', icon: '🔒', label: 'Securite' },
    { id: 'notifs', icon: '🔔', label: 'Notifications' },
    { id: 'vie_privee', icon: '🛡️', label: 'Vie privee' },
    { id: 'danger', icon: '⚠️', label: 'Zone dangereuse' },
  ];

  const iStyle = {
    width: '100%',
    padding: '.82rem 1rem',
    borderRadius: 10,
    border: '1.5px solid #e0e0e0',
    fontSize: '.88rem',
    outline: 'none',
    fontFamily: 'Poppins,sans-serif',
    color: '#333',
    background: '#fff',
    transition: 'border-color .2s',
  };
  const lStyle = {
    display: 'block',
    color: '#555',
    fontSize: '.8rem',
    fontWeight: 600,
    marginBottom: '.38rem',
  };

  const MsgBox = () =>
    msg.text ? (
      <div
        style={{
          padding: '.82rem 1rem',
          borderRadius: 10,
          marginBottom: '1rem',
          fontSize: '.85rem',
          background: msg.type === 'success' ? 'rgba(39,174,96,.08)' : 'rgba(231,76,60,.08)',
          color: msg.type === 'success' ? '#27AE60' : '#c0392b',
          border: `1px solid ${msg.type === 'success' ? 'rgba(39,174,96,.2)' : 'rgba(231,76,60,.2)'}`,
        }}
      >
        {msg.type === 'success' ? '✅' : '⚠'} {msg.text}
      </div>
    ) : null;

  const Toggle = ({ val, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!val)}
      style={{
        width: 48,
        height: 26,
        borderRadius: 100,
        background: val ? TEAL : '#d0d0d0',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background .25s',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: val ? 25 : 3,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left .25s',
          boxShadow: '0 1px 4px rgba(0,0,0,.2)',
        }}
      />
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fa', fontFamily: 'Poppins, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        .hexshape { clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); }
        .sect-btn { width:100%; display:flex; align-items:center; gap:.85rem; padding:.85rem 1.1rem; border-radius:12px; border:none; cursor:pointer; font-family:Poppins,sans-serif; font-size:.87rem; font-weight:500; transition:all .2s; text-align:left; }
        .sect-btn.on { background:${TEAL}; color:#fff; }
        .sect-btn:not(.on) { background:transparent; color:#555; }
        .sect-btn:not(.on):hover { background:rgba(26,122,138,.07); color:${TEAL}; }
        .card { background:#fff; border-radius:16px; padding:1.75rem; margin-bottom:1.5rem; box-shadow:0 3px 16px rgba(0,0,0,.06); border:1px solid #eee; }
        .inp-f:focus { border-color:${TEAL}; box-shadow:0 0 0 3px rgba(26,122,138,.07); outline:none; }
        .inp-f::placeholder { color:#ccc; }
        .btn-pri { background:linear-gradient(135deg,${TEAL},#16A085); color:#fff; border:none; padding:.85rem 2rem; border-radius:10px; font-size:.9rem; font-weight:700; cursor:pointer; font-family:Poppins,sans-serif; transition:all .25s; }
        .btn-pri:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(26,122,138,.3); }
        .btn-pri:disabled { opacity:.5; cursor:not-allowed; transform:none; }
        .btn-ghost { background:transparent; border:1.5px solid #e0e0e0; color:#666; padding:.85rem 1.5rem; border-radius:10px; cursor:pointer; font-family:Poppins,sans-serif; font-size:.88rem; transition:all .2s; }
        .btn-ghost:hover { background:#f5f5f5; }
        .btn-danger { background:rgba(231,76,60,.08); color:#c0392b; border:1.5px solid rgba(231,76,60,.25); padding:.85rem 2rem; border-radius:10px; cursor:pointer; font-family:Poppins,sans-serif; font-size:.9rem; font-weight:600; }
        .btn-danger:hover { background:rgba(231,76,60,.15); }
        .pwd-wrap { position:relative; }
        .pwd-eye { position:absolute; right:.9rem; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#aaa; font-size:.75rem; font-family:Poppins,sans-serif; }
        .pwd-eye:hover { color:${TEAL}; }
        input::placeholder, textarea::placeholder { color:#ccc; }
        textarea { resize:vertical; font-family:Poppins,sans-serif; }
        .notif-row { display:flex; justify-content:space-between; align-items:center; padding:.85rem 0; border-bottom:1px solid #f5f5f5; }
        .notif-row:last-child { border-bottom:none; }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg,${DARK},#1a3a5c)`,
          padding: '1rem 2.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div
          className="hexshape"
          style={{
            width: 40,
            height: 40,
            background: YELLOW,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
          }}
        >
          🎓
        </div>
        <div>
          <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', lineHeight: 1 }}>
            Parametres
          </h1>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.75rem', marginTop: '.15rem' }}>
            Gerez vos informations et preferences
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            marginLeft: 'auto',
            background: 'rgba(255,255,255,.1)',
            border: '1px solid rgba(255,255,255,.2)',
            color: '#fff',
            padding: '.5rem 1.1rem',
            borderRadius: 8,
            cursor: 'pointer',
            fontFamily: 'Poppins,sans-serif',
            fontSize: '.83rem',
          }}
        >
          ← Retour
        </button>
      </div>

      <div
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          padding: '2rem',
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          gap: '1.5rem',
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: '1rem',
            boxShadow: '0 3px 16px rgba(0,0,0,.06)',
            border: '1px solid #eee',
            height: 'fit-content',
            position: 'sticky',
            top: '1rem',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              textAlign: 'center',
              padding: '1.25rem 1rem',
              borderBottom: '1px solid #f0f0f0',
              marginBottom: '.75rem',
            }}
          >
            <div
              className="hexshape"
              style={{
                width: 64,
                height: 64,
                background: `linear-gradient(135deg,${YELLOW},#E67E22)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 800,
                color: DARK,
                margin: '0 auto .75rem',
              }}
            >
              {user?.prenom?.[0]}
              {user?.nom?.[0]}
            </div>
            <p style={{ fontWeight: 700, color: DARK, fontSize: '.88rem' }}>
              {user?.prenom} {user?.nom}
            </p>
            <p style={{ color: '#999', fontSize: '.73rem', marginTop: '.15rem' }}>{user?.role}</p>
          </div>
          {sections.map((s) => (
            <button
              key={s.id}
              className={'sect-btn' + (activeSection === s.id ? ' on' : '')}
              onClick={() => setActiveSection(s.id)}
            >
              <span style={{ fontSize: '1rem' }}>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div>
          <MsgBox />

          {/* PROFIL */}
          {activeSection === 'profil' && (
            <div className="card">
              <h2
                style={{
                  fontWeight: 800,
                  color: DARK,
                  fontSize: '1.05rem',
                  marginBottom: '1.5rem',
                }}
              >
                👤 Informations personnelles
              </h2>
              <form
                onSubmit={handleSaveProfil}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                    <label style={lStyle}>Prenom</label>
                    <input
                      style={iStyle}
                      className="inp-f"
                      placeholder="Votre prenom"
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
                  <label style={lStyle}>Numero de telephone</label>
                  <input
                    style={iStyle}
                    className="inp-f"
                    placeholder="+216 XX XXX XXX"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  />
                </div>
                <div>
                  <label style={lStyle}>Bio / Presentation</label>
                  <textarea
                    rows={4}
                    style={iStyle}
                    className="inp-f"
                    placeholder="Decrivez-vous en quelques mots..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-pri"
                  disabled={saving}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                </button>
              </form>
            </div>
          )}

          {/* LIENS */}
          {activeSection === 'liens' && (
            <div className="card">
              <h2
                style={{ fontWeight: 800, color: DARK, fontSize: '1.05rem', marginBottom: '.5rem' }}
              >
                🔗 Liens & Reseaux sociaux
              </h2>
              <p
                style={{
                  color: '#888',
                  fontSize: '.83rem',
                  marginBottom: '1.5rem',
                  lineHeight: 1.6,
                }}
              >
                Ajoutez vos liens professionnels pour enrichir votre profil et ameliorer vos chances
                de selection.
              </p>
              <form
                onSubmit={handleSaveProfil}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
              >
                <div>
                  <label style={lStyle}>LinkedIn</label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#0077B5',
                        fontWeight: 700,
                        fontSize: '.85rem',
                      }}
                    >
                      in
                    </span>
                    <input
                      style={{ ...iStyle, paddingLeft: '2.5rem' }}
                      className="inp-f"
                      placeholder="https://linkedin.com/in/votre-profil"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label style={lStyle}>Portfolio personnel</label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: TEAL,
                        fontSize: '.85rem',
                      }}
                    >
                      🌐
                    </span>
                    <input
                      style={{ ...iStyle, paddingLeft: '2.5rem' }}
                      className="inp-f"
                      placeholder="https://votre-portfolio.com"
                      value={formData.portfolio}
                      onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label style={lStyle}>GitHub</label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#333',
                        fontWeight: 700,
                        fontSize: '.85rem',
                      }}
                    >
                      GH
                    </span>
                    <input
                      style={{ ...iStyle, paddingLeft: '2.5rem' }}
                      className="inp-f"
                      placeholder="https://github.com/votre-username"
                    />
                  </div>
                </div>
                <div>
                  <label style={lStyle}>Behance / Dribbble</label>
                  <input
                    style={iStyle}
                    className="inp-f"
                    placeholder="https://www.behance.net/..."
                  />
                </div>

                {/* Preview */}
                {(formData.linkedin || formData.portfolio) && (
                  <div
                    style={{
                      background: 'rgba(26,122,138,.06)',
                      border: '1px solid rgba(26,122,138,.15)',
                      borderRadius: 12,
                      padding: '1rem',
                      marginTop: '.5rem',
                    }}
                  >
                    <p
                      style={{
                        color: TEAL,
                        fontWeight: 700,
                        fontSize: '.82rem',
                        marginBottom: '.6rem',
                      }}
                    >
                      Apercu de votre profil :
                    </p>
                    {formData.linkedin && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '.5rem',
                          marginBottom: '.4rem',
                        }}
                      >
                        <span style={{ color: '#0077B5', fontWeight: 700, fontSize: '.82rem' }}>
                          LinkedIn
                        </span>
                        <a
                          href={formData.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: TEAL, fontSize: '.8rem' }}
                        >
                          → Voir
                        </a>
                      </div>
                    )}
                    {formData.portfolio && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <span style={{ color: TEAL, fontWeight: 700, fontSize: '.82rem' }}>
                          Portfolio
                        </span>
                        <a
                          href={formData.portfolio}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: TEAL, fontSize: '.8rem' }}
                        >
                          → Voir
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-pri"
                  disabled={saving}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {saving ? 'Sauvegarde...' : 'Sauvegarder les liens'}
                </button>
              </form>
            </div>
          )}

          {/* SECURITE */}
          {activeSection === 'securite' && (
            <div className="card">
              <h2
                style={{
                  fontWeight: 800,
                  color: DARK,
                  fontSize: '1.05rem',
                  marginBottom: '1.5rem',
                }}
              >
                🔒 Changer le mot de passe
              </h2>
              <form
                onSubmit={handleChangeMdp}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <div>
                  <label style={lStyle}>Nouveau mot de passe</label>
                  <div className="pwd-wrap">
                    <input
                      type={voir1 ? 'text' : 'password'}
                      style={{ ...iStyle, paddingRight: '5rem' }}
                      className="inp-f"
                      placeholder="Minimum 8 caracteres"
                      value={mdpData.nouveau}
                      onChange={(e) => setMdpData({ ...mdpData, nouveau: e.target.value })}
                      required
                    />
                    <button type="button" className="pwd-eye" onClick={() => setVoir1(!voir1)}>
                      {voir1 ? '🙈 Cacher' : '👁 Voir'}
                    </button>
                  </div>
                  {mdpData.nouveau.length > 0 && (
                    <div style={{ marginTop: '.5rem' }}>
                      <div
                        style={{
                          height: 4,
                          borderRadius: 2,
                          background: '#eee',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            borderRadius: 2,
                            width:
                              mdpData.nouveau.length < 6
                                ? '30%'
                                : mdpData.nouveau.length < 10
                                  ? '65%'
                                  : '100%',
                            background:
                              mdpData.nouveau.length < 6
                                ? '#E74C3C'
                                : mdpData.nouveau.length < 10
                                  ? YELLOW
                                  : '#27AE60',
                            transition: 'all .3s',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: '.72rem',
                          color:
                            mdpData.nouveau.length < 6
                              ? '#E74C3C'
                              : mdpData.nouveau.length < 10
                                ? '#E67E22'
                                : '#27AE60',
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
                        paddingRight: '5rem',
                        borderColor:
                          mdpData.confirmer && mdpData.nouveau !== mdpData.confirmer
                            ? '#E74C3C'
                            : undefined,
                      }}
                      className="inp-f"
                      placeholder="Repetez le mot de passe"
                      value={mdpData.confirmer}
                      onChange={(e) => setMdpData({ ...mdpData, confirmer: e.target.value })}
                      required
                    />
                    <button type="button" className="pwd-eye" onClick={() => setVoir2(!voir2)}>
                      {voir2 ? '🙈 Cacher' : '👁 Voir'}
                    </button>
                  </div>
                  {mdpData.confirmer && mdpData.nouveau !== mdpData.confirmer && (
                    <p style={{ color: '#E74C3C', fontSize: '.73rem', marginTop: '.3rem' }}>
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn-pri"
                  disabled={saving}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {saving ? 'Changement...' : 'Changer le mot de passe'}
                </button>
              </form>

              <div
                style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f0f0f0' }}
              >
                <h3
                  style={{ fontWeight: 700, color: DARK, fontSize: '.92rem', marginBottom: '1rem' }}
                >
                  Sessions actives
                </h3>
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: 12,
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>💻</span>
                  <div>
                    <p style={{ fontWeight: 600, color: DARK, fontSize: '.85rem' }}>
                      Session actuelle
                    </p>
                    <p style={{ color: '#aaa', fontSize: '.75rem' }}>
                      Chrome — Tunis, Tunisie — Maintenant
                    </p>
                  </div>
                  <span
                    style={{
                      marginLeft: 'auto',
                      background: 'rgba(39,174,96,.1)',
                      color: '#27AE60',
                      padding: '.2rem .65rem',
                      borderRadius: 100,
                      fontSize: '.72rem',
                      fontWeight: 700,
                    }}
                  >
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === 'notifs' && (
            <div className="card">
              <h2
                style={{
                  fontWeight: 800,
                  color: DARK,
                  fontSize: '1.05rem',
                  marginBottom: '1.5rem',
                }}
              >
                🔔 Preferences de notifications
              </h2>

              <h3
                style={{
                  fontWeight: 700,
                  color: '#555',
                  fontSize: '.85rem',
                  marginBottom: '.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                }}
              >
                Types de notifications
              </h3>
              {[
                {
                  key: 'candidature',
                  l: 'Candidature recue',
                  d: 'Notifie quand votre candidature est envoyee',
                },
                {
                  key: 'interview',
                  l: 'Invitation entretien',
                  d: 'Notifie pour les convocations a un entretien',
                },
                {
                  key: 'quiz',
                  l: 'Quiz de selection',
                  d: 'Notifie quand un quiz vous est assigne',
                },
                {
                  key: 'refuse',
                  l: 'Candidature refusee',
                  d: "Notifie si votre candidature n'est pas retenue",
                },
                {
                  key: 'info',
                  l: 'Informations generales',
                  d: 'Nouveaux sujets, mises a jour plateforme',
                },
              ].map((item) => (
                <div key={item.key} className="notif-row">
                  <div>
                    <p style={{ fontWeight: 600, color: DARK, fontSize: '.87rem' }}>{item.l}</p>
                    <p style={{ color: '#aaa', fontSize: '.75rem', marginTop: '.15rem' }}>
                      {item.d}
                    </p>
                  </div>
                  <Toggle
                    val={notifPrefs[item.key]}
                    onChange={(v) => setNotifPrefs({ ...notifPrefs, [item.key]: v })}
                  />
                </div>
              ))}

              <div
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid #f0f0f0',
                }}
              >
                <h3
                  style={{
                    fontWeight: 700,
                    color: '#555',
                    fontSize: '.85rem',
                    marginBottom: '.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
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
                  <div key={item.key} className="notif-row">
                    <div>
                      <p style={{ fontWeight: 600, color: DARK, fontSize: '.87rem' }}>{item.l}</p>
                      <p style={{ color: '#aaa', fontSize: '.75rem', marginTop: '.15rem' }}>
                        {item.d}
                      </p>
                    </div>
                    <Toggle
                      val={notifPrefs[item.key]}
                      onChange={(v) => setNotifPrefs({ ...notifPrefs, [item.key]: v })}
                    />
                  </div>
                ))}
              </div>

              <button
                className="btn-pri"
                style={{ marginTop: '1.25rem' }}
                onClick={() => showMsg('Preferences de notifications sauvegardees !', 'success')}
              >
                Sauvegarder les preferences
              </button>
            </div>
          )}

          {/* VIE PRIVEE */}
          {activeSection === 'vie_privee' && (
            <div className="card">
              <h2
                style={{ fontWeight: 800, color: DARK, fontSize: '1.05rem', marginBottom: '.5rem' }}
              >
                🛡️ Confidentialite
              </h2>
              <p
                style={{
                  color: '#888',
                  fontSize: '.83rem',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                }}
              >
                Controlez qui peut voir vos informations sur la plateforme.
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
                  d: 'Votre CV est accessible aux encadrants apres candidature',
                },
                {
                  key: 'contactVisible',
                  l: 'Coordonnees visibles',
                  d: 'Email et telephone visibles sur votre profil',
                },
              ].map((item) => (
                <div key={item.key} className="notif-row">
                  <div>
                    <p style={{ fontWeight: 600, color: DARK, fontSize: '.87rem' }}>{item.l}</p>
                    <p style={{ color: '#aaa', fontSize: '.75rem', marginTop: '.15rem' }}>
                      {item.d}
                    </p>
                  </div>
                  <Toggle
                    val={privacy[item.key]}
                    onChange={(v) => setPrivacy({ ...privacy, [item.key]: v })}
                  />
                </div>
              ))}

              <div
                style={{
                  marginTop: '1.5rem',
                  background: 'rgba(26,122,138,.06)',
                  border: '1px solid rgba(26,122,138,.15)',
                  borderRadius: 12,
                  padding: '1rem',
                }}
              >
                <p
                  style={{
                    color: TEAL,
                    fontWeight: 600,
                    fontSize: '.83rem',
                    marginBottom: '.4rem',
                  }}
                >
                  ℹ Info protection des donnees
                </p>
                <p style={{ color: '#777', fontSize: '.78rem', lineHeight: 1.65 }}>
                  Vos donnees sont protegees conformement aux lois tunisiennes sur la protection des
                  donnees personnelles. Nous ne partageons jamais vos informations avec des tiers
                  sans votre consentement.
                </p>
              </div>

              <button
                className="btn-pri"
                style={{ marginTop: '1.25rem' }}
                onClick={() => showMsg('Preferences de confidentialite sauvegardees !', 'success')}
              >
                Sauvegarder
              </button>
            </div>
          )}

          {/* DANGER */}
          {activeSection === 'danger' && (
            <div className="card" style={{ borderColor: 'rgba(231,76,60,.2)', borderWidth: 1.5 }}>
              <h2
                style={{
                  fontWeight: 800,
                  color: '#c0392b',
                  fontSize: '1.05rem',
                  marginBottom: '.75rem',
                }}
              >
                ⚠️ Zone dangereuse
              </h2>
              <p
                style={{
                  color: '#888',
                  fontSize: '.83rem',
                  lineHeight: 1.7,
                  marginBottom: '1.5rem',
                }}
              >
                Les actions ci-dessous sont permanentes et irreversibles. Agissez avec prudence.
              </p>

              {/* Export donnees */}
              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: 12,
                  padding: '1.25rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ fontWeight: 700, color: DARK, fontSize: '.88rem' }}>
                    Telecharger mes donnees
                  </p>
                  <p style={{ color: '#aaa', fontSize: '.75rem', marginTop: '.2rem' }}>
                    Exportez toutes vos donnees au format JSON
                  </p>
                </div>
                <button
                  className="btn-ghost"
                  style={{ fontSize: '.82rem', padding: '.55rem 1.1rem' }}
                  onClick={() => alert('Export en cours...')}
                >
                  Exporter
                </button>
              </div>

              {/* Suppression */}
              <div
                style={{
                  background: 'rgba(231,76,60,.04)',
                  border: '1px solid rgba(231,76,60,.15)',
                  borderRadius: 12,
                  padding: '1.25rem',
                }}
              >
                <p
                  style={{
                    fontWeight: 700,
                    color: '#c0392b',
                    fontSize: '.88rem',
                    marginBottom: '.5rem',
                  }}
                >
                  Supprimer mon compte
                </p>
                <p
                  style={{
                    color: '#888',
                    fontSize: '.78rem',
                    lineHeight: 1.65,
                    marginBottom: '1.25rem',
                  }}
                >
                  Cette action supprimera definitivement votre compte, vos candidatures et toutes
                  vos donnees. Cette action est irreversible.
                </p>

                {!showDelete ? (
                  <button className="btn-danger" onClick={() => setShowDelete(true)}>
                    🗑️ Supprimer mon compte
                  </button>
                ) : (
                  <div>
                    <p
                      style={{
                        color: '#c0392b',
                        fontWeight: 600,
                        fontSize: '.85rem',
                        marginBottom: '.75rem',
                      }}
                    >
                      Tapez <strong>SUPPRIMER</strong> pour confirmer :
                    </p>
                    <input
                      style={{ ...iStyle, marginBottom: '.75rem', borderColor: '#E74C3C' }}
                      placeholder="Tapez SUPPRIMER"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '.75rem' }}>
                      <button
                        className="btn-danger"
                        disabled={deleteConfirm !== 'SUPPRIMER'}
                        style={{ opacity: deleteConfirm !== 'SUPPRIMER' ? 0.4 : 1 }}
                        onClick={() => {
                          if (deleteConfirm === 'SUPPRIMER') {
                            logout();
                            navigate('/accueil');
                          }
                        }}
                      >
                        Confirmer la suppression
                      </button>
                      <button
                        className="btn-ghost"
                        onClick={() => {
                          setShowDelete(false);
                          setDeleteConfirm('');
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
