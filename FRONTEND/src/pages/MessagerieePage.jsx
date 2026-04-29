// ═══════════════════════════════════════════════════════════
//  FRONTEND/src/pages/MessagerieePage.jsx
//  Design moderne inspiré Smartsupp/Messenger
//  Socket.IO + dropdown encadrant + arrière-plan décoratif
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

const C = {
  bg: '#f0f4f8',
  sidebar: '#ffffff',
  accent: '#1a7a8a',
  accentLight: '#e6f4f6',
  accentDark: '#145f6d',
  text: '#1e293b',
  textSoft: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  white: '#ffffff',
  success: '#22c55e',
  danger: '#ef4444',
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

.msg-root{display:flex;height:100vh;font-family:'Poppins',sans-serif;background:${C.bg};overflow:hidden;}

/* ── Sidebar ── */
.msg-sidebar{
  width:300px;flex-shrink:0;background:${C.white};
  border-right:1px solid ${C.border};
  display:flex;flex-direction:column;height:100vh;
}
.msg-sidebar-header{padding:1rem 1.1rem .85rem;border-bottom:1px solid ${C.border};}
.msg-sidebar-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem;}
.msg-sidebar-title{font-weight:800;font-size:1rem;color:${C.text};display:flex;align-items:center;gap:.5rem;}

.msg-back-btn{
  background:transparent;border:1px solid ${C.border};color:${C.textSoft};
  border-radius:8px;padding:.35rem .7rem;cursor:pointer;font-size:.78rem;
  font-family:'Poppins',sans-serif;transition:all .14s;
}
.msg-back-btn:hover{background:${C.accentLight};color:${C.accent};border-color:${C.accent};}

.msg-search{
  width:100%;padding:.58rem .85rem .58rem 2.2rem;
  border:1.5px solid ${C.border};border-radius:10px;
  background:#f8fafc;font-family:'Poppins',sans-serif;
  font-size:.82rem;color:${C.text};outline:none;transition:border-color .15s;
}
.msg-search:focus{border-color:${C.accent};background:#fff;}
.msg-search::placeholder{color:${C.textMuted};}
.msg-search-wrap{position:relative;}
.msg-search-icon{position:absolute;left:.7rem;top:50%;transform:translateY(-50%);color:${C.textMuted};font-size:.82rem;pointer-events:none;}

/* ── Dropdown ── */
.msg-dropdown-wrap{padding:.75rem 1.1rem;border-bottom:1px solid ${C.border};}
.msg-dropdown-label{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${C.textMuted};margin-bottom:.45rem;}
.msg-dropdown{
  width:100%;padding:.62rem .85rem;border:1.5px solid ${C.border};border-radius:10px;
  background:#f8fafc;font-family:'Poppins',sans-serif;font-size:.83rem;color:${C.text};
  outline:none;cursor:pointer;transition:border-color .15s;
  appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right .75rem center;
}
.msg-dropdown:focus{border-color:${C.accent};}

/* ── Conv list ── */
.msg-conv-list{flex:1;overflow-y:auto;}
.msg-conv-list::-webkit-scrollbar{width:4px;}
.msg-conv-list::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:2px;}

.msg-conv-item{
  display:flex;align-items:center;gap:.85rem;padding:.85rem 1.1rem;
  cursor:pointer;border-bottom:1px solid #f8fafc;transition:background .12s;
}
.msg-conv-item:hover{background:#f8fafc;}
.msg-conv-item.active{
  background:${C.accentLight};
  border-left:3px solid ${C.accent};padding-left:calc(1.1rem - 3px);
}

.msg-avatar{
  width:42px;height:42px;border-radius:50%;display:flex;
  align-items:center;justify-content:center;
  font-weight:700;color:#fff;font-size:.82rem;flex-shrink:0;
  position:relative;
}
.msg-avatar-online::after{
  content:'';position:absolute;bottom:1px;right:1px;
  width:10px;height:10px;border-radius:50%;
  background:${C.success};border:2px solid ${C.white};
}

.msg-conv-name{font-weight:600;font-size:.83rem;color:${C.text};margin-bottom:.15rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.msg-conv-preview{font-size:.73rem;color:${C.textMuted};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.msg-conv-meta{display:flex;flex-direction:column;align-items:flex-end;gap:.3rem;flex-shrink:0;}
.msg-conv-time{font-size:.67rem;color:${C.textMuted};}
.msg-unread-badge{background:${C.accent};color:#fff;border-radius:999px;font-size:.6rem;font-weight:800;padding:.1rem .42rem;min-width:18px;text-align:center;}

/* ── Chat zone ── */
.msg-chat{flex:1;display:flex;flex-direction:column;height:100vh;overflow:hidden;}

/* ── Header chat — gradient teal ── */
.msg-chat-header{
  padding:.9rem 1.5rem;
  background:linear-gradient(135deg,${C.accent},#16A085);
  display:flex;align-items:center;justify-content:space-between;
  flex-shrink:0;
}
.msg-chat-name{font-weight:700;font-size:.95rem;color:#fff;}
.msg-chat-role{font-size:.72rem;color:rgba(255,255,255,.75);font-weight:500;margin-top:.06rem;}
.msg-chat-subject{font-size:.68rem;color:rgba(255,255,255,.6);margin-top:.04rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:280px;}
.msg-chat-user{display:flex;align-items:center;gap:.85rem;}

.msg-online{display:flex;align-items:center;gap:.4rem;font-size:.74rem;color:rgba(255,255,255,.9);font-weight:600;}
.msg-online-dot{width:8px;height:8px;border-radius:50%;background:${C.success};box-shadow:0 0 0 2px rgba(34,197,94,.3);}

.msg-header-btn{
  width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.15);
  border:1px solid rgba(255,255,255,.2);display:flex;align-items:center;
  justify-content:center;cursor:pointer;color:rgba(255,255,255,.9);
  font-size:.8rem;transition:background .14s;
}
.msg-header-btn:hover{background:rgba(255,255,255,.25);}

/* ── Messages area avec motif de fond ── */
.msg-messages{
  flex:1;overflow-y:auto;padding:1.25rem 1.5rem;
  display:flex;flex-direction:column;gap:.55rem;
  background:#eef2f7;
  background-image:radial-gradient(#c8d6e5 1px, transparent 1px);
  background-size:22px 22px;
}
.msg-messages::-webkit-scrollbar{width:5px;}
.msg-messages::-webkit-scrollbar-thumb{background:#c8d6e5;border-radius:3px;}

/* ── Séparateur de date ── */
.msg-date-sep{text-align:center;margin:.5rem 0;position:relative;display:flex;align-items:center;gap:.75rem;}
.msg-date-sep::before,.msg-date-sep::after{content:'';flex:1;height:1px;background:#c8d6e5;}
.msg-date-sep span{
  font-size:.69rem;color:${C.textSoft};font-weight:600;
  background:#dce6f0;padding:.2rem .7rem;border-radius:999px;
  white-space:nowrap;flex-shrink:0;
}

/* ── Bulles ── */
.msg-row{display:flex;align-items:flex-end;gap:.5rem;}
.msg-row.sent{flex-direction:row-reverse;}
.msg-row.recv{flex-direction:row;}

.msg-bubble{
  max-width:65%;padding:.7rem 1rem;
  word-break:break-word;line-height:1.55;font-size:.84rem;
}
.msg-row.sent .msg-bubble{
  background:${C.accent};color:#fff;
  border-radius:18px 18px 4px 18px;
  box-shadow:0 2px 8px rgba(26,122,138,.3);
}
.msg-row.recv .msg-bubble{
  background:${C.white};color:${C.text};
  border-radius:18px 18px 18px 4px;
  border:1px solid ${C.border};
  box-shadow:0 1px 4px rgba(0,0,0,.06);
}

.msg-bubble-time{font-size:.61rem;margin-top:.32rem;display:flex;align-items:center;justify-content:flex-end;gap:.25rem;}
.msg-row.sent  .msg-bubble-time{color:rgba(255,255,255,.6);}
.msg-row.recv  .msg-bubble-time{color:${C.textMuted};}

/* ── Input area ── */
.msg-input-area{
  padding:.9rem 1.25rem;background:${C.white};
  border-top:1px solid ${C.border};
  display:flex;align-items:center;gap:.7rem;flex-shrink:0;
}
.msg-input-wrap{
  flex:1;display:flex;align-items:center;gap:.5rem;
  background:#f8fafc;border:1.5px solid ${C.border};
  border-radius:24px;padding:.5rem .85rem;
  transition:border-color .15s;
}
.msg-input-wrap:focus-within{border-color:${C.accent};background:#fff;}
.msg-input{
  flex:1;border:none;background:transparent;
  font-family:'Poppins',sans-serif;font-size:.84rem;
  color:${C.text};outline:none;resize:none;
  max-height:80px;line-height:1.5;
}
.msg-input::placeholder{color:${C.textMuted};}
.msg-attach-btn{
  background:none;border:none;cursor:pointer;
  color:${C.textMuted};padding:.2rem;
  display:flex;align-items:center;transition:color .14s;
  flex-shrink:0;
}
.msg-attach-btn:hover{color:${C.accent};}
.msg-emoji-btn{
  background:none;border:none;cursor:pointer;
  color:${C.textMuted};padding:.2rem;
  display:flex;align-items:center;transition:color .14s;
  font-size:1rem;flex-shrink:0;
}
.msg-emoji-btn:hover{color:${C.accent};}

.msg-send-btn{
  width:42px;height:42px;border-radius:50%;
  background:${C.accent};border:none;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;flex-shrink:0;transition:all .18s;
  box-shadow:0 3px 12px rgba(26,122,138,.35);
}
.msg-send-btn:hover{background:${C.accentDark};transform:scale(1.07);}
.msg-send-btn:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none;}

/* ── Empty ── */
.msg-empty{
  flex:1;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  text-align:center;padding:2rem;
  background:#eef2f7;
  background-image:radial-gradient(#c8d6e5 1px, transparent 1px);
  background-size:22px 22px;
}
.msg-empty-icon{font-size:3.5rem;margin-bottom:1rem;opacity:.4;}
.msg-empty-title{font-weight:700;color:${C.textSoft};font-size:1rem;margin-bottom:.4rem;}
.msg-empty-sub{font-size:.82rem;color:${C.textMuted};max-width:260px;line-height:1.55;}
.msg-empty-btn{
  margin-top:1.25rem;background:${C.accent};color:#fff;border:none;
  padding:.65rem 1.4rem;border-radius:10px;cursor:pointer;
  font-family:'Poppins',sans-serif;font-size:.84rem;font-weight:600;
  transition:opacity .14s;
}
.msg-empty-btn:hover{opacity:.88;}

/* ── Typing dots ── */
@keyframes tdot{0%,80%,100%{transform:scale(.7);opacity:.35;}40%{transform:scale(1);opacity:1;}}
.tdot{width:7px;height:7px;border-radius:50%;background:${C.textMuted};display:inline-block;margin:0 2px;}
.tdot:nth-child(1){animation:tdot 1.2s infinite 0s;}
.tdot:nth-child(2){animation:tdot 1.2s infinite .2s;}
.tdot:nth-child(3){animation:tdot 1.2s infinite .4s;}

/* ── Msg animation ── */
@keyframes msgIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
.msg-new{animation:msgIn .22s ease;}

/* ── Encadrant card info (étudiant) ── */
.enc-info-card{
  margin:.75rem 1.1rem;padding:.75rem;
  background:${C.accentLight};border-radius:12px;
  border:1px solid rgba(26,122,138,.2);
  display:flex;align-items:center;gap:.75rem;
}

/* ── Emoji picker ── */
.emoji-picker{
  position:absolute;bottom:calc(100% + 8px);right:0;
  background:${C.white};border:1px solid ${C.border};
  border-radius:14px;padding:.65rem;
  box-shadow:0 8px 32px rgba(0,0,0,.12);
  display:grid;grid-template-columns:repeat(8,1fr);gap:2px;
  width:280px;z-index:50;
}
.emoji-picker button{
  background:none;border:none;cursor:pointer;
  font-size:1.3rem;padding:.3rem;border-radius:8px;
  transition:background .1s;line-height:1;
}
.emoji-picker button:hover{background:${C.accentLight};}
.emoji-picker-header{
  grid-column:1/-1;font-size:.68rem;font-weight:700;
  color:${C.textMuted};text-transform:uppercase;
  letter-spacing:.08em;padding:.2rem .1rem .45rem;
}

/* ── File preview ── */
.file-preview{
  padding:.6rem 1.25rem;background:#f8fafc;
  border-top:1px solid ${C.border};
  display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;
}
.file-chip{
  display:flex;align-items:center;gap:.5rem;
  background:${C.accentLight};border:1px solid rgba(26,122,138,.2);
  border-radius:8px;padding:.3rem .65rem;font-size:.75rem;
  color:${C.accent};font-weight:600;
}
.file-chip-remove{
  background:none;border:none;cursor:pointer;
  color:${C.accent};font-size:.85rem;padding:0 .1rem;
  line-height:1;opacity:.7;transition:opacity .14s;
}
.file-chip-remove:hover{opacity:1;}

*{scrollbar-width:thin;scrollbar-color:#c8d6e5 transparent;}
`;

// ── Helpers ──────────────────────────────────────────────
function initiales(u) {
  return `${u?.prenom?.[0] || ''}${u?.nom?.[0] || ''}`.toUpperCase() || '?';
}
const COLORS = ['#1a7a8a', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0284c7', '#db2777'];
function avatarColor(id) {
  let h = 0;
  const s = String(id || '');
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

function Avatar({ user, size = 42, online = false }) {
  return (
    <div
      className={`msg-avatar${online ? ' msg-avatar-online' : ''}`}
      style={{
        width: size,
        height: size,
        background: avatarColor(user?._id || user?.userId),
        fontSize: size * 0.3,
      }}
    >
      {user?.image ? (
        <img
          src={user.image}
          alt=""
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        initiales(user)
      )}
    </div>
  );
}

function formatTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d),
    now = new Date();
  const diff = Math.floor((now - dt) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}
function formatConvTime(d) {
  if (!d) return '';
  const dt = new Date(d),
    now = new Date();
  const diff = Math.floor((now - dt) / 86400000);
  if (diff === 0) return dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (diff === 1) return 'Hier';
  return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

// ── Composant principal ──────────────────────────────────
export default function MessagerieePage() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const [conversations, setConversations] = useState([]);
  const [convSelected, setConvSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [texte, setTexte] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mesEtudiants, setMesEtudiants] = useState([]);
  const [etudiantSelId, setEtudiantSelId] = useState('');
  const [monEncadrant, setMonEncadrant] = useState(null);
  const [monProjet, setMonProjet] = useState(null);

  const [showEmoji, setShowEmoji] = useState(false);
  const [fichiers, setFichiers] = useState([]); // fichiers joints

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimer = useRef(null);
  const fileInputRef = useRef(null);
  const emojiRef = useRef(null);

  // Fermer le picker emoji au clic dehors
  useEffect(() => {
    const handler = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const EMOJIS = [
    '😀',
    '😊',
    '😂',
    '🥰',
    '😍',
    '🤔',
    '👍',
    '👎',
    '🙏',
    '🎉',
    '🔥',
    '💡',
    '✅',
    '❌',
    '⚠️',
    '📎',
    '📝',
    '📅',
    '🎓',
    '👨‍🏫',
    '💬',
    '🕐',
    '📌',
    '🔔',
    '😎',
    '🤓',
    '💪',
    '🙌',
    '👏',
    '🤝',
    '✨',
    '🚀',
  ];

  const insertEmoji = (emoji) => {
    setTexte((prev) => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.size <= 10 * 1024 * 1024); // max 10MB
    if (valid.length < files.length) alert('Certains fichiers dépassent 10 MB et ont été ignorés.');
    setFichiers((prev) => [...prev, ...valid]);
    // Reset input pour permettre de re-sélectionner le même fichier
    e.target.value = '';
  };

  const removeFile = (index) => setFichiers((prev) => prev.filter((_, i) => i !== index));

  const fileIcon = (file) => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type === 'application/pdf') return '📄';
    if (file.type.includes('word')) return '📝';
    return '📎';
  };

  // ── Socket.IO ─────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return;
    const socket = io(SOCKET_URL, { auth: { token: accessToken }, transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('nouveau_message', (msg) => {
      const senderId = msg.idExpediteur?._id;
      const otherId = convSelected?.interlocuteur?._id || convSelected?.userId;
      if (senderId === otherId || msg.idDestinataire?._id === otherId) {
        setMessages((prev) => [...prev, msg]);
        API.put(`/messagerie/${senderId}/lus`).catch(() => {});
      }
      setConversations((prev) =>
        prev.map((c) => {
          const id = c.interlocuteur?._id;
          if (id === senderId) return { ...c, nonLus: (c.nonLus || 0) + 1, dernierMessage: msg };
          return c;
        })
      );
    });
    socket.on('typing', ({ fromUserId }) => {
      if (fromUserId === (convSelected?.interlocuteur?._id || convSelected?.userId))
        setIsTyping(true);
    });
    socket.on('stop_typing', ({ fromUserId }) => {
      if (fromUserId === (convSelected?.interlocuteur?._id || convSelected?.userId))
        setIsTyping(false);
    });

    return () => socket.disconnect();
  }, [accessToken]);

  // ── Charger données ───────────────────────────────────
  useEffect(() => {
    if (role === 'ETUDIANT') loadEtudiantData();
    if (role === 'ENCADRANT') loadEncadrantData();
  }, [role]);

  const loadEtudiantData = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/messagerie/mon-encadrant');
      setMonEncadrant(data.encadrant);
      setMonProjet(data.projet);
      setConvSelected({ interlocuteur: data.encadrant, userId: data.encadrant?._id, nonLus: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger votre encadrant.');
    } finally {
      setLoading(false);
    }
  };

  const loadEncadrantData = async () => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([
        API.get('/messagerie/mes-etudiants'),
        API.get('/messagerie'),
      ]);
      setMesEtudiants(a.data || []);
      setConversations(b.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur chargement.');
    } finally {
      setLoading(false);
    }
  };

  // ── Charger messages ──────────────────────────────────
  useEffect(() => {
    const id = convSelected?.interlocuteur?._id || convSelected?.userId;
    if (id) loadMessages(id);
  }, [convSelected]);

  const loadMessages = async (userId) => {
    setLoadingMsgs(true);
    setError('');
    try {
      const { data } = await API.get(`/messagerie/conversation/${userId}`);
      setMessages(Array.isArray(data) ? data : []);
      setConversations((prev) =>
        prev.map((c) => (c.interlocuteur?._id === userId ? { ...c, nonLus: 0 } : c))
      );
      setMesEtudiants((prev) =>
        prev.map((e) => (e.userId?.toString() === userId ? { ...e, nonLus: 0 } : e))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur chargement messages.');
    } finally {
      setLoadingMsgs(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Dropdown encadrant ────────────────────────────────
  const handleDropdownChange = (userId) => {
    setEtudiantSelId(userId);
    if (!userId) {
      setConvSelected(null);
      return;
    }
    const e = mesEtudiants.find((e) => e.userId?.toString() === userId);
    if (e)
      setConvSelected({
        interlocuteur: {
          _id: e.userId,
          prenom: e.prenom,
          nom: e.nom,
          image: e.image,
          role: 'ETUDIANT',
        },
        userId: e.userId,
        sujetTitre: e.sujetTitre,
        nonLus: e.nonLus,
      });
  };

  // ── Envoyer ───────────────────────────────────────────
  const handleSend = async () => {
    const txt = texte.trim();
    const destId = convSelected?.interlocuteur?._id || convSelected?.userId;
    if ((!txt && fichiers.length === 0) || !destId || sending) return;
    setSending(true);
    setTexte('');
    setFichiers([]);
    const contenuFinal =
      txt + (fichiers.length > 0 ? `\n📎 ${fichiers.map((f) => f.name).join(', ')}` : '');
    const temp = {
      _id: 'tmp-' + Date.now(),
      idExpediteur: { _id: user?._id, prenom: user?.prenom, nom: user?.nom },
      idDestinataire: { _id: destId },
      contenu: contenuFinal,
      lu: false,
      createdAt: new Date().toISOString(),
      _temp: true,
    };
    setMessages((prev) => [...prev, temp]);
    try {
      const { data } = await API.post('/messagerie', {
        idDestinataire: destId,
        contenu: contenuFinal,
      });
      setMessages((prev) => prev.map((m) => (m._id === temp._id ? data : m)));
      setConversations((prev) => {
        const exists = prev.find((c) => c.interlocuteur?._id === destId);
        if (exists)
          return prev.map((c) =>
            c.interlocuteur?._id === destId ? { ...c, dernierMessage: data } : c
          );
        return [
          { interlocuteur: convSelected.interlocuteur, dernierMessage: data, nonLus: 0 },
          ...prev,
        ];
      });
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== temp._id));
      setTexte(txt);
      setError(err.response?.data?.message || 'Erreur envoi.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (val) => {
    setTexte(val);
    const destId = convSelected?.interlocuteur?._id || convSelected?.userId;
    if (socketRef.current && destId) {
      socketRef.current.emit('typing', { toUserId: destId });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(
        () => socketRef.current?.emit('stop_typing', { toUserId: destId }),
        1500
      );
    }
  };

  const grouped = messages.reduce((acc, msg) => {
    const dk = formatDate(msg.createdAt);
    if (!acc.length || acc[acc.length - 1].date !== dk) acc.push({ date: dk, msgs: [msg] });
    else acc[acc.length - 1].msgs.push(msg);
    return acc;
  }, []);

  const isMine = (msg) => {
    const sid = msg.idExpediteur?._id || msg.idExpediteur;
    return sid?.toString() === user?._id?.toString();
  };

  const convFiltered = conversations.filter((c) => {
    if (!search.trim()) return true;
    const n = `${c.interlocuteur?.prenom || ''} ${c.interlocuteur?.nom || ''}`.toLowerCase();
    return n.includes(search.toLowerCase());
  });

  if (loading)
    return (
      <>
        <style>{CSS}</style>
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            background: '#eef2f7',
            backgroundImage: 'radial-gradient(#c8d6e5 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 48,
                height: 48,
                border: `3px solid ${C.accentLight}`,
                borderTopColor: C.accent,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem',
              }}
            />
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
            <p style={{ color: C.accent, fontWeight: 600 }}>Chargement...</p>
          </div>
        </div>
      </>
    );

  return (
    <>
      <style>{CSS}</style>
      <div className="msg-root">
        {/* ══ SIDEBAR ══ */}
        <aside className="msg-sidebar">
          <div className="msg-sidebar-header">
            <div className="msg-sidebar-top">
              <div className="msg-sidebar-title">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: C.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                Messagerie
              </div>
              <button className="msg-back-btn" onClick={() => navigate('/dashboard')}>
                ← Retour
              </button>
            </div>
            {role === 'ENCADRANT' && (
              <div className="msg-search-wrap">
                <span className="msg-search-icon">🔍</span>
                <input
                  className="msg-search"
                  placeholder="Rechercher un étudiant..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Dropdown encadrant */}
          {role === 'ENCADRANT' && (
            <div className="msg-dropdown-wrap">
              <div className="msg-dropdown-label">Mes étudiants assignés</div>
              <select
                className="msg-dropdown"
                value={etudiantSelId}
                onChange={(e) => handleDropdownChange(e.target.value)}
              >
                <option value="">-- Choisir un étudiant --</option>
                {mesEtudiants.map((e) => (
                  <option key={e.userId} value={e.userId}>
                    {e.prenom} {e.nom}
                    {e.matricule ? ` · ${e.matricule}` : ''}
                    {e.nonLus > 0 ? ` 🔴 ${e.nonLus}` : ''}
                  </option>
                ))}
              </select>
              {mesEtudiants.length === 0 && (
                <p
                  style={{
                    fontSize: '.74rem',
                    color: C.textMuted,
                    marginTop: '.5rem',
                    fontStyle: 'italic',
                  }}
                >
                  Aucun étudiant assigné
                </p>
              )}
            </div>
          )}

          {/* Info encadrant (étudiant) */}
          {role === 'ETUDIANT' && monEncadrant && (
            <div className="enc-info-card">
              <Avatar user={monEncadrant} size={40} online />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: '.84rem', color: C.text }}>
                  Dr. {monEncadrant.prenom} {monEncadrant.nom}
                </p>
                <p style={{ fontSize: '.7rem', color: C.accent, fontWeight: 600 }}>
                  Encadrant · En ligne
                </p>
                {monProjet?.idSujet?.titre && (
                  <p
                    style={{
                      fontSize: '.67rem',
                      color: C.textMuted,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    📝 {monProjet.idSujet.titre}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Conversations (encadrant) */}
          {role === 'ENCADRANT' && (
            <div className="msg-conv-list">
              {convFiltered.length === 0 && (
                <p
                  style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    color: C.textMuted,
                    fontSize: '.8rem',
                  }}
                >
                  {search ? 'Aucun résultat' : 'Aucune conversation'}
                </p>
              )}
              {convFiltered.map((conv, i) => {
                const autre = conv.interlocuteur;
                const isActive =
                  (convSelected?.interlocuteur?._id || convSelected?.userId) === autre?._id;
                return (
                  <div
                    key={autre?._id || i}
                    className={`msg-conv-item${isActive ? ' active' : ''}`}
                    onClick={() => {
                      setEtudiantSelId(autre?._id || '');
                      setConvSelected({ interlocuteur: autre, userId: autre?._id, nonLus: 0 });
                    }}
                  >
                    <Avatar user={autre} size={42} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="msg-conv-name">
                        {autre?.prenom} {autre?.nom}
                      </div>
                      <div className="msg-conv-preview">
                        {conv.dernierMessage?.contenu || 'Démarrer la conversation'}
                      </div>
                    </div>
                    <div className="msg-conv-meta">
                      <span className="msg-conv-time">
                        {formatConvTime(conv.dernierMessage?.createdAt)}
                      </span>
                      {conv.nonLus > 0 && <span className="msg-unread-badge">{conv.nonLus}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Étudiant : pas de liste */}
          {role === 'ETUDIANT' && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                color: C.textMuted,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '.75rem', opacity: 0.35 }}>🔒</div>
              <p style={{ fontSize: '.8rem', lineHeight: 1.65 }}>
                Conversation privée avec votre encadrant assigné uniquement.
              </p>
            </div>
          )}
        </aside>

        {/* ══ CHAT ══ */}
        <section className="msg-chat">
          {!convSelected ? (
            <div className="msg-empty">
              <div className="msg-empty-icon">💬</div>
              <div className="msg-empty-title">
                {role === 'ENCADRANT' ? 'Sélectionnez un étudiant' : 'Aucun encadrant assigné'}
              </div>
              <div className="msg-empty-sub">
                {role === 'ENCADRANT'
                  ? 'Utilisez le menu déroulant pour choisir un étudiant et démarrer une conversation.'
                  : error || "Vous n'avez pas encore de projet PFE affecté."}
              </div>
              {role === 'ETUDIANT' && (
                <button className="msg-empty-btn" onClick={() => navigate('/dashboard')}>
                  Retour au dashboard
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Header gradient */}
              <div className="msg-chat-header">
                <div className="msg-chat-user">
                  <Avatar user={convSelected.interlocuteur} size={42} online />
                  <div>
                    <div className="msg-chat-name">
                      {convSelected.interlocuteur?.role === 'ENCADRANT' ? 'Dr. ' : ''}
                      {convSelected.interlocuteur?.prenom} {convSelected.interlocuteur?.nom}
                    </div>
                    <div className="msg-chat-role">
                      {convSelected.interlocuteur?.role === 'ENCADRANT'
                        ? '👨‍🏫 Encadrant'
                        : '🎓 Étudiant'}
                    </div>
                    {convSelected.sujetTitre && (
                      <div className="msg-chat-subject">📝 {convSelected.sujetTitre}</div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                  <div className="msg-online">
                    <div className="msg-online-dot" />
                    En ligne
                  </div>
                  <button
                    className="msg-header-btn"
                    onClick={() =>
                      loadMessages(convSelected?.interlocuteur?._id || convSelected?.userId)
                    }
                    title="Actualiser"
                  >
                    🔄
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="msg-messages">
                {error && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fca5a5',
                      color: '#991b1b',
                      padding: '.7rem 1rem',
                      borderRadius: 10,
                      fontSize: '.82rem',
                    }}
                  >
                    ❌ {error}
                  </div>
                )}
                {loadingMsgs && (
                  <div
                    style={{
                      textAlign: 'center',
                      color: C.textSoft,
                      fontSize: '.82rem',
                      padding: '2rem',
                    }}
                  >
                    Chargement...
                  </div>
                )}
                {!loadingMsgs && messages.length === 0 && (
                  <div style={{ flex: 'none', textAlign: 'center', padding: '3rem 1rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '.75rem', opacity: 0.4 }}>👋</div>
                    <p
                      style={{
                        fontWeight: 700,
                        color: C.textSoft,
                        fontSize: '1rem',
                        marginBottom: '.35rem',
                      }}
                    >
                      Démarrez la conversation
                    </p>
                    <p style={{ fontSize: '.82rem', color: C.textMuted }}>
                      Envoyez votre premier message à {convSelected.interlocuteur?.prenom}.
                    </p>
                  </div>
                )}

                {grouped.map((g, gi) => (
                  <div key={gi}>
                    <div className="msg-date-sep">
                      <span>{g.date}</span>
                    </div>
                    {g.msgs.map((msg, mi) => {
                      const mine = isMine(msg);
                      return (
                        <div key={msg._id || mi} className={`msg-row ${mine ? 'sent' : 'recv'}`}>
                          {!mine && <Avatar user={convSelected.interlocuteur} size={28} />}
                          <div className={`msg-bubble${msg._temp ? '' : ' msg-new'}`}>
                            {msg.contenu}
                            <div className="msg-bubble-time">
                              {formatTime(msg.createdAt)}
                              {mine && (
                                <span style={{ fontSize: '.65rem' }}>
                                  {msg.lu ? (
                                    <span style={{ color: 'rgba(255,255,255,.8)' }}>✓✓</span>
                                  ) : (
                                    <span style={{ color: 'rgba(255,255,255,.5)' }}>✓</span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Typing */}
                {isTyping && (
                  <div className="msg-row recv">
                    <Avatar user={convSelected.interlocuteur} size={28} />
                    <div className="msg-bubble" style={{ padding: '.6rem .9rem' }}>
                      <span className="tdot" />
                      <span className="tdot" />
                      <span className="tdot" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* File preview */}
              {fichiers.length > 0 && (
                <div className="file-preview">
                  {fichiers.map((f, i) => (
                    <div key={i} className="file-chip">
                      <span>{fileIcon(f)}</span>
                      <span
                        style={{
                          maxWidth: 120,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {f.name}
                      </span>
                      <span style={{ fontSize: '.65rem', color: 'rgba(26,122,138,.6)' }}>
                        ({(f.size / 1024).toFixed(0)}KB)
                      </span>
                      <button
                        className="file-chip-remove"
                        onClick={() => removeFile(i)}
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="msg-input-area">
                {/* Input fichier caché */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.txt,.zip"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />

                {/* Bouton pièce jointe */}
                <button
                  className="msg-attach-btn"
                  title="Joindre un fichier (PDF, image, doc...)"
                  onClick={() => fileInputRef.current?.click()}
                >
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
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>

                <div className="msg-input-wrap">
                  <textarea
                    ref={inputRef}
                    className="msg-input"
                    placeholder={`Écrire à ${convSelected.interlocuteur?.prenom}...`}
                    value={texte}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                  />
                  {/* Bouton emoji avec picker */}
                  <div ref={emojiRef} style={{ position: 'relative', flexShrink: 0 }}>
                    <button
                      className="msg-emoji-btn"
                      title="Ajouter un emoji"
                      onClick={() => setShowEmoji((v) => !v)}
                      style={{ color: showEmoji ? C.accent : undefined }}
                    >
                      😊
                    </button>
                    {showEmoji && (
                      <div className="emoji-picker">
                        <div className="emoji-picker-header">Emojis fréquents</div>
                        {EMOJIS.map((em) => (
                          <button key={em} onClick={() => insertEmoji(em)}>
                            {em}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  className="msg-send-btn"
                  onClick={handleSend}
                  disabled={(!texte.trim() && fichiers.length === 0) || sending}
                  title="Envoyer (Entrée)"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                      stroke="white"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
