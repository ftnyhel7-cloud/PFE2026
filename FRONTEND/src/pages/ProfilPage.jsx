// ═══════════════════════════════════════════════════════════
//  FRONTEND/src/pages/ProfilPage.jsx
//  ✅ Structure identique + couleurs pastels enrichies
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

// ─── THÈME PASTEL ENRICHI ─────────────────────────────────
const T = {
  accent: '#2d9e6b',
  accentLight: '#e6f5ef',
  accentMid: '#4caf82',
  accentGrad: 'linear-gradient(135deg,#1a7a4f,#2d9e6b,#4caf82)',
  accentSoft: 'rgba(45,158,107,.12)',
  sidebar: '#1a3d2b',
  bg: '#f0faf5',
  card: '#ffffff',
  cardBorder: '#d8ede3',
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
  pink: '#db2777',
  pinkLight: '#fce7f3',
  orange: '#ea580c',
  orangeLight: '#fff7ed',
  shadow: '0 2px 16px rgba(45,158,107,.10)',
  shadowMd: '0 6px 28px rgba(45,158,107,.16)',
  // Pastels pour cards
  p1: { bg:'#f0fdf4', border:'#bbf7d0', icon:'#16a34a', iconBg:'#dcfce7' },
  p2: { bg:'#eff6ff', border:'#bfdbfe', icon:'#2563eb', iconBg:'#dbeafe' },
  p3: { bg:'#fdf4ff', border:'#e9d5ff', icon:'#7c3aed', iconBg:'#ede9fe' },
  p4: { bg:'#fff7ed', border:'#fed7aa', icon:'#ea580c', iconBg:'#ffedd5' },
  p5: { bg:'#fdf2f8', border:'#fbcfe8', icon:'#db2777', iconBg:'#fce7f3' },
  p6: { bg:'#f0fdfa', border:'#99f6e4', icon:'#0d9488', iconBg:'#ccfbf1' },
};

// ─── ICÔNES SVG ────────────────────────────────────────────
const I = {
  arrowLeft: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  user: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  award: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  ),
  file: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  lock: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  upload: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  ),
  check: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  trash: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  ),
  eye: (show) => show ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  x: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  link: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  send: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
};

// ─── COMPOSANTS ────────────────────────────────────────────
function Badge({ children, color, bg }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:3, padding:'.18rem .58rem', borderRadius:999, fontSize:'.66rem', fontWeight:700, color, background:bg }}>
      {children}
    </span>
  );
}

function Btn({ children, variant='accent', onClick, disabled, style={}, type='button' }) {
  const styles = {
    accent: { background:T.accentGrad, color:'#fff', border:'none', boxShadow:'0 4px 14px rgba(45,158,107,.3)' },
    ghost:  { background:'transparent', color:T.textSoft, border:`1px solid ${T.cardBorder}` },
    danger: { background:T.dangerLight, color:T.danger, border:`1px solid ${T.danger}40` },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ display:'inline-flex', alignItems:'center', gap:'.38rem', padding:'.52rem 1.1rem', borderRadius:9, fontFamily:'inherit', fontSize:'.82rem', fontWeight:700, cursor:disabled?'not-allowed':'pointer', opacity:disabled?.5:1, transition:'all .15s', ...styles[variant], ...style }}>
      {children}
    </button>
  );
}

// ✅ Card avec couleur pastel optionnelle
function Card({ children, style={}, pastel=null }) {
  const base = {
    background: pastel ? pastel.bg : T.card,
    borderRadius: 14,
    border: `1.5px solid ${pastel ? pastel.border : T.cardBorder}`,
    boxShadow: T.shadow,
    padding: '1.25rem',
    marginBottom: '1rem',
  };
  return <div style={{ ...base, ...style }}>{children}</div>;
}

function CardHeader({ title, icon:IconComp, pastel=null }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, fontWeight:700, fontSize:'.88rem', color:T.text, marginBottom:'1rem', paddingBottom:'.75rem', borderBottom:`1px solid ${pastel ? pastel.border : T.cardBorder}` }}>
      <div style={{ width:28, height:28, borderRadius:8, background:pastel ? pastel.iconBg : T.accentLight, display:'flex', alignItems:'center', justifyContent:'center', color:pastel ? pastel.icon : T.accent, flexShrink:0 }}>
        <IconComp/>
      </div>
      {title}
    </div>
  );
}

function InfoRow({ label, value, highlight, pastel=null }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.62rem 0', borderBottom:`1px solid ${pastel ? pastel.border : T.cardBorder}` }}>
      <span style={{ color:T.textMuted, fontSize:'.8rem' }}>{label}</span>
      <span style={{ color:highlight ? T.accent : T.text, fontWeight:600, fontSize:'.82rem' }}>{value||'—'}</span>
    </div>
  );
}

function MsgBox({ m }) {
  if (!m?.text) return null;
  const ok = m.type === 'success';
  return (
    <div style={{ padding:'.72rem 1rem', borderRadius:9, marginBottom:'1rem', fontSize:'.82rem', fontWeight:600, background:ok?T.successLight:T.dangerLight, color:ok?T.success:T.danger, border:`1px solid ${ok?T.success:T.danger}40`, display:'flex', alignItems:'center', gap:'.4rem' }}>
      {ok ? <I.check/> : '⚠'} {m.text}
    </div>
  );
}

function CVUploader({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [drag, setDrag] = useState(false);

  const upload = async () => {
    if (!file) return setMsg('Sélectionnez un fichier PDF');
    setUploading(true);
    setMsg('');
    const fd = new FormData();
    fd.append('cv', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/etudiants/upload-cv', { method:'POST', headers:{ Authorization:'Bearer '+token }, body:fd });
      const data = await res.json();
      if (res.ok) { setMsg('CV uploadé avec succès !'); setFile(null); onSuccess(data.cvUrl); }
      else setMsg('Erreur : '+(data.message||'Échec'));
    } catch { setMsg('Erreur de connexion'); }
    finally { setUploading(false); }
  };

  return (
    <div>
      <div
        onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f?.type==='application/pdf'){setFile(f);setMsg('');}else setMsg('PDF uniquement');}}
        onClick={()=>document.getElementById('cv-upload').click()}
        style={{ border:`2px dashed ${drag?T.accent:T.cardBorder}`, borderRadius:12, padding:'2rem', textAlign:'center', cursor:'pointer', background:drag?T.accentLight:T.bg, transition:'all .2s', marginBottom:'1rem' }}
      >
        <input id="cv-upload" type="file" accept=".pdf" style={{ display:'none' }} onChange={e=>{const f=e.target.files[0];if(f){setFile(f);setMsg('');}}}/>
        <div style={{ color:T.accent, marginBottom:'.5rem', display:'flex', justifyContent:'center' }}><I.upload/></div>
        <p style={{ color:file?T.accent:T.textMuted, fontWeight:file?600:400, fontSize:'.85rem' }}>{file?file.name:'Glissez votre CV PDF ici ou cliquez'}</p>
        <p style={{ color:T.textMuted, fontSize:'.73rem', marginTop:'.25rem' }}>PDF uniquement — Max 10 MB</p>
      </div>
      {msg && <div style={{ padding:'.6rem .85rem', borderRadius:8, fontSize:'.8rem', marginBottom:'.75rem', background:msg.includes('succès')?T.successLight:T.dangerLight, color:msg.includes('succès')?T.success:T.danger, fontWeight:600 }}>{msg}</div>}
      {file && <Btn onClick={upload} disabled={uploading} style={{ width:'100%', justifyContent:'center' }}>{uploading?'Upload en cours…':'Uploader mon CV'}</Btn>}
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ────────────────────────────────────
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
  const [formData, setFormData] = useState({ nom:user?.nom||'', prenom:user?.prenom||'', email:user?.email||'', telephone:user?.telephone||'' });
  const [extraData, setExtraData] = useState({ filiere:'', matricule:'', niveau:'', cvUrl:'', specialite:'', departement:'', typeEncadrant:'', bio:'' });
  const [mdpData, setMdpData] = useState({ nouveau:'', confirmer:'' });
  const [msg, setMsg] = useState({ text:'', type:'' });
  const [mdpMsg, setMdpMsg] = useState({ text:'', type:'' });
  const [certifs, setCertifs] = useState([
    { id:1, titre:'AWS Cloud Practitioner', emetteur:'Amazon Web Services', date:'2024-03', valide:true, url:'#' },
    { id:2, titre:'React Developer Certificate', emetteur:'Meta', date:'2024-01', valide:true, url:'#' },
    { id:3, titre:'Python for Data Science', emetteur:'IBM', date:'2023-11', valide:true, url:'#' },
  ]);
  const [showAddCertif, setShowAddCertif] = useState(false);
  const [newCertif, setNewCertif] = useState({ titre:'', emetteur:'', date:'', url:'' });

  useEffect(()=>{ fetchAll(); },[]);

  const fetchAll = async () => {
    try {
      if (user?.role==='ETUDIANT') {
        const { data } = await API.get('/etudiants/mon-profil');
        setProfilExtra(data);
        setExtraData({ filiere:data.filiere||'', matricule:data.matricule||'', niveau:data.niveau||'', cvUrl:data.cvUrl||'' });
        try { const{data:p}=await API.get('/projets/mon-projet'); setProjet(p); } catch {}
        try { const{data:c}=await API.get('/candidatures/mes-candidatures'); setCandidatures(c); } catch {}
      }
      if (user?.role==='ENCADRANT') {
        const { data } = await API.get('/encadrants/mon-profil');
        setProfilExtra(data);
        setExtraData({ specialite:data.specialite||'', departement:data.departement||'', typeEncadrant:data.typeEncadrant||'', bio:data.bio||'' });
      }
    } catch {} finally { setLoading(false); }
  };

  const showMessage = (text, type, setter) => { setter({text,type}); setTimeout(()=>setter({text:'',type:''}),4000); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await API.put('/auth/profile', formData);
      login(data, localStorage.getItem('token'));
      if (user?.role==='ETUDIANT') await API.put('/etudiants/mon-profil', { filiere:extraData.filiere, matricule:extraData.matricule, niveau:extraData.niveau, cvUrl:extraData.cvUrl });
      if (user?.role==='ENCADRANT') await API.put('/encadrants/mon-profil', { specialite:extraData.specialite, departement:extraData.departement, typeEncadrant:extraData.typeEncadrant, bio:extraData.bio });
      showMessage('Profil sauvegardé avec succès !','success',setMsg); fetchAll();
    } catch(err) { showMessage('Erreur : '+(err.response?.data?.message||'Erreur'),'error',setMsg); }
    finally { setSaving(false); }
  };

  const handleChangeMdp = async (e) => {
    e.preventDefault();
    if (mdpData.nouveau!==mdpData.confirmer) return showMessage('Les mots de passe ne correspondent pas','error',setMdpMsg);
    if (mdpData.nouveau.length<8) return showMessage('Minimum 8 caractères','error',setMdpMsg);
    setSavingMdp(true);
    try {
      await API.put('/auth/profile',{mot_de_passe:mdpData.nouveau});
      showMessage('Mot de passe changé avec succès !','success',setMdpMsg);
      setMdpData({nouveau:'',confirmer:''}); setShowMdp(false);
    } catch(err) { showMessage('Erreur : '+(err.response?.data?.message||'Erreur'),'error',setMdpMsg); }
    finally { setSavingMdp(false); }
  };

  const addCertif = () => {
    if (!newCertif.titre||!newCertif.emetteur) return;
    setCertifs(prev=>[...prev,{id:Date.now(),...newCertif,valide:true}]);
    setNewCertif({titre:'',emetteur:'',date:'',url:''}); setShowAddCertif(false);
  };

  const iStyle = { width:'100%', padding:'.65rem .9rem', borderRadius:9, border:`1.5px solid ${T.cardBorder}`, fontSize:'.85rem', outline:'none', fontFamily:'inherit', color:T.text, background:T.card, transition:'border-color .18s' };
  const lStyle = { display:'block', color:T.textSoft, fontSize:'.75rem', fontWeight:700, marginBottom:'.3rem', letterSpacing:'.01em' };

  const TABS = [
    { id:'infos',  label:'Informations',  Icon:I.user,  pastel:T.p1 },
    { id:'certifs',label:'Certifications',Icon:I.award, pastel:T.p3 },
    { id:'cv',     label:'CV & Documents',Icon:I.file,  pastel:T.p2 },
    { id:'secu',   label:'Sécurité',      Icon:I.lock,  pastel:T.p4 },
  ];

  const candCfg = {
    EN_ATTENTE: {c:T.warning,bg:T.warningLight,l:'En attente'},
    QUIZ_REQUIS:{c:T.purple,bg:T.purpleLight,l:'Quiz requis'},
    INTERVIEW:  {c:T.success,bg:T.successLight,l:'Interview'},
    ACCEPTE:    {c:T.success,bg:T.successLight,l:'Accepté'},
    REFUSE:     {c:T.danger,bg:T.dangerLight,l:'Refusé'},
  };

  const initials = `${user?.prenom?.[0]||''}${user?.nom?.[0]||''}`.toUpperCase();
  const roleLabel = { ETUDIANT:'Étudiant', ENCADRANT:'Encadrant', ADMINISTRATEUR:'Admin' };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'grid', placeItems:'center', background:T.bg, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48, height:48, borderRadius:13, background:T.accentGrad, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto .85rem', boxShadow:'0 4px 16px rgba(45,158,107,.35)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3.33 2 8.67 2 12 0v-5"/></svg>
        </div>
        <p style={{ color:T.accent, fontWeight:700, fontSize:'.9rem' }}>Chargement…</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:T.bg, fontFamily:"'Plus Jakarta Sans',sans-serif", color:T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .inp-f:focus{border-color:${T.accent}!important;box-shadow:0 0 0 3px ${T.accentSoft};outline:none;}
        .inp-f::placeholder{color:${T.textMuted};}
        textarea{resize:vertical;font-family:inherit;}
        select option{background:#fff;color:${T.text};}
        ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(45,158,107,.25);border-radius:3px;}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
        .tab-anim{animation:fadeSlide .2s ease;}
        .certif-card{border-radius:14px;padding:1.1rem;display:flex;align-items:flex-start;gap:.85rem;transition:all .2s;border:1.5px solid;}
        .certif-card:hover{box-shadow:${T.shadowMd};transform:translateY(-2px);}
        .pwd-wrap{position:relative;}.pwd-wrap input{padding-right:3rem;}
        .pwd-eye{position:absolute;right:.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:${T.textMuted};display:flex;align-items:center;}
        .pwd-eye:hover{color:${T.accent};}
        @media(max-width:1024px){.profil-grid{grid-template-columns:1fr!important;}}
        @media(max-width:768px){
          .profil-header{padding:.75rem 1rem!important;}
          .profil-hero{padding:1.5rem 1rem!important;flex-direction:column!important;align-items:flex-start!important;gap:1rem!important;}
          .profil-stats{display:none!important;}
          .profil-tabs{padding:0 1rem!important;gap:.25rem!important;overflow-x:auto!important;}
          .profil-content{padding:1rem!important;}
          .infos-grid{grid-template-columns:1fr!important;}
        }
        @media(max-width:480px){.profil-content{padding:.75rem!important;}}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background:T.sidebar, position:'sticky', top:0, zIndex:20 }}>
        <div className="profil-header" style={{ padding:'.85rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'.75rem', boxShadow:'0 2px 12px rgba(26,61,43,.3)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.85rem' }}>
            <button
              onClick={()=>navigate(-1)}
              style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.18)', color:'#fff', padding:'.42rem .7rem', borderRadius:9, cursor:'pointer', fontFamily:'inherit', fontSize:'.8rem', fontWeight:600, display:'flex', alignItems:'center', gap:'.4rem' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.18)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.1)'}
            >
              <I.arrowLeft/> Retour
            </button>
            <div style={{ width:34, height:34, borderRadius:10, background:T.accentGrad, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 3px 10px rgba(45,158,107,.4)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3.33 2 8.67 2 12 0v-5"/></svg>
            </div>
            <div>
              <h1 style={{ color:'#fff', fontWeight:800, fontSize:'1rem', lineHeight:1 }}>Mon Profil</h1>
              <p style={{ color:'rgba(255,255,255,.5)', fontSize:'.68rem', marginTop:'.1rem' }}>Gérez vos informations personnelles</p>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="profil-hero" style={{ padding:'1.5rem 1.5rem 0', display:'flex', alignItems:'flex-end', gap:'1.5rem', maxWidth:1100, margin:'0 auto' }}>
          {/* Avatar avec ring coloré */}
          <div style={{ position:'relative', flexShrink:0 }}>
            <div style={{ width:88, height:88, borderRadius:'50%', background:T.accentGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', fontWeight:800, color:'#fff', boxShadow:'0 8px 28px rgba(45,158,107,.4)', border:'3px solid rgba(255,255,255,.2)' }}>
              {initials}
            </div>
            <div style={{ position:'absolute', bottom:2, right:2, width:22, height:22, borderRadius:'50%', background:T.success, border:`2px solid ${T.sidebar}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <I.check/>
            </div>
          </div>

          {/* Infos */}
          <div style={{ flex:1, paddingBottom:'1.25rem', minWidth:0 }}>
            <h2 style={{ fontWeight:800, fontSize:'1.4rem', color:'#fff', marginBottom:'.35rem' }}>{user?.prenom} {user?.nom}</h2>
            <div style={{ display:'flex', gap:'.45rem', flexWrap:'wrap', marginBottom:'.5rem' }}>
              <Badge color={T.accentMid} bg="rgba(76,175,130,.2)">{roleLabel[user?.role]||user?.role}</Badge>
              {profilExtra?.niveau && <Badge color="rgba(255,255,255,.8)" bg="rgba(255,255,255,.12)">{profilExtra.niveau}</Badge>}
              {profilExtra?.filiere && <Badge color="rgba(255,255,255,.8)" bg="rgba(255,255,255,.12)">{profilExtra.filiere}</Badge>}
            </div>
            <p style={{ color:'rgba(255,255,255,.55)', fontSize:'.78rem' }}>{user?.email}</p>
          </div>

          {/* Stats pastels */}
          <div className="profil-stats" style={{ display:'flex', gap:'.75rem', paddingBottom:'1.25rem', flexShrink:0 }}>
            {[
              { v:certifs.length, l:'Certifications', bg:'rgba(139,92,246,.25)', c:'#c4b5fd' },
              { v:candidatures.length, l:'Candidatures', bg:'rgba(59,130,246,.25)', c:'#93c5fd' },
              { v:projet?1:0, l:'Projets', bg:'rgba(16,185,129,.25)', c:'#6ee7b7' },
            ].map((s,i)=>(
              <div key={i} style={{ textAlign:'center', padding:'.85rem 1.25rem', background:s.bg, borderRadius:12, border:`1px solid ${s.c}40`, backdropFilter:'blur(4px)' }}>
                <div style={{ fontWeight:800, fontSize:'1.4rem', color:s.c }}>{s.v}</div>
                <div style={{ color:'rgba(255,255,255,.55)', fontSize:'.68rem', marginTop:'.15rem' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs avec couleurs pastels */}
        <div className="profil-tabs" style={{ display:'flex', gap:'.25rem', padding:'0 1.5rem', maxWidth:1100, margin:'.5rem auto 0' }}>
          {TABS.map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ display:'flex', alignItems:'center', gap:'.4rem', padding:'.65rem 1.1rem', borderRadius:'10px 10px 0 0', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:'.8rem', fontWeight:activeTab===tab.id?700:500, background:activeTab===tab.id?tab.pastel.bg:'transparent', color:activeTab===tab.id?tab.pastel.icon:'rgba(255,255,255,.55)', transition:'all .15s', borderBottom:activeTab===tab.id?`2px solid ${tab.pastel.icon}`:'2px solid transparent' }}>
              <tab.Icon/> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div className="profil-content tab-anim" style={{ maxWidth:1100, margin:'0 auto', padding:'1.5rem' }}>

        {/* ── TAB INFOS ── */}
        {activeTab==='infos' && (
          <div className="profil-grid" style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'1rem' }}>
            {/* Colonne gauche */}
            <div>
              <Card pastel={T.p1}>
                <CardHeader title="Informations" icon={I.user} pastel={T.p1}/>
                <InfoRow label="Nom" value={user?.nom} pastel={T.p1}/>
                <InfoRow label="Prénom" value={user?.prenom} pastel={T.p1}/>
                <InfoRow label="Email" value={user?.email} highlight pastel={T.p1}/>
                <InfoRow label="Téléphone" value={user?.telephone} pastel={T.p1}/>
              </Card>

              {user?.role==='ETUDIANT' && (
                <Card pastel={T.p2}>
                  <CardHeader title="Académique" icon={I.award} pastel={T.p2}/>
                  <InfoRow label="Matricule" value={profilExtra?.matricule} pastel={T.p2}/>
                  <InfoRow label="Filière" value={profilExtra?.filiere} pastel={T.p2}/>
                  <InfoRow label="Niveau" value={profilExtra?.niveau} pastel={T.p2}/>
                  <InfoRow label="Statut PFE" value={profilExtra?.statutPFE?.replace(/_/g,' ')} highlight pastel={T.p2}/>
                </Card>
              )}

              {user?.role==='ENCADRANT' && (
                <Card pastel={T.p6}>
                  <CardHeader title="Professionnel" icon={I.award} pastel={T.p6}/>
                  {[['Spécialité',profilExtra?.specialite],['Département',profilExtra?.departement],['Type',profilExtra?.typeEncadrant],['Disponibilité',profilExtra?.disponibilite?'Disponible':'Non disponible']].map(([l,v])=>(
                    <InfoRow key={l} label={l} value={v} pastel={T.p6}/>
                  ))}
                </Card>
              )}

              {projet && (
                <Card pastel={T.p3}>
                  <CardHeader title="Projet PFE actuel" icon={I.file} pastel={T.p3}/>
                  <p style={{ fontWeight:700, color:T.text, fontSize:'.88rem', marginBottom:'.5rem' }}>{projet.titre||projet.idSujet?.titre}</p>
                  <Badge color={T.p3.icon} bg={T.p3.iconBg}>{projet.statutProjet}</Badge>
                  {projet.idSujet?.technologies?.length>0 && (
                    <div style={{ display:'flex', gap:'.3rem', flexWrap:'wrap', marginTop:'.65rem' }}>
                      {projet.idSujet.technologies.map((t,i)=><Badge key={i} color={T.p3.icon} bg={T.p3.iconBg}>{t}</Badge>)}
                    </div>
                  )}
                </Card>
              )}

              {candidatures.length>0 && (
                <Card pastel={T.p5}>
                  <CardHeader title="Mes candidatures" icon={I.send} pastel={T.p5}/>
                  {candidatures.map(c=>{
                    const sc=candCfg[c.statut]||{c:T.textMuted,bg:T.cardBorder,l:c.statut};
                    return (
                      <div key={c._id} style={{ padding:'.6rem 0', borderBottom:`1px solid ${T.p5.border}` }}>
                        <p style={{ fontWeight:600, color:T.text, fontSize:'.82rem', marginBottom:'.2rem' }}>{c.idSujet?.titre||'Sujet PFE'}</p>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ color:T.textMuted, fontSize:'.72rem' }}>Score IA : <strong style={{ color:T.accent }}>{c.scoreIA}/100</strong></span>
                          <Badge color={sc.c} bg={sc.bg}>{sc.l}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </Card>
              )}
            </div>

            {/* Colonne droite — Modifier */}
            <div>
              <Card>
                <CardHeader title="Modifier mes informations" icon={I.user}/>
                <MsgBox m={msg}/>
                <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'.85rem' }}>
                  <div className="infos-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.85rem' }}>
                    <div>
                      <label style={lStyle}>Nom</label>
                      <input style={iStyle} className="inp-f" value={formData.nom} onChange={e=>setFormData({...formData,nom:e.target.value})} placeholder="Votre nom"/>
                    </div>
                    <div>
                      <label style={lStyle}>Prénom</label>
                      <input style={iStyle} className="inp-f" value={formData.prenom} onChange={e=>setFormData({...formData,prenom:e.target.value})} placeholder="Votre prénom"/>
                    </div>
                  </div>
                  <div>
                    <label style={lStyle}>Email</label>
                    <input type="email" style={iStyle} className="inp-f" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})}/>
                  </div>
                  <div>
                    <label style={lStyle}>Téléphone</label>
                    <input style={iStyle} className="inp-f" placeholder="+216 XX XXX XXX" value={formData.telephone} onChange={e=>setFormData({...formData,telephone:e.target.value})}/>
                  </div>
                  {user?.role==='ETUDIANT' && <>
                    <div className="infos-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.85rem' }}>
                      <div>
                        <label style={lStyle}>Filière</label>
                        <input style={iStyle} className="inp-f" placeholder="Informatique" value={extraData.filiere} onChange={e=>setExtraData({...extraData,filiere:e.target.value})}/>
                      </div>
                      <div>
                        <label style={lStyle}>Matricule</label>
                        <input style={iStyle} className="inp-f" placeholder="2023001" value={extraData.matricule} onChange={e=>setExtraData({...extraData,matricule:e.target.value})}/>
                      </div>
                    </div>
                    <div>
                      <label style={lStyle}>Niveau</label>
                      <select style={iStyle} className="inp-f" value={extraData.niveau} onChange={e=>setExtraData({...extraData,niveau:e.target.value})}>
                        <option value="">Choisir</option>
                        {['Licence 1','Licence 2','Licence 3','Master 1','Master 2'].map(n=><option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </>}
                  {user?.role==='ENCADRANT' && <>
                    <div className="infos-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.85rem' }}>
                      <div>
                        <label style={lStyle}>Spécialité</label>
                        <input style={iStyle} className="inp-f" placeholder="Informatique" value={extraData.specialite} onChange={e=>setExtraData({...extraData,specialite:e.target.value})}/>
                      </div>
                      <div>
                        <label style={lStyle}>Département</label>
                        <input style={iStyle} className="inp-f" placeholder="Génie Info" value={extraData.departement} onChange={e=>setExtraData({...extraData,departement:e.target.value})}/>
                      </div>
                    </div>
                    <div>
                      <label style={lStyle}>Bio</label>
                      <textarea rows={3} style={iStyle} className="inp-f" placeholder="Votre parcours…" value={extraData.bio} onChange={e=>setExtraData({...extraData,bio:e.target.value})}/>
                    </div>
                  </>}
                  <Btn type="submit" disabled={saving} style={{ alignSelf:'flex-start' }}>{saving?'Sauvegarde…':'Sauvegarder les modifications'}</Btn>
                </form>
              </Card>
            </div>
          </div>
        )}

        {/* ── TAB CERTIFICATIONS ── */}
        {activeTab==='certifs' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'.65rem' }}>
              <div>
                <h2 style={{ fontWeight:800, color:T.text, fontSize:'1.1rem' }}>Mes certifications</h2>
                <p style={{ color:T.textMuted, fontSize:'.78rem', marginTop:'.15rem' }}>Vos badges et certifications professionnels</p>
              </div>
              <Btn onClick={()=>setShowAddCertif(true)}><I.plus/> Ajouter</Btn>
            </div>

            {certifs.length===0
              ? <Card pastel={T.p3} style={{ textAlign:'center', padding:'3rem' }}>
                  <div style={{ width:64, height:64, borderRadius:16, background:T.p3.iconBg, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', color:T.p3.icon }}><I.award/></div>
                  <p style={{ color:T.textMuted, fontSize:'.9rem' }}>Aucune certification pour l'instant</p>
                </Card>
              : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1rem' }}>
                  {certifs.map((c,i)=>{
                    const pals=[T.p1,T.p2,T.p3,T.p4,T.p5,T.p6];
                    const pal=pals[i%pals.length];
                    return (
                      <div key={c.id} className="certif-card" style={{ background:pal.bg, borderColor:pal.border }}>
                        <div style={{ width:52, height:52, borderRadius:12, background:pal.iconBg, display:'flex', alignItems:'center', justifyContent:'center', color:pal.icon, fontWeight:800, fontSize:'.9rem', flexShrink:0, border:`1.5px solid ${pal.border}` }}>
                          {c.emetteur.slice(0,2).toUpperCase()}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <h3 style={{ fontWeight:700, color:T.text, fontSize:'.88rem', marginBottom:'.25rem', lineHeight:1.3 }}>{c.titre}</h3>
                          <p style={{ color:pal.icon, fontSize:'.78rem', fontWeight:600, marginBottom:'.3rem' }}>{c.emetteur}</p>
                          {c.date && <p style={{ color:T.textMuted, fontSize:'.72rem' }}>Obtenu : {c.date}</p>}
                          <div style={{ display:'flex', alignItems:'center', gap:'.65rem', marginTop:'.5rem' }}>
                            {c.valide && <Badge color={pal.icon} bg={pal.iconBg}>Vérifié ✓</Badge>}
                            {c.url&&c.url!=='#' && <a href={c.url} target="_blank" rel="noreferrer" style={{ color:pal.icon, fontSize:'.73rem', fontWeight:500 }}>Voir →</a>}
                            <button onClick={()=>setCertifs(prev=>prev.filter(x=>x.id!==c.id))} style={{ background:'none', border:'none', cursor:'pointer', color:T.textMuted, marginLeft:'auto', display:'flex', alignItems:'center' }}><I.trash/></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
            }

            {showAddCertif && (
              <div style={{ position:'fixed', inset:0, background:'rgba(15,45,30,.65)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'1rem' }}>
                <div style={{ background:T.card, borderRadius:16, padding:'1.75rem', width:'100%', maxWidth:460, boxShadow:'0 24px 60px rgba(0,0,0,.2)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
                    <h2 style={{ fontWeight:800, color:T.text, fontSize:'1rem' }}>Ajouter une certification</h2>
                    <button onClick={()=>setShowAddCertif(false)} style={{ background:T.bg, border:'none', width:30, height:30, borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:T.textSoft }}><I.x/></button>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'.85rem' }}>
                    <div><label style={lStyle}>Titre *</label><input style={iStyle} className="inp-f" placeholder="AWS Cloud Practitioner" value={newCertif.titre} onChange={e=>setNewCertif({...newCertif,titre:e.target.value})}/></div>
                    <div><label style={lStyle}>Émetteur *</label><input style={iStyle} className="inp-f" placeholder="Amazon, Google, Meta…" value={newCertif.emetteur} onChange={e=>setNewCertif({...newCertif,emetteur:e.target.value})}/></div>
                    <div><label style={lStyle}>Date d'obtention</label><input type="month" style={iStyle} className="inp-f" value={newCertif.date} onChange={e=>setNewCertif({...newCertif,date:e.target.value})}/></div>
                    <div><label style={lStyle}>URL du badge (optionnel)</label><input style={iStyle} className="inp-f" placeholder="https://www.credly.com/…" value={newCertif.url} onChange={e=>setNewCertif({...newCertif,url:e.target.value})}/></div>
                    <div style={{ display:'flex', gap:'.75rem', marginTop:'.25rem' }}>
                      <Btn variant="ghost" onClick={()=>setShowAddCertif(false)} style={{ flex:1, justifyContent:'center' }}>Annuler</Btn>
                      <Btn onClick={addCertif} style={{ flex:1, justifyContent:'center' }}>Ajouter</Btn>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB CV ── */}
        {activeTab==='cv' && (
          <div className="profil-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <Card pastel={T.p2}>
              <CardHeader title="Mon CV actuel" icon={I.file} pastel={T.p2}/>
              {profilExtra?.cvUrl||extraData.cvUrl ? (
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1rem', background:T.p2.iconBg, border:`1px solid ${T.p2.border}`, borderRadius:10, marginBottom:'1rem' }}>
                    <div style={{ width:44, height:44, borderRadius:10, background:T.p2.icon, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0 }}><I.file/></div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:700, color:T.text, fontSize:'.85rem' }}>CV disponible</p>
                      <p style={{ color:T.textMuted, fontSize:'.72rem', marginTop:'.1rem' }}>Votre CV est en ligne</p>
                    </div>
                    <a href={profilExtra?.cvUrl||extraData.cvUrl} target="_blank" rel="noreferrer" style={{ background:T.p2.icon, color:'#fff', padding:'.45rem .9rem', borderRadius:8, fontSize:'.78rem', fontWeight:700, textDecoration:'none' }}>Voir →</a>
                  </div>
                  <p style={{ color:T.textSoft, fontSize:'.78rem', fontWeight:600, marginBottom:'.75rem' }}>Remplacer le CV :</p>
                  {user?.role==='ETUDIANT' && <CVUploader onSuccess={url=>{ setProfilExtra(p=>({...p,cvUrl:url})); setExtraData(p=>({...p,cvUrl:url})); showMessage('CV mis à jour !','success',setMsg); }}/>}
                </div>
              ) : (
                <div>
                  <div style={{ textAlign:'center', padding:'2rem', background:T.p2.bg, borderRadius:10, marginBottom:'1rem', border:`1px dashed ${T.p2.border}` }}>
                    <div style={{ color:T.p2.icon, marginBottom:'.5rem', display:'flex', justifyContent:'center', fontSize:'2rem' }}><I.upload/></div>
                    <p style={{ color:T.textMuted, fontSize:'.85rem' }}>Aucun CV uploadé</p>
                  </div>
                  {user?.role==='ETUDIANT' && <CVUploader onSuccess={url=>{ setProfilExtra(p=>({...p,cvUrl:url})); setExtraData(p=>({...p,cvUrl:url})); }}/>}
                </div>
              )}
            </Card>
            <div>
              <Card pastel={T.p6}>
                <CardHeader title="Lien vers mon CV" icon={I.link} pastel={T.p6}/>
                <p style={{ color:T.textMuted, fontSize:'.8rem', lineHeight:1.65, marginBottom:'1rem' }}>Renseignez un lien vers votre CV sur Google Drive, Dropbox ou tout autre service.</p>
                <div>
                  <label style={lStyle}>URL du CV</label>
                  <input style={iStyle} className="inp-f" placeholder="https://drive.google.com/…" value={extraData.cvUrl} onChange={e=>setExtraData({...extraData,cvUrl:e.target.value})}/>
                </div>
                <Btn style={{ marginTop:'.85rem' }} onClick={async()=>{ try{ await API.put('/etudiants/mon-profil',{cvUrl:extraData.cvUrl}); showMessage('Lien CV sauvegardé !','success',setMsg); fetchAll(); }catch{} }}>Sauvegarder le lien</Btn>
              </Card>
              <Card pastel={T.p4}>
                <CardHeader title="Conseils" icon={I.award} pastel={T.p4}/>
                <ul style={{ paddingLeft:'1.1rem', color:T.textSoft, fontSize:'.8rem', lineHeight:2.1 }}>
                  <li>Utilisez un CV en format PDF</li>
                  <li>Incluez vos compétences techniques</li>
                  <li>Mentionnez vos projets personnels</li>
                  <li>Ajoutez vos certifications</li>
                  <li>Gardez votre CV à jour régulièrement</li>
                </ul>
              </Card>
            </div>
          </div>
        )}

        {/* ── TAB SÉCURITÉ ── */}
        {activeTab==='secu' && (
          <div className="profil-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <Card pastel={T.p4}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:showMdp?'1.25rem':0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, fontWeight:700, fontSize:'.88rem', color:T.text }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:T.p4.iconBg, display:'flex', alignItems:'center', justifyContent:'center', color:T.p4.icon }}><I.lock/></div>
                  Changer le mot de passe
                </div>
                <Btn variant="ghost" onClick={()=>setShowMdp(!showMdp)} style={{ fontSize:'.78rem', padding:'.35rem .75rem' }}>{showMdp?'Annuler':'Modifier'}</Btn>
              </div>
              {showMdp && <>
                <MsgBox m={mdpMsg}/>
                <form onSubmit={handleChangeMdp} style={{ display:'flex', flexDirection:'column', gap:'.85rem', marginTop:'1.25rem' }}>
                  <div>
                    <label style={lStyle}>Nouveau mot de passe</label>
                    <div className="pwd-wrap">
                      <input type={voir1?'text':'password'} style={iStyle} className="inp-f" placeholder="Minimum 8 caractères" value={mdpData.nouveau} onChange={e=>setMdpData({...mdpData,nouveau:e.target.value})} required/>
                      <button type="button" className="pwd-eye" onClick={()=>setVoir1(!voir1)}><I.eye show={voir1}/></button>
                    </div>
                    {mdpData.nouveau.length>0 && (
                      <div style={{ marginTop:'.35rem' }}>
                        <div style={{ height:3, borderRadius:2, background:T.cardBorder, overflow:'hidden' }}>
                          <div style={{ height:'100%', borderRadius:2, transition:'all .3s', width:mdpData.nouveau.length<6?'30%':mdpData.nouveau.length<10?'65%':'100%', background:mdpData.nouveau.length<6?T.danger:mdpData.nouveau.length<10?T.warning:T.success }}/>
                        </div>
                        <span style={{ fontSize:'.68rem', color:mdpData.nouveau.length<6?T.danger:mdpData.nouveau.length<10?T.warning:T.success, fontWeight:600 }}>{mdpData.nouveau.length<6?'Faible':mdpData.nouveau.length<10?'Moyen':'Fort'}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={lStyle}>Confirmer</label>
                    <div className="pwd-wrap">
                      <input type={voir2?'text':'password'} style={{...iStyle,borderColor:mdpData.confirmer&&mdpData.nouveau!==mdpData.confirmer?T.danger:undefined}} className="inp-f" placeholder="Répétez le mot de passe" value={mdpData.confirmer} onChange={e=>setMdpData({...mdpData,confirmer:e.target.value})} required/>
                      <button type="button" className="pwd-eye" onClick={()=>setVoir2(!voir2)}><I.eye show={voir2}/></button>
                    </div>
                    {mdpData.confirmer&&mdpData.nouveau!==mdpData.confirmer && <p style={{ color:T.danger, fontSize:'.72rem', marginTop:'.25rem' }}>Ne correspondent pas</p>}
                  </div>
                  <Btn type="submit" disabled={savingMdp} style={{ alignSelf:'flex-start' }}>{savingMdp?'Changement…':'Changer le mot de passe'}</Btn>
                </form>
              </>}
            </Card>

            <Card style={{ borderColor:`${T.danger}40`, borderWidth:1.5, background:'#fffbfb' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontWeight:700, fontSize:'.88rem', color:T.danger, marginBottom:'.65rem' }}>⚠ Zone dangereuse</div>
              <p style={{ color:T.textMuted, fontSize:'.8rem', lineHeight:1.7, marginBottom:'1.1rem' }}>La suppression de votre compte est définitive et irréversible. Toutes vos données seront effacées.</p>
              {!showDelete
                ? <Btn variant="danger" onClick={()=>setShowDelete(true)}>Supprimer mon compte</Btn>
                : <div style={{ background:T.dangerLight, border:`1px solid ${T.danger}40`, borderRadius:10, padding:'1rem' }}>
                    <p style={{ color:T.danger, fontWeight:700, fontSize:'.85rem', marginBottom:'1rem' }}>Êtes-vous absolument sûr ? Cette action est irréversible.</p>
                    <div style={{ display:'flex', gap:'.65rem', flexWrap:'wrap' }}>
                      <Btn variant="danger" onClick={()=>{ logout(); navigate('/accueil'); }}>Oui, supprimer définitivement</Btn>
                      <Btn variant="ghost" onClick={()=>setShowDelete(false)}>Annuler</Btn>
                    </div>
                  </div>
              }
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
