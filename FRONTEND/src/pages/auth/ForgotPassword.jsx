// ═══════════════════════════════════════════════════════════
//  FRONTEND/src/pages/auth/ForgotPassword.jsx
//  Page "Mot de passe oublié" — envoie le lien par email
// ═══════════════════════════════════════════════════════════
import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TEAL   = '#1a7a8a';
const YELLOW = '#F5C518';
const DARK   = '#1e293b';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail]       = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [serverErr, setServerErr] = useState('');

  const validate = (val) => {
    if (!val) return 'Email requis';
    if (!EMAIL_REGEX.test(val)) return "Format d'email invalide";
    return '';
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    setEmailErr(validate(e.target.value));
    setServerErr('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate(email);
    if (err) { setEmailErr(err); return; }

    setLoading(true);
    setServerErr('');
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/forgot-password`,
        { email: email.trim().toLowerCase() }
      );
      setSuccess(true);
    } catch {
      setServerErr('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Poppins, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes hexFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        .hexshape { clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); }
        .fadeUp   { animation:fadeUp .6s ease both; }
        .hex-pat  { position:absolute; inset:0; background-image:repeating-linear-gradient(60deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 0,transparent 50%),repeating-linear-gradient(120deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 0,transparent 50%); background-size:40px 70px; pointer-events:none; }
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
        a { text-decoration:none; }
      `}</style>

      {/* ── Gauche décorative ── */}
      <div style={{ width:'45%', background:TEAL, position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div className="hex-pat" />
        {[
          { ic:'🔑', s:200, c:YELLOW,    top:'48%', left:'50%', tf:'translate(-50%,-50%)', d:'0s',   fs:'5rem',  z:3 },
          { ic:'📧', s:100, c:'#E74C3C', top:'8%',  left:'58%', tf:'none',               d:'.6s',  fs:'1.8rem', z:2 },
          { ic:'🔒', s:90,  c:'#27AE60', top:'68%', left:'70%', tf:'none',               d:'1.2s', fs:'1.6rem', z:2 },
          { ic:'✉️',  s:85,  c:'#9B59B6', top:'78%', left:'10%', tf:'none',               d:'1.8s', fs:'1.5rem', z:2 },
          { ic:'🛡️',  s:80,  c:'#E67E22', top:'6%',  left:'8%',  tf:'none',               d:'2.4s', fs:'1.4rem', z:2 },
        ].map((h, i) => (
          <div key={i} className="hexshape" style={{ position:'absolute', top:h.top, left:h.left, transform:h.tf, width:h.s, height:h.s, background:h.c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:h.fs, animation:`hexFloat 5s ease-in-out infinite`, animationDelay:h.d, zIndex:h.z, boxShadow:'0 10px 28px rgba(0,0,0,.2)' }}>
            {h.ic}
          </div>
        ))}

        <div style={{ position:'absolute', bottom:'2.5rem', left:0, right:0, textAlign:'center', zIndex:4 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'.75rem', marginBottom:'.85rem' }}>
            <div style={{ width:42, height:42, borderRadius:10, background:YELLOW, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>🎓</div>
            <div>
              <div style={{ fontWeight:800, fontSize:'1.15rem', color:'#fff', lineHeight:1 }}>Project</div>
              <div style={{ fontWeight:600, fontSize:'.62rem', color:YELLOW, letterSpacing:'.15em', textTransform:'uppercase' }}>Finder</div>
            </div>
          </div>
          <p style={{ color:'rgba(255,255,255,.65)', fontSize:'.82rem', maxWidth:260, margin:'0 auto', lineHeight:1.6 }}>
            Récupérez l'accès à votre espace PFE
          </p>
        </div>
      </div>

      {/* ── Droite : Formulaire ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem 2.5rem', background:'#f8fafc' }}>
        <div className="fadeUp" style={{ width:'100%', maxWidth:400 }}>

          {success ? (
            /* ── État succès ── */
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>📬</div>
              <h2 style={{ fontWeight:800, fontSize:'1.6rem', color:DARK, marginBottom:'.75rem' }}>Email envoyé !</h2>
              <p style={{ color:'#64748b', fontSize:'.9rem', lineHeight:1.7, marginBottom:'2rem' }}>
                Si un compte existe avec <strong>{email}</strong>, vous allez recevoir un lien de réinitialisation valable <strong>30 minutes</strong>.
              </p>
              <p style={{ color:'#94a3b8', fontSize:'.8rem', marginBottom:'1.5rem' }}>
                Vérifiez également vos spams si vous ne voyez rien dans quelques minutes.
              </p>
              <Link to="/login">
                <button className="btn-main">← Retour à la connexion</button>
              </Link>
            </div>
          ) : (
            /* ── Formulaire ── */
            <>
              <div style={{ marginBottom:'2rem' }}>
                <h1 style={{ fontWeight:800, fontSize:'1.9rem', color:DARK, marginBottom:'.4rem' }}>
                  Mot de passe oublié ?
                </h1>
                <p style={{ color:'#64748b', fontSize:'.9rem' }}>
                  Entrez votre email et nous vous enverrons un lien pour le réinitialiser.
                </p>
              </div>

              {/* Erreur serveur */}
              {serverErr && (
                <div style={{ marginBottom:'1.25rem', padding:'.82rem 1rem', borderRadius:9, background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontSize:'.86rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
                  <span>⚠️</span> {serverErr}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
                <div>
                  <label style={{ display:'block', color:'#475569', fontSize:'.82rem', fontWeight:600, marginBottom:'.42rem' }}>
                    Adresse email
                  </label>
                  <input
                    type="email"
                    className={`inp${emailErr ? ' err' : ''}`}
                    placeholder="votre@email.com"
                    value={email}
                    onChange={handleChange}
                    autoComplete="email"
                    autoFocus
                    required
                  />
                  {emailErr && <span className="field-err">⚠ {emailErr}</span>}
                </div>

                <button
                  type="submit"
                  className="btn-main"
                  disabled={loading || !email || !!emailErr}
                >
                  {loading ? (
                    <>
                      <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                      Envoi en cours...
                    </>
                  ) : (
                    'Envoyer le lien de réinitialisation'
                  )}
                </button>
              </form>

              <p style={{ textAlign:'center', marginTop:'1.5rem', color:'#64748b', fontSize:'.88rem' }}>
                <Link to="/login" style={{ color:TEAL, fontWeight:600 }}>← Retour à la connexion</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
