// ═══════════════════════════════════════════════════════════
//  FRONTEND/src/pages/NotificationsPage.jsx
//  Notifications réelles depuis l'API
//  Les popups s'enregistrent automatiquement ici
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const TEAL = '#1a7a8a';
const YELLOW = '#F5C518';
const DARK = '#0d1f30';

const TYPE_CONFIG = {
  VALIDATION: { icon: '✅', color: '#27AE60', bg: 'rgba(39,174,96,.1)', label: 'Validation' },
  TACHE: { icon: '📋', color: '#d97706', bg: 'rgba(217,119,6,.1)', label: 'Tâche' },
  REUNION: { icon: '📅', color: '#7c3aed', bg: 'rgba(124,58,237,.1)', label: 'Réunion' },
  LIVRABLE: { icon: '📦', color: '#0284c7', bg: 'rgba(2,132,199,.1)', label: 'Livrable' },
  SYSTEME: { icon: '📢', color: TEAL, bg: 'rgba(26,122,138,.1)', label: 'Système' },
  AFFECTATION: { icon: '🔗', color: '#db2777', bg: 'rgba(219,39,119,.1)', label: 'Affectation' },
  // Types legacy page fake
  ACCEPTE: { icon: '🎉', color: '#27AE60', bg: 'rgba(39,174,96,.1)', label: 'Accepté' },
  REFUSE: { icon: '❌', color: '#E74C3C', bg: 'rgba(231,76,60,.1)', label: 'Refusé' },
  INTERVIEW: { icon: '🎤', color: '#2980B9', bg: 'rgba(41,128,185,.1)', label: 'Entretien' },
  QUIZ: { icon: '📝', color: '#9B59B6', bg: 'rgba(155,89,182,.1)', label: 'Quiz' },
  CANDIDATURE: { icon: '📨', color: TEAL, bg: 'rgba(26,122,138,.1)', label: 'Candidature' },
  INFO: { icon: 'ℹ️', color: '#E67E22', bg: 'rgba(230,126,34,.1)', label: 'Info' },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }

  .hexshape { clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); }

  .notif-card {
    background:#fff; border-radius:14px; padding:1.25rem 1.5rem;
    margin-bottom:.85rem; box-shadow:0 2px 10px rgba(0,0,0,.05);
    border:1.5px solid #eee; transition:all .2s; cursor:pointer;
  }
  .notif-card:hover { box-shadow:0 6px 20px rgba(0,0,0,.09); transform:translateY(-1px); }
  .notif-card.unread { border-left:4px solid ${TEAL}; }

  .filter-btn {
    padding:.45rem 1rem; border-radius:100px; border:1.5px solid #e0e0e0;
    background:#fff; cursor:pointer; font-size:.8rem; font-weight:600;
    transition:all .2s; font-family:Poppins,sans-serif; color:#666;
  }
  .filter-btn.on { background:${TEAL}; color:#fff; border-color:${TEAL}; }

  @keyframes spin { to { transform:rotate(360deg); } }
  .spinner {
    width:36px; height:36px; border:3px solid #e2e8f0;
    border-top-color:${TEAL}; border-radius:50%;
    animation:spin .8s linear infinite; margin:3rem auto;
  }

  /* Badge popup */
  .popup-badge {
    display:inline-flex; align-items:center; gap:.3rem;
    background:#e6f4f6; color:${TEAL}; border:1px solid #b2d8de;
    border-radius:999px; font-size:.65rem; font-weight:700;
    padding:.12rem .55rem; margin-left:.5rem;
  }
`;

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('Toutes');
  const [error, setError] = useState('');

  const nonLues = notifs.filter((n) => !n.lu).length;

  // ── Charger toutes les notifications depuis l'API ───────
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/notifications');
      // data peut être un tableau direct ou { notifications: [...] }
      const liste = Array.isArray(data) ? data : data.notifications || [];
      setNotifs(liste);
    } catch (err) {
      setError('Impossible de charger les notifications.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Marquer une notif comme lue ─────────────────────────
  const marquerLue = async (id) => {
    // Optimistic update
    setNotifs((prev) => prev.map((n) => (n._id === id ? { ...n, lu: true } : n)));
    try {
      await API.put(`/notifications/${id}/lue`);
    } catch {
      // Rollback si erreur
      setNotifs((prev) => prev.map((n) => (n._id === id ? { ...n, lu: false } : n)));
    }
  };

  // ── Marquer toutes comme lues ───────────────────────────
  const marquerToutesLues = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, lu: true })));
    try {
      await API.put('/notifications/toutes-lues');
    } catch {
      fetchNotifications(); // Recharge si erreur
    }
  };

  // ── Supprimer (local uniquement — pas de route DELETE) ──
  const supprimer = (id) => setNotifs((prev) => prev.filter((n) => n._id !== id));

  // ── Filtres disponibles ──────────────────────────────────
  const filtres = [
    'Toutes',
    'Non lues',
    'VALIDATION',
    'TACHE',
    'REUNION',
    'AFFECTATION',
    'SYSTEME',
  ];

  const notifsFiltrees = notifs.filter((n) => {
    if (filtre === 'Toutes') return true;
    if (filtre === 'Non lues') return !n.lu;
    return n.type === filtre;
  });

  // ── Formater la date ─────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fa', fontFamily: 'Poppins, sans-serif' }}>
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div
        style={{
          background: `linear-gradient(135deg,${DARK},#1a3a5c)`,
          padding: '1rem 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,.2)',
              color: '#fff',
              padding: '.5rem 1rem',
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: 'Poppins,sans-serif',
              fontSize: '.83rem',
            }}
          >
            ← Retour
          </button>
          <div>
            <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', lineHeight: 1 }}>
              Notifications
              {nonLues > 0 && (
                <span
                  style={{
                    marginLeft: '.6rem',
                    background: YELLOW,
                    color: DARK,
                    borderRadius: 999,
                    fontSize: '.65rem',
                    fontWeight: 800,
                    padding: '.1rem .5rem',
                    verticalAlign: 'middle',
                  }}
                >
                  {nonLues}
                </span>
              )}
            </h1>
            <p style={{ color: 'rgba(255,255,255,.65)', fontSize: '.75rem', marginTop: '.2rem' }}>
              {notifs.length} notification{notifs.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '.65rem' }}>
          <button
            onClick={fetchNotifications}
            style={{
              background: 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,.2)',
              color: '#fff',
              padding: '.6rem 1rem',
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: 'Poppins,sans-serif',
              fontSize: '.83rem',
            }}
          >
            🔄 Actualiser
          </button>
          {nonLues > 0 && (
            <button
              onClick={marquerToutesLues}
              style={{
                background: YELLOW,
                color: DARK,
                border: 'none',
                padding: '.6rem 1.25rem',
                borderRadius: 8,
                cursor: 'pointer',
                fontFamily: 'Poppins,sans-serif',
                fontSize: '.83rem',
                fontWeight: 700,
              }}
            >
              ✓✓ Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
        {/* ── Filtres ── */}
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {filtres.map((f) => (
            <button
              key={f}
              className={'filter-btn' + (filtre === f ? ' on' : '')}
              onClick={() => setFiltre(f)}
            >
              {f === 'Non lues' && nonLues > 0 ? `Non lues (${nonLues})` : f}
            </button>
          ))}
        </div>

        {/* ── Erreur ── */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              padding: '.85rem 1rem',
              borderRadius: 10,
              marginBottom: '1rem',
              fontSize: '.85rem',
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && <div className="spinner" />}

        {/* ── Liste vide ── */}
        {!loading && notifsFiltrees.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem',
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #eee',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
            <p style={{ color: '#aaa', fontSize: '.92rem' }}>
              Aucune notification{filtre !== 'Toutes' ? ' pour ce filtre' : ''}
            </p>
            {filtre !== 'Toutes' && (
              <button
                onClick={() => setFiltre('Toutes')}
                style={{
                  marginTop: '1rem',
                  background: TEAL,
                  color: '#fff',
                  border: 'none',
                  padding: '.55rem 1.2rem',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontFamily: 'Poppins,sans-serif',
                  fontSize: '.82rem',
                  fontWeight: 600,
                }}
              >
                Voir toutes
              </button>
            )}
          </div>
        )}

        {/* ── Notifications ── */}
        {!loading &&
          notifsFiltrees.map((n) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.INFO;
            const id = n._id || n.id;
            return (
              <div
                key={id}
                className={'notif-card' + (!n.lu ? ' unread' : '')}
                onClick={() => !n.lu && marquerLue(id)}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  {/* Icone */}
                  <div
                    className="hexshape"
                    style={{
                      width: 48,
                      height: 48,
                      background: cfg.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      flexShrink: 0,
                    }}
                  >
                    {cfg.icon}
                  </div>

                  {/* Contenu */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '.35rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '.5rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <h3 style={{ fontWeight: 700, color: DARK, fontSize: '.9rem' }}>
                          {n.titre}
                        </h3>
                        {!n.lu && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: TEAL,
                              display: 'inline-block',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        {/* Badge "via popup" si la notif vient d'une popup */}
                        {n.isPopupShown && n.lu === false && (
                          <span className="popup-badge">🔔 Nouveau</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          supprimer(id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ccc',
                          cursor: 'pointer',
                          fontSize: '.85rem',
                          padding: '.1rem .3rem',
                          flexShrink: 0,
                        }}
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Message — contenu ou message selon le champ dispo */}
                    <p
                      style={{
                        color: '#666',
                        fontSize: '.83rem',
                        lineHeight: 1.65,
                        marginBottom: '.5rem',
                      }}
                    >
                      {n.contenu || n.message || '—'}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.75rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          background: cfg.bg,
                          color: cfg.color,
                          padding: '.18rem .65rem',
                          borderRadius: 100,
                          fontSize: '.7rem',
                          fontWeight: 700,
                        }}
                      >
                        {cfg.label}
                      </span>
                      <span style={{ color: '#bbb', fontSize: '.75rem' }}>
                        {formatDate(n.createdAt || n.date)}
                      </span>
                      {!n.lu && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            marquerLue(id);
                          }}
                          style={{
                            background: 'none',
                            border: '1px solid #d1fae5',
                            color: '#059669',
                            borderRadius: 6,
                            padding: '.15rem .55rem',
                            fontSize: '.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontFamily: 'Poppins,sans-serif',
                          }}
                        >
                          ✓ Marquer lu
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
