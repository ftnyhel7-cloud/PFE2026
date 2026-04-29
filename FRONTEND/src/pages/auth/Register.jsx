import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';

// ── Validation helpers ────────────────────────────────────
const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRx = /^[a-zA-ZÀ-ÿ\s\-']{2,}$/;
const onlyAlpha = /^[a-zA-ZÀ-ÿ\s\-']+$/;

function pwdStrength(p) {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[a-z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score; // 0-5
}

function validateStep1(form) {
  const errs = {};
  if (!form.nom.trim()) errs.nom = 'Le nom est obligatoire';
  else if (!nameRx.test(form.nom.trim())) errs.nom = 'Lettres uniquement (min 2 caractères)';
  if (!form.prenom.trim()) errs.prenom = 'Le prénom est obligatoire';
  else if (!nameRx.test(form.prenom.trim())) errs.prenom = 'Lettres uniquement (min 2 caractères)';
  if (!form.email.trim()) errs.email = "L'email est obligatoire";
  else if (!emailRx.test(form.email.trim())) errs.email = 'Format email invalide';
  return errs;
}

function validateStep2(form) {
  const errs = {};
  if (form.role === 'ETUDIANT') {
    if (!form.filiere.trim()) errs.filiere = 'La filière est obligatoire';
    if (!form.matricule.trim()) errs.matricule = 'Le matricule est obligatoire';
    if (!form.niveau) errs.niveau = 'Veuillez choisir votre niveau';
  }
  if (form.role === 'ENCADRANT') {
    if (!form.matriculeProf.trim()) errs.matriculeProf = 'Le matricule prof est obligatoire';
    if (!form.specialite.trim()) errs.specialite = 'La spécialité est obligatoire';
    if (!form.departement.trim()) errs.departement = 'Le département est obligatoire';
  }
  return errs;
}

function validateStep3(form) {
  const errs = {};
  const s = pwdStrength(form.mot_de_passe);
  if (!form.mot_de_passe) errs.mot_de_passe = 'Le mot de passe est obligatoire';
  else if (form.mot_de_passe.length < 8) errs.mot_de_passe = 'Minimum 8 caractères';
  else if (!/[A-Z]/.test(form.mot_de_passe)) errs.mot_de_passe = 'Au moins une majuscule requise';
  else if (!/[a-z]/.test(form.mot_de_passe)) errs.mot_de_passe = 'Au moins une minuscule requise';
  else if (!/[0-9]/.test(form.mot_de_passe)) errs.mot_de_passe = 'Au moins un chiffre requis';
  else if (!/[^A-Za-z0-9]/.test(form.mot_de_passe))
    errs.mot_de_passe = 'Au moins un caractère spécial (!@#$...)';
  if (!form.confirmer) errs.confirmer = 'Veuillez confirmer le mot de passe';
  else if (form.mot_de_passe !== form.confirmer)
    errs.confirmer = 'Les mots de passe ne correspondent pas';
  return errs;
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [voir1, setVoir1] = useState(false);
  const [voir2, setVoir2] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

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

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setTouched((p) => ({ ...p, [k]: true }));
    // Validation temps réel
    const updated = { ...form, [k]: v };
    const allErrs = {
      ...validateStep1(updated),
      ...validateStep2(updated),
      ...validateStep3(updated),
    };
    setFieldErrors(allErrs);
  };

  const touch = (k) => setTouched((p) => ({ ...p, [k]: true }));

  // Bordure dynamique
  const borderColor = (field) => {
    if (!touched[field]) return '#e0e0e0';
    return fieldErrors[field] ? '#E74C3C' : '#27AE60';
  };

  const iStyle = (field) => ({
    width: '100%',
    padding: '.88rem 1.1rem',
    borderRadius: 10,
    border: `1.5px solid ${borderColor(field)}`,
    fontSize: '.9rem',
    outline: 'none',
    fontFamily: 'Poppins,sans-serif',
    transition: 'border-color .2s',
    background: '#fff',
    color: '#333',
  });

  const lStyle = {
    display: 'block',
    color: '#444',
    fontSize: '.83rem',
    fontWeight: 600,
    marginBottom: '.45rem',
  };

  const ErrMsg = ({ field }) =>
    touched[field] && fieldErrors[field] ? (
      <p style={{ color: '#E74C3C', fontSize: '.73rem', marginTop: '.3rem' }}>
        ⚠ {fieldErrors[field]}
      </p>
    ) : null;

  const OkIcon = ({ field }) =>
    touched[field] && !fieldErrors[field] && form[field] ? (
      <span style={{ color: '#27AE60', fontSize: '.73rem', marginTop: '.3rem', display: 'block' }}>
        ✓ Valide
      </span>
    ) : null;

  // Avancer étape
  const next = () => {
    setError('');
    if (step === 1) {
      const errs = validateStep1(form);
      // Marquer tout comme touché
      setTouched((p) => ({ ...p, nom: true, prenom: true, email: true }));
      setFieldErrors((prev) => ({ ...prev, ...errs }));
      if (Object.keys(errs).length > 0)
        return setError('Veuillez corriger les erreurs avant de continuer.');
      setStep(2);
    } else if (step === 2) {
      const errs = validateStep2(form);
      const touchFields =
        form.role === 'ETUDIANT'
          ? { filiere: true, matricule: true, niveau: true }
          : { matriculeProf: true, specialite: true, departement: true };
      setTouched((p) => ({ ...p, ...touchFields }));
      setFieldErrors((prev) => ({ ...prev, ...errs }));
      if (Object.keys(errs).length > 0)
        return setError('Veuillez remplir tous les champs obligatoires.');
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep3(form);
    setTouched((p) => ({ ...p, mot_de_passe: true, confirmer: true }));
    setFieldErrors((prev) => ({ ...prev, ...errs }));
    if (Object.keys(errs).length > 0) return setError('Veuillez corriger les erreurs.');
    setLoading(true);
    setError('');
    try {
      const { data } = await API.post('/auth/register', {
        ...form,
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        email: form.email.trim().toLowerCase(),
        codeReference: form.role === 'ETUDIANT' ? form.matricule.trim() : form.matriculeProf.trim(),
      });
      setSuccess(data.message || 'Compte créé avec succès. Vous pouvez vous connecter.');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // Force du mot de passe
  const strength = pwdStrength(form.mot_de_passe);
  const strengthLabel = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'][strength];
  const strengthColor = ['', '#E74C3C', '#E74C3C', '#F5C518', '#27AE60', '#27AE60'][strength];
  const strengthW = `${strength * 20}%`;

  // Critères mot de passe
  const criteria = [
    { label: '8 caractères minimum', ok: form.mot_de_passe.length >= 8 },
    { label: 'Une majuscule (A-Z)', ok: /[A-Z]/.test(form.mot_de_passe) },
    { label: 'Une minuscule (a-z)', ok: /[a-z]/.test(form.mot_de_passe) },
    { label: 'Un chiffre (0-9)', ok: /[0-9]/.test(form.mot_de_passe) },
    { label: 'Un caractère spécial (!@#)', ok: /[^A-Za-z0-9]/.test(form.mot_de_passe) },
  ];

  const steps = ['Informations', 'Rôle', 'Mot de passe'];

  // Désactiver bouton Continuer si erreurs présentes
  const step1Valid = Object.keys(validateStep1(form)).length === 0;
  const step2Valid = Object.keys(validateStep2(form)).length === 0;
  const step3Valid = Object.keys(validateStep3(form)).length === 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Poppins,sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes hexFloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-14px) rotate(-4deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        .hexshape{clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);}
        .fadeUp{animation:fadeUp .7s ease both;}
        .inp::placeholder{color:#bbb;}
        .btn-y{background:#F5C518;color:#0d1f30;border:none;flex:1;padding:1rem;border-radius:10px;font-size:.95rem;font-weight:800;cursor:pointer;font-family:Poppins,sans-serif;transition:all .25s;}
        .btn-y:hover:not(:disabled){background:#e6b800;transform:translateY(-2px);box-shadow:0 8px 24px rgba(245,197,24,.4);}
        .btn-y:disabled{opacity:.45;cursor:not-allowed;transform:none;filter:grayscale(.3);}
        .btn-back{background:transparent;color:#777;border:1.5px solid #e0e0e0;flex:1;padding:1rem;border-radius:10px;font-size:.95rem;font-weight:600;cursor:pointer;font-family:Poppins,sans-serif;transition:all .25s;}
        .btn-back:hover{background:#f0f0f0;}
        .role-card{flex:1;padding:1.2rem;border-radius:14px;border:2px solid #e0e0e0;background:#fff;cursor:pointer;text-align:center;transition:all .25s;font-family:Poppins,sans-serif;}
        .role-card.on{border-color:#1a7a8a;background:rgba(26,122,138,.06);}
        .role-card:hover{border-color:#1a7a8a;transform:translateY(-2px);}
        .pwd-wrap{position:relative;}
        .pwd-eye{position:absolute;right:.9rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#999;font-size:.78rem;font-family:Poppins,sans-serif;padding:.2rem .4rem;}
        .pwd-eye:hover{color:#1a7a8a;}
        select{font-family:Poppins,sans-serif;color:#333;}
        select option{background:#fff;}
        .hex-pat{position:absolute;inset:0;background-image:repeating-linear-gradient(60deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 0,transparent 50%),repeating-linear-gradient(120deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 0,transparent 50%);background-size:40px 70px;pointer-events:none;}
        .crit-item{display:flex;align-items:center;gap:.4rem;font-size:.73rem;color:#888;transition:color .2s;}
        .crit-item.ok{color:#27AE60;}
        a{text-decoration:none;}
        input:focus,select:focus{outline:none;box-shadow:0 0 0 3px rgba(26,122,138,.1);}
      `}</style>

      {/* ── GAUCHE (décoration) ── */}
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

      {/* ── DROITE (formulaire) ── */}
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

          {/* ── Stepper ── */}
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

          {/* ── Barre de progression ── */}
          <div
            style={{
              height: 4,
              background: '#eee',
              borderRadius: 2,
              marginBottom: '1.5rem',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: 2,
                background: `linear-gradient(90deg,${TEAL},#16A085)`,
                width: `${((step - 1) / 2) * 100}%`,
                transition: 'width .4s',
              }}
            />
          </div>

          {/* ── Messages globaux ── */}
          {error && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '.85rem 1rem',
                borderRadius: 10,
                background: 'rgba(231,76,60,.07)',
                border: '1px solid rgba(231,76,60,.25)',
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
                border: '1px solid rgba(39,174,96,.25)',
                color: '#27AE60',
                fontSize: '.87rem',
              }}
            >
              ✅ {success}
              <br />
              <button
                onClick={() => navigate('/login')}
                style={{
                  marginTop: '.6rem',
                  background: '#27AE60',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '.5rem 1.1rem',
                  cursor: 'pointer',
                  fontFamily: 'Poppins,sans-serif',
                  fontSize: '.83rem',
                  fontWeight: 700,
                }}
              >
                Se connecter →
              </button>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              {/* ════ STEP 1 — Informations personnelles ════ */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={lStyle}>
                        Nom <span style={{ color: '#E74C3C' }}>*</span>
                      </label>
                      <input
                        style={iStyle('nom')}
                        className="inp"
                        placeholder="Ben Ali"
                        value={form.nom}
                        onChange={(e) => set('nom', e.target.value)}
                        onBlur={() => touch('nom')}
                      />
                      <ErrMsg field="nom" />
                      <OkIcon field="nom" />
                    </div>
                    <div>
                      <label style={lStyle}>
                        Prenom <span style={{ color: '#E74C3C' }}>*</span>
                      </label>
                      <input
                        style={iStyle('prenom')}
                        className="inp"
                        placeholder="Ahmed"
                        value={form.prenom}
                        onChange={(e) => set('prenom', e.target.value)}
                        onBlur={() => touch('prenom')}
                      />
                      <ErrMsg field="prenom" />
                      <OkIcon field="prenom" />
                    </div>
                  </div>

                  <div>
                    <label style={lStyle}>
                      Adresse email <span style={{ color: '#E74C3C' }}>*</span>
                    </label>
                    <input
                      type="email"
                      style={iStyle('email')}
                      className="inp"
                      placeholder="votre@email.com"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      onBlur={() => touch('email')}
                    />
                    <ErrMsg field="email" />
                    <OkIcon field="email" />
                  </div>

                  <button
                    type="button"
                    className="btn-y"
                    onClick={next}
                    disabled={!step1Valid}
                    style={{ marginTop: '.25rem' }}
                  >
                    Continuer →
                  </button>

                  {!step1Valid && (
                    <p
                      style={{
                        textAlign: 'center',
                        color: '#aaa',
                        fontSize: '.76rem',
                        marginTop: '-.5rem',
                      }}
                    >
                      Complétez tous les champs pour continuer
                    </p>
                  )}
                </div>
              )}

              {/* ════ STEP 2 — Rôle & informations spécifiques ════ */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={lStyle}>
                      Votre rôle <span style={{ color: '#E74C3C' }}>*</span>
                    </label>
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
                          <label style={lStyle}>
                            Filière <span style={{ color: '#E74C3C' }}>*</span>
                          </label>
                          <input
                            style={iStyle('filiere')}
                            className="inp"
                            placeholder="Informatique"
                            value={form.filiere}
                            onChange={(e) => set('filiere', e.target.value)}
                            onBlur={() => touch('filiere')}
                          />
                          <ErrMsg field="filiere" />
                        </div>
                        <div>
                          <label style={lStyle}>
                            Matricule <span style={{ color: '#E74C3C' }}>*</span>
                          </label>
                          <input
                            style={iStyle('matricule')}
                            className="inp"
                            placeholder="2023001"
                            value={form.matricule}
                            onChange={(e) => set('matricule', e.target.value)}
                            onBlur={() => touch('matricule')}
                          />
                          <ErrMsg field="matricule" />
                        </div>
                      </div>
                      <div>
                        <label style={lStyle}>
                          Niveau <span style={{ color: '#E74C3C' }}>*</span>
                        </label>
                        <select
                          style={iStyle('niveau')}
                          value={form.niveau}
                          onChange={(e) => set('niveau', e.target.value)}
                          onBlur={() => touch('niveau')}
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
                        <ErrMsg field="niveau" />
                      </div>
                    </>
                  )}

                  {form.role === 'ENCADRANT' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={lStyle}>
                            Matricule Prof <span style={{ color: '#E74C3C' }}>*</span>
                          </label>
                          <input
                            style={iStyle('matriculeProf')}
                            className="inp"
                            placeholder="PROF001"
                            value={form.matriculeProf}
                            onChange={(e) => set('matriculeProf', e.target.value)}
                            onBlur={() => touch('matriculeProf')}
                          />
                          <ErrMsg field="matriculeProf" />
                        </div>
                        <div>
                          <label style={lStyle}>
                            Spécialité <span style={{ color: '#E74C3C' }}>*</span>
                          </label>
                          <input
                            style={iStyle('specialite')}
                            className="inp"
                            placeholder="Informatique"
                            value={form.specialite}
                            onChange={(e) => set('specialite', e.target.value)}
                            onBlur={() => touch('specialite')}
                          />
                          <ErrMsg field="specialite" />
                        </div>
                      </div>
                      <div>
                        <label style={lStyle}>
                          Département <span style={{ color: '#E74C3C' }}>*</span>
                        </label>
                        <input
                          style={iStyle('departement')}
                          className="inp"
                          placeholder="Génie Informatique"
                          value={form.departement}
                          onChange={(e) => set('departement', e.target.value)}
                          onBlur={() => touch('departement')}
                        />
                        <ErrMsg field="departement" />
                      </div>
                      <div>
                        <label style={lStyle}>Type encadrant</label>
                        <select
                          style={iStyle('typeEncadrant')}
                          value={form.typeEncadrant}
                          onChange={(e) => set('typeEncadrant', e.target.value)}
                        >
                          <option value="Academique">Académique</option>
                          <option value="Professionnel">Professionnel</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" className="btn-back" onClick={() => setStep(1)}>
                      ← Retour
                    </button>
                    <button type="button" className="btn-y" onClick={next} disabled={!step2Valid}>
                      Continuer →
                    </button>
                  </div>
                  {!step2Valid && (
                    <p
                      style={{
                        textAlign: 'center',
                        color: '#aaa',
                        fontSize: '.76rem',
                        marginTop: '-.5rem',
                      }}
                    >
                      Complétez tous les champs obligatoires pour continuer
                    </p>
                  )}
                </div>
              )}

              {/* ════ STEP 3 — Mot de passe ════ */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={lStyle}>
                      Mot de passe <span style={{ color: '#E74C3C' }}>*</span>
                    </label>
                    <div className="pwd-wrap">
                      <input
                        type={voir1 ? 'text' : 'password'}
                        style={{ ...iStyle('mot_de_passe'), paddingRight: '4.5rem' }}
                        className="inp"
                        placeholder="Minimum 8 caractères"
                        value={form.mot_de_passe}
                        onChange={(e) => set('mot_de_passe', e.target.value)}
                        onBlur={() => touch('mot_de_passe')}
                      />
                      <button type="button" className="pwd-eye" onClick={() => setVoir1(!voir1)}>
                        {voir1 ? '🙈 Cacher' : '👁 Voir'}
                      </button>
                    </div>

                    {/* Barre de force */}
                    {form.mot_de_passe.length > 0 && (
                      <div style={{ marginTop: '.55rem' }}>
                        <div
                          style={{
                            height: 5,
                            borderRadius: 3,
                            background: '#eee',
                            overflow: 'hidden',
                            marginBottom: '.3rem',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              borderRadius: 3,
                              transition: 'width .3s, background .3s',
                              width: strengthW,
                              background: strengthColor,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '.73rem', color: strengthColor, fontWeight: 600 }}>
                          Force : {strengthLabel}
                        </span>
                      </div>
                    )}

                    <ErrMsg field="mot_de_passe" />

                    {/* Critères visuels */}
                    {form.mot_de_passe.length > 0 && (
                      <div
                        style={{
                          marginTop: '.6rem',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '.25rem',
                        }}
                      >
                        {criteria.map((c) => (
                          <div key={c.label} className={`crit-item${c.ok ? ' ok' : ''}`}>
                            <span>{c.ok ? '✓' : '○'}</span>
                            <span>{c.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={lStyle}>
                      Confirmer le mot de passe <span style={{ color: '#E74C3C' }}>*</span>
                    </label>
                    <div className="pwd-wrap">
                      <input
                        type={voir2 ? 'text' : 'password'}
                        style={{ ...iStyle('confirmer'), paddingRight: '4.5rem' }}
                        className="inp"
                        placeholder="Répétez le mot de passe"
                        value={form.confirmer}
                        onChange={(e) => set('confirmer', e.target.value)}
                        onBlur={() => touch('confirmer')}
                      />
                      <button type="button" className="pwd-eye" onClick={() => setVoir2(!voir2)}>
                        {voir2 ? '🙈 Cacher' : '👁 Voir'}
                      </button>
                    </div>
                    <ErrMsg field="confirmer" />
                    {touched.confirmer &&
                      form.confirmer &&
                      form.mot_de_passe === form.confirmer && (
                        <span style={{ color: '#27AE60', fontSize: '.73rem' }}>
                          ✓ Les mots de passe correspondent
                        </span>
                      )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" className="btn-back" onClick={() => setStep(2)}>
                      ← Retour
                    </button>
                    <button type="submit" className="btn-y" disabled={loading || !step3Valid}>
                      {loading ? '⏳ Création...' : '✅ Créer mon compte'}
                    </button>
                  </div>
                  {!step3Valid && touched.mot_de_passe && (
                    <p
                      style={{
                        textAlign: 'center',
                        color: '#aaa',
                        fontSize: '.76rem',
                        marginTop: '-.5rem',
                      }}
                    >
                      Complétez les exigences du mot de passe
                    </p>
                  )}
                </div>
              )}
            </form>
          )}

          <p
            style={{ textAlign: 'center', color: '#777', fontSize: '.88rem', marginTop: '1.5rem' }}
          >
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: TEAL, fontWeight: 700 }}>
              Se connecter →
            </Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: '.75rem' }}>
            <Link to="/accueil" style={{ color: '#bbb', fontSize: '.82rem' }}>
              ← Retour à l'accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
