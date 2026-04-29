import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Instance axios publique (pas besoin du token pour le contact)
const publicAPI = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  // ── Contact form state ──────────────────────────────────
  const [contactForm, setContactForm] = useState({
    nom: '',
    email: '',
    sujet: '',
    message: '',
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactError, setContactError] = useState('');

  const slides = [
    {
      title: 'Trouvez Votre',
      titleHighlight: "Projet de Fin d'Etudes",
      subtitle:
        'La plateforme intelligente qui connecte etudiants et encadrants pour une experience PFE reussie.',
      btn: 'Commencer maintenant',
    },
    {
      title: 'Intelligence Artificielle',
      titleHighlight: 'Pour Votre Candidature',
      subtitle:
        'Notre IA analyse votre CV et calcule votre score de compatibilite avec chaque sujet PFE disponible.',
      btn: 'Voir les sujets',
    },
    {
      title: 'Gestion Complete',
      titleHighlight: 'De Votre Parcours PFE',
      subtitle:
        'Calendrier, messagerie, taches, notifications — tout ce dont vous avez besoin en un seul endroit.',
      btn: 'En savoir plus',
    },
  ];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setSlideIndex((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  // ── Handle contact submit ───────────────────────────────
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');
    setContactSuccess('');

    // Validation front basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      setContactError("Format d'email invalide.");
      return;
    }
    if (contactForm.message.trim().length < 10) {
      setContactError('Le message doit contenir au moins 10 caractères.');
      return;
    }

    setContactLoading(true);
    try {
      const { data } = await publicAPI.post('/support/contact', {
        nom: contactForm.nom.trim(),
        email: contactForm.email.trim(),
        sujet: contactForm.sujet.trim(),
        message: contactForm.message.trim(),
      });

      setContactSuccess(data.message || 'Message envoyé avec succès !');
      setContactForm({ nom: '', email: '', sujet: '', message: '' });
      // Effacer le message de succès après 6 s
      setTimeout(() => setContactSuccess(''), 6000);
    } catch (err) {
      setContactError(
        err.response?.data?.message || "Erreur lors de l'envoi. Réessayez plus tard."
      );
    } finally {
      setContactLoading(false);
    }
  };

  // ── Shared field change handler ─────────────────────────
  const handleField = (field) => (e) =>
    setContactForm((prev) => ({ ...prev, [field]: e.target.value }));

  const features = [
    {
      color: '#4A90D9',
      icon: '🎓',
      title: 'Encadrants Qualifies',
      desc: 'Des professeurs et professionnels expertes dans leurs domaines pour vous guider.',
    },
    {
      color: '#E74C3C',
      icon: '📚',
      title: 'Sujets Diversifies',
      desc: 'Plus de 100 sujets PFE dans tous les domaines technologiques et scientifiques.',
    },
    {
      color: '#27AE60',
      icon: '🌍',
      title: 'Reconnaissance Globale',
      desc: 'Des projets reconnus et valorises par les entreprises locales et internationales.',
    },
  ];

  const stats = [
    { value: '200+', label: 'Etudiants' },
    { value: '50+', label: 'Encadrants' },
    { value: '100+', label: 'Sujets PFE' },
    { value: '95%', label: 'Satisfaction' },
  ];

  const courses = [
    { icon: '💻', title: 'Developpement Web', count: '24 sujets', color: '#4A90D9' },
    { icon: '🤖', title: 'Intelligence Artificielle', count: '18 sujets', color: '#9B59B6' },
    { icon: '📱', title: 'Applications Mobile', count: '15 sujets', color: '#E74C3C' },
    { icon: '🔒', title: 'Cybersecurite', count: '12 sujets', color: '#E67E22' },
    { icon: '📊', title: 'Big Data & Analytics', count: '10 sujets', color: '#27AE60' },
    { icon: '☁️', title: 'Cloud Computing', count: '8 sujets', color: '#1ABC9C' },
  ];

  const teachers = [
    { name: 'Dr. Mohamed Hammami', role: 'Genie Logiciel', sujets: 5, color: '#4A90D9' },
    { name: 'Dr. Fatma Ben Salem', role: 'Intelligence Artificielle', sujets: 4, color: '#9B59B6' },
    { name: 'Dr. Ahmed Trabelsi', role: 'Reseaux & Securite', sujets: 6, color: '#E74C3C' },
    { name: 'Dr. Sara Khalil', role: 'Developpement Mobile', sujets: 3, color: '#27AE60' },
  ];

  const slide = slides[slideIndex];

  const inputStyle = {
    width: '100%',
    padding: '.85rem 1.1rem',
    borderRadius: 10,
    border: '1.5px solid #e0e0e0',
    fontSize: '.9rem',
    outline: 'none',
    fontFamily: 'Poppins, sans-serif',
    transition: 'border-color .18s',
  };

  return (
    <div
      style={{
        background: '#f0f4f8',
        minHeight: '100vh',
        fontFamily: 'Poppins, sans-serif',
        color: '#333',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }

        @keyframes fadeIn  { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse   { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

        .animate-fade { animation: fadeIn .8s ease both; }

        .nav-link { color:#fff; text-decoration:none; font-size:.95rem; font-weight:500; padding:.4rem .8rem; border-radius:6px; transition:all .2s; cursor:pointer; }
        .nav-link:hover { background:rgba(255,255,255,.15); }

        .btn-main { background:#F39C12; color:#fff; border:none; padding:.85rem 2.2rem; border-radius:8px; font-size:1rem; font-weight:700; cursor:pointer; font-family:'Poppins',sans-serif; transition:all .25s; text-transform:uppercase; letter-spacing:.05em; }
        .btn-main:hover { background:#E67E22; transform:translateY(-2px); box-shadow:0 8px 24px rgba(243,156,18,.4); }
        .btn-main:disabled { opacity:.6; cursor:not-allowed; transform:none; box-shadow:none; }

        .btn-outline { background:transparent; color:#fff; border:2px solid rgba(255,255,255,.6); padding:.85rem 2.2rem; border-radius:8px; font-size:1rem; font-weight:600; cursor:pointer; font-family:'Poppins',sans-serif; transition:all .25s; }
        .btn-outline:hover { background:rgba(255,255,255,.15); border-color:#fff; }

        .feature-card { background:#fff; border-radius:16px; padding:2.5rem 2rem; text-align:center; transition:all .3s; box-shadow:0 4px 20px rgba(0,0,0,.08); }
        .feature-card:hover { transform:translateY(-8px); box-shadow:0 16px 40px rgba(0,0,0,.15); }

        .course-card { background:#fff; border-radius:14px; padding:1.75rem; transition:all .3s; box-shadow:0 4px 16px rgba(0,0,0,.07); cursor:pointer; border-left:5px solid transparent; }
        .course-card:hover { transform:translateY(-5px); box-shadow:0 12px 32px rgba(0,0,0,.12); }

        .teacher-card { background:#fff; border-radius:16px; padding:2rem; text-align:center; transition:all .3s; box-shadow:0 4px 16px rgba(0,0,0,.07); }
        .teacher-card:hover { transform:translateY(-6px); box-shadow:0 16px 36px rgba(0,0,0,.12); }

        .slide-dot { width:10px; height:10px; border-radius:50%; background:rgba(255,255,255,.4); border:none; cursor:pointer; transition:all .3s; }
        .slide-dot.active { background:#F39C12; width:30px; border-radius:5px; }

        .social-btn { width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; text-decoration:none; font-size:1.1rem; transition:all .25s; border:2px solid rgba(255,255,255,.2); }
        .social-btn:hover { transform:translateY(-3px); border-color:#F39C12; }

        .contact-input:focus { border-color: #1a3a5c !important; }

        .contact-success { background:#ecfdf5; border:1px solid #6ee7b7; color:#065f46; padding:.85rem 1.1rem; border-radius:10px; font-size:.88rem; font-weight:600; animation:slideUp .3s ease; display:flex; align-items:center; gap:.5rem; }
        .contact-error   { background:#fef2f2; border:1px solid #fca5a5; color:#991b1b; padding:.85rem 1.1rem; border-radius:10px; font-size:.88rem; font-weight:600; animation:slideUp .3s ease; display:flex; align-items:center; gap:.5rem; }

        input::placeholder, textarea::placeholder { color:#aaa; }
        select option { background:#fff; color:#333; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 999,
          background: scrolled ? '#0d2137' : '#1a3a5c',
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,.3)' : 'none',
          padding: '1rem 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all .3s',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '.75rem', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#F39C12',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
            }}
          >
            🎓
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', lineHeight: 1 }}>
              Project
            </div>
            <div
              style={{
                fontWeight: 600,
                fontSize: '.7rem',
                color: '#F39C12',
                letterSpacing: '.15em',
                textTransform: 'uppercase',
              }}
            >
              Finder
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          {['accueil', 'apropos', 'domaines', 'encadrants', 'contact'].map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className="nav-link"
              style={{ textTransform: 'capitalize' }}
            >
              {id === 'apropos' ? 'A propos' : id.charAt(0).toUpperCase() + id.slice(1)}
            </a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '.75rem' }}>
          <button
            className="btn-outline"
            style={{ padding: '.6rem 1.4rem', fontSize: '.9rem' }}
            onClick={() => navigate('/login')}
          >
            Connexion
          </button>
          <button
            className="btn-main"
            style={{ padding: '.6rem 1.4rem', fontSize: '.9rem' }}
            onClick={() => navigate('/register')}
          >
            S'inscrire
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        id="accueil"
        style={{
          minHeight: '88vh',
          background: `linear-gradient(rgba(10,22,40,0.7),rgba(10,22,40,0.7)), url('/graduation.jpg') center/cover no-repeat`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '4rem 2.5rem',
        }}
      >
        <div style={{ maxWidth: 900, textAlign: 'center', position: 'relative' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '.5rem',
              background: 'rgba(243,156,18,.15)',
              border: '1px solid rgba(243,156,18,.3)',
              borderRadius: 100,
              padding: '.4rem 1.2rem',
              marginBottom: '1.5rem',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#F39C12',
                display: 'inline-block',
                animation: 'pulse 2s infinite',
              }}
            />
            <span style={{ color: '#F39C12', fontSize: '.82rem', fontWeight: 600 }}>
              Plateforme de Gestion PFE — Tunisie
            </span>
          </div>
          <h1
            key={slideIndex}
            className="animate-fade"
            style={{
              fontWeight: 800,
              fontSize: 'clamp(2.2rem,5vw,3.8rem)',
              color: '#fff',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
            }}
          >
            {slide.title} <span style={{ color: '#F39C12' }}>{slide.titleHighlight}</span>
          </h1>
          <p
            key={'sub-' + slideIndex}
            className="animate-fade"
            style={{
              color: 'rgba(255,255,255,.75)',
              fontSize: '1.1rem',
              lineHeight: 1.7,
              maxWidth: 680,
              margin: '0 auto 2.5rem',
            }}
          >
            {slide.subtitle}
          </p>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '3rem',
            }}
          >
            <button className="btn-main" onClick={() => navigate('/auth')}>
              {slide.btn}
            </button>
            <button
              className="btn-outline"
              onClick={() =>
                document.getElementById('apropos').scrollIntoView({ behavior: 'smooth' })
              }
            >
              En savoir plus
            </button>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '.6rem',
              justifyContent: 'center',
              marginBottom: '2rem',
            }}
          >
            {slides.map((_, i) => (
              <button
                key={i}
                className={'slide-dot' + (i === slideIndex ? ' active' : '')}
                onClick={() => setSlideIndex(i)}
              />
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '3rem',
              flexWrap: 'wrap',
              padding: '1.5rem 2rem',
              background: 'rgba(255,255,255,.06)',
              borderRadius: 16,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,.1)',
            }}
          >
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '2rem', color: '#F39C12' }}>{s.value}</div>
                <div
                  style={{ color: 'rgba(255,255,255,.7)', fontSize: '.85rem', marginTop: '.2rem' }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="apropos" style={{ padding: '6rem 2.5rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div
              style={{
                color: '#F39C12',
                fontWeight: 700,
                fontSize: '.85rem',
                letterSpacing: '.15em',
                textTransform: 'uppercase',
                marginBottom: '.75rem',
              }}
            >
              Pourquoi nous choisir
            </div>
            <h2
              style={{
                fontWeight: 800,
                fontSize: 'clamp(1.8rem,3.5vw,2.6rem)',
                color: '#1a3a5c',
                lineHeight: 1.2,
                marginBottom: '1rem',
              }}
            >
              Tout ce dont vous avez besoin
            </h2>
            <p style={{ color: '#666', maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
              Project Finder simplifie la gestion des projets de fin d'etudes.
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
              gap: '1.5rem',
            }}
          >
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: f.color + '18',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.2rem',
                    margin: '0 auto 1.5rem',
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    color: '#1a3a5c',
                    marginBottom: '.75rem',
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ color: '#666', lineHeight: 1.7, fontSize: '.95rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ── */}
      <section style={{ background: '#1a3a5c', padding: '4rem 2.5rem' }}>
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
            gap: '2rem',
            textAlign: 'center',
          }}
        >
          {stats.map((s, i) => (
            <div key={i} style={{ padding: '1.5rem' }}>
              <div style={{ fontWeight: 800, fontSize: '3rem', color: '#F39C12', lineHeight: 1 }}>
                {s.value}
              </div>
              <div
                style={{
                  color: 'rgba(255,255,255,.8)',
                  fontSize: '1rem',
                  marginTop: '.5rem',
                  fontWeight: 500,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DOMAINES ── */}
      <section id="domaines" style={{ padding: '6rem 2.5rem', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div
              style={{
                color: '#F39C12',
                fontWeight: 700,
                fontSize: '.85rem',
                letterSpacing: '.15em',
                textTransform: 'uppercase',
                marginBottom: '.75rem',
              }}
            >
              Domaines disponibles
            </div>
            <h2
              style={{ fontWeight: 800, fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', color: '#1a3a5c' }}
            >
              Explorez nos domaines PFE
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
              gap: '1.25rem',
            }}
          >
            {courses.map((c, i) => (
              <div
                key={i}
                className="course-card"
                style={{ borderLeftColor: c.color }}
                onClick={() => navigate('/auth')}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      background: c.color + '18',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      flexShrink: 0,
                    }}
                  >
                    {c.icon}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1a3a5c' }}>
                      {c.title}
                    </h3>
                    <span style={{ color: c.color, fontSize: '.82rem', fontWeight: 600 }}>
                      {c.count}
                    </span>
                  </div>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ color: '#999', fontSize: '.85rem' }}>Voir les sujets</span>
                  <span style={{ color: c.color, fontWeight: 700 }}>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENCADRANTS ── */}
      <section id="encadrants" style={{ padding: '6rem 2.5rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div
              style={{
                color: '#F39C12',
                fontWeight: 700,
                fontSize: '.85rem',
                letterSpacing: '.15em',
                textTransform: 'uppercase',
                marginBottom: '.75rem',
              }}
            >
              Notre equipe
            </div>
            <h2
              style={{ fontWeight: 800, fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', color: '#1a3a5c' }}
            >
              Nos encadrants experts
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))',
              gap: '1.5rem',
            }}
          >
            {teachers.map((t, i) => (
              <div key={i} className="teacher-card">
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg,${t.color},${t.color}aa)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  {t.name.split(' ')[1]?.[0] || t.name[0]}
                </div>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#1a3a5c',
                    marginBottom: '.4rem',
                  }}
                >
                  {t.name}
                </h3>
                <p
                  style={{
                    color: t.color,
                    fontSize: '.85rem',
                    fontWeight: 600,
                    marginBottom: '.75rem',
                  }}
                >
                  {t.role}
                </p>
                <span
                  style={{
                    background: t.color + '15',
                    color: t.color,
                    padding: '.25rem .75rem',
                    borderRadius: 100,
                    fontSize: '.78rem',
                    fontWeight: 600,
                  }}
                >
                  {t.sujets} sujets
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── A PROPOS ── */}
      <section style={{ padding: '6rem 2.5rem', background: '#1a3a5c' }}>
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                color: '#F39C12',
                fontWeight: 700,
                fontSize: '.85rem',
                letterSpacing: '.15em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              A propos de nous
            </div>
            <h2
              style={{
                fontWeight: 800,
                fontSize: 'clamp(1.8rem,3.5vw,2.4rem)',
                color: '#fff',
                lineHeight: 1.2,
                marginBottom: '1.5rem',
              }}
            >
              Bienvenue sur Project Finder
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,.75)',
                lineHeight: 1.8,
                marginBottom: '1.25rem',
                fontSize: '.97rem',
              }}
            >
              Project Finder est une plateforme innovante dediee a la gestion des projets de fin
              d'etudes en Tunisie.
            </p>
            <p
              style={{
                color: 'rgba(255,255,255,.75)',
                lineHeight: 1.8,
                marginBottom: '2rem',
                fontSize: '.97rem',
              }}
            >
              Grace a notre intelligence artificielle, nous analysons les competences de chaque
              etudiant et proposons les sujets les plus compatibles.
            </p>
            <button className="btn-main" onClick={() => navigate('/auth')}>
              Rejoindre maintenant
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { emoji: '🎓', title: 'Pour les etudiants', desc: 'Trouvez votre sujet ideal' },
              { emoji: '👨‍🏫', title: 'Pour les encadrants', desc: 'Gerez vos etudiants' },
              { emoji: '🤖', title: 'Analyse IA', desc: 'Score de compatibilite' },
              { emoji: '📊', title: 'Dashboard', desc: 'Suivez votre progression' },
            ].map((c, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,.07)',
                  border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 16,
                  padding: '1.5rem',
                  transition: 'all .3s',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '.75rem' }}>{c.emoji}</div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '.95rem',
                    color: '#fff',
                    marginBottom: '.4rem',
                  }}
                >
                  {c.title}
                </div>
                <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '.83rem' }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ── CONTACT — FORMULAIRE FONCTIONNEL ──
      ══════════════════════════════════════════════════════ */}
      <section id="contact" style={{ padding: '6rem 2.5rem', background: '#fff' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              color: '#F39C12',
              fontWeight: 700,
              fontSize: '.85rem',
              letterSpacing: '.15em',
              textTransform: 'uppercase',
              marginBottom: '.75rem',
            }}
          >
            Contact
          </div>
          <h2
            style={{
              fontWeight: 800,
              fontSize: 'clamp(1.8rem,3.5vw,2.4rem)',
              color: '#1a3a5c',
              marginBottom: '1rem',
            }}
          >
            Contactez-nous
          </h2>
          <p style={{ color: '#666', marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Une question ? Ecrivez-nous et nous vous repondrons rapidement.
          </p>

          {/* Feedback messages */}
          {contactSuccess && (
            <div className="contact-success" style={{ marginBottom: '1.25rem' }}>
              ✅ {contactSuccess}
            </div>
          )}
          {contactError && (
            <div className="contact-error" style={{ marginBottom: '1.25rem' }}>
              ❌ {contactError}
            </div>
          )}

          {/* ── FORM ── */}
          <form
            onSubmit={handleContactSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    color: '#444',
                    fontSize: '.85rem',
                    fontWeight: 600,
                    marginBottom: '.4rem',
                  }}
                >
                  Nom <span style={{ color: '#E74C3C' }}>*</span>
                </label>
                <input
                  className="contact-input"
                  placeholder="Votre nom"
                  value={contactForm.nom}
                  onChange={handleField('nom')}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    color: '#444',
                    fontSize: '.85rem',
                    fontWeight: 600,
                    marginBottom: '.4rem',
                  }}
                >
                  Email <span style={{ color: '#E74C3C' }}>*</span>
                </label>
                <input
                  className="contact-input"
                  type="email"
                  placeholder="votre@email.com"
                  value={contactForm.email}
                  onChange={handleField('email')}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  color: '#444',
                  fontSize: '.85rem',
                  fontWeight: 600,
                  marginBottom: '.4rem',
                }}
              >
                Sujet <span style={{ color: '#E74C3C' }}>*</span>
              </label>
              <input
                className="contact-input"
                placeholder="Sujet du message"
                value={contactForm.sujet}
                onChange={handleField('sujet')}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  color: '#444',
                  fontSize: '.85rem',
                  fontWeight: 600,
                  marginBottom: '.4rem',
                }}
              >
                Message <span style={{ color: '#E74C3C' }}>*</span>
              </label>
              <textarea
                className="contact-input"
                rows={5}
                placeholder="Votre message... (minimum 10 caractères)"
                value={contactForm.message}
                onChange={handleField('message')}
                required
                style={{ ...inputStyle, resize: 'vertical' }}
              />
              <p style={{ color: '#aaa', fontSize: '.75rem', marginTop: '.3rem' }}>
                {contactForm.message.length} / minimum 10 caractères
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <button
                type="submit"
                className="btn-main"
                disabled={contactLoading}
                style={{ padding: '1rem 2.5rem' }}
              >
                {contactLoading ? '⏳ Envoi en cours...' : '📨 Envoyer le message'}
              </button>
              {contactLoading && (
                <span style={{ color: '#666', fontSize: '.82rem' }}>Veuillez patienter...</span>
              )}
            </div>
          </form>

          {/* Infos contact rapides */}
          <div
            style={{
              marginTop: '3rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: '1rem',
            }}
          >
            {[
              { icon: '📍', label: 'Adresse', value: 'Tunis, Tunisie' },
              { icon: '📞', label: 'Téléphone', value: '+216 71 000 000' },
              { icon: '📧', label: 'Email', value: 'contact@projectfinder.tn' },
            ].map((info, i) => (
              <div
                key={i}
                style={{
                  background: '#f8fafc',
                  borderRadius: 12,
                  padding: '1.25rem',
                  textAlign: 'center',
                  border: '1px solid #e8ecf0',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '.5rem' }}>{info.icon}</div>
                <div
                  style={{
                    fontWeight: 700,
                    color: '#1a3a5c',
                    fontSize: '.82rem',
                    marginBottom: '.25rem',
                  }}
                >
                  {info.label}
                </div>
                <div style={{ color: '#666', fontSize: '.8rem' }}>{info.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0d1f30', padding: '4rem 2.5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: '3rem',
              marginBottom: '3rem',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: '#F39C12',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                  }}
                >
                  🎓
                </div>
                <div>
                  <div
                    style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', lineHeight: 1 }}
                  >
                    Project
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '.65rem',
                      color: '#F39C12',
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
                  fontSize: '.88rem',
                  lineHeight: 1.7,
                  marginBottom: '1.5rem',
                }}
              >
                La plateforme intelligente de gestion des projets de fin d'etudes en Tunisie.
              </p>
              <div style={{ display: 'flex', gap: '.6rem' }}>
                {[
                  { href: 'https://facebook.com', bg: '#3B5998', label: 'f' },
                  { href: 'https://linkedin.com', bg: '#0077B5', label: 'in' },
                  { href: 'https://twitter.com', bg: '#1DA1F2', label: '𝕏' },
                  { href: 'https://youtube.com', bg: '#FF0000', label: '▶' },
                ].map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="social-btn"
                    style={{ background: s.bg, color: '#fff', fontWeight: 700, fontSize: '.9rem' }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4
                style={{
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '1.25rem',
                  fontSize: '1rem',
                }}
              >
                Liens rapides
              </h4>
              {['Accueil', 'A propos', 'Domaines', 'Encadrants', 'Contact'].map((link) => (
                <a
                  key={link}
                  href={'#' + link.toLowerCase().replace(' ', '')}
                  style={{
                    display: 'block',
                    color: 'rgba(255,255,255,.6)',
                    fontSize: '.88rem',
                    marginBottom: '.6rem',
                    textDecoration: 'none',
                    transition: 'color .2s',
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#F39C12')}
                  onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,.6)')}
                >
                  → {link}
                </a>
              ))}
            </div>
            <div>
              <h4
                style={{
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '1.25rem',
                  fontSize: '1rem',
                }}
              >
                Etudiants
              </h4>
              {[
                "S'inscrire",
                'Voir les sujets',
                'Mon profil',
                'Mes candidatures',
                'Mon dashboard',
              ].map((link) => (
                <a
                  key={link}
                  href="#"
                  style={{
                    display: 'block',
                    color: 'rgba(255,255,255,.6)',
                    fontSize: '.88rem',
                    marginBottom: '.6rem',
                    textDecoration: 'none',
                    transition: 'color .2s',
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#F39C12')}
                  onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,.6)')}
                >
                  → {link}
                </a>
              ))}
            </div>
            <div>
              <h4
                style={{
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '1.25rem',
                  fontSize: '1rem',
                }}
              >
                Contact
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                {[
                  ['📍', 'Tunis, Tunisie'],
                  ['📞', '+216 71 000 000'],
                  ['📧', 'contact@projectfinder.tn'],
                  ['🌐', 'www.projectfinder.tn'],
                ].map(([icon, val], i) => (
                  <div key={i} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#F39C12', flexShrink: 0 }}>{icon}</span>
                    <span
                      style={{ color: 'rgba(255,255,255,.6)', fontSize: '.85rem', lineHeight: 1.5 }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,.08)',
              paddingTop: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.82rem' }}>
              © 2026 Project Finder — Tunisie
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {['Politique de confidentialite', "Conditions d'utilisation"].map((label) => (
                <a
                  key={label}
                  href="#"
                  style={{
                    color: 'rgba(255,255,255,.4)',
                    fontSize: '.82rem',
                    textDecoration: 'none',
                    transition: 'color .2s',
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#F39C12')}
                  onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,.4)')}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
