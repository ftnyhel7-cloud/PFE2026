// ═══════════════════════════════════════════════════════════
//  FRONTEND/src/pages/dashboard/CandidaturePage.jsx
//  Formulaire de postulation — upload CV + lettre motivation
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';

// ── Palette identique à SujetsPage ────────────────────────
const T = {
  accent: '#40916c',
  accentLight: '#d8f3dc',
  accentGrad: 'linear-gradient(135deg,#40916c,#52b788)',
  bg: '#f8fffe',
  card: '#fff',
  cardBorder: '#d8f3dc',
  text: '#1b4332',
  textSoft: '#40916c',
  textMuted: '#95d5b2',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  success: '#059669',
  successLight: '#d1fae5',
  shadow: '0 2px 12px rgba(64,145,108,.08)',
};

export default function CandidaturePage() {
  const { idSujet } = useParams();
  const navigate = useNavigate();

  const [sujet, setSujet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lettre, setLettre] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [cvUrl, setCvUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // ── Charger le sujet ──────────────────────────────────────
  useEffect(() => {
    const fetchSujet = async () => {
      try {
        const res = await API.get('/sujets');
        const found = res.data.find((s) => s._id === idSujet);
        if (!found) {
          setError('Sujet introuvable');
          return;
        }
        setSujet(found);
      } catch (err) {
        setError('Impossible de charger le sujet');
      } finally {
        setLoading(false);
      }
    };
    fetchSujet();
  }, [idSujet]);

  // ── Upload CV vers Cloudinary ─────────────────────────────
  const handleCvChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Le CV doit être en format PDF');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Le CV ne doit pas dépasser 5 MB');
      return;
    }
    setCvFile(file);
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('cv', file);
      const res = await API.post('/etudiants/upload-cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCvUrl(res.data.cvUrl);
    } catch (err) {
      setError("Erreur lors de l'upload du CV. Réessayez.");
      setCvFile(null);
    } finally {
      setUploading(false);
    }
  };

  // ── Soumettre la candidature ──────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cvUrl) {
      setError('Veuillez uploader votre CV');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await API.post('/candidatures', {
        idSujet,
        cvUrl,
        lettre: lettre.trim(),
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Couleur badge décision ────────────────────────────────
  const decisionStyle = (d) =>
    ({
      QUIZ_REQUIS: { bg: '#fef3c7', color: '#92400e', label: 'Quiz requis' },
      INTERVIEW: { bg: '#dbeafe', color: '#1e40af', label: 'Entretien' },
      ACCEPTE: { bg: T.successLight, color: T.success, label: 'Accepté' },
      REFUSE: { bg: T.dangerLight, color: T.danger, label: 'Refusé' },
    })[d] || { bg: T.accentLight, color: T.accent, label: d };

  // ════════════════════════════════════════════════════════
  if (loading)
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: T.bg,
          fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: `3px solid ${T.accentLight}`,
              borderTopColor: T.accent,
              borderRadius: '50%',
              animation: 'spin .8s linear infinite',
              margin: '0 auto 1rem',
            }}
          />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: T.accent, fontWeight: 600, fontSize: '.9rem' }}>Chargement…</p>
        </div>
      </div>
    );

  // ── Résultat après soumission ─────────────────────────────
  if (result) {
    const dec = decisionStyle(result.decision);
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div
          style={{
            minHeight: '100vh',
            background: T.bg,
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            display: 'grid',
            placeItems: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: T.card,
              borderRadius: 20,
              padding: '2.5rem',
              maxWidth: 480,
              width: '100%',
              boxShadow: T.shadow,
              border: `1px solid ${T.cardBorder}`,
              animation: 'fadeUp .5s ease',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: T.accentGrad,
                borderRadius: 12,
                padding: '1.5rem',
                textAlign: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: 'rgba(255,255,255,.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto .75rem',
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2
                style={{
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  marginBottom: '.25rem',
                }}
              >
                Candidature soumise !
              </h2>
              <p style={{ color: 'rgba(255,255,255,.8)', fontSize: '.83rem' }}>{sujet?.titre}</p>
            </div>

            {/* Score */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                padding: '1rem',
                background: T.bg,
                borderRadius: 12,
                border: `1px solid ${T.cardBorder}`,
              }}
            >
              <div>
                <p
                  style={{
                    color: T.textMuted,
                    fontSize: '.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.07em',
                    marginBottom: 4,
                  }}
                >
                  Score IA
                </p>
                <p style={{ fontWeight: 800, fontSize: '1.6rem', color: T.accent }}>
                  {result.scoreIA}
                  <span style={{ fontSize: '.9rem', color: T.textMuted }}>/100</span>
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p
                  style={{
                    color: T.textMuted,
                    fontSize: '.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.07em',
                    marginBottom: 4,
                  }}
                >
                  Décision
                </p>
                <span
                  style={{
                    background: dec.bg,
                    color: dec.color,
                    padding: '4px 12px',
                    borderRadius: 999,
                    fontSize: '.78rem',
                    fontWeight: 700,
                  }}
                >
                  {dec.label}
                </span>
              </div>
            </div>

            {/* Résumé IA */}
            {result.analyseIA?.resume && (
              <p
                style={{
                  color: T.textSoft,
                  fontSize: '.85rem',
                  lineHeight: 1.65,
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: T.accentLight,
                  borderRadius: 10,
                }}
              >
                {result.analyseIA.resume}
              </p>
            )}

            {/* Recommandation */}
            {result.recommandation && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  border: '1.5px solid #22c55e',
                  borderRadius: 14,
                  padding: '1.25rem',
                  marginBottom: '1rem',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.5rem',
                    marginBottom: '.75rem',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, color: '#15803d', fontSize: '.82rem', margin: 0 }}>
                      Sujet recommandé par l'IA pour votre profil
                    </p>
                    <p style={{ color: '#16a34a', fontSize: '.72rem', margin: 0 }}>
                      Basé sur votre CV, vos compétences et votre filière
                    </p>
                  </div>
                </div>

                {/* Titre sujet */}
                <p
                  style={{
                    fontWeight: 700,
                    color: '#166534',
                    fontSize: '.92rem',
                    padding: '.6rem .9rem',
                    background: 'rgba(255,255,255,.6)',
                    borderRadius: 8,
                    marginBottom: '.6rem',
                    border: '1px solid #86efac',
                  }}
                >
                  📌 {result.recommandation.sujet?.titre}
                </p>

                {/* Technologies */}
                {result.recommandation.sujet?.technologies?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: '.6rem' }}>
                    {result.recommandation.sujet.technologies.slice(0, 5).map((tech, i) => (
                      <span
                        key={i}
                        style={{
                          background: '#dcfce7',
                          color: '#15803d',
                          fontSize: '.68rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 99,
                          border: '1px solid #86efac',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Raison */}
                <p
                  style={{
                    color: '#166534',
                    fontSize: '.8rem',
                    lineHeight: 1.6,
                    marginBottom: '.9rem',
                  }}
                >
                  💡 {result.recommandation.raison}
                </p>

                {/* Boutons sujet recommande */}
                <div style={{ display: 'flex', gap: '.5rem', flexDirection: 'column' }}>
                {result.recommandation.sujet?._id && (
                  <button
                    onClick={() => navigate(`/sujets?highlight=${result.recommandation.sujet._id}`)}
                    style={{ width: '100%', padding: '.55rem', background: 'transparent', color: '#15803d', border: '1.5px solid #22c55e', borderRadius: 9, fontFamily: 'inherit', fontSize: '.82rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    🔍 Voir ce sujet
                  </button>
                )}
                <button
                  onClick={() => {
                    const id = result.recommandation.sujet?._id;
                    if (!id) { alert('Identifiant du sujet introuvable'); return; }
                    navigate(`/candidature/${id}`);
                  }}
                  style={{
                    width: '100%',
                    padding: '.65rem',
                    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 9,
                    fontFamily: 'inherit',
                    fontSize: '.83rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(34,197,94,.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '.4rem',
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
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  Postuler à ce sujet
                </button>
                </div>
              </div>
            )}

            {/* Info quiz */}
            {result.decision === 'QUIZ_REQUIS' && (
              <div
                style={{
                  background: '#fff8e1',
                  border: '1px solid #f5c518',
                  borderRadius: 10,
                  padding: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <p
                  style={{ fontWeight: 700, color: '#92400e', fontSize: '.82rem', marginBottom: 4 }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ marginRight: 5, verticalAlign: 'middle' }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Un quiz vous a été envoyé par email
                </p>
                <p style={{ color: '#78350f', fontSize: '.8rem' }}>
                  Vérifiez votre boîte mail. Le lien est valable 48h. Le chronomètre (15 min)
                  démarre à l'ouverture.
                </p>
              </div>
            )}

            <button
              onClick={() => navigate('/dashboard')}
              style={{
                width: '100%',
                padding: '.8rem',
                borderRadius: 10,
                border: 'none',
                background: T.accentGrad,
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: '.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(64,145,108,.3)',
              }}
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Formulaire principal ──────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .cv-drop {
          border: 2px dashed ${T.cardBorder}; border-radius: 12px;
          padding: 2rem 1rem; text-align: center; cursor: pointer;
          transition: all .2s; background: ${T.bg};
        }
        .cv-drop:hover, .cv-drop.active { border-color: ${T.accent}; background: ${T.accentLight}; }
        .lettre-ta {
          width: 100%; padding: .85rem 1rem; border: 1.5px solid ${T.cardBorder};
          border-radius: 10px; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: .87rem; color: ${T.text}; background: ${T.bg};
          resize: vertical; outline: none; min-height: 140px; transition: border-color .15s;
        }
        .lettre-ta:focus { border-color: ${T.accent}; box-shadow: 0 0 0 3px rgba(64,145,108,.1); }
        .btn-submit {
          width: 100%; padding: .9rem; border-radius: 10px; border: none;
          background: ${T.accentGrad}; color: #fff; font-family: inherit;
          font-size: .9rem; font-weight: 700; cursor: pointer;
          box-shadow: 0 4px 14px rgba(64,145,108,.3); transition: opacity .2s;
          display: flex; align-items: center; justify-content: center; gap: .5rem;
        }
        .btn-submit:disabled { opacity: .6; cursor: not-allowed; }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          background: T.bg,
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          padding: '2rem 1rem',
        }}
      >
        <div style={{ maxWidth: 560, margin: '0 auto', animation: 'fadeUp .4s ease' }}>
          {/* ── Bouton retour ── */}
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              color: T.textSoft,
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: '.85rem',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              padding: 0,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Retour aux sujets
          </button>

          {/* ── Info sujet ── */}
          {sujet && (
            <div
              style={{
                background: T.accentGrad,
                borderRadius: 16,
                padding: '1.5rem',
                marginBottom: '1.5rem',
                boxShadow: '0 8px 24px rgba(64,145,108,.2)',
              }}
            >
              <p
                style={{
                  color: 'rgba(255,255,255,.7)',
                  fontSize: '.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.1em',
                  marginBottom: '.4rem',
                }}
              >
                Postuler pour
              </p>
              <h2
                style={{
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  lineHeight: 1.35,
                  marginBottom: '.5rem',
                }}
              >
                {sujet.titre}
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {sujet.technologies?.slice(0, 4).map((t, i) => (
                  <span
                    key={i}
                    style={{
                      background: 'rgba(255,255,255,.18)',
                      color: '#fff',
                      padding: '2px 10px',
                      borderRadius: 999,
                      fontSize: '.73rem',
                      fontWeight: 600,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Formulaire ── */}
          <div
            style={{
              background: T.card,
              borderRadius: 16,
              padding: '1.75rem',
              boxShadow: T.shadow,
              border: `1px solid ${T.cardBorder}`,
            }}
          >
            <h3
              style={{ fontWeight: 800, fontSize: '1rem', color: T.text, marginBottom: '.25rem' }}
            >
              Votre candidature
            </h3>
            <p style={{ color: T.textMuted, fontSize: '.82rem', marginBottom: '1.5rem' }}>
              L'IA analysera votre profil et vous répondra par email.
            </p>

            {error && (
              <div
                style={{
                  background: T.dangerLight,
                  border: `1px solid ${T.danger}`,
                  borderRadius: 9,
                  padding: '.75rem 1rem',
                  marginBottom: '1.25rem',
                  color: T.danger,
                  fontSize: '.83rem',
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* ── Upload CV ── */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 700,
                    fontSize: '.82rem',
                    color: T.text,
                    marginBottom: '.5rem',
                  }}
                >
                  CV (PDF)
                  <span style={{ color: T.danger, marginLeft: 3 }}>*</span>
                </label>

                <label className="cv-drop" style={{ display: 'block' }}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleCvChange}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />

                  {uploading ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        color: T.accent,
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          border: `2px solid ${T.accentLight}`,
                          borderTopColor: T.accent,
                          borderRadius: '50%',
                          animation: 'spin .7s linear infinite',
                        }}
                      />
                      <span style={{ fontSize: '.85rem', fontWeight: 600 }}>Upload en cours…</span>
                    </div>
                  ) : cvUrl ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        color: T.success,
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span style={{ fontSize: '.85rem', fontWeight: 700 }}>{cvFile?.name}</span>
                    </div>
                  ) : (
                    <div>
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={T.textMuted}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        style={{ margin: '0 auto .6rem', display: 'block' }}
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <p style={{ color: T.textSoft, fontSize: '.85rem', fontWeight: 600 }}>
                        Cliquez pour uploader votre CV
                      </p>
                      <p style={{ color: T.textMuted, fontSize: '.75rem', marginTop: 4 }}>
                        PDF uniquement · max 5 MB
                      </p>
                    </div>
                  )}
                </label>

                {cvUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setCvFile(null);
                      setCvUrl('');
                    }}
                    style={{
                      marginTop: 6,
                      background: 'none',
                      border: 'none',
                      color: T.danger,
                      fontSize: '.75rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Supprimer et rechoisir
                  </button>
                )}
              </div>

              {/* ── Lettre de motivation ── */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 700,
                    fontSize: '.82rem',
                    color: T.text,
                    marginBottom: '.5rem',
                  }}
                >
                  Lettre de motivation
                  <span style={{ color: T.textMuted, fontWeight: 400, marginLeft: 6 }}>
                    (optionnelle)
                  </span>
                </label>
                <textarea
                  className="lettre-ta"
                  placeholder="Expliquez pourquoi ce sujet vous intéresse, vos compétences pertinentes, votre motivation…"
                  value={lettre}
                  onChange={(e) => setLettre(e.target.value)}
                  maxLength={2000}
                />
                <p
                  style={{
                    textAlign: 'right',
                    color: T.textMuted,
                    fontSize: '.7rem',
                    marginTop: 4,
                  }}
                >
                  {lettre.length}/2000
                </p>
              </div>

              {/* ── Info IA ── */}
              <div
                style={{
                  background: T.accentLight,
                  borderRadius: 10,
                  padding: '.85rem 1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  gap: '.65rem',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={T.accent}
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ flexShrink: 0, marginTop: 2 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p style={{ color: T.textSoft, fontSize: '.78rem', lineHeight: 1.6 }}>
                  L'IA analysera votre CV et calculera un score de compatibilité. Si votre score est
                  supérieur à 60/100, vous recevrez un email avec les prochaines étapes.
                </p>
              </div>

              {/* ── Bouton soumettre ── */}
              <button
                type="submit"
                className="btn-submit"
                disabled={submitting || uploading || !cvUrl}
              >
                {submitting ? (
                  <>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        border: '2px solid rgba(255,255,255,.4)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin .7s linear infinite',
                      }}
                    />
                    Analyse IA en cours…
                  </>
                ) : (
                  <>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Soumettre ma candidature
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
