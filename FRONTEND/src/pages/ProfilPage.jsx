import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const YELLOW = '#F5C518';
const TEAL = '#1a7a8a';
const DARK = '#0d1f30';

function CVUploader({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [drag, setDrag] = useState(false);

  const upload = async () => {
    if (!file) return setMsg('Selectionnez un fichier PDF');
    setUploading(true);
    setMsg('');
    const fd = new FormData();
    fd.append('cv', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/etudiants/upload-cv', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('CV uploade avec succes !');
        setFile(null);
        onSuccess(data.cvUrl);
      } else setMsg('Erreur : ' + (data.message || 'Echec'));
    } catch {
      setMsg('Erreur de connexion');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files[0];
          if (f?.type === 'application/pdf') {
            setFile(f);
            setMsg('');
          } else setMsg('Seulement les PDF');
        }}
        onClick={() => document.getElementById('cv-upload').click()}
        style={{
          border: `2px dashed ${drag ? TEAL : '#d0d0d0'}`,
          borderRadius: 12,
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: drag ? 'rgba(26,122,138,.04)' : '#fafafa',
          transition: 'all .25s',
          marginBottom: '1rem',
        }}
      >
        <input
          id="cv-upload"
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files[0];
            if (f) {
              setFile(f);
              setMsg('');
            }
          }}
        />
        <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>📤</div>
        <p style={{ color: file ? TEAL : '#aaa', fontWeight: file ? 600 : 400, fontSize: '.9rem' }}>
          {file ? file.name : 'Glissez votre CV PDF ici ou cliquez'}
        </p>
        <p style={{ color: '#ccc', fontSize: '.78rem', marginTop: '.25rem' }}>
          PDF uniquement - Max 10 MB
        </p>
      </div>
      {msg && (
        <div
          style={{
            padding: '.7rem',
            borderRadius: 8,
            fontSize: '.83rem',
            marginBottom: '.75rem',
            background: msg.includes('succes') ? 'rgba(39,174,96,.08)' : 'rgba(231,76,60,.08)',
            color: msg.includes('succes') ? '#27AE60' : '#c0392b',
            border: msg.includes('succes')
              ? '1px solid rgba(39,174,96,.2)'
              : '1px solid rgba(231,76,60,.2)',
          }}
        >
          {msg}
        </div>
      )}
      {file && (
        <button
          onClick={upload}
          disabled={uploading}
          style={{
            width: '100%',
            padding: '.85rem',
            borderRadius: 10,
            border: 'none',
            background: uploading
              ? 'rgba(26,122,138,.5)'
              : 'linear-gradient(135deg,' + TEAL + ',#16A085)',
            color: '#fff',
            fontWeight: 700,
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontFamily: 'Poppins,sans-serif',
            fontSize: '.9rem',
          }}
        >
          {uploading ? 'Upload en cours...' : 'Uploader mon CV'}
        </button>
      )}
    </div>
  );
}

function MsgBox({ m }) {
  if (!m || !m.text) return null;
  const ok = m.type === 'success';
  return (
    <div
      style={{
        padding: '.8rem 1rem',
        borderRadius: 10,
        marginBottom: '1rem',
        fontSize: '.85rem',
        background: ok ? 'rgba(39,174,96,.08)' : 'rgba(231,76,60,.08)',
        color: ok ? '#27AE60' : '#c0392b',
        border: ok ? '1px solid rgba(39,174,96,.2)' : '1px solid rgba(231,76,60,.2)',
      }}
    >
      {m.text}
    </div>
  );
}

export default function ProfilPage() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();

  const [profilExtra, setProfilExtra] = useState(null);
  const [projet, setProjet] = useState(null);
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('infos');
  const [showMdp, setShowMdp] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [voir1, setVoir1] = useState(false);
  const [voir2, setVoir2] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingMdp, setSavingMdp] = useState(false);

  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
  });
  const [extraData, setExtraData] = useState({
    filiere: '',
    matricule: '',
    niveau: '',
    cvUrl: '',
    specialite: '',
    departement: '',
    typeEncadrant: '',
    bio: '',
  });
  const [mdpData, setMdpData] = useState({ nouveau: '', confirmer: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [mdpMsg, setMdpMsg] = useState({ text: '', type: '' });

  // Certifications demo
  const [certifs, setCertifs] = useState([
    {
      id: 1,
      titre: 'AWS Cloud Practitioner',
      emetteur: 'Amazon Web Services',
      date: '2024-03',
      logo: '☁️',
      valide: true,
      url: '#',
    },
    {
      id: 2,
      titre: 'React Developer Certificate',
      emetteur: 'Meta',
      date: '2024-01',
      logo: '⚛️',
      valide: true,
      url: '#',
    },
    {
      id: 3,
      titre: 'Python for Data Science',
      emetteur: 'IBM',
      date: '2023-11',
      logo: '🐍',
      valide: true,
      url: '#',
    },
  ]);
  const [showAddCertif, setShowAddCertif] = useState(false);
  const [newCertif, setNewCertif] = useState({ titre: '', emetteur: '', date: '', url: '' });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      if (user?.role === 'ETUDIANT') {
        const { data } = await API.get('/etudiants/mon-profil');
        setProfilExtra(data);
        setExtraData({
          filiere: data.filiere || '',
          matricule: data.matricule || '',
          niveau: data.niveau || '',
          cvUrl: data.cvUrl || '',
        });
        try {
          const { data: p } = await API.get('/projets/mon-projet');
          setProjet(p);
        } catch {}
        try {
          const { data: c } = await API.get('/candidatures/mes-candidatures');
          setCandidatures(c);
        } catch {}
      }
      if (user?.role === 'ENCADRANT') {
        const { data } = await API.get('/encadrants/mon-profil');
        setProfilExtra(data);
        setExtraData({
          specialite: data.specialite || '',
          departement: data.departement || '',
          typeEncadrant: data.typeEncadrant || '',
          bio: data.bio || '',
        });
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type, setter) => {
    setter({ text, type });
    setTimeout(() => setter({ text: '', type: '' }), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.put('/auth/profile', formData);
      login(data, localStorage.getItem('token'));
      if (user?.role === 'ETUDIANT')
        await API.put('/etudiants/mon-profil', {
          filiere: extraData.filiere,
          matricule: extraData.matricule,
          niveau: extraData.niveau,
          cvUrl: extraData.cvUrl,
        });
      if (user?.role === 'ENCADRANT')
        await API.put('/encadrants/mon-profil', {
          specialite: extraData.specialite,
          departement: extraData.departement,
          typeEncadrant: extraData.typeEncadrant,
          bio: extraData.bio,
        });
      showMessage('Profil sauvegarde avec succes !', 'success', setMsg);
      fetchAll();
    } catch (err) {
      showMessage('Erreur : ' + (err.response?.data?.message || 'Erreur'), 'error', setMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleChangeMdp = async (e) => {
    e.preventDefault();
    if (mdpData.nouveau !== mdpData.confirmer)
      return showMessage('Les mots de passe ne correspondent pas', 'error', setMdpMsg);
    if (mdpData.nouveau.length < 8) return showMessage('Minimum 8 caracteres', 'error', setMdpMsg);
    setSavingMdp(true);
    try {
      await API.put('/auth/profile', { mot_de_passe: mdpData.nouveau });
      showMessage('Mot de passe change avec succes !', 'success', setMdpMsg);
      setMdpData({ nouveau: '', confirmer: '' });
      setShowMdp(false);
    } catch (err) {
      showMessage('Erreur : ' + (err.response?.data?.message || 'Erreur'), 'error', setMdpMsg);
    } finally {
      setSavingMdp(false);
    }
  };

  const addCertif = () => {
    if (!newCertif.titre || !newCertif.emetteur) return;
    setCertifs((prev) => [...prev, { id: Date.now(), ...newCertif, logo: '🏅', valide: true }]);
    setNewCertif({ titre: '', emetteur: '', date: '', url: '' });
    setShowAddCertif(false);
  };

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

  const tabs = [
    { id: 'infos', label: 'Informations', emoji: '👤' },
    { id: 'certifs', label: 'Certifications', emoji: '🏆' },
    { id: 'cv', label: 'CV & Documents', emoji: '📄' },
    { id: 'secu', label: 'Securite', emoji: '🔒' },
  ];

  const statutColors = {
    EN_ATTENTE: { c: '#F5C518', bg: 'rgba(245,197,24,.12)', l: 'En attente' },
    QUIZ_REQUIS: { c: '#9B59B6', bg: 'rgba(155,89,182,.12)', l: 'Quiz requis' },
    INTERVIEW: { c: '#27AE60', bg: 'rgba(39,174,96,.12)', l: 'Interview' },
    ACCEPTE: { c: '#27AE60', bg: 'rgba(39,174,96,.15)', l: 'Accepte' },
    REFUSE: { c: '#E74C3C', bg: 'rgba(231,76,60,.12)', l: 'Refuse' },
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f4f7fa',
        }}
      >
        <p style={{ color: TEAL, fontFamily: 'Poppins,sans-serif' }}>Chargement...</p>
      </div>
    );

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fa', fontFamily: 'Poppins,sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        .hexshape { clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); }
        .card { background:#fff; border-radius:16px; padding:1.75rem; margin-bottom:1.5rem; box-shadow:0 3px 16px rgba(0,0,0,.06); border:1px solid #eee; }
        .tab { padding:.65rem 1.25rem; border-radius:10px; border:none; cursor:pointer; font-family:Poppins,sans-serif; font-size:.85rem; font-weight:600; transition:all .2s; }
        .tab.on { background:${TEAL}; color:#fff; box-shadow:0 4px 14px rgba(26,122,138,.3); }
        .tab:not(.on) { background:#f0f4f7; color:#666; }
        .tab:not(.on):hover { background:#e4eef2; }
        .inp-f:focus { border-color:#1a7a8a; box-shadow:0 0 0 3px rgba(26,122,138,.07); outline:none; }
        .inp-f::placeholder { color:#ccc; }
        .certif-card { background:#fff; border-radius:14px; padding:1.4rem; border:1.5px solid #eee; transition:all .25s; display:flex; align-items:flex-start; gap:1rem; }
        .certif-card:hover { border-color:${TEAL}; box-shadow:0 8px 24px rgba(26,122,138,.1); transform:translateY(-2px); }
        .btn-pri { background:linear-gradient(135deg,${TEAL},#16A085); color:#fff; border:none; padding:.85rem 2rem; border-radius:10px; font-size:.9rem; font-weight:700; cursor:pointer; font-family:Poppins,sans-serif; transition:all .25s; }
        .btn-pri:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(26,122,138,.3); }
        .btn-pri:disabled { opacity:.5; cursor:not-allowed; transform:none; }
        .btn-ghost { background:transparent; border:1.5px solid #e0e0e0; color:#666; padding:.85rem 1.5rem; border-radius:10px; cursor:pointer; font-family:Poppins,sans-serif; transition:all .2s; font-size:.88rem; }
        .btn-ghost:hover { background:#f5f5f5; }
        .btn-danger { background:rgba(231,76,60,.08); color:#c0392b; border:1.5px solid rgba(231,76,60,.25); padding:.85rem 2rem; border-radius:10px; cursor:pointer; font-family:Poppins,sans-serif; transition:all .2s; font-size:.9rem; font-weight:600; }
        .btn-danger:hover { background:rgba(231,76,60,.14); }
        .info-row { display:flex; justify-content:space-between; align-items:center; padding:.75rem 0; border-bottom:1px solid #f0f0f0; }
        .info-row:last-child { border-bottom:none; }
        .pwd-wrap { position:relative; }
        .pwd-wrap input { padding-right:5rem; }
        .pwd-eye { position:absolute; right:.9rem; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#aaa; font-size:.75rem; font-family:Poppins,sans-serif; padding:.2rem .4rem; }
        .pwd-eye:hover { color:${TEAL}; }
        input::placeholder,textarea::placeholder { color:#ccc; }
        textarea { resize:vertical; font-family:Poppins,sans-serif; }
        select option { background:#fff; color:#333; }
        a { text-decoration:none; }
      `}</style>

      {/* HEADER PROFIL — style Credly */}
      <div
        style={{
          background: `linear-gradient(135deg, ${DARK} 0%, #1a3a5c 100%)`,
          paddingTop: '0',
          position: 'relative',
          overflow: 'hidden',

        }}
      >
        {/* Pattern hexagonal */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(60deg,rgba(255,255,255,.03) 0,rgba(255,255,255,.03) 1px,transparent 0,transparent 50%),repeating-linear-gradient(120deg,rgba(255,255,255,.03) 0,rgba(255,255,255,.03) 1px,transparent 0,transparent 50%)',
            backgroundSize: '40px 70px',
            pointerEvents: 'none',
          }}
        />

        {/* Navbar dans le header */}
        <div
          style={{
            padding: '1rem 2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,.08)',
          }}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '.75rem', cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
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
                fontSize: '1.2rem',
                
              }}
            >
              🎓
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', lineHeight: 1 }}>
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
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,.2)',
              color: '#fff',
              padding: '.5rem 1.2rem',
              borderRadius: 10,
              cursor: 'pointer',
              fontFamily: 'Poppins,sans-serif',
              fontSize: '.85rem',
            }}
          >
            ← Retour
          </button>
        </div>

        {/* Info utilisateur */}
        <div
          style={{
            maxWidth: 1100,
            margin: '2rem auto',
            padding: '2.5rem ',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '2rem',
          }}
        >
          {/* Avatar hexagonal */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              className="hexshape"
              style={{
                width: 120,
                height: 120,
                background: `linear-gradient(135deg,${YELLOW},#E67E22)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                fontWeight: 800,
                color: DARK,
                fontFamily: 'Poppins,sans-serif',
                boxShadow: '0 12px 40px rgba(245,197,24,.35)',
              }}
            >
              {user?.prenom?.[0]}
              {user?.nom?.[0]}
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: -6,
                right: -6,
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#27AE60',
                border: '3px solid' + DARK,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '.8rem',
              }}
            >
              ✓
            </div>
          </div>

          {/* Infos */}
          <div style={{ flex: 1, paddingBottom: '1.5rem' }}>
            <h1
              style={{ fontWeight: 800, fontSize: '1.8rem', color: '#fff', marginBottom: '.3rem' }}
            >
              {user?.prenom} {user?.nom}
            </h1>
            <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginBottom: '.6rem' }}>
              {[
                {
                  bg: `${YELLOW}22`,
                  c: YELLOW,
                  t:
                    user?.role === 'ETUDIANT'
                      ? '🎓 Etudiant'
                      : user?.role === 'ENCADRANT'
                        ? '👨‍🏫 Encadrant'
                        : '🛡️ Admin',
                },
                profilExtra?.niveau
                  ? { bg: 'rgba(255,255,255,.1)', c: 'rgba(255,255,255,.8)', t: profilExtra.niveau }
                  : null,
                profilExtra?.filiere
                  ? {
                      bg: 'rgba(255,255,255,.1)',
                      c: 'rgba(255,255,255,.8)',
                      t: profilExtra.filiere,
                    }
                  : null,
              ]
                .filter(Boolean)
                .map((b, i) => (
                  <span
                    key={i}
                    style={{
                      background: b.bg,
                      color: b.c,
                      padding: '.28rem .85rem',
                      borderRadius: 100,
                      fontSize: '.78rem',
                      fontWeight: 600,
                    }}
                  >
                    {b.t}
                  </span>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {user?.email && (
                <span style={{ color: 'rgba(255,255,255,.65)', fontSize: '.83rem' }}>
                  ✉ {user.email}
                </span>
              )}
              {user?.telephone && (
                <span style={{ color: 'rgba(255,255,255,.65)', fontSize: '.83rem' }}>
                  📞 {user.telephone}
                </span>
              )}
              {profilExtra?.matricule && (
                <span style={{ color: 'rgba(255,255,255,.65)', fontSize: '.83rem' }}>
                  🎫 {profilExtra.matricule}
                </span>
              )}
            </div>
          </div>

          {/* Stats rapides */}
          <div style={{ display: 'flex', gap: '1.5rem', paddingBottom: '1.5rem' }}>
            {[
              { v: certifs.length, l: 'Certifications' },
              { v: candidatures.length, l: 'Candidatures' },
              { v: projet ? 1 : 0, l: 'Projets' },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  padding: '1rem 1.5rem',
                  background: 'rgba(255,255,255,.08)',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,.12)',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '1.5rem', color: YELLOW }}>{s.v}</div>
                <div
                  style={{ color: 'rgba(255,255,255,.6)', fontSize: '.72rem', marginTop: '.2rem' }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        {/* <div
          style={{
            maxWidth: 1100,
            margin: '2rem',
            padding: '1.25rem 2.5rem 0',
            display: 'flex',
            gap: '.6rem',
            overflowX: 'auto',
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              className={'tab' + (activeTab === t.id ? ' on' : '')}
              onClick={() => setActiveTab(t.id)}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div> */}
      </div>

      {/* CONTENU */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 2.5rem' }}>
                {/* Tabs */}
        <div
          style={{
            maxWidth: 1100,
            margin: '2rem',
            // padding: '1.25rem 2.5rem 0',
            display: 'flex',
            gap: '.6rem',
            overflowX: 'auto',
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              className={'tab' + (activeTab === t.id ? ' on' : '')}
              onClick={() => setActiveTab(t.id)}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
        {/* TAB — Informations */}
        {activeTab === 'infos' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
            {/* Colonne gauche */}
            <div>
              {/* Infos affichage */}
              <div className="card">
                <h3
                  style={{
                    fontWeight: 700,
                    color: DARK,
                    fontSize: '.95rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  Informations personnelles
                </h3>
                <div className="info-row">
                  <span style={{ color: '#888', fontSize: '.83rem' }}>Nom</span>
                  <span style={{ color: DARK, fontWeight: 600, fontSize: '.85rem' }}>
                    {user?.nom}
                  </span>
                </div>
                <div className="info-row">
                  <span style={{ color: '#888', fontSize: '.83rem' }}>Prenom</span>
                  <span style={{ color: DARK, fontWeight: 600, fontSize: '.85rem' }}>
                    {user?.prenom}
                  </span>
                </div>
                <div className="info-row">
                  <span style={{ color: '#888', fontSize: '.83rem' }}>Email</span>
                  <span style={{ color: TEAL, fontWeight: 500, fontSize: '.82rem' }}>
                    {user?.email}
                  </span>
                </div>
                <div className="info-row">
                  <span style={{ color: '#888', fontSize: '.83rem' }}>Telephone</span>
                  <span style={{ color: DARK, fontWeight: 500, fontSize: '.83rem' }}>
                    {user?.telephone || 'Non renseigne'}
                  </span>
                </div>
              </div>

              {user?.role === 'ETUDIANT' && (
                <div className="card">
                  <h3
                    style={{
                      fontWeight: 700,
                      color: DARK,
                      fontSize: '.95rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    Academique
                  </h3>
                  <div className="info-row">
                    <span style={{ color: '#888', fontSize: '.83rem' }}>Matricule</span>
                    <span style={{ color: DARK, fontWeight: 600, fontSize: '.85rem' }}>
                      {profilExtra?.matricule || '-'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span style={{ color: '#888', fontSize: '.83rem' }}>Filiere</span>
                    <span style={{ color: DARK, fontWeight: 500, fontSize: '.83rem' }}>
                      {profilExtra?.filiere || '-'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span style={{ color: '#888', fontSize: '.83rem' }}>Niveau</span>
                    <span style={{ color: DARK, fontWeight: 500, fontSize: '.83rem' }}>
                      {profilExtra?.niveau || '-'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span style={{ color: '#888', fontSize: '.83rem' }}>Statut PFE</span>
                    <span style={{ color: TEAL, fontWeight: 700, fontSize: '.8rem' }}>
                      {profilExtra?.statutPFE?.replace(/_/g, ' ') || '-'}
                    </span>
                  </div>
                </div>
              )}

              {user?.role === 'ENCADRANT' && (
                <div className="card">
                  <h3
                    style={{
                      fontWeight: 700,
                      color: DARK,
                      fontSize: '.95rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    Professionnel
                  </h3>
                  {[
                    ['Specialite', profilExtra?.specialite],
                    ['Departement', profilExtra?.departement],
                    ['Type', profilExtra?.typeEncadrant],
                    ['Disponibilite', profilExtra?.disponibilite ? 'Disponible' : 'Non disponible'],
                  ].map(([l, v]) => (
                    <div key={l} className="info-row">
                      <span style={{ color: '#888', fontSize: '.83rem' }}>{l}</span>
                      <span style={{ color: DARK, fontWeight: 500, fontSize: '.83rem' }}>
                        {v || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Projet si EN_COURS */}
              {projet && (
                <div className="card" style={{ borderLeft: `4px solid ${TEAL}` }}>
                  <h3
                    style={{
                      fontWeight: 700,
                      color: DARK,
                      fontSize: '.95rem',
                      marginBottom: '1rem',
                    }}
                  >
                    Projet PFE actuel
                  </h3>
                  <p
                    style={{
                      fontWeight: 600,
                      color: DARK,
                      fontSize: '.88rem',
                      marginBottom: '.5rem',
                    }}
                  >
                    {projet.titre}
                  </p>
                  <span
                    style={{
                      background: 'rgba(26,122,138,.1)',
                      color: TEAL,
                      padding: '.22rem .75rem',
                      borderRadius: 100,
                      fontSize: '.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {projet.statutProjet}
                  </span>
                  {projet.idSujet?.technologies?.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '.35rem',
                        flexWrap: 'wrap',
                        marginTop: '.75rem',
                      }}
                    >
                      {projet.idSujet.technologies.map((t, i) => (
                        <span
                          key={i}
                          style={{
                            background: 'rgba(26,122,138,.08)',
                            color: TEAL,
                            padding: '.15rem .55rem',
                            borderRadius: 100,
                            fontSize: '.72rem',
                            fontWeight: 600,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Candidatures */}
              {candidatures.length > 0 && (
                <div className="card">
                  <h3
                    style={{
                      fontWeight: 700,
                      color: DARK,
                      fontSize: '.95rem',
                      marginBottom: '1rem',
                    }}
                  >
                    Mes candidatures
                  </h3>
                  {candidatures.map((c) => {
                    const si = statutColors[c.statut] || {
                      c: '#888',
                      bg: 'rgba(0,0,0,.05)',
                      l: c.statut,
                    };
                    return (
                      <div
                        key={c._id}
                        style={{ padding: '.75rem 0', borderBottom: '1px solid #f0f0f0' }}
                      >
                        <p style={{ fontWeight: 600, color: DARK, fontSize: '.83rem' }}>
                          {c.idSujet?.titre || 'Sujet'}
                        </p>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '.3rem',
                          }}
                        >
                          <span style={{ color: '#888', fontSize: '.75rem' }}>
                            Score IA : <strong style={{ color: TEAL }}>{c.scoreIA}/100</strong>
                          </span>
                          <span
                            style={{
                              background: si.bg,
                              color: si.c,
                              padding: '.2rem .65rem',
                              borderRadius: 100,
                              fontSize: '.72rem',
                              fontWeight: 700,
                            }}
                          >
                            {si.l}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Colonne droite — Modifier */}
            <div>
              <div className="card">
                <h3
                  style={{
                    fontWeight: 700,
                    color: DARK,
                    fontSize: '.95rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  Modifier mes informations
                </h3>
                <MsgBox m={msg} />
                <form
                  onSubmit={handleSave}
                  style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}>
                    <div>
                      <label style={lStyle}>Nom</label>
                      <input
                        style={iStyle}
                        className="inp-f"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <label style={lStyle}>Prenom</label>
                      <input
                        style={iStyle}
                        className="inp-f"
                        value={formData.prenom}
                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                        placeholder="Votre prenom"
                      />
                    </div>
                  </div>
                  <div>
                    <label style={lStyle}>Email</label>
                    <input
                      type="email"
                      style={iStyle}
                      className="inp-f"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={lStyle}>Telephone</label>
                    <input
                      style={iStyle}
                      className="inp-f"
                      placeholder="+216 XX XXX XXX"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    />
                  </div>

                  {user?.role === 'ETUDIANT' && (
                    <>
                      <div
                        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}
                      >
                        <div>
                          <label style={lStyle}>Filiere</label>
                          <input
                            style={iStyle}
                            className="inp-f"
                            placeholder="Informatique"
                            value={extraData.filiere}
                            onChange={(e) =>
                              setExtraData({ ...extraData, filiere: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label style={lStyle}>Matricule</label>
                          <input
                            style={iStyle}
                            className="inp-f"
                            placeholder="2023001"
                            value={extraData.matricule}
                            onChange={(e) =>
                              setExtraData({ ...extraData, matricule: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label style={lStyle}>Niveau</label>
                        <select
                          style={iStyle}
                          value={extraData.niveau}
                          onChange={(e) => setExtraData({ ...extraData, niveau: e.target.value })}
                        >
                          <option value="">Choisir</option>
                          {['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'].map(
                            (n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </>
                  )}

                  {user?.role === 'ENCADRANT' && (
                    <>
                      <div
                        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}
                      >
                        <div>
                          <label style={lStyle}>Specialite</label>
                          <input
                            style={iStyle}
                            className="inp-f"
                            placeholder="Informatique"
                            value={extraData.specialite}
                            onChange={(e) =>
                              setExtraData({ ...extraData, specialite: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label style={lStyle}>Departement</label>
                          <input
                            style={iStyle}
                            className="inp-f"
                            placeholder="Genie Info"
                            value={extraData.departement}
                            onChange={(e) =>
                              setExtraData({ ...extraData, departement: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label style={lStyle}>Bio</label>
                        <textarea
                          rows={3}
                          style={iStyle}
                          className="inp-f"
                          placeholder="Votre parcours..."
                          value={extraData.bio}
                          onChange={(e) => setExtraData({ ...extraData, bio: e.target.value })}
                        />
                      </div>
                    </>
                  )}

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
            </div>
          </div>
        )}

        {/* TAB — Certifications (style Credly) */}
        {activeTab === 'certifs' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <h2 style={{ fontWeight: 800, color: DARK, fontSize: '1.2rem' }}>
                  Mes certifications
                </h2>
                <p style={{ color: '#888', fontSize: '.85rem', marginTop: '.25rem' }}>
                  Vos badges et certifications professionnels
                </p>
              </div>
              <button className="btn-pri" onClick={() => setShowAddCertif(true)}>
                + Ajouter une certification
              </button>
            </div>

            {certifs.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '4rem',
                  background: '#fff',
                  borderRadius: 16,
                  border: '1px solid #eee',
                }}
              >
                <div
                  className="hexshape"
                  style={{
                    width: 80,
                    height: 80,
                    background: 'rgba(26,122,138,.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    margin: '0 auto 1.25rem',
                  }}
                >
                  🏆
                </div>
                <p style={{ color: '#888', fontSize: '.92rem' }}>
                  Aucune certification pour l'instant
                </p>
                <p style={{ color: '#bbb', fontSize: '.82rem', marginTop: '.4rem' }}>
                  Ajoutez vos certifications professionnelles
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
                  gap: '1.25rem',
                }}
              >
                {certifs.map((c) => (
                  <div key={c.id} className="certif-card">
                    {/* Logo hexagonal */}
                    <div
                      className="hexshape"
                      style={{
                        width: 64,
                        height: 64,
                        background: `linear-gradient(135deg,${TEAL},#16A085)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.8rem',
                        flexShrink: 0,
                      }}
                    >
                      {c.logo}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          fontWeight: 700,
                          color: DARK,
                          fontSize: '.92rem',
                          marginBottom: '.3rem',
                          lineHeight: 1.3,
                        }}
                      >
                        {c.titre}
                      </h3>
                      <p
                        style={{
                          color: TEAL,
                          fontSize: '.8rem',
                          fontWeight: 600,
                          marginBottom: '.4rem',
                        }}
                      >
                        {c.emetteur}
                      </p>
                      {c.date && (
                        <p style={{ color: '#aaa', fontSize: '.75rem' }}>Obtenu : {c.date}</p>
                      )}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '.75rem',
                          marginTop: '.6rem',
                        }}
                      >
                        {c.valide && (
                          <span
                            style={{
                              background: 'rgba(39,174,96,.1)',
                              color: '#27AE60',
                              padding: '.18rem .65rem',
                              borderRadius: 100,
                              fontSize: '.72rem',
                              fontWeight: 700,
                            }}
                          >
                            Verifie ✓
                          </span>
                        )}
                        {c.url && c.url !== '#' && (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: TEAL, fontSize: '.75rem', fontWeight: 500 }}
                          >
                            Voir le badge →
                          </a>
                        )}
                        <button
                          onClick={() => setCertifs((prev) => prev.filter((x) => x.id !== c.id))}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ccc',
                            cursor: 'pointer',
                            fontSize: '.8rem',
                            marginLeft: 'auto',
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal ajouter certification */}
            {showAddCertif && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,.65)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                  padding: '1rem',
                }}
              >
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 18,
                    padding: '2rem',
                    width: '100%',
                    maxWidth: 480,
                    boxShadow: '0 24px 60px rgba(0,0,0,.2)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <h2 style={{ fontWeight: 700, color: DARK }}>Ajouter une certification</h2>
                    <button
                      onClick={() => setShowAddCertif(false)}
                      style={{
                        background: '#f0f0f0',
                        border: 'none',
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: '1rem',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
                    <div>
                      <label style={lStyle}>Titre de la certification *</label>
                      <input
                        style={iStyle}
                        className="inp-f"
                        placeholder="AWS Cloud Practitioner"
                        value={newCertif.titre}
                        onChange={(e) => setNewCertif({ ...newCertif, titre: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={lStyle}>Emetteur *</label>
                      <input
                        style={iStyle}
                        className="inp-f"
                        placeholder="Amazon Web Services, Google, Meta..."
                        value={newCertif.emetteur}
                        onChange={(e) => setNewCertif({ ...newCertif, emetteur: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={lStyle}>Date d'obtention</label>
                      <input
                        type="month"
                        style={iStyle}
                        className="inp-f"
                        value={newCertif.date}
                        onChange={(e) => setNewCertif({ ...newCertif, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={lStyle}>URL du badge (optionnel)</label>
                      <input
                        style={iStyle}
                        className="inp-f"
                        placeholder="https://www.credly.com/badges/..."
                        value={newCertif.url}
                        onChange={(e) => setNewCertif({ ...newCertif, url: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '.5rem' }}>
                      <button
                        className="btn-ghost"
                        onClick={() => setShowAddCertif(false)}
                        style={{ flex: 1 }}
                      >
                        Annuler
                      </button>
                      <button className="btn-pri" onClick={addCertif} style={{ flex: 1 }}>
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB — CV */}
        {activeTab === 'cv' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <div className="card">
                <h3
                  style={{
                    fontWeight: 700,
                    color: DARK,
                    fontSize: '.95rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  Mon CV actuel
                </h3>
                {profilExtra?.cvUrl || extraData.cvUrl ? (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1.25rem',
                        background: 'rgba(26,122,138,.07)',
                        border: '1px solid rgba(26,122,138,.15)',
                        borderRadius: 12,
                        marginBottom: '1.25rem',
                      }}
                    >
                      <div
                        className="hexshape"
                        style={{
                          width: 52,
                          height: 52,
                          background: TEAL,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          flexShrink: 0,
                        }}
                      >
                        📄
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, color: DARK, fontSize: '.88rem' }}>
                          CV disponible
                        </p>
                        <p style={{ color: '#888', fontSize: '.75rem', marginTop: '.15rem' }}>
                          Votre CV est en ligne
                        </p>
                      </div>
                      <a
                        href={profilExtra?.cvUrl || extraData.cvUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: TEAL,
                          color: '#fff',
                          padding: '.5rem 1rem',
                          borderRadius: 8,
                          fontSize: '.8rem',
                          fontWeight: 600,
                        }}
                      >
                        Voir →
                      </a>
                    </div>
                    <p
                      style={{
                        color: '#888',
                        fontSize: '.82rem',
                        marginBottom: '.75rem',
                        fontWeight: 600,
                      }}
                    >
                      Remplacer le CV :
                    </p>
                    {user?.role === 'ETUDIANT' && (
                      <CVUploader
                        onSuccess={(url) => {
                          setProfilExtra((p) => ({ ...p, cvUrl: url }));
                          setExtraData((p) => ({ ...p, cvUrl: url }));
                          showMessage('CV mis a jour !', 'success', setMsg);
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '2rem',
                        background: '#f8fafc',
                        borderRadius: 12,
                        marginBottom: '1.25rem',
                        border: '1px dashed #d0d0d0',
                      }}
                    >
                      <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>📭</div>
                      <p style={{ color: '#aaa', fontSize: '.88rem' }}>Aucun CV uploade</p>
                    </div>
                    {user?.role === 'ETUDIANT' && (
                      <CVUploader
                        onSuccess={(url) => {
                          setProfilExtra((p) => ({ ...p, cvUrl: url }));
                          setExtraData((p) => ({ ...p, cvUrl: url }));
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="card">
                <h3
                  style={{
                    fontWeight: 700,
                    color: DARK,
                    fontSize: '.95rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  Lien vers mon CV
                </h3>
                <p
                  style={{
                    color: '#888',
                    fontSize: '.83rem',
                    lineHeight: 1.6,
                    marginBottom: '1.25rem',
                  }}
                >
                  Vous pouvez aussi renseigner un lien vers votre CV sur Google Drive, Dropbox ou
                  tout autre service.
                </p>
                <div>
                  <label style={lStyle}>URL du CV</label>
                  <input
                    style={iStyle}
                    className="inp-f"
                    placeholder="https://drive.google.com/..."
                    value={extraData.cvUrl}
                    onChange={(e) => setExtraData({ ...extraData, cvUrl: e.target.value })}
                  />
                </div>
                <button
                  className="btn-pri"
                  style={{ marginTop: '1rem' }}
                  onClick={async () => {
                    try {
                      await API.put('/etudiants/mon-profil', { cvUrl: extraData.cvUrl });
                      showMessage('Lien CV sauvegarde !', 'success', setMsg);
                      fetchAll();
                    } catch {}
                  }}
                >
                  Sauvegarder le lien
                </button>
              </div>

              <div className="card" style={{ borderLeft: `4px solid ${YELLOW}` }}>
                <h3
                  style={{
                    fontWeight: 700,
                    color: DARK,
                    fontSize: '.95rem',
                    marginBottom: '.75rem',
                  }}
                >
                  Conseils
                </h3>
                <ul
                  style={{
                    paddingLeft: '1.2rem',
                    color: '#666',
                    fontSize: '.83rem',
                    lineHeight: 2,
                  }}
                >
                  <li>Utilisez un CV en format PDF</li>
                  <li>Incluez vos competences techniques</li>
                  <li>Mentionnez vos projets personnels</li>
                  <li>Ajoutez vos certifications</li>
                  <li>Gardez votre CV a jour regulierement</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB — Securite */}
        {activeTab === 'secu' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              {/* Changer mot de passe */}
              <div className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: showMdp ? '1.5rem' : 0,
                  }}
                >
                  <h3 style={{ fontWeight: 700, color: DARK, fontSize: '.95rem' }}>
                    Changer le mot de passe
                  </h3>
                  <button
                    className="btn-ghost"
                    style={{ padding: '.5rem 1rem', fontSize: '.82rem' }}
                    onClick={() => setShowMdp(!showMdp)}
                  >
                    {showMdp ? 'Annuler' : 'Modifier'}
                  </button>
                </div>
                {showMdp && (
                  <>
                    <MsgBox m={mdpMsg} />
                    <form
                      onSubmit={handleChangeMdp}
                      style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}
                    >
                      <div>
                        <label style={lStyle}>Nouveau mot de passe</label>
                        <div className="pwd-wrap">
                          <input
                            type={voir1 ? 'text' : 'password'}
                            style={iStyle}
                            className="inp-f"
                            placeholder="Minimum 8 caracteres"
                            value={mdpData.nouveau}
                            onChange={(e) => setMdpData({ ...mdpData, nouveau: e.target.value })}
                            required
                          />
                          <button
                            type="button"
                            className="pwd-eye"
                            onClick={() => setVoir1(!voir1)}
                          >
                            {voir1 ? '🙈' : ' 👁'}
                          </button>
                        </div>
                        {mdpData.nouveau.length > 0 && (
                          <div style={{ marginTop: '.4rem' }}>
                            <div
                              style={{
                                height: 3,
                                borderRadius: 2,
                                background: '#eee',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  borderRadius: 2,
                                  transition: 'width .3s, background .3s',
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
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: '.7rem',
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
                        <label style={lStyle}>Confirmer</label>
                        <div className="pwd-wrap">
                          <input
                            type={voir2 ? 'text' : 'password'}
                            style={{
                              ...iStyle,
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
                          <button
                            type="button"
                            className="pwd-eye"
                            onClick={() => setVoir2(!voir2)}
                          >
                            {voir2 ? '🙈' : '👁'}
                          </button>
                        </div>
                        {mdpData.confirmer && mdpData.nouveau !== mdpData.confirmer && (
                          <p style={{ color: '#E74C3C', fontSize: '.73rem', marginTop: '.25rem' }}>
                            Ne correspondent pas
                          </p>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="btn-pri"
                        disabled={savingMdp}
                        style={{ alignSelf: 'flex-start' }}
                      >
                        {savingMdp ? 'Changement...' : 'Changer le mot de passe'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            <div>
              {/* Zone dangereuse */}
              <div className="card" style={{ borderColor: 'rgba(231,76,60,.2)', borderWidth: 1.5 }}>
                <h3
                  style={{
                    fontWeight: 700,
                    color: '#c0392b',
                    fontSize: '.95rem',
                    marginBottom: '.75rem',
                  }}
                >
                  Zone dangereuse
                </h3>
                <p
                  style={{
                    color: '#888',
                    fontSize: '.83rem',
                    lineHeight: 1.7,
                    marginBottom: '1.25rem',
                  }}
                >
                  La suppression de votre compte est definitive et irreversible. Toutes vos donnees
                  seront effacees de nos serveurs.
                </p>
                {!showDelete ? (
                  <button className="btn-danger" onClick={() => setShowDelete(true)}>
                    Supprimer mon compte
                  </button>
                ) : (
                  <div
                    style={{
                      background: 'rgba(231,76,60,.05)',
                      border: '1px solid rgba(231,76,60,.15)',
                      borderRadius: 12,
                      padding: '1.25rem',
                    }}
                  >
                    <p
                      style={{
                        color: '#c0392b',
                        fontWeight: 600,
                        fontSize: '.88rem',
                        marginBottom: '1rem',
                      }}
                    >
                      Etes-vous absolument sur ? Cette action est irreversible.
                    </p>
                    <div style={{ display: 'flex', gap: '.75rem' }}>
                      <button
                        className="btn-danger"
                        onClick={() => {
                          logout();
                          navigate('/accueil');
                        }}
                      >
                        Oui, supprimer definititement
                      </button>
                      <button className="btn-ghost" onClick={() => setShowDelete(false)}>
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
