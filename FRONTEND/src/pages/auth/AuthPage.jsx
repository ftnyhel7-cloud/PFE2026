import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

export default function AuthPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ email: '', mot_de_passe: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [regData, setRegData] = useState({
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
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const inputStyle = {
    width: '100%',
    padding: '.8rem 1.1rem',
    borderRadius: 12,
    background: 'rgba(255,255,255,.06)',
    border: '1px solid rgba(255,255,255,.1)',
    color: '#F1F5F9',
    fontSize: '.9rem',
    fontFamily: "'DM Sans',sans-serif",
    outline: 'none',
  };
  const labelStyle = {
    display: 'block',
    color: '#94A3B8',
    fontSize: '.82rem',
    fontWeight: 500,
    marginBottom: '.4rem',
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const { data } = await API.post('/auth/login', loginData);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    if (regData.mot_de_passe !== regData.confirmer)
      return setRegError('Les mots de passe ne correspondent pas');
    if (regData.mot_de_passe.length < 8) return setRegError('Minimum 8 caractères');
    setRegLoading(true);
    try {
      await API.post('/auth/register', regData);
      setRegSuccess('✅ Compte créé ! Connectez-vous maintenant.');
      setRegData({
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
    } catch (err) {
      setRegError(err.response?.data?.message || 'Erreur inscription');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div
      style={{
        background: '#07101F',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        .btn-pri { background:linear-gradient(135deg,#4338CA,#7C3AED); color:#fff; border:none; padding:.85rem; border-radius:12px; font-size:.95rem; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .25s; width:100%; }
        .btn-pri:hover { transform:translateY(-1px); box-shadow:0 10px 28px rgba(99,102,241,.4); }
        .btn-pri:disabled { opacity:.5; cursor:not-allowed; }
        input::placeholder, textarea::placeholder { color:#475569; }
        select option { background:#1E293B; color:#F1F5F9; }
      `}</style>

      {/* Navbar mini */}
      <nav
        style={{
          padding: '1rem 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,.06)',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '.7rem', cursor: 'pointer' }}
          onClick={() => navigate('/accueil')}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: 'linear-gradient(135deg,#4338CA,#7C3AED)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99,102,241,.45)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 800,
                fontSize: '1rem',
                color: '#F1F5F9',
                lineHeight: 1,
              }}
            >
              Project
            </div>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 700,
                fontSize: '.65rem',
                color: '#6366F1',
                letterSpacing: '.12em',
                textTransform: 'uppercase',
              }}
            >
              Finder
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/accueil')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,.12)',
            color: '#94A3B8',
            padding: '.5rem 1.2rem',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: '.85rem',
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          ← Retour à l'accueil
        </button>
      </nav>

      {/* Contenu 2 colonnes */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: 'calc(100vh - 65px)',
        }}
      >
        {/* ── LOGIN (gauche) ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 2rem',
            borderRight: '1px solid rgba(255,255,255,.06)',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '30%',
              width: 300,
              height: 300,
              background: 'radial-gradient(circle,rgba(79,70,229,.1) 0%,transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 800,
                  fontSize: '2rem',
                  color: '#F8FAFC',
                  marginBottom: '.5rem',
                }}
              >
                Connexion
              </h2>
              <p style={{ color: '#64748B', fontSize: '.9rem' }}>Accédez à votre espace PFE</p>
            </div>

            {loginError && (
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '.75rem 1rem',
                  borderRadius: 10,
                  background: 'rgba(239,68,68,.1)',
                  border: '1px solid rgba(239,68,68,.3)',
                  color: '#FCA5A5',
                  fontSize: '.85rem',
                }}
              >
                ❌ {loginError}
              </div>
            )}

            <form
              onSubmit={handleLogin}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
            >
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginData.mot_de_passe}
                  onChange={(e) => setLoginData({ ...loginData, mot_de_passe: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#6366F1', fontSize: '.83rem', cursor: 'pointer' }}>
                  Mot de passe oublié ?
                </span>
              </div>
              <button type="submit" className="btn-pri" disabled={loginLoading}>
                {loginLoading ? '⏳ Connexion...' : '🚀 Se connecter'}
              </button>
            </form>
          </div>
        </div>

        {/* ── REGISTER (droite) ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 2rem',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '20%',
              right: '30%',
              width: 300,
              height: 300,
              background: 'radial-gradient(circle,rgba(168,85,247,.08) 0%,transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 800,
                  fontSize: '2rem',
                  color: '#F8FAFC',
                  marginBottom: '.5rem',
                }}
              >
                Inscription
              </h2>
              <p style={{ color: '#64748B', fontSize: '.9rem' }}>Rejoignez la plateforme PFE</p>
            </div>

            {regError && (
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '.75rem 1rem',
                  borderRadius: 10,
                  background: 'rgba(239,68,68,.1)',
                  border: '1px solid rgba(239,68,68,.3)',
                  color: '#FCA5A5',
                  fontSize: '.85rem',
                }}
              >
                ❌ {regError}
              </div>
            )}
            {regSuccess && (
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '.75rem 1rem',
                  borderRadius: 10,
                  background: 'rgba(16,185,129,.1)',
                  border: '1px solid rgba(16,185,129,.3)',
                  color: '#6EE7B7',
                  fontSize: '.85rem',
                }}
              >
                {regSuccess}
              </div>
            )}

            <form
              onSubmit={handleRegister}
              style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}>
                <div>
                  <label style={labelStyle}>Nom</label>
                  <input
                    placeholder="Ben Ali"
                    value={regData.nom}
                    onChange={(e) => setRegData({ ...regData, nom: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Prénom</label>
                  <input
                    placeholder="Ahmed"
                    value={regData.prenom}
                    onChange={(e) => setRegData({ ...regData, prenom: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Rôle</label>
                <select
                  value={regData.role}
                  onChange={(e) => setRegData({ ...regData, role: e.target.value })}
                  style={{ ...inputStyle, background: '#1E293B' }}
                >
                  <option value="ETUDIANT">Étudiant</option>
                  <option value="ENCADRANT">Encadrant</option>
                </select>
              </div>

              {regData.role === 'ETUDIANT' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}>
                  <div>
                    <label style={labelStyle}>Filière</label>
                    <input
                      placeholder="Informatique"
                      value={regData.filiere}
                      onChange={(e) => setRegData({ ...regData, filiere: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Matricule</label>
                    <input
                      placeholder="2023001"
                      value={regData.matricule}
                      onChange={(e) => setRegData({ ...regData, matricule: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>Niveau</label>
                    <select
                      value={regData.niveau}
                      onChange={(e) => setRegData({ ...regData, niveau: e.target.value })}
                      style={{ ...inputStyle, background: '#1E293B' }}
                    >
                      <option value="">Choisir niveau</option>
                      {['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {regData.role === 'ENCADRANT' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}>
                  <div>
                    <label style={labelStyle}>Matricule Prof</label>
                    <input
                      placeholder="PROF001"
                      value={regData.matriculeProf}
                      onChange={(e) => setRegData({ ...regData, matriculeProf: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Spécialité</label>
                    <input
                      placeholder="Informatique"
                      value={regData.specialite}
                      onChange={(e) => setRegData({ ...regData, specialite: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>Département</label>
                    <input
                      placeholder="Génie Informatique"
                      value={regData.departement}
                      onChange={(e) => setRegData({ ...regData, departement: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}>
                <div>
                  <label style={labelStyle}>Mot de passe</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={regData.mot_de_passe}
                    onChange={(e) => setRegData({ ...regData, mot_de_passe: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Confirmer</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={regData.confirmer}
                    onChange={(e) => setRegData({ ...regData, confirmer: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              <button type="submit" className="btn-pri" disabled={regLoading}>
                {regLoading ? '⏳ Inscription...' : '✅ Créer mon compte'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
