import { useState, useEffect, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import API from '../../api/axios';

// ─── RESPONSIVE HOOK ────────────────────────────────────────
function useWindowSize() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return w;
}

function generateMeetLink() {
  const c = 'abcdefghijklmnopqrstuvwxyz';
  const s = (n) => Array.from({ length: n }, () => c[Math.floor(Math.random() * c.length)]).join('');
  return `https://meet.google.com/${s(3)}-${s(4)}-${s(3)}`;
}

// ─── HELPERS DATE/HEURE ────────────────────────────────────
function todayStr() { return new Date().toISOString().split('T')[0]; }
function nowTimeStr() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}
// Extrait l'heure HH:MM depuis une date ISO ou un champ heure séparé
function extraireHeure(r) {
  // ✅ Le modèle Calendrier a maintenant un champ heure "HH:MM" dédié
  // On utilise r.heure directement s'il est présent et valide
  if (r.heure && /^\d{2}:\d{2}$/.test(r.heure)) return r.heure;
  // Défaut sécurisé
  return '09:00';
}


// ─── VALIDATION : date+heure passée ? ──────────────────────
function estPassee(date, heure) {
  if (!date) return false;
  const dt = new Date(`${date}T${heure||'00:00'}:00`);
  return dt < new Date();
}

const T = {
  blue:'#6D9EEB', blueSoft:'#EBF3FF', blueLight:'#BFDBFE',
  green:'#16A34A', greenSoft:'#F0FDF4', greenLight:'#BBF7D0',
  red:'#DC2626', redSoft:'#FEF2F2', redLight:'#FECACA',
  amber:'#D97706', amberSoft:'#FFFBEB',
  gray50:'#F9FAFB', gray100:'#F3F4F6', gray200:'#E5E7EB', gray300:'#D1D5DB',
  gray400:'#9CA3AF', gray500:'#6B7280', gray700:'#374151', gray900:'#111827',
  white:'#FFFFFF',
  busy:'#FEE2E2', busyBorder:'#FECACA', busyText:'#DC2626',
};

const STATUS_MAP = {
  PLANIFIEE: { label:'Planifiée', bg:'#6D9EEB', soft:'#EBF3FF' },
  EFFECTUEE: { label:'Effectuée', bg:'#6AA84F', soft:'#EDF7E6' },
  ANNULEE:   { label:'Annulée',   bg:'#E06666', soft:'#FDECEA' },
};

const TACHE_COLORS = {
  A_FAIRE:  { bg:'#B39DDB', soft:'#F3E8FF', border:'#D8B4FE', label:'À faire'  },
  EN_COURS: { bg:'#F6A96D', soft:'#FEF3C7', border:'#FDE68A', label:'En cours' },
  TERMINEE: { bg:'#81C784', soft:'#F0FDF4', border:'#BBF7D0', label:'Terminée' },
};

function normalise(r) {
  const et = r.idEtudiant;
  const nomEtudiant = et?.utilisateur
    ? `${et.utilisateur.prenom||''} ${et.utilisateur.nom||''}`.trim()
    : r.nomEtudiant || '';
  const heure = extraireHeure(r);
  return {
    ...r,
    lienMeet:   r.lienVisio || r.lienMeet || '',
    statut:     r.statutReunion || r.statut || 'PLANIFIEE',
    titre:      r.titre || '(sans titre)',
    heure,
    date:       r.date ? r.date.slice(0,10) : '',
    duree:      r.duree || 60,
    idEtudiant: et?._id || r.idEtudiant || '',
    nomEtudiant,
  };
}

function normaliseTache(t) {
  const et = t.idEtudiant;
  const nomEtudiant = et?.utilisateur
    ? `${et.utilisateur.prenom||''} ${et.utilisateur.nom||''}`.trim() : '';
  return {
    ...t, _type:'TACHE', statut:t.statutTache||'A_FAIRE',
    titre:t.titre||'(sans titre)',
    dateDebut:  t.dateDebut  ? t.dateDebut.slice(0,10)  : '',
    dateLimite: t.dateLimite ? t.dateLimite.slice(0,10) : '',
    nomEtudiant,
  };
}

function nomDepuisListe(item) {
  const u = item?.etudiant?.utilisateur;
  if (!u) return '—';
  return `${u.prenom||''} ${u.nom||''}`.trim();
}

// ─── DÉTECTION CONFLITS ─────────────────────────────────────
function detecterConflits(reunions, date, heure, duree, excludeId = null) {
  if (!date || !heure) return [];
  const debut = new Date(`${date}T${heure}:00`);
  const fin   = new Date(debut.getTime() + (parseInt(duree)||60)*60000);
  return reunions.filter(r => {
    if (excludeId && r._id === excludeId) return false;
    if (r.statut === 'ANNULEE') return false;
    const rDebut = new Date(`${r.date}T${r.heure||'10:00'}:00`);
    const rFin   = new Date(rDebut.getTime() + (parseInt(r.duree)||60)*60000);
    return debut < rFin && fin > rDebut;
  });
}

// ─── SVG ICONS ──────────────────────────────────────────────
const SvgCalendar = ({ color = T.gray400, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="3"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const SvgClock = ({ color = T.red, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const SvgUser = ({ color = T.gray400, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const SvgLink = ({ color = T.gray400, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
);
const SvgWarning = ({ color = T.red, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const SvgCheck = ({ color = T.green, size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const SvgPlus = ({ color = 'white', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const SvgClose = ({ color = T.gray500, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const SvgInfo = ({ color = T.blue, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const SvgPlay = ({ color = T.amber, size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

// ─── ALERTE CONFLIT ─────────────────────────────────────────
function AlerteConflit({ conflits }) {
  if (!conflits || conflits.length === 0) return null;
  return (
    <div style={{ background:T.busy, border:`1.5px solid ${T.busyBorder}`, borderRadius:10, padding:'.75rem .9rem', marginBottom:'.75rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'.45rem', marginBottom:'.35rem' }}>
        <SvgWarning/><span style={{ color:T.red, fontWeight:700, fontSize:'.8rem' }}>Créneau déjà occupé</span>
      </div>
      {conflits.map((r,i) => (
        <div key={i} style={{ color:T.busyText, fontSize:'.75rem', marginLeft:'1.35rem', marginBottom:'.15rem' }}>
          • <strong>{r.titre}</strong> — {r.heure} ({r.duree||60} min){r.nomEtudiant ? ` · ${r.nomEtudiant}` : ''}
        </div>
      ))}
      <p style={{ color:T.red, fontSize:'.73rem', marginLeft:'1.35rem', marginTop:'.35rem', fontStyle:'italic' }}>
        Veuillez choisir une autre heure ou une autre date.
      </p>
    </div>
  );
}

// ─── ALERTE DATE PASSÉE ─────────────────────────────────────
function AlertePassee({ visible }) {
  if (!visible) return null;
  return (
    <div style={{ background:'#FEF3C7', border:`1.5px solid #FDE68A`, borderRadius:10, padding:'.65rem .9rem', marginBottom:'.75rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
      <SvgWarning color={T.amber}/>
      <span style={{ color:T.amber, fontWeight:600, fontSize:'.8rem' }}>Cette date/heure est déjà passée. Veuillez choisir un créneau futur.</span>
    </div>
  );
}

// ─── CRÉNEAUX DU JOUR ───────────────────────────────────────
function CreneauxDuJour({ reunions, date }) {
  if (!date) return null;
  const duJour = reunions
    .filter(r => r.date === date && r.statut !== 'ANNULEE')
    .sort((a,b) => (a.heure||'').localeCompare(b.heure||''));
  if (duJour.length === 0) return (
    <div style={{ background:T.greenSoft, border:`1.5px solid ${T.greenLight}`, borderRadius:10, padding:'.65rem .9rem', marginBottom:'.75rem', display:'flex', alignItems:'center', gap:'.45rem' }}>
      <SvgCheck/><span style={{ color:T.green, fontSize:'.78rem', fontWeight:600 }}>Ce jour est libre — aucun créneau occupé.</span>
    </div>
  );
  return (
    <div style={{ marginBottom:'.75rem' }}>
      <p style={{ fontSize:'.72rem', fontWeight:700, color:T.gray500, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'.4rem' }}>
        Créneaux occupés — {new Date(date).toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}
      </p>
      {duJour.map((r,i) => {
        const debut = new Date(`${r.date}T${r.heure}:00`);
        const fin   = new Date(debut.getTime() + (r.duree||60)*60000);
        const fStr  = `${fin.getHours().toString().padStart(2,'0')}:${fin.getMinutes().toString().padStart(2,'0')}`;
        return (
          <div key={i} style={{ background:T.busy, border:`1.5px solid ${T.busyBorder}`, borderRadius:8, padding:'.5rem .75rem', display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'.3rem' }}>
            <div style={{ width:3, height:28, background:T.red, borderRadius:2, flexShrink:0 }}/>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontWeight:600, color:T.gray900, fontSize:'.78rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.titre}</p>
              <p style={{ color:T.gray500, fontSize:'.7rem' }}>{r.heure} → {fStr} · {r.duree||60} min</p>
            </div>
            <span style={{ background:T.red, color:'#fff', borderRadius:6, fontSize:'.65rem', fontWeight:700, padding:'.15rem .45rem', flexShrink:0 }}>Occupé</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── INFO ITEM (réutilisable dans les modals) ───────────────
function InfoItem({ icon, label, children, bg = T.gray50, border = T.gray200 }) {
  return (
    <div style={{ display:'flex', gap:'.65rem', alignItems:'center', padding:'.7rem .85rem', background:bg, borderRadius:10, border:`1.5px solid ${border}` }}>
      <div style={{ flexShrink:0 }}>{icon}</div>
      <div><p style={{ color:T.gray400, fontSize:'.7rem', marginBottom:'.1rem' }}>{label}</p>{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
export default function CalendrierPage({ role }) {
  const screenW   = useWindowSize();
  const isMobile  = screenW < 768;
  const isTablet  = screenW >= 768 && screenW < 1024;

  const [reunions, setReunions]   = useState([]);
  const [taches, setTaches]       = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selEvent, setSelEvent]   = useState(null);
  const [selTache, setSelTache]   = useState(null);
  const [isNew, setIsNew]         = useState(false);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState({ text:'', ok:true });
  const [form, setForm]           = useState({ titre:'', description:'', date:'', heure:'10:00', duree:60, idEtudiant:'' });

  // ✅ Conflits + date passée en temps réel
  const conflits = useMemo(() =>
    detecterConflits(reunions, form.date, form.heure, form.duree, selEvent?._id),
    [form.date, form.heure, form.duree, reunions, selEvent]
  );
  const datePassee = useMemo(() =>
    (isNew || (selEvent && !selTache)) ? estPassee(form.date, form.heure) : false,
    [form.date, form.heure, isNew, selEvent, selTache]
  );
  const bloquer = conflits.length > 0 || datePassee;

  const iStyle = { width:'100%', padding:'.6rem .85rem', borderRadius:8, border:`1.5px solid ${T.gray200}`, fontSize:'.875rem', outline:'none', fontFamily:'inherit', color:T.gray900, background:T.white, transition:'border-color .15s,box-shadow .15s' };
  const lStyle = { display:'block', color:T.gray500, fontSize:'.75rem', fontWeight:600, letterSpacing:'.04em', textTransform:'uppercase', marginBottom:'.35rem' };
  const iStyleBusy = { ...iStyle, borderColor:T.red, background:T.busy };

  useEffect(() => {
    fetchReunions();
    fetchTaches();
    if (role === 'ENCADRANT') fetchEtudiants();
  }, []);

  const fetchReunions = async () => {
    setLoading(true);
    try {
      const ep = role === 'ETUDIANT' ? '/calendrier/etudiant' : '/calendrier/encadrant';
      const { data } = await API.get(ep);
      setReunions((Array.isArray(data) ? data : []).map(normalise));
    } catch { setReunions([]); } finally { setLoading(false); }
  };

  const fetchTaches = async () => {
    try {
      const ep = role === 'ETUDIANT' ? '/taches/mes-taches' : '/taches/mes-taches-encadrant';
      const { data } = await API.get(ep);
      setTaches((Array.isArray(data) ? data : []).map(normaliseTache));
    } catch { setTaches([]); }
  };

  const fetchEtudiants = async () => {
    try {
      const { data } = await API.get('/encadrants/mes-etudiants');
      setEtudiants(Array.isArray(data) ? data : []);
    } catch { setEtudiants([]); }
  };

  const showToast = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text:'', ok:true }), 3500);
  };

  const openEvent = useCallback((r) => {
    setSelTache(null); setSelEvent(r); setIsNew(false);
    setForm({ titre:r.titre||'', description:r.description||'', date:r.date||'', heure:r.heure||'10:00', duree:r.duree||60, idEtudiant:r.idEtudiant||'' });
    setShowModal(true);
  }, []);

  const openTache = useCallback((t) => {
    setSelEvent(null); setSelTache(t); setIsNew(false); setShowModal(true);
  }, []);

  const handleEventClick = useCallback((info) => {
    const p = info.event.extendedProps;
    if (p._type === 'TACHE') openTache(p); else openEvent(p);
  }, [openEvent, openTache]);

  const handleDateClick = useCallback((info) => {
    const today = new Date(); today.setHours(0,0,0,0);
    // ✅ Bloquer les dates passées
    if (new Date(info.date) < today) return;
    if (role !== 'ENCADRANT') return;
    setSelEvent(null); setSelTache(null); setIsNew(true);
    setForm({ titre:'', description:'', date:info.dateStr, heure: nowTimeStr(), duree:60, idEtudiant:'' });
    setShowModal(true);
  }, [role]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.idEtudiant) { showToast('Veuillez sélectionner un étudiant.', false); return; }
    // ✅ Bloquer date passée
    if (datePassee) { showToast('Impossible de planifier une réunion à une date/heure passée.', false); return; }
    if (conflits.length > 0) { showToast('Ce créneau est déjà occupé.', false); return; }
    setSaving(true);
    try {
      await API.post('/calendrier', {
        idEtudiant: form.idEtudiant, titre: form.titre, description: form.description,
        date: form.date, heure: form.heure, duree: form.duree, lienVisio: generateMeetLink(),
      });
      showToast("Réunion planifiée ! L'étudiant a été notifié.");
      setShowModal(false); fetchReunions();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la création.', false);
    } finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (datePassee) { showToast('Impossible de modifier vers une date/heure passée.', false); return; }
    if (conflits.length > 0) { showToast('Ce créneau est déjà occupé.', false); return; }
    setSaving(true);
    try {
      await API.put('/calendrier/' + selEvent._id, {
        titre: form.titre, description: form.description,
        date: form.date, heure: form.heure, duree: form.duree, lienVisio: selEvent.lienMeet,
      });
      showToast('Réunion modifiée !');
      setShowModal(false); fetchReunions();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur modification.', false);
    } finally { setSaving(false); }
  };

  const handleStatut = async (statut) => {
    try {
      await API.put('/calendrier/' + selEvent._id + '/statut', { statutReunion: statut });
      showToast(`Réunion marquée comme ${STATUS_MAP[statut]?.label}.`);
      setShowModal(false); fetchReunions();
    } catch { showToast('Erreur statut.', false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer cette réunion ?')) return;
    try {
      await API.delete('/calendrier/' + selEvent._id);
      showToast('Réunion supprimée.');
      setShowModal(false); fetchReunions();
    } catch { showToast('Erreur suppression.', false); }
  };

  const handleTacheStatut = async (statut) => {
    try {
      await API.put('/taches/' + selTache._id + '/statut', { statutTache: statut });
      showToast(`Tâche : ${TACHE_COLORS[statut]?.label}.`);
      setShowModal(false); fetchTaches();
    } catch { showToast('Erreur statut tâche.', false); }
  };

  const fcEvents = useMemo(() => {
    const evR = reunions.map(r => {
      const c = STATUS_MAP[r.statut] || STATUS_MAP.PLANIFIEE;
      const start = new Date(`${r.date}T${r.heure||'10:00'}:00`);
      const end   = new Date(start.getTime() + (r.duree||60)*60000);
      return { id:'r_'+r._id, title:'📅 '+r.titre, start:start.toISOString(), end:end.toISOString(), backgroundColor:c.bg, borderColor:c.bg, textColor:'#fff', extendedProps:r };
    });
    const evT = taches.filter(t=>t.dateDebut).map(t => {
      const c = TACHE_COLORS[t.statut] || TACHE_COLORS.A_FAIRE;
      const start = new Date(t.dateDebut+'T08:00:00');
      const end   = t.dateLimite ? new Date(t.dateLimite+'T18:00:00') : new Date(start.getTime()+3600000);
      return { id:'t_'+t._id, title:'✓ '+t.titre, start:start.toISOString(), end:end.toISOString(), backgroundColor:c.bg, borderColor:c.bg, textColor:'#fff', extendedProps:t };
    });
    return [...evR, ...evT];
  }, [reunions, taches]);

  const prochaines    = reunions.filter(r => r.statut==='PLANIFIEE' && new Date(`${r.date}T${r.heure}:00`) >= new Date()).sort((a,b) => new Date(`${a.date}T${a.heure}`) - new Date(`${b.date}T${b.heure}`));
  const passees       = reunions.filter(r => r.statut==='EFFECTUEE');
  const tachesActives = taches.filter(t => t.statut!=='TERMINEE' && t.dateLimite).sort((a,b) => new Date(a.dateLimite)-new Date(b.dateLimite));

  if (loading) return <div style={{ padding:'3rem', textAlign:'center', color:T.gray400, fontFamily:'inherit' }}>Chargement du calendrier…</div>;

  const gridLayout = isMobile
    ? { display:'flex', flexDirection:'column', gap:'1rem' }
    : { display:'grid', gridTemplateColumns: isTablet ? '1fr 220px' : '1fr 270px', gap:'1.25rem', alignItems:'start' };

  // ── Libellé bouton submit selon état
  const libelleSubmit = () => {
    if (saving) return 'En cours…';
    if (datePassee) return '⚠ Date/heure passée';
    if (conflits.length > 0) return '⚠ Créneau occupé';
    return isNew ? 'Planifier la réunion' : 'Enregistrer les modifications';
  };

  return (
    <div style={{ fontFamily:'inherit' }}>
      <style>{`
        .fc .fc-toolbar-title{font-size:${isMobile?'.95rem':'1.15rem'}!important;font-weight:600!important;color:${T.gray900}!important}
        .fc .fc-button{background:${T.white}!important;background-image:none!important;border:1.5px solid ${T.gray200}!important;color:${T.gray700}!important;text-shadow:none!important;font-size:${isMobile?'.72rem':'.8rem'}!important;font-weight:500!important;padding:${isMobile?'.28rem .55rem':'.35rem .75rem'}!important;border-radius:8px!important;font-family:inherit!important;box-shadow:none!important;transition:background .15s!important}
        .fc .fc-button:hover{background:${T.gray50}!important;border-color:${T.gray300}!important}
        .fc .fc-button:active,.fc .fc-button:focus{background:${T.gray100}!important;outline:none!important;box-shadow:0 0 0 3px ${T.blueLight}!important}
        .fc .fc-button-primary:not(:disabled).fc-button-active{background:${T.blueSoft}!important;border-color:${T.blueLight}!important;color:${T.blue}!important}
        .fc .fc-prev-button,.fc .fc-next-button{width:32px!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important}
        .fc .fc-icon{display:none!important}
        .fc .fc-prev-button::after{content:'';display:inline-block;width:16px;height:16px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round'%3E%3Cpolyline points='15 18 9 12 15 6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-size:contain}
        .fc .fc-next-button::after{content:'';display:inline-block;width:16px;height:16px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round'%3E%3Cpolyline points='9 18 15 12 9 6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-size:contain}
        .fc .fc-col-header-cell{background:${T.gray50}!important;border-color:${T.gray200}!important}
        .fc .fc-col-header-cell-cushion{color:${T.gray500}!important;font-weight:600!important;font-size:${isMobile?'.65rem':'.75rem'}!important;text-transform:uppercase!important;letter-spacing:.05em!important;text-decoration:none!important;padding:${isMobile?'5px 2px':'8px 4px'}!important}
        .fc .fc-daygrid-day-number{color:${T.gray700}!important;font-size:${isMobile?'.72rem':'.8rem'}!important;font-weight:500!important;text-decoration:none!important;padding:${isMobile?'4px 5px':'6px 8px'}!important}
        .fc .fc-day-today{background-color:${T.blueSoft}!important}
        .fc .fc-day-today .fc-daygrid-day-number{background:${T.blue}!important;color:${T.white}!important;border-radius:6px!important;padding:3px 7px!important}
        .fc .fc-day-other .fc-daygrid-day-number{opacity:.45!important}
        .fc .fc-day-other{background:${T.gray50}!important}
        .fc .fc-scrollgrid{border:1.5px solid ${T.gray200}!important;border-radius:12px!important;overflow:hidden!important}
        .fc .fc-scrollgrid td,.fc .fc-scrollgrid th{border-color:${T.gray200}!important}
        .fc .fc-event{border-radius:6px!important;font-size:${isMobile?'.68rem':'.78rem'}!important;font-weight:500!important;padding:${isMobile?'1px 4px':'2px 6px'}!important;cursor:pointer!important;border-width:0!important;transition:opacity .15s!important}
        .fc .fc-event:hover{opacity:.85!important}
        .fc .fc-toolbar{margin-bottom:1rem!important;flex-wrap:wrap!important;gap:.5rem!important}
        .fc .fc-toolbar-chunk{display:flex;align-items:center;gap:6px}
        .fc .fc-timegrid-now-indicator-line{border-color:${T.blue}!important;border-width:2px!important}
        .fc .fc-timegrid-slot-label-cushion{font-size:.75rem!important;color:${T.gray400}!important}
        .r-item{display:flex;align-items:flex-start;gap:.75rem;padding:.75rem;background:${T.white};border-radius:10px;margin-bottom:.5rem;border:1.5px solid ${T.gray200};cursor:pointer;transition:border-color .15s,background .15s}
        .r-item:hover{background:${T.gray50};border-color:${T.gray300}}
        .t-item{display:flex;align-items:flex-start;gap:.65rem;padding:.65rem .75rem;border-radius:10px;margin-bottom:.4rem;cursor:pointer;transition:opacity .15s}
        .t-item:hover{opacity:.8}
        .cal-overlay{position:fixed;inset:0;background:rgba(17,24,39,.45);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem}
        .cal-modal{width:100%;max-width:520px;background:${T.white};border-radius:16px;border:1.5px solid ${T.gray200};box-shadow:0 24px 48px rgba(0,0,0,.12);overflow:hidden;max-height:92vh;overflow-y:auto}
        .cal-inp:focus{border-color:${T.blue}!important;box-shadow:0 0 0 3px ${T.blueLight};outline:none}
        .cal-inp::placeholder{color:${T.gray300}}
        textarea.cal-inp{resize:vertical}
        select.cal-inp{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .75rem center;background-size:14px;padding-right:2.5rem}
        .inp-busy{border-color:${T.red}!important;background:${T.busy}!important}
        .inp-busy:focus{box-shadow:0 0 0 3px ${T.redLight}!important}
        .fc-past-day{opacity:.55;pointer-events:none}
      `}</style>

      {/* Toast */}
      {msg.text && (
        <div style={{ marginBottom:'1rem', padding:'.65rem 1rem', borderRadius:10, background:msg.ok?T.greenSoft:T.redSoft, border:`1.5px solid ${msg.ok?T.greenLight:T.redLight}`, color:msg.ok?T.green:T.red, fontSize:'.85rem', fontWeight:500, display:'flex', alignItems:'center', gap:'.5rem' }}>
          {msg.ok ? <SvgCheck/> : <SvgClose color={T.red}/>}
          {msg.text}
        </div>
      )}

      <div style={gridLayout}>
        {/* CALENDRIER */}
        <div style={{ background:T.white, borderRadius:14, padding:isMobile?'.85rem':'1.25rem', border:`1.5px solid ${T.gray200}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'.5rem' }}>
            {role === 'ENCADRANT' && (
              <button onClick={() => { setSelEvent(null); setSelTache(null); setIsNew(true); setForm({ titre:'', description:'', date:todayStr(), heure:nowTimeStr(), duree:60, idEtudiant:'' }); setShowModal(true); }}
                style={{ background:T.blue, color:T.white, border:'none', padding:isMobile?'.4rem .75rem':'.45rem 1rem', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontSize:isMobile?'.75rem':'.82rem', fontWeight:600, display:'flex', alignItems:'center', gap:'.4rem' }}>
                <SvgPlus/>{isMobile?'Planifier':'Planifier une réunion'}
              </button>
            )}
            {!isMobile && (
              <div style={{ display:'flex', gap:'.6rem', flexWrap:'wrap', marginLeft:'auto' }}>
                {Object.entries(STATUS_MAP).map(([k,v]) => (
                  <div key={k} style={{ display:'flex', alignItems:'center', gap:'.3rem' }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:v.bg }}/>
                    <span style={{ color:T.gray400, fontSize:'.7rem' }}>📅 {v.label}</span>
                  </div>
                ))}
                {Object.entries(TACHE_COLORS).map(([k,v]) => (
                  <div key={k} style={{ display:'flex', alignItems:'center', gap:'.3rem' }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:v.bg }}/>
                    <span style={{ color:T.gray400, fontSize:'.7rem' }}>✓ {v.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="fr"
            headerToolbar={isMobile
              ? { left:'prev,next', center:'title', right:'today' }
              : { left:'prev,next today', center:'title', right:'dayGridMonth,timeGridWeek,timeGridDay' }
            }
            buttonText={{ today:"Auj.", month:'Mois', week:'Sem.', day:'Jour' }}
            events={fcEvents}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            height="auto"
            firstDay={1}
            nowIndicator
            selectable={role === 'ENCADRANT'}
            eventDisplay="block"
            eventTimeFormat={{ hour:'2-digit', minute:'2-digit', hour12:false }}
            dayCellClassNames={(arg) => {
              const t = new Date(); t.setHours(0,0,0,0);
              return arg.date < t ? ['fc-past-day'] : [];
            }}
          />
        </div>

        {/* SIDEBAR */}
        <div>
          {/* Prochaines */}
          <div style={{ background:T.white, borderRadius:14, padding:'1rem', border:`1.5px solid ${T.gray200}`, marginBottom:'1rem' }}>
            <h3 style={{ fontWeight:600, color:T.gray900, fontSize:'.82rem', marginBottom:'.85rem', paddingBottom:'.6rem', borderBottom:`1.5px solid ${T.gray100}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              Prochaines réunions
              <span style={{ background:T.blueSoft, color:T.blue, fontSize:'.7rem', fontWeight:700, padding:'.1rem .5rem', borderRadius:20 }}>{prochaines.length}</span>
            </h3>
            {prochaines.length === 0
              ? <div style={{ textAlign:'center', padding:'1.5rem 0', color:T.gray300 }}>
                  <SvgCalendar color={T.gray300} size={32}/>
                  <p style={{ fontSize:'.8rem', marginTop:'.5rem' }}>Aucune réunion planifiée</p>
                </div>
              : prochaines.slice(0,4).map(r => {
                  const dj = Math.ceil((new Date(r.date)-new Date())/86400000);
                  const badge = dj<=1 ? {bg:T.redSoft,color:T.red,text:dj<=0?'Auj.':'Demain'} : dj<=3 ? {bg:T.amberSoft,color:T.amber,text:`J-${dj}`} : {bg:T.gray100,color:T.gray500,text:`J-${dj}`};
                  return (
                    <div key={r._id} className="r-item" onClick={() => openEvent(r)}>
                      <div style={{ background:T.blue, borderRadius:8, padding:'.35rem .5rem', textAlign:'center', flexShrink:0, minWidth:38 }}>
                        <div style={{ fontWeight:700, fontSize:'.9rem', color:T.white, lineHeight:1 }}>{new Date(r.date).getDate()}</div>
                        <div style={{ fontSize:'.58rem', fontWeight:600, color:'rgba(255,255,255,.75)', textTransform:'uppercase', letterSpacing:'.04em' }}>{new Date(r.date).toLocaleDateString('fr-FR',{month:'short'})}</div>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontWeight:600, color:T.gray900, fontSize:'.82rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'.15rem' }}>{r.titre}</p>
                        <p style={{ color:T.gray400, fontSize:'.73rem' }}>{r.heure} · {r.duree} min</p>
                        {r.nomEtudiant && <p style={{ color:T.gray400, fontSize:'.7rem' }}>{r.nomEtudiant}</p>}
                        {r.lienMeet && <a href={r.lienMeet} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{ color:T.blue, fontSize:'.71rem', fontWeight:600, textDecoration:'none' }}>Rejoindre →</a>}
                      </div>
                      <span style={{ background:badge.bg, color:badge.color, padding:'.15rem .45rem', borderRadius:6, fontSize:'.65rem', fontWeight:700, flexShrink:0 }}>{badge.text}</span>
                    </div>
                  );
                })
            }
          </div>

          {/* Tâches actives */}
          {tachesActives.length > 0 && (
            <div style={{ background:T.white, borderRadius:14, padding:'1rem', border:`1.5px solid ${T.gray200}`, marginBottom:'1rem' }}>
              <h3 style={{ fontWeight:600, color:T.gray900, fontSize:'.82rem', marginBottom:'.85rem', paddingBottom:'.6rem', borderBottom:`1.5px solid ${T.gray100}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                Tâches en cours
                <span style={{ background:'#ede9fe', color:'#7c3aed', fontSize:'.7rem', fontWeight:700, padding:'.1rem .5rem', borderRadius:20 }}>{tachesActives.length}</span>
              </h3>
              {tachesActives.slice(0,5).map(t => {
                const c = TACHE_COLORS[t.statut]||TACHE_COLORS.A_FAIRE;
                const dl = t.dateLimite ? Math.ceil((new Date(t.dateLimite)-new Date())/86400000) : null;
                return (
                  <div key={t._id} className="t-item" style={{ background:c.soft, border:`1.5px solid ${c.border}` }} onClick={() => openTache(t)}>
                    <div style={{ width:10, height:10, borderRadius:3, background:c.bg, flexShrink:0, marginTop:3 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:600, color:T.gray900, fontSize:'.8rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.titre}</p>
                      {t.nomEtudiant && <p style={{ color:T.gray500, fontSize:'.7rem' }}>{t.nomEtudiant}</p>}
                      {dl!==null && <p style={{ fontSize:'.68rem', fontWeight:700, color:dl<=0?T.red:dl<=3?T.amber:c.bg, marginTop:'.1rem' }}>{dl<=0?'Délai dépassé':dl===1?'Demain':`Limite J-${dl}`}</p>}
                    </div>
                    <span style={{ background:c.bg, color:'#fff', padding:'.1rem .4rem', borderRadius:5, fontSize:'.62rem', fontWeight:700, flexShrink:0 }}>{c.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Passées */}
          {passees.length > 0 && (
            <div style={{ background:T.white, borderRadius:14, padding:'1rem', border:`1.5px solid ${T.gray200}` }}>
              <h3 style={{ fontWeight:600, color:T.gray400, fontSize:'.7rem', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'.75rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                Passées <span style={{ background:T.greenSoft, color:T.green, fontSize:'.65rem', fontWeight:700, padding:'.1rem .5rem', borderRadius:20 }}>{passees.length}</span>
              </h3>
              {passees.slice(0,4).map(r => (
                <div key={r._id} onClick={() => openEvent(r)} style={{ display:'flex', alignItems:'center', gap:'.55rem', padding:'.5rem .6rem', borderRadius:8, marginBottom:'.35rem', background:T.greenSoft, border:`1.5px solid ${T.greenLight}`, cursor:'pointer' }}
                  onMouseOver={e=>e.currentTarget.style.opacity='.75'} onMouseOut={e=>e.currentTarget.style.opacity='1'}>
                  <SvgCheck/>
                  <div style={{ minWidth:0, flex:1 }}>
                    <p style={{ fontWeight:500, color:T.gray700, fontSize:'.78rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.titre}</p>
                    <p style={{ color:T.gray400, fontSize:'.7rem' }}>{new Date(r.date).toLocaleDateString('fr-FR')} à {r.heure}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="cal-overlay" onClick={() => setShowModal(false)}>
          <div className="cal-modal" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding:'1.1rem 1.25rem', borderBottom:`1.5px solid ${T.gray100}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ color:T.gray900, fontWeight:600, fontSize:'.95rem', margin:0 }}>
                {isNew ? 'Planifier une réunion' : selTache ? 'Détails de la tâche' : 'Détails de la réunion'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background:T.gray100, border:'none', width:28, height:28, borderRadius:7, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <SvgClose/>
              </button>
            </div>

            <div style={{ padding:'1.25rem' }}>

              {/* ── DÉTAILS TÂCHE ── */}
              {selTache && !isNew && (() => {
                const c = TACHE_COLORS[selTache.statut]||TACHE_COLORS.A_FAIRE;
                return (
                  <div>
                    <div style={{ display:'flex', gap:'.5rem', marginBottom:'1rem', flexWrap:'wrap' }}>
                      <span style={{ background:c.soft, color:c.bg, padding:'.2rem .65rem', borderRadius:6, fontSize:'.73rem', fontWeight:700, border:`1px solid ${c.border}` }}>{c.label}</span>
                      <span style={{ background:T.gray100, color:T.gray500, padding:'.2rem .65rem', borderRadius:6, fontSize:'.73rem', fontWeight:600 }}>Tâche</span>
                    </div>
                    <h3 style={{ fontWeight:600, color:T.gray900, fontSize:'.97rem', marginBottom:'.6rem', lineHeight:1.4 }}>{selTache.titre}</h3>
                    {selTache.description && <p style={{ color:T.gray500, fontSize:'.87rem', lineHeight:1.7, marginBottom:'1rem' }}>{selTache.description}</p>}
                    <div style={{ display:'flex', flexDirection:'column', gap:'.5rem', marginBottom:'1.25rem' }}>
                      {/* ✅ SVG au lieu d'emojis */}
                      {selTache.dateDebut && (
                        <InfoItem icon={<SvgCalendar/>} label="Date de début">
                          <p style={{ fontWeight:600, color:T.gray900, fontSize:'.87rem' }}>
                            {new Date(selTache.dateDebut).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}
                          </p>
                        </InfoItem>
                      )}
                      {selTache.dateLimite && (
                        <InfoItem icon={<SvgClock/>} label="Date limite" bg={T.redSoft} border={T.redLight}>
                          <p style={{ fontWeight:700, color:T.red, fontSize:'.87rem' }}>
                            {new Date(selTache.dateLimite).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}
                          </p>
                        </InfoItem>
                      )}
                      {selTache.nomEtudiant && (
                        <InfoItem icon={<SvgUser/>} label="Étudiant">
                          <p style={{ fontWeight:600, color:T.gray900, fontSize:'.87rem' }}>{selTache.nomEtudiant}</p>
                        </InfoItem>
                      )}
                    </div>
                    {role === 'ETUDIANT' && selTache.statut !== 'TERMINEE' && (
                      <div style={{ display:'flex', gap:'.6rem', flexWrap:'wrap' }}>
                        {selTache.statut === 'A_FAIRE' && (
                          <button onClick={() => handleTacheStatut('EN_COURS')} style={{ flex:1, padding:'.7rem', borderRadius:10, border:`1.5px solid ${TACHE_COLORS.EN_COURS.border}`, background:TACHE_COLORS.EN_COURS.soft, color:TACHE_COLORS.EN_COURS.bg, cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:'.82rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'.4rem' }}>
                            <SvgPlay color={TACHE_COLORS.EN_COURS.bg} size={12}/> Démarrer
                          </button>
                        )}
                        <button onClick={() => handleTacheStatut('TERMINEE')} style={{ flex:1, padding:'.7rem', borderRadius:10, border:`1.5px solid ${T.greenLight}`, background:T.greenSoft, color:T.green, cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:'.82rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'.4rem' }}>
                          <SvgCheck/> Marquer terminée
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ── DÉTAILS RÉUNION ── */}
              {!isNew && selEvent && !selTache && (
                <div>
                  <div style={{ display:'flex', gap:'.5rem', marginBottom:'1rem', flexWrap:'wrap' }}>
                    <span style={{ background:STATUS_MAP[selEvent.statut]?.soft||T.blueSoft, color:STATUS_MAP[selEvent.statut]?.bg||T.blue, padding:'.2rem .65rem', borderRadius:6, fontSize:'.73rem', fontWeight:600 }}>{STATUS_MAP[selEvent.statut]?.label||selEvent.statut}</span>
                    <span style={{ background:T.gray100, color:T.gray500, padding:'.2rem .65rem', borderRadius:6, fontSize:'.73rem', fontWeight:600 }}>{selEvent.duree||60} min</span>
                  </div>
                  <h3 style={{ fontWeight:600, color:T.gray900, fontSize:'.97rem', marginBottom:'.6rem', lineHeight:1.4 }}>{selEvent.titre}</h3>
                  {selEvent.description && <p style={{ color:T.gray500, fontSize:'.87rem', lineHeight:1.7, marginBottom:'1rem' }}>{selEvent.description}</p>}
                  <div style={{ display:'flex', flexDirection:'column', gap:'.5rem', marginBottom:'1.25rem' }}>
                    {/* ✅ Heure correcte + SVG */}
                    <InfoItem icon={<SvgCalendar/>} label="Date et heure">
                      <p style={{ fontWeight:600, color:T.gray900, fontSize:'.87rem' }}>
                        {new Date(selEvent.date).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})} à <strong>{selEvent.heure}</strong>
                      </p>
                    </InfoItem>
                    {selEvent.nomEtudiant && (
                      <InfoItem icon={<SvgUser/>} label="Étudiant">
                        <p style={{ fontWeight:600, color:T.gray900, fontSize:'.87rem' }}>{selEvent.nomEtudiant}</p>
                      </InfoItem>
                    )}
                    {selEvent.lienMeet && (
                      <InfoItem icon={<SvgLink/>} label="Lien Google Meet">
                        <a href={selEvent.lienMeet} target="_blank" rel="noreferrer" style={{ color:T.blue, fontWeight:600, fontSize:'.87rem', textDecoration:'none' }}>Rejoindre Google Meet →</a>
                      </InfoItem>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:'.6rem', flexWrap:'wrap' }}>
                    {selEvent.lienMeet && <a href={selEvent.lienMeet} target="_blank" rel="noreferrer" style={{ flex:1, textAlign:'center', display:'block', padding:'.7rem', borderRadius:10, background:T.blue, color:T.white, fontFamily:'inherit', fontWeight:600, fontSize:'.87rem', textDecoration:'none', minWidth:90 }}>Rejoindre</a>}
                    {role === 'ENCADRANT' && selEvent.statut === 'PLANIFIEE' && <>
                      <button onClick={() => handleStatut('EFFECTUEE')} style={{ flex:1, padding:'.7rem', borderRadius:10, border:`1.5px solid ${T.greenLight}`, background:T.greenSoft, color:T.green, cursor:'pointer', fontFamily:'inherit', fontWeight:500, fontSize:'.82rem', minWidth:90 }}>✓ Effectuée</button>
                      <button onClick={handleDelete} style={{ flex:1, padding:'.7rem', borderRadius:10, border:`1.5px solid ${T.redLight}`, background:T.redSoft, color:T.red, cursor:'pointer', fontFamily:'inherit', fontWeight:500, fontSize:'.82rem', minWidth:90 }}>Supprimer</button>
                    </>}
                  </div>

                  {/* Formulaire modification */}
                  {role === 'ENCADRANT' && selEvent.statut === 'PLANIFIEE' && (
                    <form onSubmit={handleEdit} style={{ marginTop:'1.25rem', borderTop:`1.5px solid ${T.gray100}`, paddingTop:'1.25rem', display:'flex', flexDirection:'column', gap:'.85rem' }}>
                      <p style={{ fontSize:'.75rem', fontWeight:600, color:T.gray400, textTransform:'uppercase', letterSpacing:'.05em' }}>Modifier la réunion</p>
                      <CreneauxDuJour reunions={reunions} date={form.date}/>
                      <AlertePassee visible={datePassee}/>
                      <AlerteConflit conflits={conflits}/>
                      <div><label style={lStyle}>Titre *</label><input className="cal-inp" style={iStyle} value={form.titre} onChange={e=>setForm({...form,titre:e.target.value})} required/></div>
                      <div><label style={lStyle}>Description</label><textarea rows={2} className="cal-inp" style={{...iStyle,resize:'vertical'}} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.85rem' }}>
                        <div>
                          <label style={lStyle}>Date *</label>
                          <input type="date" className={`cal-inp${bloquer?' inp-busy':''}`} style={bloquer?iStyleBusy:iStyle} value={form.date} min={todayStr()} onChange={e=>setForm({...form,date:e.target.value})} required/>
                        </div>
                        <div>
                          <label style={lStyle}>Heure *</label>
                          <input type="time" className={`cal-inp${bloquer?' inp-busy':''}`} style={bloquer?iStyleBusy:iStyle} value={form.heure} onChange={e=>setForm({...form,heure:e.target.value})} required/>
                        </div>
                      </div>
                      <div>
                        <label style={lStyle}>Durée</label>
                        <select className="cal-inp" style={iStyle} value={form.duree} onChange={e=>setForm({...form,duree:parseInt(e.target.value)})}>
                          {[30,45,60,90,120].map(d=><option key={d} value={d}>{d} min</option>)}
                        </select>
                      </div>
                      <button type="submit" disabled={saving||bloquer} style={{ padding:'.7rem', borderRadius:10, border:'none', background:(saving||bloquer)?T.gray200:T.blue, color:(saving||bloquer)?T.gray400:T.white, cursor:(saving||bloquer)?'not-allowed':'pointer', fontFamily:'inherit', fontWeight:600, fontSize:'.87rem' }}>
                        {libelleSubmit()}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* ── FORMULAIRE CRÉATION ── */}
              {isNew && (
                <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:'.85rem' }}>
                  <div><label style={lStyle}>Titre *</label><input className="cal-inp" style={iStyle} placeholder="Ex : Point avancement chapitre 2" value={form.titre} onChange={e=>setForm({...form,titre:e.target.value})} required/></div>
                  <div><label style={lStyle}>Description</label><textarea rows={3} className="cal-inp" style={{...iStyle,resize:'vertical'}} placeholder="Ordre du jour…" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
                  <div>
                    <label style={lStyle}>Étudiant encadré *</label>
                    <select className="cal-inp" style={iStyle} value={form.idEtudiant} onChange={e=>setForm({...form,idEtudiant:e.target.value})} required>
                      <option value="">— Sélectionner un étudiant —</option>
                      {etudiants.map(item=><option key={item.etudiant?._id} value={item.etudiant?._id}>{nomDepuisListe(item)}{item.projet?.titre?` — ${item.projet.titre}`:''}</option>)}
                    </select>
                    {etudiants.length===0 && <p style={{ color:T.amber, fontSize:'.73rem', marginTop:'.35rem' }}>⚠ Aucun étudiant encadré trouvé.</p>}
                  </div>

                  {/* ✅ Créneaux occupés + alertes */}
                  {form.date && <CreneauxDuJour reunions={reunions} date={form.date}/>}
                  <AlertePassee visible={datePassee}/>
                  <AlerteConflit conflits={conflits}/>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.85rem' }}>
                    <div>
                      <label style={lStyle}>Date *</label>
                      <input type="date" className={`cal-inp${bloquer?' inp-busy':''}`} style={bloquer?iStyleBusy:iStyle} value={form.date} min={todayStr()} onChange={e=>setForm({...form,date:e.target.value})} required/>
                    </div>
                    <div>
                      <label style={lStyle}>Heure *</label>
                      <input type="time" className={`cal-inp${bloquer?' inp-busy':''}`} style={bloquer?iStyleBusy:iStyle} value={form.heure} onChange={e=>setForm({...form,heure:e.target.value})} required/>
                    </div>
                  </div>
                  <div>
                    <label style={lStyle}>Durée</label>
                    <select className="cal-inp" style={iStyle} value={form.duree} onChange={e=>setForm({...form,duree:parseInt(e.target.value)})}>
                      {[30,45,60,90,120].map(d=><option key={d} value={d}>{d} min</option>)}
                    </select>
                  </div>
                  <div style={{ background:T.blueSoft, border:`1.5px solid ${T.blueLight}`, borderRadius:10, padding:'.65rem .85rem', display:'flex', gap:'.5rem', alignItems:'flex-start' }}>
                    <SvgInfo/><p style={{ color:T.blue, fontSize:'.78rem', lineHeight:1.6 }}>Un lien Google Meet sera généré automatiquement. L'étudiant recevra une notification dès la création.</p>
                  </div>
                  <div style={{ display:'flex', gap:'.6rem', flexWrap:'wrap' }}>
                    <button type="button" onClick={() => setShowModal(false)} style={{ flex:1, padding:'.7rem', borderRadius:10, border:`1.5px solid ${T.gray200}`, background:T.white, color:T.gray500, cursor:'pointer', fontFamily:'inherit', fontSize:'.87rem', minWidth:80 }}>Annuler</button>
                    <button type="submit" disabled={saving||bloquer} style={{ flex:2, padding:'.7rem', borderRadius:10, border:'none', background:(saving||bloquer)?T.gray200:T.blue, color:(saving||bloquer)?T.gray400:T.white, cursor:(saving||bloquer)?'not-allowed':'pointer', fontFamily:'inherit', fontWeight:600, fontSize:'.87rem', minWidth:120 }}>
                      {libelleSubmit()}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
