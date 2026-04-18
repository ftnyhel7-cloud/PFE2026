import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [voir1, setVoir1] = useState(false);
  const [voir2, setVoir2] = useState(false);

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    confirmer: '',
    role: 'ETUDIANT',
    filiere: '',
    matricule: '',
    niveau: '',
    matriculeProf: '',
    specialite: '',
    departement: '',
    typeEncadrant: 'Academique',
  });

  const YELLOW = '#F5C518';
  const TEAL = '#1a7a8a';
  const DARK = '#0d1f30';

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const next = () => {
    setError('');
    if (step === 1) {
      if (!form.nom || !form.prenom || !form.email)
        return setError('Veuillez remplir tous les champs');
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.mot_de_passe !== form.confirmer)
      return setError('Les mots de passe ne correspondent pas');
    if (form.mot_de_passe.length < 8) return setError('Minimum 8 caracteres requis');
    setLoading(true);
    setError('');
    try {
      await API.post('/auth/register', form);
      setSuccess('Compte cree ! Redirection vers la connexion...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const iStyle = {
    width: '100%',
    padding: '.88rem 1.1rem',
    borderRadius: 10,
    border: '1.5px solid #e0e0e0',
    fontSize: '.9rem',
    outline: 'none',
    fontFamily: 'Poppins,sans-serif',
    transition: 'border-color .2s',
    background: '#fff',
    color: '#333',
  };
  const lStyle = {
    display: 'block',
    color: '#444',
    fontSize: '.83rem',
    fontWeight: 600,
    marginBottom: '.45rem',
  };

  const steps = ['Informations', 'Role', 'Mot de passe'];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Poppins,sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes hexFloat { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(-4deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        .hexshape { clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); }
        .fadeUp { animation:fadeUp .7s ease both; }
        .inp:focus { border-color:#1a7a8a; box-shadow:0 0 0 3px rgba(26,122,138,.08); }
        .inp::placeholder { color:#bbb; }
        .btn-y { background:#F5C518; color:#0d1f30; border:none; flex:1; padding:1rem; border-radius:10px; font-size:.95rem; font-weight:800; cursor:pointer; font-family:Poppins,sans-serif; transition:all .25s; }
        .btn-y:hover { background:#e6b800; transform:translateY(-2px); box-shadow:0 8px 24px rgba(245,197,24,.4); }
        .btn-y:disabled { opacity:.6; cursor:not-allowed; transform:none; }
        .btn-back { background:transparent; color:#777; border:1.5px solid #e0e0e0; flex:1; padding:1rem; border-radius:10px; font-size:.95rem; font-weight:600; cursor:pointer; font-family:Poppins,sans-serif; transition:all .25s; }
        .btn-back:hover { background:#f0f0f0; }
        .role-card { flex:1; padding:1.2rem; border-radius:14px; border:2px solid #e0e0e0; background:#fff; cursor:pointer; text-align:center; transition:all .25s; font-family:Poppins,sans-serif; }
        .role-card.on { border-color:#1a7a8a; background:rgba(26,122,138,.06); }
        .role-card:hover { border-color:#1a7a8a; transform:translateY(-2px); }
        .pwd-wrap { position:relative; }
        .pwd-eye { position:absolute; right:.9rem; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#999; font-size:.78rem; font-family:Poppins,sans-serif; padding:.2rem .4rem; }
        .pwd-eye:hover { color:#1a7a8a; }
        select { font-family:Poppins,sans-serif; color:#333; }
        select option { background:#fff; }
        .hex-pat { position:absolute; inset:0; background-image:repeating-linear-gradient(60deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 0,transparent 50%),repeating-linear-gradient(120deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 0,transparent 50%); background-size:40px 70px; pointer-events:none; }
        a { text-decoration:none; }
      `}</style>

      {/* GAUCHE */}
      <div
        style={{
          width: '42%',
          background: DARK,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="hex-pat" />

        {[
          {
            ic: '🎓',
            s: 190,
            c: YELLOW,
            top: '47%',
            left: '50%',
            tf: 'translate(-50%,-50%)',
            d: '0s',
            z: 3,
            fs: '4.5rem',
          },
          {
            ic: '📱',
            s: 95,
            c: '#E74C3C',
            top: '10%',
            left: '55%',
            tf: 'none',
            d: '.5s',
            z: 2,
            fs: '1.7rem',
          },
          {
            ic: '💻',
            s: 88,
            c: TEAL,
            top: '65%',
            left: '65%',
            tf: 'none',
            d: '1s',
            z: 2,
            fs: '1.5rem',
          },
          {
            ic: '🤖',
            s: 82,
            c: '#9B59B6',
            top: '75%',
            left: '12%',
            tf: 'none',
            d: '1.5s',
            z: 2,
            fs: '1.4rem',
          },
          {
            ic: '📊',
            s: 78,
            c: '#27AE60',
            top: '7%',
            left: '10%',
            tf: 'none',
            d: '2s',
            z: 2,
            fs: '1.4rem',
          },
          {
            ic: '🔒',
            s: 72,
            c: '#E67E22',
            top: '38%',
            left: '-2%',
            tf: 'none',
            d: '2.5s',
            z: 2,
            fs: '1.3rem',
          },
          {
            ic: '☁️',
            s: 68,
            c: '#2980B9',
            top: '82%',
            left: '45%',
            tf: 'none',
            d: '3s',
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
              boxShadow: '0 10px 28px rgba(0,0,0,.3)',
            }}
          >
            {h.ic}
          </div>
        ))}

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
              color: 'rgba(255,255,255,.6)',
              fontSize: '.82rem',
              maxWidth: 250,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Rejoignez des centaines d'etudiants et encadrants
          </p>
        </div>

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
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: YELLOW }}>{v}</div>
              <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '.7rem' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DROITE */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 2rem',
          background: '#f8fafc',
          overflowY: 'auto',
        }}
      >
        <div className="fadeUp" style={{ width: '100%', maxWidth: 460 }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h1
              style={{ fontWeight: 800, fontSize: '1.85rem', color: DARK, marginBottom: '.4rem' }}
            >
              Creer un compte
            </h1>
            <p style={{ color: '#777', fontSize: '.9rem' }}>
              Rejoignez la plateforme Project Finder
            </p>
          </div>

          {/* Indicateur etapes */}
          <div
            style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '.5rem' }}
          >
            {steps.map((s, i) => (
              <div
                key={s}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: i < steps.length - 1 ? 1 : 'none',
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: step > i + 1 ? '#27AE60' : step === i + 1 ? TEAL : '#e0e0e0',
                    color: step >= i + 1 ? '#fff' : '#aaa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '.82rem',
                    fontWeight: 700,
                    flexShrink: 0,
                    transition: 'all .3s',
                  }}
                >
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background: step > i + 1 ? '#27AE60' : '#e0e0e0',
                      margin: '0 .4rem',
                      transition: 'background .3s',
                    }}
                  />
                )}
              </div>
            ))}
            <span style={{ marginLeft: '.75rem', fontSize: '.8rem', color: '#888', flexShrink: 0 }}>
              {steps[step - 1]}
            </span>
          </div>

          {/* Messages */}
          {error && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '.85rem 1rem',
                borderRadius: 10,
                background: 'rgba(231,76,60,.07)',
                border: '1px solid rgba(231,76,60,.2)',
                color: '#c0392b',
                fontSize: '.87rem',
              }}
            >
              ⚠ {error}
            </div>
          )}
          {success && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '.85rem 1rem',
                borderRadius: 10,
                background: 'rgba(39,174,96,.07)',
                border: '1px solid rgba(39,174,96,.2)',
                color: '#27AE60',
                fontSize: '.87rem',
              }}
            >
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* STEP 1 */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={lStyle}>Nom</label>
                    <input
                      style={iStyle}
                      className="inp"
                      placeholder="Ben Ali"
                      value={form.nom}
                      onChange={(e) => set('nom', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={lStyle}>Prenom</label>
                    <input
                      style={iStyle}
                      className="inp"
                      placeholder="Ahmed"
                      value={form.prenom}
                      onChange={(e) => set('prenom', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label style={lStyle}>Adresse email</label>
                  <input
                    type="email"
                    style={iStyle}
                    className="inp"
                    placeholder="votre@email.com"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" className="btn-y" onClick={next}>
                    Continuer →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={lStyle}>Votre role</label>
                  <div style={{ display: 'flex', gap: '.75rem', marginBottom: '.5rem' }}>
                    <button
                      type="button"
                      className={'role-card' + (form.role === 'ETUDIANT' ? ' on' : '')}
                      onClick={() => set('role', 'ETUDIANT')}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🎓</div>
                      <div style={{ fontWeight: 700, color: DARK, fontSize: '.92rem' }}>
                        Etudiant
                      </div>
                    </button>
                    <button
                      type="button"
                      className={'role-card' + (form.role === 'ENCADRANT' ? ' on' : '')}
                      onClick={() => set('role', 'ENCADRANT')}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>👨‍🏫</div>
                      <div style={{ fontWeight: 700, color: DARK, fontSize: '.92rem' }}>
                        Encadrant
                      </div>
                    </button>
                  </div>
                </div>

                {form.role === 'ETUDIANT' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={lStyle}>Filiere</label>
                        <input
                          style={iStyle}
                          className="inp"
                          placeholder="Informatique"
                          value={form.filiere}
                          onChange={(e) => set('filiere', e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={lStyle}>Matricule</label>
                        <input
                          style={iStyle}
                          className="inp"
                          placeholder="2023001"
                          value={form.matricule}
                          onChange={(e) => set('matricule', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={lStyle}>Niveau</label>
                      <select
                        style={iStyle}
                        value={form.niveau}
                        onChange={(e) => set('niveau', e.target.value)}
                      >
                        <option value="">Choisir votre niveau</option>
                        {['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'].map(
                          (n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </>
                )}

                {form.role === 'ENCADRANT' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={lStyle}>Matricule Prof</label>
                        <input
                          style={iStyle}
                          className="inp"
                          placeholder="PROF001"
                          value={form.matriculeProf}
                          onChange={(e) => set('matriculeProf', e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={lStyle}>Specialite</label>
                        <input
                          style={iStyle}
                          className="inp"
                          placeholder="Informatique"
                          value={form.specialite}
                          onChange={(e) => set('specialite', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={lStyle}>Departement</label>
                      <input
                        style={iStyle}
                        className="inp"
                        placeholder="Genie Informatique"
                        value={form.departement}
                        onChange={(e) => set('departement', e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={lStyle}>Type encadrant</label>
                      <select
                        style={iStyle}
                        value={form.typeEncadrant}
                        onChange={(e) => set('typeEncadrant', e.target.value)}
                      >
                        <option value="Academique">Academique</option>
                        <option value="Professionnel">Professionnel</option>
                      </select>
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" className="btn-back" onClick={() => setStep(1)}>
                    ← Retour
                  </button>
                  <button type="button" className="btn-y" onClick={next}>
                    Continuer →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={lStyle}>Nouveau mot de passe</label>
                  <div className="pwd-wrap">
                    <input
                      type={voir1 ? 'text' : 'password'}
                      style={{ ...iStyle, paddingRight: '4.5rem' }}
                      className="inp"
                      placeholder="Minimum 8 caracteres"
                      value={form.mot_de_passe}
                      onChange={(e) => set('mot_de_passe', e.target.value)}
                      required
                    />
                    <button type="button" className="pwd-eye" onClick={() => setVoir1(!voir1)}>
                      {voir1 ? '🙈 Cacher' : '👁 Voir'}
                    </button>
                  </div>
                  {form.mot_de_passe.length > 0 && (
                    <div style={{ marginTop: '.5rem' }}>
                      <div
                        style={{
                          height: 4,
                          borderRadius: 2,
                          background: '#eee',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            borderRadius: 2,
                            transition: 'width .3s, background .3s',
                            width:
                              form.mot_de_passe.length < 6
                                ? '30%'
                                : form.mot_de_passe.length < 10
                                  ? '65%'
                                  : '100%',
                            background:
                              form.mot_de_passe.length < 6
                                ? '#E74C3C'
                                : form.mot_de_passe.length < 10
                                  ? '#F5C518'
                                  : '#27AE60',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: '.73rem',
                          color:
                            form.mot_de_passe.length < 6
                              ? '#E74C3C'
                              : form.mot_de_passe.length < 10
                                ? '#E67E22'
                                : '#27AE60',
                        }}
                      >
                        {form.mot_de_passe.length < 6
                          ? 'Faible'
                          : form.mot_de_passe.length < 10
                            ? 'Moyen'
                            : 'Fort'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label style={lStyle}>Confirmer le mot de passe</label>
                  <div className="pwd-wrap">
                    <input
                      type={voir2 ? 'text' : 'password'}
                      style={{
                        ...iStyle,
                        paddingRight: '4.5rem',
                        borderColor:
                          form.confirmer && form.mot_de_passe !== form.confirmer
                            ? '#E74C3C'
                            : undefined,
                      }}
                      className="inp"
                      placeholder="Repetez le mot de passe"
                      value={form.confirmer}
                      onChange={(e) => set('confirmer', e.target.value)}
                      required
                    />
                    <button type="button" className="pwd-eye" onClick={() => setVoir2(!voir2)}>
                      {voir2 ? '🙈 Cacher' : '👁 Voir'}
                    </button>
                  </div>
                  {form.confirmer && form.mot_de_passe !== form.confirmer && (
                    <p style={{ color: '#E74C3C', fontSize: '.75rem', marginTop: '.3rem' }}>
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" className="btn-back" onClick={() => setStep(2)}>
                    ← Retour
                  </button>
                  <button type="submit" className="btn-y" disabled={loading}>
                    {loading ? '⏳ Creation...' : '✅ Creer mon compte'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p
            style={{ textAlign: 'center', color: '#777', fontSize: '.88rem', marginTop: '1.5rem' }}
          >
            Deja un compte ?{' '}
            <Link to="/login" style={{ color: TEAL, fontWeight: 700 }}>
              Se connecter →
            </Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: '.75rem' }}>
            <Link to="/accueil" style={{ color: '#bbb', fontSize: '.82rem' }}>
              ← Retour a l'accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
