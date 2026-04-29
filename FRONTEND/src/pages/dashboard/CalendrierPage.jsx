import { useState, useEffect, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import API from '../../api/axios';

function getRelDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const FAKE = [
  {
    _id: 'r1',
    titre: 'Reunion de lancement PFE',
    description: 'Presentation du sujet et des objectifs',
    date: getRelDate(2),
    heure: '10:00',
    statut: 'PLANIFIEE',
    lienMeet: 'https://meet.google.com/abc-def-ghi',
    duree: 60,
  },
  {
    _id: 'r2',
    titre: 'Point avancement - Chapitre 1',
    description: 'Revue du premier chapitre',
    date: getRelDate(6),
    heure: '14:00',
    statut: 'PLANIFIEE',
    lienMeet: 'https://meet.google.com/xyz-uvw-rst',
    duree: 45,
  },
  {
    _id: 'r3',
    titre: 'Revue du prototype',
    description: 'Demo du prototype',
    date: getRelDate(12),
    heure: '11:00',
    statut: 'PLANIFIEE',
    lienMeet: 'https://meet.google.com/mno-pqr-stu',
    duree: 90,
  },
  {
    _id: 'r4',
    titre: 'Correction rapport final',
    description: 'Discussion des corrections',
    date: getRelDate(-4),
    heure: '15:00',
    statut: 'EFFECTUEE',
    lienMeet: '',
    duree: 60,
  },
  {
    _id: 'r5',
    titre: 'Bilan mi-parcours',
    description: 'Evaluation a mi-parcours',
    date: getRelDate(-10),
    heure: '09:00',
    statut: 'EFFECTUEE',
    lienMeet: '',
    duree: 60,
  },
];

export default function CalendrierPage({ role, accentColor = '#1a7a8a' }) {
  const [reunions, setReunions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selEvent, setSelEvent] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    titre: '',
    description: '',
    date: '',
    heure: '10:00',
    lienMeet: '',
    duree: 60,
    idEtudiant: '',
  });

  useEffect(() => {
    fetchR();
  }, []);

  const fetchR = async () => {
    try {
      const ep =
        role === 'ETUDIANT'
          ? '/calendrier/mes-reunions-etudiant'
          : '/calendrier/mes-reunions-encadrant';
      const { data } = await API.get(ep);
      setReunions(data.length > 0 ? data : FAKE);
    } catch {
      setReunions(FAKE);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (t) => {
    setMsg(t);
    setTimeout(() => setMsg(''), 3000);
  };

  // ── Couleurs événements exactement comme l'image ──────
  const fcEvents = useMemo(
    () =>
      reunions.map((r) => {
        const colors = {
          PLANIFIEE: { bg: '#3a87ad', border: '#3a87ad' }, // bleu classique FullCalendar
          EFFECTUEE: { bg: '#468847', border: '#468847' }, // vert classique
          ANNULEE: { bg: '#b94a48', border: '#b94a48' }, // rouge classique
        };
        const c = colors[r.statut] || colors.PLANIFIEE;
        const start = new Date(r.date + 'T' + (r.heure || '10:00') + ':00');
        const end = new Date(start.getTime() + (r.duree || 60) * 60000);
        return {
          id: r._id,
          title: r.titre,
          start: start.toISOString(),
          end: end.toISOString(),
          backgroundColor: c.bg,
          borderColor: c.border,
          textColor: '#fff',
          extendedProps: r,
        };
      }),
    [reunions]
  );

  const handleEventClick = useCallback((info) => {
    const r = info.event.extendedProps;
    setSelEvent(r);
    setIsNew(false);
    setForm({
      titre: r.titre,
      description: r.description || '',
      date: r.date,
      heure: r.heure || '10:00',
      lienMeet: r.lienMeet || '',
      duree: r.duree || 60,
      idEtudiant: r.idEtudiant || '',
    });
    setShowModal(true);
  }, []);

  const handleDateClick = useCallback(
    (info) => {
      if (role !== 'ENCADRANT') return;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(info.date) < today) return;
      setSelEvent(null);
      setIsNew(true);
      setForm({
        titre: '',
        description: '',
        date: info.dateStr,
        heure: '10:00',
        lienMeet: '',
        duree: 60,
        idEtudiant: '',
      });
      setShowModal(true);
    },
    [role]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!isNew) await API.put('/calendrier/' + selEvent._id, form);
      else await API.post('/calendrier', form);
      showMsg(isNew ? 'Reunion planifiee !' : 'Reunion modifiee !');
      setShowModal(false);
      fetchR();
    } catch {
      if (isNew)
        setReunions((prev) => [...prev, { _id: 'new' + Date.now(), ...form, statut: 'PLANIFIEE' }]);
      showMsg('Reunion ajoutee !');
      setShowModal(false);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete('/calendrier/' + selEvent._id);
    } catch {}
    setReunions((prev) => prev.filter((r) => r._id !== selEvent._id));
    setShowModal(false);
    showMsg('Reunion supprimee !');
  };

  const prochaines = reunions
    .filter((r) => r.statut === 'PLANIFIEE' && new Date(r.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const passees = reunions.filter((r) => r.statut === 'EFFECTUEE');

  const iStyle = {
    width: '100%',
    padding: '.7rem .9rem',
    borderRadius: 6,
    border: '1px solid #ccc',
    fontSize: '.88rem',
    outline: 'none',
    fontFamily: 'inherit',
    color: '#333',
    background: '#fff',
    transition: 'border-color .2s',
  };
  const lStyle = {
    display: 'block',
    color: '#555',
    fontSize: '.82rem',
    fontWeight: 600,
    marginBottom: '.35rem',
  };

  if (loading)
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#666', fontFamily: 'inherit' }}>
        Chargement...
      </div>
    );

  return (
    <div style={{ fontFamily: 'inherit' }}>
      {/* ── CSS : reproduire EXACTEMENT le style de l'image ── */}
      <style>{`
        /* ── FullCalendar reset vers style classique image ── */

        /* Toolbar */
        .fc .fc-toolbar-title {
          font-size: 1.4rem !important;
          font-weight: 700 !important;
          color: #333 !important;
        }

        /* Boutons : gris clair avec bordure, exactement comme l'image */
        .fc .fc-button {
          background-color: #f7f7f7 !important;
          background-image: linear-gradient(to bottom,#fff,#e6e6e6) !important;
          border: 1px solid #ccc !important;
          border-bottom-color: #bbb !important;
          color: #333 !important;
          text-shadow: 0 1px 0 #fff !important;
          font-size: .875rem !important;
          padding: .375rem .75rem !important;
          border-radius: 4px !important;
          font-family: inherit !important;
          font-weight: 400 !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.2), 0 1px 2px rgba(0,0,0,.05) !important;
          transition: none !important;
        }
        .fc .fc-button:hover {
          background-color: #e6e6e6 !important;
          background-image: linear-gradient(to bottom,#e6e6e6,#d9d9d9) !important;
          border-color: #adadad !important;
          color: #333 !important;
        }
        .fc .fc-button:active,
        .fc .fc-button:focus {
          background-color: #d4d4d4 !important;
          background-image: linear-gradient(to bottom,#e0e0e0,#d0d0d0) !important;
          border-color: #999 !important;
          outline: none !important;
          box-shadow: inset 0 2px 4px rgba(0,0,0,.15) !important;
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: #e0e0e0 !important;
          background-image: linear-gradient(to bottom,#e0e0e0,#d0d0d0) !important;
          border-color: #adadad !important;
          box-shadow: inset 0 2px 4px rgba(0,0,0,.15) !important;
          color: #333 !important;
        }

        /* Icones flechees prev/next */
        .fc .fc-icon-chevron-left::before  { content: '<'; font-style:normal; font-size:.9rem; font-weight:700; }
        .fc .fc-icon-chevron-right::before { content: '>'; font-style:normal; font-size:.9rem; font-weight:700; }

        /* En-tete colonnes : Sun Mon Tue ... */
        .fc .fc-col-header-cell {
          background: #f3f3f3 !important;
          border-color: #ddd !important;
        }
        .fc .fc-col-header-cell-cushion {
          color: #333 !important;
          font-weight: 400 !important;
          font-size: .875rem !important;
          text-decoration: none !important;
          padding: 4px 0 !important;
          text-transform: none !important;
          letter-spacing: 0 !important;
        }

        /* Numerotation des jours */
        .fc .fc-daygrid-day-number {
          color: #333 !important;
          font-size: .875rem !important;
          font-weight: 400 !important;
          text-decoration: none !important;
          padding: 2px 4px !important;
        }

        /* Jour aujourd'hui : fond jaune clair comme image */
        .fc .fc-day-today {
          background-color: #ffffcc !important;
        }
        .fc .fc-day-today .fc-daygrid-day-number {
          color: #333 !important;
        }

        /* Jours autres mois : gris clair */
        .fc .fc-day-other .fc-daygrid-day-number {
          color: #bbb !important;
        }
        .fc .fc-day-other { background: #fafafa !important; }

        /* Grille : bordures grises comme image */
        .fc .fc-scrollgrid {
          border: 1px solid #ddd !important;
          border-radius: 0 !important;
        }
        .fc .fc-scrollgrid td,
        .fc .fc-scrollgrid th {
          border-color: #ddd !important;
        }
        .fc-theme-standard .fc-scrollgrid { border-color: #ddd !important; }

        /* Événements : style plat avec coins arrondis légers */
        .fc .fc-event {
          border-radius: 4px !important;
          font-size: .85rem !important;
          font-weight: normal !important;
          padding: 1px 3px !important;
          cursor: pointer !important;
          border-width: 0 !important;
        }
        .fc .fc-event:hover { opacity: .9 !important; }
        .fc .fc-event-title { font-size: .85rem !important; }
        .fc .fc-event-time  { font-size: .82rem !important; }

        /* Lien "more" */
        .fc .fc-daygrid-more-link {
          color: #3a87ad !important;
          font-size: .8rem !important;
        }

        /* Toolbar margin */
        .fc .fc-toolbar { margin-bottom: 1em !important; }
        .fc .fc-toolbar-chunk { display: flex; align-items: center; gap: 4px; }

        /* Indicateur maintenant */
        .fc .fc-timegrid-now-indicator-line {
          border-color: #f00 !important;
          border-width: 2px !important;
        }

        /* Time labels */
        .fc .fc-timegrid-slot-label-cushion {
          font-size: .8rem !important;
          color: #666 !important;
        }

        /* ── Modal ── */
        .cal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; padding: 1rem;
        }
        .cal-modal {
          width: 100%; max-width: 480px;
          background: #fff; border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,.2);
          overflow: hidden; max-height: 90vh; overflow-y: auto;
        }
        .cal-inp:focus {
          border-color: ${accentColor} !important;
          box-shadow: 0 0 0 2px ${accentColor}22;
          outline: none;
        }
        .cal-inp::placeholder { color: #aaa; }
        textarea.cal-inp { resize: vertical; }
        select.cal-inp option { background: #fff; }

        /* Sidebar items */
        .r-item {
          display: flex; align-items: flex-start; gap: .75rem;
          padding: .75rem; background: #f9f9f9; border-radius: 6px;
          margin-bottom: .5rem; border: 1px solid #e0e0e0;
          cursor: pointer; transition: background .15s;
        }
        .r-item:hover { background: #f0f7ff; border-color: #b8d8f0; }
      `}</style>

      {/* Message */}
      {msg && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '.65rem 1rem',
            borderRadius: 6,
            background: '#dff0d8',
            border: '1px solid #d6e9c6',
            color: '#3c763d',
            fontSize: '.85rem',
            fontWeight: 500,
          }}
        >
          ✓ {msg}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 260px',
          gap: '1.25rem',
          alignItems: 'start',
        }}
      >
        {/* ── FullCalendar ── */}
        <div
          style={{
            background: '#fff',
            borderRadius: 6,
            padding: '1rem',
            boxShadow: '0 1px 4px rgba(0,0,0,.1)',
            border: '1px solid #ddd',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            {role === 'ENCADRANT' && (
              <button
                onClick={() => {
                  setSelEvent(null);
                  setIsNew(true);
                  setForm({
                    titre: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    heure: '10:00',
                    lienMeet: '',
                    duree: 60,
                    idEtudiant: '',
                  });
                  setShowModal(true);
                }}
                style={{
                  background: '#3a87ad',
                  color: '#fff',
                  border: 'none',
                  padding: '.4rem .9rem',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '.85rem',
                  fontWeight: 500,
                }}
              >
                + Planifier une reunion
              </button>
            )}
            {/* Legende */}
            <div style={{ display: 'flex', gap: '.85rem', marginLeft: 'auto' }}>
              {[
                { c: '#3a87ad', l: 'Planifiee' },
                { c: '#468847', l: 'Effectuee' },
                { c: '#b94a48', l: 'Annulee' },
              ].map((x) => (
                <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: x.c }} />
                  <span style={{ color: '#666', fontSize: '.78rem' }}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>

          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="fr"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            buttonText={{
              today: "Aujourd'hui",
              month: 'Mois',
              week: 'Semaine',
              day: 'Jour',
            }}
            events={fcEvents}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            height="auto"
            firstDay={1}
            nowIndicator={true}
            selectable={role === 'ENCADRANT'}
            eventDisplay="block"
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            dayCellClassNames={(arg) => {
              const t = new Date();
              t.setHours(0, 0, 0, 0);
              return arg.date < t ? ['fc-past-day'] : [];
            }}
          />
        </div>

        {/* ── Sidebar ── */}
        <div>
          {/* Prochaines */}
          <div
            style={{
              background: '#fff',
              borderRadius: 6,
              padding: '1rem',
              boxShadow: '0 1px 4px rgba(0,0,0,.1)',
              border: '1px solid #ddd',
              marginBottom: '1rem',
            }}
          >
            <h3
              style={{
                fontWeight: 600,
                color: '#333',
                fontSize: '.9rem',
                marginBottom: '.85rem',
                paddingBottom: '.5rem',
                borderBottom: '1px solid #eee',
              }}
            >
              Prochaines reunions ({prochaines.length})
            </h3>
            {prochaines.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#aaa' }}>
                <div style={{ fontSize: '2rem', marginBottom: '.4rem' }}>📅</div>
                <p style={{ fontSize: '.82rem' }}>Aucune reunion planifiee</p>
              </div>
            ) : (
              prochaines.slice(0, 5).map((r) => {
                const dj = Math.ceil((new Date(r.date) - new Date()) / 86400000);
                return (
                  <div
                    key={r._id}
                    className="r-item"
                    onClick={() => {
                      setSelEvent(r);
                      setIsNew(false);
                      setForm({
                        titre: r.titre,
                        description: r.description || '',
                        date: r.date,
                        heure: r.heure || '10:00',
                        lienMeet: r.lienMeet || '',
                        duree: r.duree || 60,
                        idEtudiant: r.idEtudiant || '',
                      });
                      setShowModal(true);
                    }}
                  >
                    {/* Badge date */}
                    <div
                      style={{
                        background: '#3a87ad',
                        borderRadius: 5,
                        padding: '.3rem .5rem',
                        textAlign: 'center',
                        flexShrink: 0,
                        minWidth: 40,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '.95rem',
                          color: '#fff',
                          lineHeight: 1,
                        }}
                      >
                        {new Date(r.date).getDate()}
                      </div>
                      <div
                        style={{
                          fontSize: '.6rem',
                          fontWeight: 500,
                          color: 'rgba(255,255,255,.85)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {new Date(r.date).toLocaleDateString('fr-FR', { month: 'short' })}
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: 600,
                          color: '#333',
                          fontSize: '.83rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginBottom: '.2rem',
                        }}
                      >
                        {r.titre}
                      </p>
                      <p style={{ color: '#888', fontSize: '.75rem' }}>
                        {r.heure} · {r.duree || 60} min
                      </p>
                      {r.lienMeet && (
                        <a
                          href={r.lienMeet}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: '#3a87ad',
                            fontSize: '.72rem',
                            fontWeight: 500,
                            textDecoration: 'none',
                          }}
                        >
                          Rejoindre Meet →
                        </a>
                      )}
                    </div>
                    <span
                      style={{
                        background: dj <= 1 ? '#f2dede' : dj <= 3 ? '#fcf8e3' : '#dff0d8',
                        color: dj <= 1 ? '#a94442' : dj <= 3 ? '#8a6d3b' : '#3c763d',
                        padding: '.1rem .45rem',
                        borderRadius: 3,
                        fontSize: '.65rem',
                        fontWeight: 600,
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {dj <= 0 ? 'Auj.' : dj === 1 ? 'Demain' : `J-${dj}`}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Passees */}
          {passees.length > 0 && (
            <div
              style={{
                background: '#fff',
                borderRadius: 6,
                padding: '1rem',
                boxShadow: '0 1px 4px rgba(0,0,0,.1)',
                border: '1px solid #ddd',
              }}
            >
              <h3
                style={{
                  fontWeight: 600,
                  color: '#888',
                  fontSize: '.82rem',
                  textTransform: 'uppercase',
                  letterSpacing: '.06em',
                  marginBottom: '.75rem',
                }}
              >
                Passees ({passees.length})
              </h3>
              {passees.slice(0, 4).map((r) => (
                <div
                  key={r._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.5rem',
                    padding: '.45rem .5rem',
                    borderRadius: 4,
                    marginBottom: '.3rem',
                    background: '#dff0d8',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setSelEvent(r);
                    setIsNew(false);
                    setForm({
                      titre: r.titre,
                      description: r.description || '',
                      date: r.date,
                      heure: r.heure || '10:00',
                      lienMeet: r.lienMeet || '',
                      duree: r.duree || 60,
                      idEtudiant: r.idEtudiant || '',
                    });
                    setShowModal(true);
                  }}
                >
                  <span style={{ color: '#468847', fontSize: '.8rem' }}>✓</span>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 500,
                        color: '#333',
                        fontSize: '.78rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {r.titre}
                    </p>
                    <p style={{ color: '#888', fontSize: '.7rem' }}>
                      {new Date(r.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div className="cal-overlay" onClick={() => setShowModal(false)}>
          <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div
              style={{
                padding: '1rem 1.25rem',
                background: '#3a87ad',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 style={{ color: '#fff', fontWeight: 600, fontSize: '.95rem', margin: 0 }}>
                {isNew ? '+ Planifier une reunion' : '📅 Details de la reunion'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(255,255,255,.2)',
                  border: 'none',
                  color: '#fff',
                  width: 26,
                  height: 26,
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 0.9 + 'rem',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              {/* Vue details */}
              {!isNew && selEvent && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '.5rem',
                      marginBottom: '.85rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {[
                      {
                        l: selEvent.statut,
                        c:
                          selEvent.statut === 'EFFECTUEE'
                            ? '#468847'
                            : selEvent.statut === 'ANNULEE'
                              ? '#b94a48'
                              : '#3a87ad',
                      },
                      { l: (selEvent.duree || 60) + ' min', c: '#888' },
                    ].map((b) => (
                      <span
                        key={b.l}
                        style={{
                          background: b.c + '22',
                          color: b.c,
                          padding: '.2rem .65rem',
                          borderRadius: 3,
                          fontSize: '.75rem',
                          fontWeight: 600,
                          border: `1px solid ${b.c}44`,
                        }}
                      >
                        {b.l}
                      </span>
                    ))}
                  </div>
                  <h3
                    style={{
                      fontWeight: 600,
                      color: '#333',
                      fontSize: '.97rem',
                      marginBottom: '.6rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {selEvent.titre}
                  </h3>
                  {selEvent.description && (
                    <p
                      style={{
                        color: '#666',
                        fontSize: '.87rem',
                        lineHeight: 1.65,
                        marginBottom: '.9rem',
                      }}
                    >
                      {selEvent.description}
                    </p>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '.5rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: '.65rem',
                        alignItems: 'center',
                        padding: '.65rem .75rem',
                        background: '#f5f5f5',
                        borderRadius: 5,
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <span>📅</span>
                      <div>
                        <p style={{ color: '#999', fontSize: '.72rem' }}>Date et heure</p>
                        <p style={{ fontWeight: 600, color: '#333', fontSize: '.87rem' }}>
                          {new Date(selEvent.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}{' '}
                          a {selEvent.heure}
                        </p>
                      </div>
                    </div>
                    {selEvent.lienMeet && (
                      <div
                        style={{
                          display: 'flex',
                          gap: '.65rem',
                          alignItems: 'center',
                          padding: '.65rem .75rem',
                          background: '#f5f5f5',
                          borderRadius: 5,
                          border: '1px solid #e0e0e0',
                        }}
                      >
                        <span>🔗</span>
                        <div>
                          <p style={{ color: '#999', fontSize: '.72rem' }}>Lien</p>
                          <a
                            href={selEvent.lienMeet}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: '#3a87ad',
                              fontWeight: 600,
                              fontSize: '.87rem',
                              textDecoration: 'none',
                            }}
                          >
                            Rejoindre Google Meet →
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '.6rem' }}>
                    {selEvent.lienMeet && (
                      <a
                        href={selEvent.lienMeet}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          display: 'block',
                          padding: '.7rem',
                          borderRadius: 5,
                          background: '#3a87ad',
                          color: '#fff',
                          fontFamily: 'inherit',
                          fontWeight: 600,
                          fontSize: '.88rem',
                          textDecoration: 'none',
                        }}
                      >
                        Rejoindre
                      </a>
                    )}
                    {role === 'ENCADRANT' && selEvent.statut === 'PLANIFIEE' && (
                      <button
                        onClick={handleDelete}
                        style={{
                          flex: 1,
                          padding: '.7rem',
                          borderRadius: 5,
                          border: '1px solid #dca7a7',
                          background: '#f2dede',
                          color: '#a94442',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontWeight: 500,
                          fontSize: '.87rem',
                        }}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Formulaire */}
              {isNew && (
                <form
                  onSubmit={handleSubmit}
                  style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}
                >
                  <div>
                    <label style={lStyle}>Titre *</label>
                    <input
                      className="cal-inp"
                      style={iStyle}
                      placeholder="Ex: Point avancement"
                      value={form.titre}
                      onChange={(e) => setForm({ ...form, titre: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={lStyle}>Description</label>
                    <textarea
                      rows={3}
                      className="cal-inp"
                      style={{ ...iStyle, resize: 'vertical' }}
                      placeholder="Ordre du jour..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.85rem' }}>
                    <div>
                      <label style={lStyle}>Date *</label>
                      <input
                        type="date"
                        className="cal-inp"
                        style={iStyle}
                        value={form.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={lStyle}>Heure *</label>
                      <input
                        type="time"
                        className="cal-inp"
                        style={iStyle}
                        value={form.heure}
                        onChange={(e) => setForm({ ...form, heure: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.85rem' }}>
                    <div>
                      <label style={lStyle}>Duree</label>
                      <select
                        className="cal-inp"
                        style={iStyle}
                        value={form.duree}
                        onChange={(e) => setForm({ ...form, duree: parseInt(e.target.value) })}
                      >
                        {[30, 45, 60, 90, 120].map((d) => (
                          <option key={d} value={d}>
                            {d} min
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={lStyle}>ID Etudiant</label>
                      <input
                        className="cal-inp"
                        style={iStyle}
                        placeholder="ID"
                        value={form.idEtudiant}
                        onChange={(e) => setForm({ ...form, idEtudiant: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={lStyle}>Lien Google Meet</label>
                    <input
                      className="cal-inp"
                      style={iStyle}
                      placeholder="https://meet.google.com/..."
                      value={form.lienMeet}
                      onChange={(e) => setForm({ ...form, lienMeet: e.target.value })}
                    />
                  </div>
                  <div
                    style={{
                      background: '#d9edf7',
                      border: '1px solid #bce8f1',
                      borderRadius: 5,
                      padding: '.65rem .85rem',
                      display: 'flex',
                      gap: '.5rem',
                    }}
                  >
                    <span>💡</span>
                    <p style={{ color: '#31708f', fontSize: '.78rem', lineHeight: 1.6 }}>
                      L'etudiant recevra une notification automatique.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '.6rem', marginTop: '.1rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      style={{
                        flex: 1,
                        padding: '.7rem',
                        borderRadius: 5,
                        border: '1px solid #ccc',
                        background: '#fff',
                        color: '#555',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '.87rem',
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      style={{
                        flex: 2,
                        padding: '.7rem',
                        borderRadius: 5,
                        border: 'none',
                        background: '#3a87ad',
                        color: '#fff',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontWeight: 600,
                        fontSize: '.88rem',
                      }}
                    >
                      Planifier
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
