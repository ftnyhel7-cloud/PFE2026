// ═══════════════════════════════════════════════════════════
//  FRONTEND/src/pages/auth/Login.jsx
//  Formulaire de connexion avec validation réactive
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TEAL = '#1a7a8a';
const YELLOW = '#F5C518';
const DARK = '#1e293b';

// Regex de validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login, isAuthenticated, loading: authLoading, setAuthError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', mot_de_passe: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState('');
  const [voirMdp, setVoirMdp] = useState(false);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // ── Validation réactive champ par champ ──────────────
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email requis';
        if (!EMAIL_REGEX.test(value)) return "Format d'email invalide";
        return '';
      case 'mot_de_passe':
        if (!value) return 'Mot de passe requis';
        if (value.length < 8) return 'Minimum 8 caractères';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Validation en temps réel
    const errMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errMsg }));
    setServerErr('');
  };

  // ── Validation complète avant soumission ─────────────
  const validateAll = () => {
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const err = validateField(key, form[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [notValidated, setNotValidated] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);
    setServerErr('');
    setNotValidated(false);

    const result = await login(form.email.trim(), form.mot_de_passe);

    if (result?.success) {
      // Redirection selon le rôle
      navigate('/dashboard', { replace: true });
    } else {
      if (result?.code === 'NOT_VALIDATED') {
        setNotValidated(true);
      }
      setServerErr(result?.message || 'Identifiants incorrects');
    }

    setLoading(false);
  };

  const isFormValid = form.email && form.mot_de_passe && !errors.email && !errors.mot_de_passe;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Poppins, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes hexFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .hexshape { clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); }
        .fadeUp   { animation:fadeUp .6s ease both; }
        .inp {
          width:100%; padding:.82rem 1rem; border-radius:9px;
          border:1.5px solid #e2e8f0; font-size:.88rem; outline:none;
          font-family:Poppins,sans-serif; color:#334155; background:#fff;
          transition:border-color .2s;
        }
        .inp:focus { border-color:${TEAL}; box-shadow:0 0 0 3px rgba(26,122,138,.1); }
        .inp.err   { border-color:#ef4444; }
        .inp::placeholder { color:#cbd5e1; }
        .field-err { color:#ef4444; font-size:.72rem; margin-top:.28rem; display:block; }
        .btn-main {
          width:100%; padding:.9rem; border-radius:9px; border:none;
          background:${TEAL}; color:#fff; font-size:.92rem; font-weight:700;
          cursor:pointer; font-family:Poppins,sans-serif; transition:all .22s;
          display:flex; align-items:center; justify-content:center; gap:.5rem;
        }
        .btn-main:hover:not(:disabled) { background:#15677a; transform:translateY(-1px); box-shadow:0 6px 18px rgba(26,122,138,.3); }
        .btn-main:disabled { opacity:.55; cursor:not-allowed; transform:none; }
        .hex-pat { position:absolute; inset:0; background-image:repeating-linear-gradient(60deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 0,transparent 50%),repeating-linear-gradient(120deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 0,transparent 50%); background-size:40px 70px; pointer-events:none; }
        .pwd-wrap { position:relative; }
        .pwd-eye  { position:absolute; right:.85rem; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#94a3b8; font-size:.75rem; font-family:Poppins,sans-serif; padding:.2rem .3rem; }
        .pwd-eye:hover { color:${TEAL}; }
        a { text-decoration:none; }
      `}</style>

      {/* ── Gauche : Hexagones décoratifs ── */}
      <div
        style={{
          width: '45%',
          background: TEAL,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="hex-pat" />

        {/* Hexagones animés */}
        {[
          {
            ic: '🎓',
            s: 200,
            c: YELLOW,
            top: '48%',
            left: '50%',
            tf: 'translate(-50%,-50%)',
            d: '0s',
            fs: '5rem',
            z: 3,
          },
          {
            ic: '📚',
            s: 100,
            c: '#E74C3C',
            top: '8%',
            left: '58%',
            tf: 'none',
            d: '.6s',
            fs: '1.8rem',
            z: 2,
          },
          {
            ic: '🔬',
            s: 90,
            c: '#27AE60',
            top: '68%',
            left: '70%',
            tf: 'none',
            d: '1.2s',
            fs: '1.6rem',
            z: 2,
          },
          {
            ic: '💡',
            s: 85,
            c: '#9B59B6',
            top: '78%',
            left: '10%',
            tf: 'none',
            d: '1.8s',
            fs: '1.5rem',
            z: 2,
          },
          {
            ic: '⚙️',
            s: 80,
            c: '#E67E22',
            top: '6%',
            left: '8%',
            tf: 'none',
            d: '2.4s',
            fs: '1.4rem',
            z: 2,
          },
          {
            ic: '🏆',
            s: 75,
            c: '#2980B9',
            top: '40%',
            left: '-3%',
            tf: 'none',
            d: '3s',
            fs: '1.3rem',
            z: 2,
          },
        ].map((h, i) => (
          <div
            key={i}
            className="hexshape"
            style={{
              position: 'absolute',
              top: h.top,
              left: h.left,
              transform: h.tf,
              width: h.s,
              height: h.s,
              background: h.c,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: h.fs,
              animation: `hexFloat 5s ease-in-out infinite`,
              animationDelay: h.d,
              zIndex: h.z,
              boxShadow: '0 10px 28px rgba(0,0,0,.2)',
            }}
          >
            {h.ic}
          </div>
        ))}

        {/* Logo bas */}
        <div
          style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 4,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '.75rem',
              marginBottom: '.85rem',
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: YELLOW,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
              }}
            >
              🎓
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#fff', lineHeight: 1 }}>
                Project
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '.62rem',
                  color: YELLOW,
                  letterSpacing: '.15em',
                  textTransform: 'uppercase',
                }}
              >
                Finder
              </div>
            </div>
          </div>
          <p
            style={{
              color: 'rgba(255,255,255,.65)',
              fontSize: '.82rem',
              maxWidth: 260,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            La plateforme intelligente de gestion des PFE en Tunisie
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            position: 'absolute',
            top: '2rem',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            zIndex: 4,
          }}
        >
          {[
            ['200+', 'Étudiants'],
            ['50+', 'Encadrants'],
            ['100+', 'Sujets'],
          ].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '1.3rem', color: YELLOW }}>{v}</div>
              <div style={{ color: 'rgba(255,255,255,.65)', fontSize: '.72rem' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Droite : Formulaire ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2.5rem',
          background: '#f8fafc',
        }}
      >
        <div className="fadeUp" style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontWeight: 800, fontSize: '1.9rem', color: DARK, marginBottom: '.4rem' }}>
              Bon retour !
            </h1>
            <p style={{ color: '#64748b', fontSize: '.9rem' }}>Connectez-vous à votre espace PFE</p>
          </div>

          {/* Erreur serveur */}
          {serverErr && !notValidated && (
            <div
              style={{
                marginBottom: '1.25rem',
                padding: '.82rem 1rem',
                borderRadius: 9,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '.5rem',
              }}
            >
              <span>⚠️</span> {serverErr}
            </div>
          )}

          {/* Compte non validé */}
          {notValidated && (
            <div
              style={{
                marginBottom: '1.25rem',
                padding: '1rem',
                borderRadius: 9,
                background: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#92400e',
                fontSize: '.86rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.4rem', fontWeight: 700 }}>
                <span>⏳</span> Compte en attente de validation
              </div>
              <p style={{ fontSize: '.8rem', lineHeight: 1.5, margin: 0 }}>
                Votre compte a bien été créé mais n'a pas encore été validé par l'administrateur.
                Vous recevrez un email dès que votre accès sera activé.
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
          >
            {/* Email */}
            <div>
              <label
                style={{
                  display: 'block',
                  color: '#475569',
                  fontSize: '.82rem',
                  fontWeight: 600,
                  marginBottom: '.42rem',
                }}
              >
                Adresse email
              </label>
              <input
                type="email"
                name="email"
                className={`inp${errors.email ? ' err' : ''}`}
                placeholder="votre@email.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
              {errors.email && <span className="field-err">⚠ {errors.email}</span>}
            </div>

            {/* Mot de passe */}
            <div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.42rem' }}
              >
                <label style={{ color: '#475569', fontSize: '.82rem', fontWeight: 600 }}>
                  Mot de passe
                </label>
                <Link
                  to="/forgot-password"
                  style={{ color: TEAL, fontSize: '.78rem', fontWeight: 500 }}
                >
                  Oublié ?
                </Link>
              </div>
              <div className="pwd-wrap">
                <input
                  type={voirMdp ? 'text' : 'password'}
                  name="mot_de_passe"
                  className={`inp${errors.mot_de_passe ? ' err' : ''}`}
                  placeholder="••••••••"
                  value={form.mot_de_passe}
                  onChange={handleChange}
                  autoComplete="current-password"
                  style={{ paddingRight: '4.5rem' }}
                  required
                />
                <button type="button" className="pwd-eye" onClick={() => setVoirMdp(!voirMdp)}>
                  {voirMdp ? '🙈 Cacher' : '👁 Voir'}
                </button>
              </div>
              {errors.mot_de_passe && <span className="field-err">⚠ {errors.mot_de_passe}</span>}
            </div>

            {/* Bouton connexion */}
            <button type="submit" className="btn-main" disabled={loading || !isFormValid}>
              {loading ? (
                <>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      border: '2px solid rgba(255,255,255,.4)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Séparateur */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e8ecf0' }} />
            <span style={{ color: '#cbd5e1', fontSize: '.8rem' }}>ou</span>
            <div style={{ flex: 1, height: 1, background: '#e8ecf0' }} />
          </div>

          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '.88rem' }}>
            Pas de compte ?{' '}
            <Link to="/register" style={{ color: TEAL, fontWeight: 700 }}>
              S'inscrire gratuitement →
            </Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: '.85rem' }}>
            <Link to="/accueil" style={{ color: '#94a3b8', fontSize: '.82rem' }}>
              ← Retour à l'accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
