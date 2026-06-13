// ═══════════════════════════════════════════════════════════
//  FRONTEND/src/pages/auth/ResetPassword.jsx
//  Page "Réinitialiser le mot de passe" — via token URL
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const TEAL   = '#1a7a8a';
const YELLOW = '#F5C518';
const DARK   = '#1e293b';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ResetPassword() {
  const { token }    = useParams();
  const navigate     = useNavigate();

  const [form, setForm]         = useState({ mot_de_passe: '', confirmer: '' });
  const [errors, setErrors]     = useState({});
  const [voirMdp, setVoirMdp]   = useState(false);
  const [voirConf, setVoirConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [serverErr, setServerErr] = useState('');
  const [tokenErr, setTokenErr] = useState(false);

  // Si pas de token dans l'URL → lien invalide
  useEffect(() => {
    if (!token) setTokenErr(true);
  }, [token]);

  const validateField = (name, value) => {
    if (name === 'mot_de_passe') {
      if (!value) return 'Mot de passe requis';
      if (value.length < 8) return 'Minimum 8 caractères';
      return '';
    }
    if (name === 'confirmer') {
      if (!value) return 'Confirmation requise';
      if (value !== form.mot_de_passe) return 'Les mots de passe ne correspondent pas';
      return '';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Re-valider la confirmation si on change le mot de passe
    if (name === 'mot_de_passe' && form.confirmer) {
      setErrors(prev => ({
        ...prev,
        mot_de_passe: validateField('mot_de_passe', value),
        confirmer: value !== form.confirmer ? 'Les mots de passe ne correspondent pas' : '',
      }));
    } else {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
    setServerErr('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      mot_de_passe: validateField('mot_de_passe', form.mot_de_passe),
      confirmer:    validateField('confirmer',    form.confirmer),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    setServerErr('');
    try {
      await axios.put(`${API}/api/auth/reset-password/${token}`, {
        mot_de_passe: form.mot_de_passe,
      });
      setSuccess(true);
      // Redirection automatique vers login après 3 secondes
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg === 'Lien invalide ou expiré') {
        setTokenErr(true);
      } else {
        setServerErr(msg || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    form.mot_de_passe &&
    form.confirmer &&
    !errors.mot_de_passe &&
    !errors.confirmer;

  // ── Indicateur de force du mot de passe ──
  const strength = (() => {
    const v = form.mot_de_passe;
    if (!v) return 0;
    let s = 0;
    if (v.length >= 8)  s++;
    if (v.length >= 12) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'][strength] || '';
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'][strength] || '';

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
        .field-ok  { color:#22c55e; font-size:.72rem; margin-top:.28rem; display:block; }
        .btn-main {
          width:100%; padding:.9rem; border-radius:9px; border:none;
          background:${TEAL}; color:#fff; font-size:.92rem; font-weight:700;
          cursor:pointer; font-family:Poppins,sans-serif; transition:all .22s;
          display:flex; align-items:center; justify-content:center; gap:.5rem;
        }
        .btn-main:hover:not(:disabled) { background:#15677a; transform:translateY(-1px); box-shadow:0 6px 18px rgba(26,122,138,.3); }
        .btn-main:disabled { opacity:.55; cursor:not-allowed; transform:none; }
        .pwd-wrap { position:relative; }
        .pwd-eye  { position:absolute; right:.85rem; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#94a3b8; font-size:.75rem; font-family:Poppins,sans-serif; padding:.2rem .3rem; }
        .pwd-eye:hover { color:${TEAL}; }
        a { text-decoration:none; }
      `}</style>

      {/* ── Gauche décorative ── */}
      <div style={{ width:'45%', background:TEAL, position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div className="hex-pat" />
        {[
          { ic:'🔐', s:200, c:YELLOW,    top:'48%', left:'50%', tf:'translate(-50%,-50%)', d:'0s',   fs:'5rem',  z:3 },
          { ic:'🔑', s:100, c:'#E74C3C', top:'8%',  left:'58%', tf:'none',               d:'.6s',  fs:'1.8rem', z:2 },
          { ic:'✅', s:90,  c:'#27AE60', top:'68%', left:'70%', tf:'none',               d:'1.2s', fs:'1.6rem', z:2 },
          { ic:'🛡️',  s:85,  c:'#9B59B6', top:'78%', left:'10%', tf:'none',               d:'1.8s', fs:'1.5rem', z:2 },
          { ic:'⚡', s:80,  c:'#E67E22', top:'6%',  left:'8%',  tf:'none',               d:'2.4s', fs:'1.4rem', z:2 },
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
            Créez un nouveau mot de passe sécurisé
          </p>
        </div>
      </div>

      {/* ── Droite : Formulaire ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem 2.5rem', background:'#f8fafc' }}>
        <div className="fadeUp" style={{ width:'100%', maxWidth:400 }}>

          {/* ── Lien invalide / expiré ── */}
          {tokenErr ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>⏰</div>
              <h2 style={{ fontWeight:800, fontSize:'1.6rem', color:'#dc2626', marginBottom:'.75rem' }}>
                Lien invalide ou expiré
              </h2>
              <p style={{ color:'#64748b', fontSize:'.9rem', lineHeight:1.7, marginBottom:'2rem' }}>
                Ce lien de réinitialisation n'est plus valide. Les liens expirent après <strong>30 minutes</strong>.
              </p>
              <Link to="/forgot-password">
                <button className="btn-main">Demander un nouveau lien</button>
              </Link>
              <p style={{ marginTop:'1rem' }}>
                <Link to="/login" style={{ color:TEAL, fontSize:'.85rem', fontWeight:500 }}>← Retour à la connexion</Link>
              </p>
            </div>

          ) : success ? (
            /* ── Succès ── */
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🎉</div>
              <h2 style={{ fontWeight:800, fontSize:'1.6rem', color:'#16a34a', marginBottom:'.75rem' }}>
                Mot de passe réinitialisé !
              </h2>
              <p style={{ color:'#64748b', fontSize:'.9rem', lineHeight:1.7, marginBottom:'1rem' }}>
                Votre nouveau mot de passe est actif. Vous allez être redirigé vers la connexion...
              </p>
              <div style={{ width:40, height:40, border:'3px solid rgba(26,122,138,.2)', borderTopColor:TEAL, borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'1.5rem auto' }} />
              <Link to="/login">
                <button className="btn-main" style={{ marginTop:'.5rem' }}>Se connecter maintenant →</button>
              </Link>
            </div>

          ) : (
            /* ── Formulaire ── */
            <>
              <div style={{ marginBottom:'2rem' }}>
                <h1 style={{ fontWeight:800, fontSize:'1.9rem', color:DARK, marginBottom:'.4rem' }}>
                  Nouveau mot de passe
                </h1>
                <p style={{ color:'#64748b', fontSize:'.9rem' }}>
                  Choisissez un mot de passe fort d'au moins 8 caractères.
                </p>
              </div>

              {serverErr && (
                <div style={{ marginBottom:'1.25rem', padding:'.82rem 1rem', borderRadius:9, background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontSize:'.86rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
                  <span>⚠️</span> {serverErr}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>

                {/* Nouveau mot de passe */}
                <div>
                  <label style={{ display:'block', color:'#475569', fontSize:'.82rem', fontWeight:600, marginBottom:'.42rem' }}>
                    Nouveau mot de passe
                  </label>
                  <div className="pwd-wrap">
                    <input
                      type={voirMdp ? 'text' : 'password'}
                      name="mot_de_passe"
                      className={`inp${errors.mot_de_passe ? ' err' : ''}`}
                      placeholder="••••••••"
                      value={form.mot_de_passe}
                      onChange={handleChange}
                      autoComplete="new-password"
                      style={{ paddingRight:'4.5rem' }}
                      autoFocus
                      required
                    />
                    <button type="button" className="pwd-eye" onClick={() => setVoirMdp(!voirMdp)}>
                      {voirMdp ? '🙈 Cacher' : '👁 Voir'}
                    </button>
                  </div>
                  {errors.mot_de_passe && <span className="field-err">⚠ {errors.mot_de_passe}</span>}

                  {/* Barre de force */}
                  {form.mot_de_passe && (
                    <div style={{ marginTop:'.5rem' }}>
                      <div style={{ display:'flex', gap:4, marginBottom:'.25rem' }}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} style={{ flex:1, height:4, borderRadius:4, background: i <= strength ? strengthColor : '#e2e8f0', transition:'background .3s' }} />
                        ))}
                      </div>
                      <span style={{ fontSize:'.7rem', color:strengthColor, fontWeight:600 }}>{strengthLabel}</span>
                    </div>
                  )}
                </div>

                {/* Confirmer */}
                <div>
                  <label style={{ display:'block', color:'#475569', fontSize:'.82rem', fontWeight:600, marginBottom:'.42rem' }}>
                    Confirmer le mot de passe
                  </label>
                  <div className="pwd-wrap">
                    <input
                      type={voirConf ? 'text' : 'password'}
                      name="confirmer"
                      className={`inp${errors.confirmer ? ' err' : (form.confirmer && !errors.confirmer ? '' : '')}`}
                      placeholder="••••••••"
                      value={form.confirmer}
                      onChange={handleChange}
                      autoComplete="new-password"
                      style={{ paddingRight:'4.5rem' }}
                      required
                    />
                    <button type="button" className="pwd-eye" onClick={() => setVoirConf(!voirConf)}>
                      {voirConf ? '🙈 Cacher' : '👁 Voir'}
                    </button>
                  </div>
                  {errors.confirmer && <span className="field-err">⚠ {errors.confirmer}</span>}
                  {!errors.confirmer && form.confirmer && form.confirmer === form.mot_de_passe && (
                    <span className="field-ok">✓ Les mots de passe correspondent</span>
                  )}
                </div>

                <button type="submit" className="btn-main" disabled={loading || !isFormValid}>
                  {loading ? (
                    <>
                      <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                      Réinitialisation...
                    </>
                  ) : (
                    'Réinitialiser le mot de passe'
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
