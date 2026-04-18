import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', mot_de_passe: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [voir, setVoir] = useState(false);

  const YELLOW = '#F5C518';
  const TEAL = '#1a7a8a';
  const DARK = '#0d1f30';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Poppins, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes hexFloat { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(4deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }
        .hexshape { clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); }
        .fadeUp { animation:fadeUp .7s ease both; }
        .inp { width:100%; padding:.9rem 1.1rem; border-radius:10px; border:1.5px solid #e0e0e0; font-size:.92rem; outline:none; font-family:Poppins,sans-serif; transition:border-color .2s; background:#fff; color:#333; }
        .inp:focus { border-color:#1a7a8a; box-shadow:0 0 0 3px rgba(26,122,138,.08); }
        .inp::placeholder { color:#bbb; }
        .btn-y { background:#F5C518; color:#0d1f30; border:none; width:100%; padding:1rem; border-radius:10px; font-size:1rem; font-weight:800; cursor:pointer; font-family:Poppins,sans-serif; transition:all .25s; letter-spacing:.03em; }
        .btn-y:hover { background:#e6b800; transform:translateY(-2px); box-shadow:0 8px 24px rgba(245,197,24,.4); }
        .btn-y:disabled { opacity:.6; cursor:not-allowed; transform:none; }
        .hex-pat { position:absolute; inset:0; background-image:repeating-linear-gradient(60deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 0,transparent 50%),repeating-linear-gradient(120deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 0,transparent 50%); background-size:40px 70px; pointer-events:none; }
        .pwd-wrap { position:relative; }
        .pwd-eye { position:absolute; right:.9rem; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#999; font-size:.8rem; font-family:Poppins,sans-serif; padding:.2rem .5rem; transition:color .2s; }
        .pwd-eye:hover { color:#1a7a8a; }
        a { text-decoration:none; }
      `}</style>

      {/* ── GAUCHE — Hexagones ── */}
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

        {/* Hexagones flottants */}
        {[
          {
            ic: '🎓',
            s: 200,
            c: YELLOW,
            top: '48%',
            left: '50%',
            tf: 'translate(-50%,-50%)',
            d: '0s',
            z: 3,
            fs: '5rem',
          },
          {
            ic: '📚',
            s: 100,
            c: '#E74C3C',
            top: '8%',
            left: '58%',
            tf: 'none',
            d: '.6s',
            z: 2,
            fs: '1.8rem',
          },
          {
            ic: '🔬',
            s: 90,
            c: '#27AE60',
            top: '68%',
            left: '70%',
            tf: 'none',
            d: '1.2s',
            z: 2,
            fs: '1.6rem',
          },
          {
            ic: '💡',
            s: 85,
            c: '#9B59B6',
            top: '78%',
            left: '10%',
            tf: 'none',
            d: '1.8s',
            z: 2,
            fs: '1.5rem',
          },
          {
            ic: '⚙️',
            s: 80,
            c: '#E67E22',
            top: '6%',
            left: '8%',
            tf: 'none',
            d: '2.4s',
            z: 2,
            fs: '1.4rem',
          },
          {
            ic: '🏆',
            s: 75,
            c: '#2980B9',
            top: '40%',
            left: '-3%',
            tf: 'none',
            d: '3s',
            z: 2,
            fs: '1.3rem',
          },
          {
            ic: '✉️',
            s: 70,
            c: '#16A085',
            top: '82%',
            left: '50%',
            tf: 'none',
            d: '3.6s',
            z: 2,
            fs: '1.2rem',
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
              boxShadow: '0 10px 28px rgba(0,0,0,.22)',
            }}
          >
            {h.ic}
          </div>
        ))}

        {/* Logo + texte bas */}
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
                boxShadow: '0 4px 14px rgba(245,197,24,.4)',
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
              fontSize: '.83rem',
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
            ['200+', 'Etudiants'],
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

      {/* ── DROITE — Formulaire ── */}
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
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontWeight: 800, fontSize: '2rem', color: DARK, marginBottom: '.4rem' }}>
              Bon retour !
            </h1>
            <p style={{ color: '#777', fontSize: '.92rem' }}>Connectez-vous a votre espace PFE</p>
          </div>

          {/* Erreur */}
          {error && (
            <div
              style={{
                marginBottom: '1.25rem',
                padding: '.85rem 1rem',
                borderRadius: 10,
                background: 'rgba(231,76,60,.07)',
                border: '1px solid rgba(231,76,60,.2)',
                color: '#c0392b',
                fontSize: '.88rem',
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* Formulaire */}
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  color: '#444',
                  fontSize: '.83rem',
                  fontWeight: 600,
                  marginBottom: '.45rem',
                }}
              >
                Adresse email
              </label>
              <input
                type="email"
                className="inp"
                placeholder="votre@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.45rem' }}
              >
                <label style={{ color: '#444', fontSize: '.83rem', fontWeight: 600 }}>
                  Mot de passe
                </label>
                <Link
                  to="/forgot-password"
                  style={{ color: TEAL, fontSize: '.8rem', fontWeight: 500 }}
                >
                  Oublie ?
                </Link>
              </div>
              <div className="pwd-wrap">
                <input
                  type={voir ? 'text' : 'password'}
                  className="inp"
                  placeholder="••••••••"
                  value={form.mot_de_passe}
                  onChange={(e) => setForm({ ...form, mot_de_passe: e.target.value })}
                  required
                  style={{ paddingRight: '4.5rem' }}
                />
                <button type="button" className="pwd-eye" onClick={() => setVoir(!voir)}>
                  {voir ? '🙈 Cacher' : '👁 Voir'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-y" disabled={loading}>
              {loading ? '⏳ Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
            <span style={{ color: '#ccc', fontSize: '.8rem' }}>ou</span>
            <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
          </div>

          {/* Inscription */}
          <p style={{ textAlign: 'center', color: '#777', fontSize: '.9rem' }}>
            Pas de compte ?{' '}
            <Link to="/register" style={{ color: TEAL, fontWeight: 700 }}>
              S'inscrire gratuitement →
            </Link>
          </p>

          {/* Retour */}
          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/accueil" style={{ color: '#bbb', fontSize: '.82rem' }}>
              ← Retour a l'accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
