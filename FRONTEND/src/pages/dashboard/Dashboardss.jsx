import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import DashboardEtudiant from './DashboardEtudiant';
import DashboardEncadrant from './DashboardEncadrant';
import DashboardAdmin from './DashboardAdmin';
import SujetsPage from './SujetsPage';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [statutPFE, setStatutPFE] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'ETUDIANT') {
      fetchStatutEtudiant();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStatutEtudiant = async () => {
    try {
      const { data } = await API.get('/etudiants/mon-profil');
      setStatutPFE(data?.statutPFE);
    } catch {
      setStatutPFE('NON_AFFECTE');
    } finally {
      setLoading(false);
    }
  };

  // Chargement
  if (loading)
    return (
      <div
        style={{
          background: '#07101F',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: '#6366F1', fontFamily: 'DM Sans, sans-serif', fontSize: '1rem' }}>
          Chargement...
        </p>
      </div>
    );

  // ENCADRANT → dashboard encadrant
  if (user?.role === 'ENCADRANT') return <DashboardEncadrant />;

  // ADMIN → dashboard admin
  if (user?.role === 'ADMINISTRATEUR') return <DashboardAdmin />;

  // ETUDIANT
  if (user?.role === 'ETUDIANT') {
    // ✅ Validé → dashboard complet
    if (statutPFE === 'EN_COURS' || statutPFE === 'TERMINE') {
      return <DashboardEtudiant />;
    }

    // ❌ Pas encore validé → page sujets seulement
    return (
      <div style={{ background: '#07101F', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>

        {/* ── NAVBAR ── */}
        <nav
          style={{
            borderBottom: '1px solid rgba(255,255,255,.06)',
            padding: '1rem 2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: 'linear-gradient(135deg,#4338CA,#7C3AED)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                  fontFamily: 'Syne, sans-serif',
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
                  fontFamily: 'Syne, sans-serif',
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

          {/* Droite navbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ color: '#64748B', fontSize: '.9rem' }}>
              👋 Bonjour,{' '}
              <strong style={{ color: '#F1F5F9' }}>
                {user?.prenom} {user?.nom}
              </strong>
            </span>
            <button
              onClick={() => navigate('/profil')}
              style={{
                background: 'rgba(99,102,241,.12)',
                color: '#818CF8',
                border: '1px solid rgba(99,102,241,.25)',
                padding: '.5rem 1.1rem',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: '.85rem',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              👤 Mon profil
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/accueil');
              }}
              style={{
                background: 'rgba(239,68,68,.1)',
                color: '#FCA5A5',
                border: '1px solid rgba(239,68,68,.25)',
                padding: '.5rem 1.1rem',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: '.85rem',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Déconnexion
            </button>
          </div>
        </nav>

        {/* ── CONTENU ── */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem' }}>
          {/* Bannière statut */}
          {statutPFE === 'EN_ATTENTE_VALIDATION' ? (
            <div
              style={{
                background: 'rgba(245,158,11,.08)',
                border: '1px solid rgba(245,158,11,.25)',
                borderRadius: 16,
                padding: '1.25rem 1.5rem',
                marginBottom: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <span style={{ fontSize: '1.8rem' }}>⏳</span>
              <div>
                <p style={{ color: '#FCD34D', fontWeight: 600, fontSize: '.95rem' }}>
                  Candidature en cours d'évaluation
                </p>
                <p style={{ color: '#92400E', fontSize: '.85rem', marginTop: '.2rem' }}>
                  Votre CV est en cours d'analyse. Vous recevrez un email pour la prochaine étape
                  (quiz ou interview).
                </p>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(99,102,241,.08)',
                border: '1px solid rgba(99,102,241,.2)',
                borderRadius: 16,
                padding: '1.25rem 1.5rem',
                marginBottom: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <span style={{ fontSize: '1.8rem' }}>🎓</span>
              <div>
                <p style={{ color: '#818CF8', fontWeight: 600, fontSize: '.95rem' }}>
                  Bienvenue sur Project Finder !
                </p>
                <p style={{ color: '#64748B', fontSize: '.85rem', marginTop: '.2rem' }}>
                  Parcourez les sujets PFE disponibles et postulez à ceux qui vous intéressent.
                  Notre IA analysera votre profil automatiquement.
                </p>
              </div>
            </div>
          )}

          {/* Liste des sujets */}
          <SujetsPage />
        </div>
      </div>
    );
  }

  return null;
}

export default Dashboard;
