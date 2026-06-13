import { useNavigate } from 'react-router-dom';
import AccompagnementPFE from './AccompagnementPFE';

const G = {
  grad: 'linear-gradient(135deg,#155f42,#1e8a5e,#34a872)',
  accent: '#1e8a5e',
  accentLight: '#d4f0e2',
  border: '#c8e6d0',
  bg: '#f0faf4',
};

export default function GuidePFEPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: G.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Header sticky */}
      <div style={{
        background: G.grad,
        padding: '.9rem 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(21,95,66,.3)',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,255,255,.15)',
            border: '1px solid rgba(255,255,255,.28)',
            color: '#fff',
            padding: '.48rem .95rem',
            borderRadius: 9,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: '.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'background .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Retour
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>Guide PFE</p>
            <p style={{ color: 'rgba(255,255,255,.65)', fontSize: '.68rem', marginTop: 2 }}>Ressources pour réussir votre projet</p>
          </div>
        </div>
      </div>

      {/* Contenu AccompagnementPFE en pleine page */}
      <AccompagnementPFE />
    </div>
  );
}
