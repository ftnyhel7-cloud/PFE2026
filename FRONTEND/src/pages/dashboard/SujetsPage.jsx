import { useNavigate } from 'react-router-dom';

// ─── Thème (copie des constantes de DashboardEtudiant) ───────
const T = {
  accent: '#2d9e6b',
  accentLight: '#e6f5ef',
  accentGrad: 'linear-gradient(135deg,#1a7a4f,#2d9e6b,#4caf82)',
  bg: '#f4faf7',
  card: '#ffffff',
  cardBorder: '#e0efe8',
  text: '#0f2d1e',
  textSoft: '#3d6b52',
  textMuted: '#7fa98e',
  shadow: '0 2px 16px rgba(45,158,107,.10)',
};

const DOMAINES_LIST = ['Web', 'IA', 'Mobile', 'IoT', 'Securite', 'Blockchain', 'Sante'];

const SUJET_COLORS = [
  { bg: '#F0FDF4', border: '#86EFAC', badge: '#DCFCE7', badgeText: '#166534', dot: '#22c55e' },
  { bg: '#EFF6FF', border: '#BFDBFE', badge: '#DBEAFE', badgeText: '#1E40AF', dot: '#3B82F6' },
  { bg: '#FDF4FF', border: '#E9D5FF', badge: '#F3E8FF', badgeText: '#6B21A8', dot: '#9333EA' },
  { bg: '#FFFBEB', border: '#FDE68A', badge: '#FEF3C7', badgeText: '#92400E', dot: '#F59E0B' },
  { bg: '#FFF1F2', border: '#FECDD3', badge: '#FFE4E6', badgeText: '#9F1239', dot: '#F43F5E' },
  { bg: '#F0FDFA', border: '#99F6E4', badge: '#CCFBF1', badgeText: '#134E4A', dot: '#14B8A6' },
];

export default function SujetsPage({
  sujets = [],
  sujetSelec,
  setSujetSelec,
  search,
  setSearch,
  filtreDomaine,
  setFiltreDomaine,
}) {
  const navigate = useNavigate();

  const filtered = sujets.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.titre?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.technologies?.some((t) => t.toLowerCase().includes(q));
    const matchDomaine = !filtreDomaine || s.domaine === filtreDomaine;
    return matchSearch && matchDomaine;
  });

  return (
    <div>
      {/* En-tête */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: T.text, marginBottom: '.25rem' }}>
          Sujets PFE disponibles
        </h2>
        <p style={{ color: T.textMuted, fontSize: '.8rem' }}>
          {sujets.length} sujet{sujets.length > 1 ? 's' : ''} validé{sujets.length > 1 ? 's' : ''}{' '}
          par vos encadrants
        </p>
      </div>

      {/* Barre de recherche + filtre */}
      <div style={{ display: 'flex', gap: '.65rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
        <div
          style={{
            flex: 1,
            minWidth: 200,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#fff',
            border: `1px solid ${T.cardBorder}`,
            borderRadius: 10,
            padding: '.55rem .85rem',
            boxShadow: T.shadow,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={T.textMuted}
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            placeholder="Rechercher par titre, technologie…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              fontSize: '.82rem',
              color: T.text,
              background: 'transparent',
              flex: 1,
              width: '100%',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: T.textMuted,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <select
          value={filtreDomaine}
          onChange={(e) => setFiltreDomaine(e.target.value)}
          style={{
            padding: '.55rem .85rem',
            border: `1px solid ${T.cardBorder}`,
            borderRadius: 10,
            fontFamily: 'inherit',
            fontSize: '.82rem',
            color: T.text,
            background: '#fff',
            outline: 'none',
            cursor: 'pointer',
            boxShadow: T.shadow,
          }}
        >
          <option value="">Tous les domaines</option>
          {DOMAINES_LIST.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Résultats vides */}
      {filtered.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            background: '#fff',
            borderRadius: 14,
            border: `1px solid ${T.cardBorder}`,
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke={T.textMuted}
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ margin: '0 auto .75rem', display: 'block', opacity: 0.5 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p style={{ color: T.textMuted, fontSize: '.88rem' }}>
            Aucun sujet ne correspond à votre recherche.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setFiltreDomaine('');
            }}
            style={{
              marginTop: '1rem',
              background: T.accentLight,
              color: T.accent,
              border: 'none',
              borderRadius: 8,
              padding: '.5rem 1.2rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: '.8rem',
            }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Grille de cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))',
          gap: '1.25rem',
        }}
      >
        {filtered.map((s, idx) => {
          const col = SUJET_COLORS[idx % SUJET_COLORS.length];
          const encNom = s.idEncadrant?.utilisateur
            ? `Dr. ${s.idEncadrant.utilisateur.prenom} ${s.idEncadrant.utilisateur.nom}`
            : 'Encadrant';
          return (
            <div
              key={s._id}
              style={{
                background: col.bg,
                border: `1.5px solid ${col.border}`,
                borderRadius: 16,
                padding: '1.4rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '.8rem',
                transition: 'box-shadow .15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '';
              }}
            >
              {/* Ligne 1 — domaine + niveau + places */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <div
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: col.dot,
                    flexShrink: 0,
                  }}
                />
                {s.domaine && (
                  <span
                    style={{
                      background: col.badge,
                      color: col.badgeText,
                      fontSize: '.65rem',
                      fontWeight: 700,
                      padding: '2px 9px',
                      borderRadius: 999,
                    }}
                  >
                    {s.domaine}
                  </span>
                )}
                {s.niveau && (
                  <span
                    style={{
                      background: 'rgba(0,0,0,.06)',
                      color: T.textSoft,
                      fontSize: '.65rem',
                      fontWeight: 600,
                      padding: '2px 9px',
                      borderRadius: 999,
                    }}
                  >
                    {s.niveau}
                  </span>
                )}
                {s.maxCandidatsInterview > 0 && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      color: T.textMuted,
                      fontSize: '.68rem',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {s.maxCandidatsInterview} place{s.maxCandidatsInterview > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Titre complet */}
              <h3
                style={{
                  fontWeight: 800,
                  color: T.text,
                  fontSize: '1rem',
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                {s.titre}
              </h3>

              {/* Description complète */}
              {s.description && (
                <p style={{ color: T.textSoft, fontSize: '.82rem', lineHeight: 1.65, margin: 0 }}>
                  {s.description}
                </p>
              )}

              {/* Référence */}
              {s.reference && (
                <p style={{ color: T.textMuted, fontSize: '.75rem', margin: 0 }}>
                  Réf : <strong>{s.reference}</strong>
                </p>
              )}

              {/* Technologies — toutes affichées */}
              {s.technologies?.length > 0 && (
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {s.technologies.map((t, i) => (
                    <span
                      key={i}
                      style={{
                        background: 'rgba(0,0,0,.07)',
                        color: T.textSoft,
                        fontSize: '.7rem',
                        fontWeight: 600,
                        padding: '3px 9px',
                        borderRadius: 999,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer — encadrant + bouton */}
              <div
                style={{
                  borderTop: `1px solid ${col.border}`,
                  paddingTop: '.8rem',
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: col.badge,
                      color: col.badgeText,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '.75rem',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {encNom.replace('Dr. ', '')[0]?.toUpperCase() || 'E'}
                  </div>
                  <div>
                    <p
                      style={{ margin: 0, color: T.textMuted, fontSize: '.63rem', fontWeight: 600 }}
                    >
                      Encadrant
                    </p>
                    <p
                      style={{ margin: 0, color: T.textSoft, fontSize: '.76rem', fontWeight: 700 }}
                    >
                      {encNom}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/candidature/${s._id}`)}
                  style={{
                    flexShrink: 0,
                    background: T.accentGrad,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '9px 22px',
                    fontSize: '.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(45,158,107,.35)',
                    fontFamily: 'inherit',
                  }}
                >
                  Postuler →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL Détail sujet */}
      {sujetSelec &&
        (() => {
          const idx = sujets.indexOf(sujetSelec);
          const col = SUJET_COLORS[(idx >= 0 ? idx : 0) % SUJET_COLORS.length];
          const encNom = sujetSelec.idEncadrant?.utilisateur
            ? `Dr. ${sujetSelec.idEncadrant.utilisateur.prenom} ${sujetSelec.idEncadrant.utilisateur.nom}`
            : 'Encadrant';
          return (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15,23,42,.55)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 200,
                padding: '1rem',
              }}
              onClick={(e) => e.target === e.currentTarget && setSujetSelec(null)}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: 580,
                  background: '#fff',
                  borderRadius: 18,
                  overflow: 'hidden',
                  boxShadow: '0 24px 64px rgba(0,0,0,.22)',
                  maxHeight: '92vh',
                  overflowY: 'auto',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    background: col.bg,
                    padding: '1.3rem 1.5rem',
                    borderBottom: `1px solid ${col.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span
                        style={{
                          background: col.badge,
                          color: col.badgeText,
                          fontSize: '.68rem',
                          fontWeight: 700,
                          padding: '2px 10px',
                          borderRadius: 999,
                        }}
                      >
                        Sujet validé
                      </span>
                      {sujetSelec.domaine && (
                        <span
                          style={{
                            background: col.badge,
                            color: col.badgeText,
                            fontSize: '.68rem',
                            fontWeight: 700,
                            padding: '2px 10px',
                            borderRadius: 999,
                          }}
                        >
                          {sujetSelec.domaine}
                        </span>
                      )}
                      {sujetSelec.niveau && (
                        <span
                          style={{
                            background: 'rgba(0,0,0,.06)',
                            color: T.textSoft,
                            fontSize: '.68rem',
                            fontWeight: 600,
                            padding: '2px 10px',
                            borderRadius: 999,
                          }}
                        >
                          {sujetSelec.niveau}
                        </span>
                      )}
                    </div>
                    <h3
                      style={{
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        color: T.text,
                        lineHeight: 1.35,
                      }}
                    >
                      {sujetSelec.titre}
                    </h3>
                    {sujetSelec.reference && (
                      <p style={{ color: T.textMuted, fontSize: '.75rem', marginTop: 4 }}>
                        Réf. : <strong style={{ color: T.accent }}>{sujetSelec.reference}</strong>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSujetSelec(null)}
                    style={{
                      background: 'rgba(0,0,0,.08)',
                      border: 'none',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: T.textSoft,
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Corps */}
                <div style={{ padding: '1.3rem 1.5rem' }}>
                  {sujetSelec.description && (
                    <p
                      style={{
                        color: T.textSoft,
                        fontSize: '.87rem',
                        lineHeight: 1.75,
                        marginBottom: '1.1rem',
                      }}
                    >
                      {sujetSelec.description}
                    </p>
                  )}

                  {/* Infos grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))',
                      gap: 8,
                      marginBottom: '1.1rem',
                    }}
                  >
                    {[
                      {
                        l: 'Places',
                        v:
                          sujetSelec.places > 0
                            ? `${sujetSelec.places} place${sujetSelec.places > 1 ? 's' : ''}`
                            : '—',
                      },
                      { l: 'Encadrant', v: encNom },
                      {
                        l: 'Proposé le',
                        v: sujetSelec.createdAt
                          ? new Date(sujetSelec.createdAt).toLocaleDateString('fr-FR')
                          : '—',
                      },
                    ].map((item) => (
                      <div
                        key={item.l}
                        style={{
                          background: T.bg,
                          borderRadius: 9,
                          padding: '8px 12px',
                          border: `1px solid ${T.cardBorder}`,
                        }}
                      >
                        <p
                          style={{
                            color: T.textMuted,
                            fontSize: '.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '.07em',
                            marginBottom: 3,
                          }}
                        >
                          {item.l}
                        </p>
                        <p
                          style={{
                            fontWeight: 700,
                            color: T.text,
                            fontSize: '.78rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.v}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Technologies */}
                  {sujetSelec.technologies?.length > 0 && (
                    <div style={{ marginBottom: '1.1rem' }}>
                      <p
                        style={{
                          color: T.textMuted,
                          fontSize: '.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '.07em',
                          marginBottom: 7,
                        }}
                      >
                        Technologies
                      </p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {sujetSelec.technologies.map((t, i) => (
                          <span
                            key={i}
                            style={{
                              background: T.accentLight,
                              color: T.accent,
                              padding: '3px 11px',
                              borderRadius: 999,
                              fontSize: '.78rem',
                              fontWeight: 600,
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '.65rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        setSujetSelec(null);
                        navigate(`/candidature/${sujetSelec._id}`);
                      }}
                      style={{
                        flex: 2,
                        minWidth: 140,
                        padding: '.75rem',
                        borderRadius: 10,
                        border: 'none',
                        background: T.accentGrad,
                        color: '#fff',
                        fontFamily: 'inherit',
                        fontSize: '.87rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 4px 14px rgba(45,158,107,.3)',
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Postuler à ce sujet
                    </button>
                    <button
                      onClick={() => setSujetSelec(null)}
                      style={{
                        flex: 1,
                        minWidth: 100,
                        padding: '.75rem',
                        borderRadius: 10,
                        border: `1px solid ${T.cardBorder}`,
                        background: 'transparent',
                        color: T.textSoft,
                        fontFamily: 'inherit',
                        fontSize: '.87rem',
                        cursor: 'pointer',
                      }}
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
