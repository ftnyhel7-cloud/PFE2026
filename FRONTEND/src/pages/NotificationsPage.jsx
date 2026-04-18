import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TEAL = '#1a7a8a';
const YELLOW = '#F5C518';
const DARK = '#0d1f30';

const FAKE_NOTIFS = [
  {
    id: 1,
    type: 'ACCEPTE',
    titre: 'Candidature acceptee !',
    message:
      'Felicitations ! Votre candidature pour "Plateforme MERN de gestion PFE" a ete acceptee par Prof. Mohamed Hammami.',
    date: '2026-04-15 10:30',
    lu: false,
  },
  {
    id: 2,
    type: 'INTERVIEW',
    titre: 'Invitation a un entretien',
    message:
      'Vous etes convoque pour un entretien concernant le sujet "Dashboard analytique IoT". Date : 20 Avril 2026 a 14h00. Lien : https://meet.google.com/abc-xyz',
    date: '2026-04-14 15:20',
    lu: false,
  },
  {
    id: 3,
    type: 'QUIZ',
    titre: 'Quiz de selection requis',
    message:
      'En raison du grand nombre de candidats pour "Detection de fraude bancaire par IA", un quiz de selection vous a ete assigne. Duree : 30 minutes.',
    date: '2026-04-13 09:15',
    lu: true,
  },
  {
    id: 4,
    type: 'REFUSE',
    titre: 'Candidature non retenue',
    message:
      'Nous vous remercions pour votre interet pour le sujet "Chatbot NLP". Votre candidature n\'a pas ete retenue cette fois. Continuez a postuler !',
    date: '2026-04-12 16:45',
    lu: true,
  },
  {
    id: 5,
    type: 'INFO',
    titre: 'Nouveau sujet disponible',
    message:
      '5 nouveaux sujets PFE ont ete ajoutes a la plateforme. Consultez-les et postulez avant la date limite !',
    date: '2026-04-11 08:00',
    lu: true,
  },
  {
    id: 6,
    type: 'CANDIDATURE',
    titre: 'Candidature recue',
    message:
      'Votre candidature pour "Application mobile e-commerce" a bien ete recue. Score IA : 78/100. Vous serez contacte prochainement.',
    date: '2026-04-10 11:30',
    lu: true,
  },
];

const TYPE_CONFIG = {
  ACCEPTE: { icon: '🎉', color: '#27AE60', bg: 'rgba(39,174,96,.1)', label: 'Accepte' },
  REFUSE: { icon: '❌', color: '#E74C3C', bg: 'rgba(231,76,60,.1)', label: 'Refuse' },
  INTERVIEW: { icon: '🎤', color: '#2980B9', bg: 'rgba(41,128,185,.1)', label: 'Entretien' },
  QUIZ: { icon: '📝', color: '#9B59B6', bg: 'rgba(155,89,182,.1)', label: 'Quiz' },
  CANDIDATURE: { icon: '📨', color: TEAL, bg: 'rgba(26,122,138,.1)', label: 'Candidature' },
  INFO: { icon: 'ℹ️', color: '#E67E22', bg: 'rgba(230,126,34,.1)', label: 'Info' },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState(FAKE_NOTIFS);
  const [filtre, setFiltre] = useState('Toutes');

  const nonLues = notifs.filter((n) => !n.lu).length;

  const marquerLue = (id) =>
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)));
  const marquerToutesLues = () => setNotifs((prev) => prev.map((n) => ({ ...n, lu: true })));
  const supprimer = (id) => setNotifs((prev) => prev.filter((n) => n.id !== id));

  const filtres = ['Toutes', 'Non lues', 'ACCEPTE', 'INTERVIEW', 'QUIZ', 'REFUSE', 'INFO'];
  const notifsFiltrees = notifs.filter((n) => {
    if (filtre === 'Toutes') return true;
    if (filtre === 'Non lues') return !n.lu;
    return n.type === filtre;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fa', fontFamily: 'Poppins, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        .hexshape { clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); }
        .notif-card { background:#fff; border-radius:14px; padding:1.25rem 1.5rem; margin-bottom:.85rem; box-shadow:0 2px 10px rgba(0,0,0,.05); border:1.5px solid #eee; transition:all .2s; cursor:pointer; }
        .notif-card:hover { box-shadow:0 6px 20px rgba(0,0,0,.09); transform:translateY(-1px); }
        .notif-card.unread { border-left:4px solid ${TEAL}; background:#fff; }
        .filter-btn { padding:.45rem 1rem; border-radius:100px; border:1.5px solid #e0e0e0; background:#fff; cursor:pointer; font-size:.8rem; font-weight:600; transition:all .2s; font-family:Poppins,sans-serif; color:#666; }
        .filter-btn.on { background:${TEAL}; color:#fff; border-color:${TEAL}; }
      `}</style>

      {/* Header */}
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
            </h1>
            {nonLues > 0 && (
              <p style={{ color: 'rgba(255,255,255,.65)', fontSize: '.78rem', marginTop: '.2rem' }}>
                {nonLues} non lue{nonLues > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
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
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 2rem' }}>
        {/* Filtres */}
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {filtres.map((f) => (
            <button
              key={f}
              className={'filter-btn' + (filtre === f ? ' on' : '')}
              onClick={() => setFiltre(f)}
            >
              {f === 'Non lues' && nonLues > 0 ? `${f} (${nonLues})` : f}
            </button>
          ))}
        </div>

        {/* Liste */}
        {notifsFiltrees.length === 0 ? (
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
            <p style={{ color: '#aaa', fontSize: '.92rem' }}>Aucune notification</p>
          </div>
        ) : (
          notifsFiltrees.map((n) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.INFO;
            return (
              <div
                key={n.id}
                className={'notif-card' + (!n.lu ? ' unread' : '')}
                onClick={() => marquerLue(n.id)}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
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
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '.35rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
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
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          supprimer(n.id);
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
                      >
                        ✕
                      </button>
                    </div>
                    <p
                      style={{
                        color: '#666',
                        fontSize: '.83rem',
                        lineHeight: 1.65,
                        marginBottom: '.5rem',
                      }}
                    >
                      {n.message}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
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
                      <span style={{ color: '#bbb', fontSize: '.75rem' }}>{n.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
