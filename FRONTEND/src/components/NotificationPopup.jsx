// ═══════════════════════════════════════════════════════════
//  FRONTEND/src/components/NotificationPopup.jsx
//  Popup affiché UNE SEULE FOIS par notification
//  Thème clair — cohérent avec dashboard étudiant/encadrant
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import API from '../api/axios';

const TYPE_CONFIG = {
  VALIDATION: { emoji: '✅', color: '#059669', bg: '#ecfdf5', border: '#6ee7b7' },
  TACHE: { emoji: '📋', color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
  REUNION: { emoji: '📅', color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd' },
  LIVRABLE: { emoji: '📦', color: '#0284c7', bg: '#e0f2fe', border: '#7dd3fc' },
  SYSTEME: { emoji: '📢', color: '#1a7a8a', bg: '#e6f4f6', border: '#6dd4e0' },
  AFFECTATION: { emoji: '🔗', color: '#db2777', bg: '#fce7f3', border: '#f9a8d4' },
};

const CSS = `
  @keyframes notif-in {
    from { opacity:0; transform:scale(.94) translateY(18px); }
    to   { opacity:1; transform:scale(1)   translateY(0);    }
  }
  @keyframes overlay-in {
    from { opacity:0; }
    to   { opacity:1; }
  }
  .notif-overlay {
    position:fixed; inset:0; z-index:9999;
    background:rgba(15,23,42,.45);
    backdrop-filter:blur(4px);
    display:flex; align-items:center; justify-content:center;
    animation:overlay-in .25s ease;
    font-family:'Poppins',sans-serif;
  }
  .notif-box {
    width:100%; max-width:480px;
    background:#fff;
    border-radius:16px;
    box-shadow:0 24px 64px rgba(0,0,0,.18);
    border:1px solid #e2e8f0;
    overflow:hidden;
    animation:notif-in .3s ease;
    max-height:85vh;
    display:flex; flex-direction:column;
  }
  .notif-header {
    padding:1.1rem 1.4rem;
    background:linear-gradient(135deg,#1a7a8a,#16A085);
    display:flex; align-items:center; justify-content:space-between;
    flex-shrink:0;
  }
  .notif-list {
    overflow-y:auto; padding:.9rem; flex:1;
    display:flex; flex-direction:column; gap:.6rem;
  }
  .notif-item {
    display:flex; align-items:flex-start; gap:.85rem;
    padding:.85rem 1rem;
    border-radius:10px;
    border:1px solid #e2e8f0;
    background:#f8fafc;
    transition:background .14s;
  }
  .notif-item:hover { background:#f0f9fa; }
  .notif-icon {
    width:38px; height:38px; border-radius:9px;
    display:flex; align-items:center; justify-content:center;
    font-size:1.1rem; flex-shrink:0;
  }
  .notif-footer {
    padding:.9rem 1.4rem;
    border-top:1px solid #e2e8f0;
    display:flex; align-items:center; justify-content:space-between;
    flex-shrink:0;
    background:#f8fafc;
  }
  .btn-ghost-notif {
    background:transparent; border:none;
    color:#1a7a8a; font-size:.8rem; font-weight:600;
    cursor:pointer; font-family:'Poppins',sans-serif;
    padding:.4rem .75rem; border-radius:7px;
    transition:background .14s;
  }
  .btn-ghost-notif:hover { background:#e6f4f6; }
  .btn-close-notif {
    background:#1a7a8a; border:none; color:#fff;
    font-size:.82rem; font-weight:700;
    cursor:pointer; font-family:'Poppins',sans-serif;
    padding:.5rem 1.1rem; border-radius:8px;
    transition:opacity .14s;
    display:flex; align-items:center; gap:.35rem;
  }
  .btn-close-notif:hover { opacity:.88; }
  .btn-mark-read {
    background:transparent; border:1px solid #d1fae5;
    color:#059669; font-size:.7rem; font-weight:700;
    cursor:pointer; font-family:'Poppins',sans-serif;
    padding:.25rem .6rem; border-radius:6px;
    flex-shrink:0; transition:background .14s;
    white-space:nowrap;
  }
  .btn-mark-read:hover { background:#ecfdf5; }
  .notif-badge {
    background:#dc2626; color:#fff;
    border-radius:999px; font-size:.62rem; font-weight:800;
    padding:.1rem .45rem; min-width:18px; text-align:center;
  }
`;

export default function NotificationPopup({ notifications = [], onClose }) {
  const [visible, setVisible] = useState(false);
  const [localNotifs, setLocalNotifs] = useState([]);

  useEffect(() => {
    if (notifications.length === 0) return;

    const filtered = notifications.filter((n) => n.type !== 'SYSTEME');
    if (filtered.length === 0) return;
    setLocalNotifs(filtered);
    // Petit délai pour l'animation d'entrée
    const t = setTimeout(() => setVisible(true), 400);

    // ── Marquer immédiatement les popups comme affichées ─
    // Ainsi, même si l'utilisateur ferme sans cliquer "lu",
    // elles ne réapparaîtront plus au prochain login
    const ids = notifications.map((n) => n._id);
    API.put('/notifications/popup-shown', { ids }).catch(() => {});

    return () => clearTimeout(t);
  }, [notifications]);

  // ── Marquer une notif comme lue (disparaît de la liste) ─
  const handleMarkRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/lue`);
      setLocalNotifs((prev) => {
        const next = prev.filter((n) => n._id !== id);
        if (next.length === 0) closePopup();
        return next;
      });
    } catch {}
  };

  // ── Tout marquer comme lu ─────────────────────────────
  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/toutes-lues');
    } catch {}
    closePopup();
  };

  const closePopup = () => {
    setVisible(false);
    setTimeout(() => onClose?.(), 280);
  };

  if (!visible && localNotifs.length === 0) return null;

  return (
    <>
      <style>{CSS}</style>
      <div
        className="notif-overlay"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity .28s',
          pointerEvents: visible ? 'auto' : 'none',
        }}
        onClick={closePopup}
      >
        <div className="notif-box" onClick={(e) => e.stopPropagation()}>
          {/* ── Header ── */}
          <div className="notif-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.15rem',
                }}
              >
                🔔
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', lineHeight: 1 }}>
                  Nouvelles notifications
                </p>
                <p
                  style={{
                    color: 'rgba(255,255,255,.75)',
                    fontSize: '.72rem',
                    marginTop: '.15rem',
                  }}
                >
                  {localNotifs.length} non lue{localNotifs.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
              <span className="notif-badge">{localNotifs.length}</span>
              <button
                onClick={closePopup}
                style={{
                  background: 'rgba(255,255,255,.15)',
                  border: 'none',
                  borderRadius: 7,
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '1rem',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* ── Liste ── */}
          <div className="notif-list">
            {localNotifs.map((notif) => {
              const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.SYSTEME;
              return (
                <div key={notif._id} className="notif-item" style={{ borderColor: cfg.border }}>
                  <div className="notif-icon" style={{ background: cfg.bg }}>
                    {cfg.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 700,
                        color: '#1e293b',
                        fontSize: '.84rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {notif.titre}
                    </p>
                    <p
                      style={{
                        color: '#64748b',
                        fontSize: '.76rem',
                        marginTop: '.2rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {notif.contenu}
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '.68rem', marginTop: '.35rem' }}>
                      {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <button
                    className="btn-mark-read"
                    onClick={() => handleMarkRead(notif._id)}
                    title="Marquer comme lu"
                  >
                    ✓ Lu
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── Footer ── */}
          <div className="notif-footer">
            <button className="btn-ghost-notif" onClick={handleMarkAllRead}>
              ✓✓ Tout marquer comme lu
            </button>
            <button className="btn-close-notif" onClick={closePopup}>
              Fermer →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
