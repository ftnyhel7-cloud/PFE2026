// ═══════════════════════════════════════════════════════════
//  FRONTEND/src/pages/dashboard/QuizPage.jsx
//  Format QCM (A/B/C/D) avec blocage navigation pendant chrono
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API from '../../api/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  success: '#1b9e4e',
  successLight: '#d8f3dc',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  warning: '#d97706',
  warningLight: '#fef3c7',
  shadow: '0 2px 12px rgba(64,145,108,.08)',
};

function formatTime(secs) {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function QuizPage() {
  const { candidatureId, token } = useParams();
  const navigate = useNavigate();
  const modeToken = !!token;

  const [quiz, setQuiz] = useState(null);
  const [reponses, setReponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [tempsRestant, setTempsRestant] = useState(null);
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  // Contrôle si le quiz est actif (pour bloquer la navigation)
  const [quizActif, setQuizActif] = useState(false);

  const timerRef = useRef(null);
  const reponsesRef = useRef([]);
  reponsesRef.current = reponses;

  const QUESTIONS_PAR_PAGE = 5;

  // ── Bloquer navigation tant que chrono actif ──────────────
  useEffect(() => {
    if (!quizActif) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue =
        'Le quiz est en cours. Si vous quittez maintenant, vos réponses seront perdues.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [quizActif]);

  // Bloquer le bouton "retour" du navigateur
  useEffect(() => {
    if (!quizActif) return;

    // Pousser un état pour intercepter le back
    window.history.pushState(null, '', window.location.href);
    const handlePopState = (e) => {
      // Repousser l'état pour empêcher le retour
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [quizActif]);

  useEffect(() => {
    chargerQuiz();
    return () => clearInterval(timerRef.current);
  }, []);

  const chargerQuiz = async () => {
    try {
      setLoading(true);
      let data;

      if (modeToken) {
        const res = await axios.get(`${API_URL}/api/candidatures/quiz/token/${token}`);
        data = res.data;
      } else {
        const res = await API.get('/candidatures/mes-candidatures');
        const cand = res.data.find((c) => c._id === candidatureId);
        if (!cand) {
          setError('Candidature introuvable');
          return;
        }
        if (cand.statut !== 'QUIZ_REQUIS') {
          setError('Aucun quiz requis pour cette candidature');
          return;
        }
        data = {
          candidatureId: cand._id,
          sujet: {
            titre: cand.idSujet?.titre,
            technologies: cand.idSujet?.technologies,
            domaine: cand.idSujet?.domaine,
          },
          etudiant: {},
          questions: cand.analyseIA?.quiz || [],
          secondesRestantes: 15 * 60,
        };
      }

      setQuiz(data);
      const questions = data.questions || [];
      setReponses(Array(questions.length).fill(''));
      const secs = data.secondesRestantes ?? 15 * 60;
      setTempsRestant(secs);
      setQuizActif(true);
      demarrerChrono(secs);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors du chargement';
      const expire = err.response?.data?.expire;
      setError(expire ? 'Le temps imparti est écoulé. Ce quiz a expiré.' : msg);
    } finally {
      setLoading(false);
    }
  };

  const demarrerChrono = useCallback((secondesInitiales) => {
    clearInterval(timerRef.current);
    let secs = secondesInitiales;
    timerRef.current = setInterval(() => {
      secs--;
      setTempsRestant(secs);
      if (secs <= 0) {
        clearInterval(timerRef.current);
        soumettreForcé();
      }
    }, 1000);
  }, []);

  const soumettreForcé = useCallback(async () => {
    setAutoSubmit(true);
    await soumettre(reponsesRef.current, true);
  }, []);

  const soumettre = async (reps, force = false) => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    setQuizActif(false); // Débloquer la navigation après soumission
    clearInterval(timerRef.current);

    try {
      let data;
      if (modeToken) {
        const res = await axios.post(`${API_URL}/api/candidatures/quiz/token/${token}`, {
          reponses: reps,
        });
        data = res.data;
      } else {
        const res = await API.post(`/candidatures/${candidatureId}/quiz`, { reponses: reps });
        data = res.data;
      }
      setResult({ ...data, forceSubmit: force });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
      setQuizActif(true); // Rebloquer si erreur
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const nonRepondues = reponses.filter((r) => !r).length;
    if (
      nonRepondues > 0 &&
      !window.confirm(`${nonRepondues} question(s) sans réponse. Soumettre quand même ?`)
    )
      return;
    await soumettre(reponses, false);
  };

  const couleurChrono = () => {
    if (tempsRestant === null) return T.accent;
    if (tempsRestant <= 60) return '#dc2626';
    if (tempsRestant <= 180) return '#d97706';
    return T.accent;
  };

  const questions = quiz?.questions || [];
  const totalPages = Math.ceil(questions.length / QUESTIONS_PAR_PAGE);
  const qPage = questions.slice(
    currentPage * QUESTIONS_PAR_PAGE,
    (currentPage + 1) * QUESTIONS_PAR_PAGE
  );
  const repProgrès = reponses.filter((r) => r).length;

  // ── Normaliser question (QCM objet ou string) ─────────────
  const getQuestion = (q) =>
    typeof q === 'object' && q !== null ? q : { question: q, options: null, reponse: null };

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
              width: 40,
              height: 40,
              border: `3px solid ${T.accentLight}`,
              borderTopColor: T.accent,
              borderRadius: '50%',
              animation: 'spin .8s linear infinite',
              margin: '0 auto 1rem',
            }}
          />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: T.accent, fontWeight: 700 }}>Chargement du quiz…</p>
        </div>
      </div>
    );

  if (error && !quiz)
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`}</style>
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            background: T.bg,
            fontFamily: "'Plus Jakarta Sans',sans-serif",
          }}
        >
          <div style={{ textAlign: 'center', padding: '2rem', maxWidth: 420 }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏰</p>
            <h2 style={{ color: T.danger, fontWeight: 800, marginBottom: '.75rem' }}>
              Quiz non disponible
            </h2>
            <p
              style={{
                color: T.textSoft,
                fontSize: '.9rem',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
              }}
            >
              {error}
            </p>
            {!modeToken && (
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  background: T.accentGrad,
                  color: '#fff',
                  border: 'none',
                  padding: '.75rem 2rem',
                  borderRadius: 10,
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Retour au tableau de bord
              </button>
            )}
          </div>
        </div>
      </>
    );

  if (result)
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            background: T.bg,
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            padding: '1rem',
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
              textAlign: 'center',
              animation: 'fadeUp .5s ease',
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
              {result.estExpire ? '⏰' : result.scoreQuiz >= 70 ? '🎉' : '😔'}
            </div>
            <h2
              style={{ fontWeight: 800, fontSize: '1.4rem', color: T.text, marginBottom: '.5rem' }}
            >
              {result.estExpire
                ? 'Temps écoulé'
                : result.scoreQuiz >= 70
                  ? 'Félicitations !'
                  : 'Résultat du Quiz'}
            </h2>

            {result.estExpire ? (
              <div
                style={{
                  background: T.dangerLight,
                  borderRadius: 12,
                  padding: '1rem',
                  margin: '1.25rem 0',
                }}
              >
                <p style={{ color: T.danger, fontWeight: 700, fontSize: '.9rem' }}>
                  Le quiz a été soumis automatiquement après expiration du temps imparti (15 min).
                </p>
              </div>
            ) : (
              <div
                style={{
                  background: result.scoreQuiz >= 70 ? T.successLight : T.dangerLight,
                  borderRadius: 12,
                  padding: '1rem',
                  margin: '1.25rem 0',
                }}
              >
                <p
                  style={{
                    fontWeight: 800,
                    fontSize: '2rem',
                    color: result.scoreQuiz >= 70 ? T.success : T.danger,
                  }}
                >
                  {result.scoreQuiz}/100
                </p>
                <p style={{ color: T.textSoft, fontSize: '.85rem', marginTop: '.3rem' }}>
                  Score obtenu
                </p>
              </div>
            )}

            <p
              style={{
                color: T.textSoft,
                fontSize: '.9rem',
                lineHeight: 1.65,
                marginBottom: '1.5rem',
              }}
            >
              {result.prochainEtape}
            </p>

            {!modeToken && (
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  background: T.accentGrad,
                  color: '#fff',
                  border: 'none',
                  padding: '.75rem 2rem',
                  borderRadius: 10,
                  fontFamily: 'inherit',
                  fontSize: '.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(64,145,108,.3)',
                }}
              >
                Retour au tableau de bord
              </button>
            )}
          </div>
        </div>
      </>
    );

  // ════════════════════════════════════════════════════════
  //  QUIZ PRINCIPAL — FORMAT QCM
  // ════════════════════════════════════════════════════════
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:${T.bg};}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .qcm-option{
          display:flex;align-items:center;gap:.75rem;
          padding:.75rem 1rem;border-radius:10px;
          border:2px solid ${T.cardBorder};background:#f8fffe;
          cursor:pointer;transition:all .18s;margin-bottom:.5rem;
          font-family:'Plus Jakarta Sans',sans-serif;font-size:.87rem;
          color:${T.text};text-align:left;width:100%;
        }
        .qcm-option:hover{border-color:${T.accent};background:${T.accentLight};}
        .qcm-option.selected{border-color:${T.accent};background:${T.accentLight};}
        .qcm-badge{
          width:28px;height:28px;border-radius:50%;display:flex;
          align-items:center;justify-content:center;
          font-weight:800;font-size:.78rem;flex-shrink:0;
          transition:all .18s;
        }
        .qcm-badge.normal{background:${T.accentLight};color:${T.accent};}
        .qcm-badge.selected{background:${T.accentGrad};color:#fff;}
        .nav-btn{
          padding:.55rem 1.1rem;border-radius:8px;border:1px solid ${T.cardBorder};
          background:transparent;color:${T.textSoft};font-family:inherit;font-size:.82rem;
          font-weight:600;cursor:pointer;transition:all .15s;
        }
        .nav-btn:hover{background:${T.accentLight};}
        .nav-btn:disabled{opacity:.35;cursor:not-allowed;}
        .page-dot{width:8px;height:8px;border-radius:50%;background:${T.accentLight};cursor:pointer;transition:all .2s;border:none;}
        .page-dot.active{background:${T.accent};transform:scale(1.3);}
      `}</style>

      {/* Bannière de blocage visible */}
      <div
        style={{
          background: '#fff8e1',
          borderBottom: `2px solid ${T.warning}`,
          padding: '.6rem 1rem',
          textAlign: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}
      >
        <span style={{ color: T.warning, fontWeight: 700, fontSize: '.82rem' }}>
          Quiz en cours — Navigation bloquée jusqu'à la fin du chronomètre
        </span>
      </div>

      <div
        style={{
          minHeight: '100vh',
          background: T.bg,
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          padding: '1.5rem',
        }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {/* Header */}
          <div
            style={{
              background: T.accentGrad,
              borderRadius: 16,
              padding: '1.5rem 1.75rem',
              marginBottom: '1.5rem',
              boxShadow: '0 8px 24px rgba(64,145,108,.22)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -30,
                right: 60,
                width: 130,
                height: 130,
                borderRadius: '50%',
                background: 'rgba(255,255,255,.07)',
                pointerEvents: 'none',
              }}
            />
            <p
              style={{ color: 'rgba(255,255,255,.75)', fontSize: '.78rem', marginBottom: '.3rem' }}
            >
              Quiz QCM de sélection
            </p>
            <h1
              style={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem', marginBottom: '.4rem' }}
            >
              {quiz?.sujet?.titre || 'Sujet PFE'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,.72)', fontSize: '.82rem' }}>
              {questions.length} question{questions.length > 1 ? 's' : ''} · {repProgrès}/
              {questions.length} répondues
            </p>
          </div>

          {/* Chronomètre */}
          {tempsRestant !== null && (
            <div
              style={{
                background:
                  tempsRestant <= 60
                    ? T.dangerLight
                    : tempsRestant <= 180
                      ? T.warningLight
                      : T.accentLight,
                border: `1.5px solid ${couleurChrono()}`,
                borderRadius: 14,
                padding: '1rem 1.5rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: tempsRestant <= 60 ? '0 0 0 3px rgba(220,38,38,.15)' : 'none',
                animation: tempsRestant <= 60 ? 'pulse 1s ease infinite' : 'none',
              }}
            >
              <div>
                <p
                  style={{
                    fontWeight: 700,
                    color: tempsRestant <= 60 ? T.danger : tempsRestant <= 180 ? T.warning : T.text,
                    fontSize: '.82rem',
                    marginBottom: '.2rem',
                  }}
                >
                  {tempsRestant <= 60
                    ? 'Dépêchez-vous !'
                    : tempsRestant <= 180
                      ? 'Moins de 3 minutes'
                      : 'Temps restant'}
                </p>
                <p style={{ fontSize: '.75rem', color: T.textSoft }}>
                  {tempsRestant <= 0
                    ? 'Soumission en cours…'
                    : 'Le quiz sera soumis automatiquement'}
                </p>
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '2rem',
                  fontVariantNumeric: 'tabular-nums',
                  color: couleurChrono(),
                  fontFamily: 'monospace',
                  minWidth: 80,
                  textAlign: 'right',
                }}
              >
                {tempsRestant <= 0 ? (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      border: `3px solid ${T.dangerLight}`,
                      borderTopColor: T.danger,
                      borderRadius: '50%',
                      animation: 'spin .7s linear infinite',
                      marginLeft: 'auto',
                    }}
                  />
                ) : (
                  formatTime(tempsRestant)
                )}
              </div>
            </div>
          )}

          {/* Barre de progression */}
          <div
            style={{
              background: T.accentLight,
              borderRadius: 99,
              height: 6,
              marginBottom: '1.5rem',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                background: T.accentGrad,
                borderRadius: 99,
                width: `${questions.length ? (repProgrès / questions.length) * 100 : 0}%`,
                transition: 'width .3s ease',
              }}
            />
          </div>

          {/* Instructions */}
          <div
            style={{
              background: T.accentLight,
              border: `1px solid ${T.cardBorder}`,
              borderRadius: 12,
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '.75rem',
            }}
          >
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>ℹ</span>
            <div>
              <p
                style={{
                  fontWeight: 700,
                  color: T.text,
                  fontSize: '.84rem',
                  marginBottom: '.2rem',
                }}
              >
                Instructions
              </p>
              <p style={{ color: T.textSoft, fontSize: '.8rem', lineHeight: 1.6 }}>
                Sélectionnez la meilleure réponse (A, B, C ou D) pour chaque question. Une seule
                réponse correcte par question. Le quiz est soumis automatiquement à la fin des 15
                minutes. Page {currentPage + 1}/{totalPages}
              </p>
            </div>
          </div>

          {/* Questions QCM */}
          <form onSubmit={handleSubmit}>
            {qPage.map((rawQ, i) => {
              const idx = currentPage * QUESTIONS_PAR_PAGE + i;
              const q = getQuestion(rawQ);
              const hasOptions = q.options && Object.keys(q.options).length > 0;
              return (
                <div
                  key={idx}
                  style={{
                    background: T.card,
                    border: `1px solid ${reponses[idx] ? T.accent : T.cardBorder}`,
                    borderRadius: 14,
                    padding: '1.25rem',
                    marginBottom: '1rem',
                    boxShadow: T.shadow,
                    animation: 'fadeUp .3s ease',
                    transition: 'border-color .2s',
                  }}
                >
                  {/* Numéro + question */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '.75rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: reponses[idx] ? T.accentGrad : T.accentLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '.8rem',
                        color: reponses[idx] ? '#fff' : T.accent,
                        flexShrink: 0,
                        transition: 'all .2s',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <p
                      style={{
                        fontWeight: 600,
                        color: T.text,
                        fontSize: '.9rem',
                        lineHeight: 1.55,
                        paddingTop: '.3rem',
                      }}
                    >
                      {q.question}
                    </p>
                  </div>

                  {/* Options QCM */}
                  {hasOptions ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                      {Object.entries(q.options).map(([lettre, texte]) => {
                        const isSelected = reponses[idx] === lettre;
                        return (
                          <button
                            key={lettre}
                            type="button"
                            className={`qcm-option${isSelected ? ' selected' : ''}`}
                            onClick={() => {
                              const n = [...reponses];
                              n[idx] = lettre;
                              setReponses(n);
                            }}
                          >
                            <span className={`qcm-badge${isSelected ? ' selected' : ' normal'}`}>
                              {lettre}
                            </span>
                            <span style={{ flex: 1 }}>{texte}</span>
                            {isSelected && (
                              <span style={{ color: T.accent, fontSize: '.9rem' }}>✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Fallback textarea si pas d'options QCM */
                    <textarea
                      style={{
                        width: '100%',
                        padding: '.75rem 1rem',
                        border: `1.5px solid ${T.cardBorder}`,
                        borderRadius: 9,
                        fontFamily: "'Plus Jakarta Sans',sans-serif",
                        fontSize: '.85rem',
                        color: T.text,
                        background: '#f8fffe',
                        resize: 'vertical',
                        outline: 'none',
                        minHeight: 80,
                      }}
                      placeholder="Votre réponse…"
                      value={reponses[idx] || ''}
                      onChange={(e) => {
                        const n = [...reponses];
                        n[idx] = e.target.value;
                        setReponses(n);
                      }}
                    />
                  )}
                </div>
              );
            })}

            {error && (
              <div
                style={{
                  background: T.dangerLight,
                  border: `1px solid ${T.danger}`,
                  borderRadius: 10,
                  padding: '.75rem 1rem',
                  marginBottom: '1rem',
                  color: T.danger,
                  fontSize: '.83rem',
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            {/* Navigation pages */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <button
                type="button"
                className="nav-btn"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                ← Précédent
              </button>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {Array.from({ length: totalPages }).map((_, p) => (
                  <button
                    key={p}
                    type="button"
                    className={`page-dot${p === currentPage ? ' active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  />
                ))}
              </div>
              {currentPage < totalPages - 1 ? (
                <button
                  type="button"
                  className="nav-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                  Suivant →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '.55rem 1.4rem',
                    borderRadius: 8,
                    border: 'none',
                    background: T.accentGrad,
                    color: '#fff',
                    fontFamily: 'inherit',
                    fontSize: '.85rem',
                    fontWeight: 700,
                    cursor: submitting ? 'wait' : 'pointer',
                    opacity: submitting ? 0.75 : 1,
                    boxShadow: '0 4px 14px rgba(64,145,108,.3)',
                  }}
                >
                  {submitting ? 'Envoi…' : `Soumettre (${repProgrès}/${questions.length})`}
                </button>
              )}
            </div>

            {/* Bouton soumettre global (dernière page) */}
            {currentPage === totalPages - 1 && (
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '.72rem',
                  borderRadius: 10,
                  border: 'none',
                  background: T.accentGrad,
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: '.88rem',
                  fontWeight: 700,
                  cursor: submitting ? 'wait' : 'pointer',
                  opacity: submitting ? 0.75 : 1,
                  boxShadow: '0 4px 14px rgba(64,145,108,.3)',
                }}
              >
                {submitting
                  ? 'Envoi en cours…'
                  : `Soumettre le quiz (${repProgrès}/${questions.length} répondues)`}
              </button>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
