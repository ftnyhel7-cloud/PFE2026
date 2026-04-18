import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [counterStarted, setCounterStarted] = useState(false);

  const slides = [
    {
      bg: 'linear-gradient(135deg, #0A1628 0%, #1a3a5c 50%, #0d2137 100%)',
      title: 'Trouvez Votre',
      titleHighlight: 'Projet de Fin d\'Etudes',
      subtitle: 'La plateforme intelligente qui connecte etudiants et encadrants pour une experience PFE reussie.',
      btn: 'Commencer maintenant',
    },
    {
      bg: 'linear-gradient(135deg, #0d2137 0%, #1a4a3a 50%, #0A1628 100%)',
      title: 'Intelligence Artificielle',
      titleHighlight: 'Pour Votre Candidature',
      subtitle: 'Notre IA analyse votre CV et calcule votre score de compatibilite avec chaque sujet PFE disponible.',
      btn: 'Voir les sujets',
    },
    {
      bg: 'linear-gradient(135deg, #1a2a0d 0%, #0A1628 50%, #1a1a3a 100%)',
      title: 'Gestion Complete',
      titleHighlight: 'De Votre Parcours PFE',
      subtitle: 'Calendrier, messagerie, taches, notifications — tout ce dont vous avez besoin en un seul endroit.',
      btn: 'En savoir plus',
    },
  ];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { color: '#4A90D9', icon: '🎓', title: 'Encadrants Qualifies', desc: 'Des professeurs et professionnels expertes dans leurs domaines pour vous guider.' },
    { color: '#E74C3C', icon: '📚', title: 'Sujets Diversifies', desc: 'Plus de 100 sujets PFE dans tous les domaines technologiques et scientifiques.' },
    { color: '#27AE60', icon: '🌍', title: 'Reconnaissance Globale', desc: 'Des projets reconnus et valorises par les entreprises locales et internationales.' },
  ];

  const stats = [
    { value: 200, label: 'Etudiants', suffix: '+' },
    { value: 50, label: 'Encadrants', suffix: '+' },
    { value: 100, label: 'Sujets PFE', suffix: '+' },
    { value: 95, label: 'Satisfaction', suffix: '%' },
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

  return (
    <div
      style={{
        background: '#f0f4f8',
        minHeight: '100vh',
        fontFamily: 'Segoe UI, sans-serif',
        color: '#333',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Poppins', sans-serif; }

        @keyframes fadeIn { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }

        .animate-fade { animation: fadeIn .8s ease both; }
        .animate-slide { animation: slideIn .8s ease both; }

        .nav-link {
          color: #fff;
          text-decoration: none;
          font-size: .95rem;
          font-weight: 500;
          padding: .4rem .8rem;
          border-radius: 6px;
          transition: all .2s;
          cursor: pointer;
        }
        .nav-link:hover { background: rgba(255,255,255,.15); }

        .btn-main {
          background: #F39C12;
          color: #fff;
          border: none;
          padding: .85rem 2.2rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Poppins', sans-serif;
          transition: all .25s;
          text-transform: uppercase;
          letter-spacing: .05em;
        }
        .btn-main:hover { background: #E67E22; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(243,156,18,.4); }

        .btn-outline {
          background: transparent;
          color: #fff;
          border: 2px solid rgba(255,255,255,.6);
          padding: .85rem 2.2rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Poppins', sans-serif;
          transition: all .25s;
        }
        .btn-outline:hover { background: rgba(255,255,255,.15); border-color: #fff; }

        .feature-card {
          background: #fff;
          border-radius: 16px;
          padding: 2.5rem 2rem;
          text-align: center;
          transition: all .3s;
          box-shadow: 0 4px 20px rgba(0,0,0,.08);
        }
        .feature-card:hover { transform: translateY(-8px); box-shadow: 0 16px 40px rgba(0,0,0,.15); }

        .course-card {
          background: #fff;
          border-radius: 14px;
          padding: 1.75rem;
          transition: all .3s;
          box-shadow: 0 4px 16px rgba(0,0,0,.07);
          cursor: pointer;
          border-left: 5px solid transparent;
        }
        .course-card:hover { transform: translateY(-5px); box-shadow: 0 12px 32px rgba(0,0,0,.12); }

        .teacher-card {
          background: #fff;
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          transition: all .3s;
          box-shadow: 0 4px 16px rgba(0,0,0,.07);
        }
        .teacher-card:hover { transform: translateY(-6px); box-shadow: 0 16px 36px rgba(0,0,0,.12); }

        .slide-dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,.4); border: none; cursor: pointer; transition: all .3s; }
        .slide-dot.active { background: #F39C12; width: 30px; border-radius: 5px; }

        .social-btn {
          width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          text-decoration: none; font-size: 1.1rem; transition: all .25s; border: 2px solid rgba(255,255,255,.2);
        }
        .social-btn:hover { transform: translateY(-3px); border-color: #F39C12; }

        .stat-item { text-align: center; }
        .stat-num { font-size: 2.8rem; font-weight: 800; color: #1a3a5c; line-height: 1; }
        .stat-label { font-size: .95rem; color: #666; margin-top: .3rem; font-weight: 500; }

        input, textarea { font-family: 'Poppins', sans-serif; }
        input::placeholder, textarea::placeholder { color: #aaa; }
      `}</style>

      {/* ── TOP BAR ── */}


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
        {/* Logo */}
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
            <div
              style={{
                fontFamily: 'Poppins,sans-serif',
                fontWeight: 800,
                fontSize: '1.2rem',
                color: '#fff',
                lineHeight: 1,
              }}
            >
              Project
            </div>
            <div
              style={{
                fontFamily: 'Poppins,sans-serif',
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

        {/* Links */}
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <a href="#accueil" className="nav-link">
            Accueil
          </a>
          <a href="#apropos" className="nav-link">
            A propos
          </a>
          <a href="#domaines" className="nav-link">
            Domaines
          </a>
          <a href="#encadrants" className="nav-link">
            Encadrants
          </a>
          <a href="#contact" className="nav-link">
            Contact
          </a>
        </div>

        {/* Boutons */}
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

      {/* ── HERO SLIDER ── */}
      <section
        id="accueil"
        style={{
          minHeight: '88vh',
          background: `
  linear-gradient(rgba(10,22,40,0.7), rgba(10,22,40,0.7)),
  url('/graduation.jpg') center/cover no-repeat
`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          transition: 'background 1s ease',
          padding: '4rem 2.5rem',
        }}
      >
        {/* Cercles decoratifs */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(255,255,255,.03)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'rgba(243,156,18,.05)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '5%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,.06)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 900, textAlign: 'center', position: 'relative' }}>
          {/* Badge */}
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

          {/* Titre */}
          <h1
            key={slideIndex}
            className="animate-fade"
            style={{
              fontFamily: 'Poppins,sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              color: '#fff',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
            }}
          >
            {slide.title} <span style={{ color: '#F39C12' }}>{slide.titleHighlight}</span>
          </h1>

          {/* Sous-titre */}
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

          {/* Boutons */}
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
              onClick={() => {
                document.getElementById('apropos').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              En savoir plus
            </button>
          </div>

          {/* Dots navigation */}
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

          {/* Stats rapides */}
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
                <div
                  style={{
                    fontFamily: 'Poppins,sans-serif',
                    fontWeight: 800,
                    fontSize: '2rem',
                    color: '#F39C12',
                  }}
                >
                  {s.value}
                  {s.suffix}
                </div>
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
                fontFamily: 'Poppins,sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                color: '#1a3a5c',
                lineHeight: 1.2,
                marginBottom: '1rem',
              }}
            >
              Tout ce dont vous avez besoin
            </h2>
            <p style={{ color: '#666', maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
              Project Finder simplifie la gestion des projets de fin d'etudes en mettant en relation
              etudiants et encadrants qualifies.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
                    fontFamily: 'Poppins,sans-serif',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    color: '#1a3a5c',
                    marginBottom: '.75rem',
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ color: '#666', lineHeight: 1.7, fontSize: '.95rem' }}>{f.desc}</p>
                <div style={{ marginTop: '1.25rem' }}>
                  <a
                    href="#"
                    style={{
                      color: f.color,
                      fontWeight: 600,
                      fontSize: '.9rem',
                      textDecoration: 'none',
                    }}
                  >
                    En savoir plus →
                  </a>
                </div>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            textAlign: 'center',
          }}
        >
          {stats.map((s, i) => (
            <div key={i} style={{ padding: '1.5rem' }}>
              <div
                style={{
                  fontFamily: 'Poppins,sans-serif',
                  fontWeight: 800,
                  fontSize: '3rem',
                  color: '#F39C12',
                  lineHeight: 1,
                }}
              >
                {s.value}
                {s.suffix}
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
              style={{
                fontFamily: 'Poppins,sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                color: '#1a3a5c',
              }}
            >
              Explorez nos domaines PFE
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
                    <h3
                      style={{
                        fontFamily: 'Poppins,sans-serif',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: '#1a3a5c',
                      }}
                    >
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
              style={{
                fontFamily: 'Poppins,sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                color: '#1a3a5c',
              }}
            >
              Nos encadrants experts
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
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
                    background: 'linear-gradient(135deg,' + t.color + ',' + t.color + 'aa)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    color: '#fff',
                    fontFamily: 'Poppins,sans-serif',
                  }}
                >
                  {t.name.split(' ')[1] ? t.name.split(' ')[1][0] : t.name[0]}
                </div>
                <h3
                  style={{
                    fontFamily: 'Poppins,sans-serif',
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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '.5rem',
                    flexWrap: 'wrap',
                  }}
                >
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
                fontFamily: 'Poppins,sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
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
              d'etudes en Tunisie. Notre mission est de faciliter la mise en relation entre
              etudiants et encadrants.
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
              etudiant et proposons les sujets les plus compatibles avec son profil.
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
                    fontFamily: 'Poppins,sans-serif',
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

      {/* ── CONTACT ── */}
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
              fontFamily: 'Poppins,sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
              color: '#1a3a5c',
              marginBottom: '1rem',
            }}
          >
            Contactez-nous
          </h2>
          <p style={{ color: '#666', marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Une question ? Ecrivez-nous et nous vous repondrons rapidement.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
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
                  Nom
                </label>
                <input
                  placeholder="Votre nom"
                  style={{
                    width: '100%',
                    padding: '.85rem 1.1rem',
                    borderRadius: 10,
                    border: '1.5px solid #e0e0e0',
                    fontSize: '.9rem',
                    outline: 'none',
                  }}
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
                  Email
                </label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  style={{
                    width: '100%',
                    padding: '.85rem 1.1rem',
                    borderRadius: 10,
                    border: '1.5px solid #e0e0e0',
                    fontSize: '.9rem',
                    outline: 'none',
                  }}
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
                Sujet
              </label>
              <input
                placeholder="Sujet du message"
                style={{
                  width: '100%',
                  padding: '.85rem 1.1rem',
                  borderRadius: 10,
                  border: '1.5px solid #e0e0e0',
                  fontSize: '.9rem',
                  outline: 'none',
                }}
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
                Message
              </label>
              <textarea
                rows={5}
                placeholder="Votre message..."
                style={{
                  width: '100%',
                  padding: '.85rem 1.1rem',
                  borderRadius: 10,
                  border: '1.5px solid #e0e0e0',
                  fontSize: '.9rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>
            <button
              className="btn-main"
              style={{ alignSelf: 'flex-start', padding: '1rem 2.5rem' }}
            >
              Envoyer le message
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0d1f30', padding: '4rem 2.5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Top footer */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: '3rem',
              marginBottom: '3rem',
            }}
          >
            {/* Logo + desc */}
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
                    style={{
                      fontFamily: 'Poppins,sans-serif',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      color: '#fff',
                      lineHeight: 1,
                    }}
                  >
                    Project
                  </div>
                  <div
                    style={{
                      fontFamily: 'Poppins,sans-serif',
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
              {/* Reseaux sociaux */}
              <div style={{ display: 'flex', gap: '.6rem' }}>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn"
                  style={{ background: '#3B5998', color: '#fff' }}
                  title="Facebook"
                >
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>f</span>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn"
                  style={{
                    background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
                    color: '#fff',
                  }}
                  title="Instagram"
                >
                  📷
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn"
                  style={{ background: '#0077B5', color: '#fff' }}
                  title="LinkedIn"
                >
                  <span style={{ fontWeight: 700 }}>in</span>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn"
                  style={{ background: '#1DA1F2', color: '#fff' }}
                  title="Twitter / X"
                >
                  𝕏
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn"
                  style={{ background: '#FF0000', color: '#fff' }}
                  title="YouTube"
                >
                  ▶
                </a>
                <a
                  href="https://wa.me/21600000000"
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn"
                  style={{ background: '#25D366', color: '#fff' }}
                  title="WhatsApp"
                >
                  💬
                </a>
              </div>
            </div>

            {/* Liens rapides */}
            <div>
              <h4
                style={{
                  fontFamily: 'Poppins,sans-serif',
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

            {/* Pour les etudiants */}
            <div>
              <h4
                style={{
                  fontFamily: 'Poppins,sans-serif',
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

            {/* Contact */}
            <div>
              <h4
                style={{
                  fontFamily: 'Poppins,sans-serif',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '1.25rem',
                  fontSize: '1rem',
                }}
              >
                Contact
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                <div style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start' }}>
                  <span style={{ color: '#F39C12', flexShrink: 0 }}>📍</span>
                  <span
                    style={{ color: 'rgba(255,255,255,.6)', fontSize: '.85rem', lineHeight: 1.5 }}
                  >
                    Tunis, Tunisie
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
                  <span style={{ color: '#F39C12', flexShrink: 0 }}>📞</span>
                  <span style={{ color: 'rgba(255,255,255,.6)', fontSize: '.85rem' }}>
                    +216 71 000 000
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
                  <span style={{ color: '#F39C12', flexShrink: 0 }}>📧</span>
                  <span style={{ color: 'rgba(255,255,255,.6)', fontSize: '.85rem' }}>
                    contact@projectfinder.tn
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
                  <span style={{ color: '#F39C12', flexShrink: 0 }}>🌐</span>
                  <span style={{ color: 'rgba(255,255,255,.6)', fontSize: '.85rem' }}>
                    www.projectfinder.tn
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
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
              2026 Project Finder —  Tunisie
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {['Politique de confidentialite', "Conditions d'utilisation", 'Cookies'].map(
                (link) => (
                  <a
                    key={link}
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
                    {link}
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
