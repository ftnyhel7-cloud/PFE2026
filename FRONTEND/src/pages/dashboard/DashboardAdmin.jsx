// ═══════════════════════════════════════════════════════════
//  DashboardAdmin.jsx — v3
//  • Icônes SVG (style encadrant)
//  • Sidebar responsive (collapsible + mobile)
//  • Support → Messagerie Contact
//  • Publications ciblées (étudiant/encadrant/tous)
//  • Sujets : boutons statut (EN_COURS / VALIDE / REFUSE)
//  • Suppression titres redondants par page
//  • Thème clair / sombre
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

// ══════════════════════════════════════════════════════════
//  SVG ICONS — identiques au dashboard encadrant
// ══════════════════════════════════════════════════════════
const Icon = {
  grid: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  users: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  doc: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  check: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  msg: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  bell: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  link: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  newspaper: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <line x1="11" y1="8" x2="17" y2="8" />
      <line x1="11" y1="12" x2="17" y2="12" />
      <line x1="11" y1="16" x2="15" y2="16" />
    </svg>
  ),
  star: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  bar: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  trend: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  settings: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M21 12h-2M5 12H3M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 19v2M12 3V1" />
    </svg>
  ),
  logout: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  search: (c = 'currentColor') => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  plus: (c = 'currentColor') => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  edit: (c = 'currentColor') => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  trash: (c = 'currentColor') => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  ),
  send: (c = 'currentColor') => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  archive: (c = 'currentColor') => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  ),
  chevL: (c = 'currentColor') => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  chevR: (c = 'currentColor') => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  menu: (c = 'currentColor') => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  moon: (c = 'currentColor') => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  sun: (c = 'currentColor') => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  refresh: (c = 'currentColor') => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  target: (c = 'currentColor') => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  eye: (c = 'currentColor') => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  checkSm: (c = 'currentColor') => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="3"
      strokeLinecap="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  x: (c = 'currentColor') => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  clock: (c = 'currentColor') => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  user: (c = 'currentColor') => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

// ══════════════════════════════════════════════════════════
//  NAV
// ══════════════════════════════════════════════════════════
const NAV_SECTIONS = [
  {
    label: 'Navigation',
    items: [
      { id: 'accueil', icon: Icon.grid, label: 'Accueil' },
      { id: 'utilisateurs', icon: Icon.users, label: 'Utilisateurs' },
      { id: 'referentiels', icon: Icon.doc, label: 'Référentiels' },
      { id: 'sujets', icon: Icon.check, label: 'Sujets PFE' },
      { id: 'affectations', icon: Icon.link, label: 'Affectations' },
    ],
  },
  {
    label: 'Contenu',
    items: [
      { id: 'publications', icon: Icon.newspaper, label: 'Publications' },
      { id: 'feedbacks', icon: Icon.star, label: 'Feedbacks' },
      { id: 'messagerie', icon: Icon.msg, label: 'Messagerie Contact' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { id: 'monitoring', icon: Icon.bar, label: 'Monitoring' },
      { id: 'statistiques', icon: Icon.trend, label: 'Statistiques' },
    ],
  },
];

// ══════════════════════════════════════════════════════════
//  THEMES
// ══════════════════════════════════════════════════════════
function getTheme(dark) {
  return dark
    ? {
        sidebar: '#0f172a',
        sidebarBorder: 'rgba(255,255,255,.07)',
        sidebarText: 'rgba(255,255,255,.5)',
        sidebarHover: 'rgba(255,255,255,.06)',
        sidebarActive: 'rgba(34,211,238,.12)',
        sidebarAccent: '#22d3ee',
        accent: '#22d3ee',
        accentDark: '#0891b2',
        accentLight: 'rgba(34,211,238,.13)',
        accentGrad: 'linear-gradient(135deg,#0891b2,#22d3ee)',
        text: '#f1f5f9',
        textSoft: '#94a3b8',
        textMuted: '#64748b',
        bg: '#020617',
        card: '#0f172a',
        cardBorder: '#1e293b',
        border: '#1e293b',
        topbar: '#0f172a',
        inputBg: '#1e293b',
        hoverBg: 'rgba(34,211,238,.06)',
        rowBg: '#1e293b',
        altRow: '#1e293b',
        success: '#34d399',
        successLight: 'rgba(52,211,153,.13)',
        warning: '#fbbf24',
        warningLight: 'rgba(251,191,36,.13)',
        danger: '#f87171',
        dangerLight: 'rgba(248,113,113,.13)',
        purple: '#a78bfa',
        purpleLight: 'rgba(167,139,250,.13)',
        info: '#38bdf8',
        infoLight: 'rgba(56,189,248,.13)',
        shadow: '0 4px 24px rgba(0,0,0,.4)',
      }
    : {
        sidebar: '#1a3d2b',
        sidebarBorder: 'rgba(255,255,255,.07)',
        sidebarText: 'rgba(255,255,255,.55)',
        sidebarHover: 'rgba(255,255,255,.07)',
        sidebarActive: 'rgba(255,255,255,.13)',
        sidebarAccent: '#4caf82',
        accent: '#0891b2',
        accentDark: '#0e7490',
        accentLight: '#e0f7fa',
        accentGrad: 'linear-gradient(135deg,#0891b2,#06b6d4)',
        text: '#0f172a',
        textSoft: '#475569',
        textMuted: '#94a3b8',
        bg: '#f0f9ff',
        card: '#ffffff',
        cardBorder: '#e2e8f0',
        border: '#e2e8f0',
        topbar: '#ffffff',
        inputBg: '#f8fafc',
        hoverBg: '#e0f7fa',
        rowBg: '#f8fafc',
        altRow: '#f8fafc',
        success: '#059669',
        successLight: '#ecfdf5',
        warning: '#d97706',
        warningLight: '#fffbeb',
        danger: '#dc2626',
        dangerLight: '#fef2f2',
        purple: '#7c3aed',
        purpleLight: '#ede9fe',
        info: '#0284c7',
        infoLight: '#e0f2fe',
        shadow: '0 2px 12px rgba(8,145,178,.08)',
      };
}

// ══════════════════════════════════════════════════════════
//  CSS
// ══════════════════════════════════════════════════════════
function buildCSS(P, dark) {
  return `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.adm-root{display:flex;min-height:100vh;font-family:'Nunito',sans-serif;background:${P.bg};color:${P.text};transition:background .3s,color .3s;}

/* ─ Sidebar ─ */
.adm-sb{min-height:100vh;background:${P.sidebar};border-right:1px solid ${P.sidebarBorder};display:flex;flex-direction:column;flex-shrink:0;transition:width .22s ease;position:sticky;top:0;height:100vh;overflow-y:auto;overflow-x:hidden;}
.adm-logo{display:flex;align-items:center;gap:.6rem;padding:1.1rem .9rem;border-bottom:1px solid ${P.sidebarBorder};white-space:nowrap;overflow:hidden;}
.adm-logo-icon{width:36px;height:36px;border-radius:10px;background:${P.accentGrad};display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 12px rgba(8,145,178,.35);}
.adm-logo-text{font-weight:800;font-size:.88rem;color:#fff;line-height:1.1;}
.adm-logo-sub{font-size:.52rem;color:rgba(255,255,255,.4);font-weight:700;letter-spacing:.15em;text-transform:uppercase;}
.adm-nav{padding:.6rem .5rem;flex:1;overflow-y:auto;overflow-x:hidden;}
.adm-nl{color:rgba(255,255,255,.3);font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;padding:.6rem .5rem .3rem;white-space:nowrap;overflow:hidden;}
.adm-sep{height:1px;background:${P.sidebarBorder};margin:.4rem .5rem;}
.ni{display:flex;align-items:center;gap:.7rem;padding:.65rem .85rem .65rem 1rem;border-radius:9px;cursor:pointer;border:none;background:transparent;width:100%;text-align:left;font-family:'Nunito',sans-serif;font-size:.82rem;font-weight:500;color:${P.sidebarText};border-left:3px solid transparent;transition:background .14s,color .14s;margin-bottom:.1rem;white-space:nowrap;overflow:hidden;}
.ni:hover{background:${P.sidebarHover};color:#fff;}
.ni.on{background:${P.sidebarActive};color:#fff;font-weight:700;border-left:3px solid ${P.sidebarAccent};}
.ni svg{flex-shrink:0;opacity:.6;}
.ni.on svg,.ni:hover svg{opacity:1;}
.adm-nb{margin-left:auto;background:${P.danger};color:#fff;border-radius:999px;font-size:.58rem;font-weight:800;padding:.1rem .42rem;min-width:18px;text-align:center;flex-shrink:0;}
.adm-upill{margin:.3rem .6rem .8rem;background:rgba(255,255,255,.08);border-radius:12px;padding:.85rem .75rem;display:flex;align-items:center;gap:.65rem;white-space:nowrap;overflow:hidden;}
.adm-av{width:32px;height:32px;border-radius:50%;background:${P.accentGrad};display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:.72rem;flex-shrink:0;box-shadow:0 2px 8px rgba(8,145,178,.4);}
.adm-lout{display:flex;align-items:center;gap:.7rem;padding:.65rem 1rem;width:100%;border:none;background:transparent;font-family:'Nunito',sans-serif;font-size:.82rem;font-weight:700;color:${P.danger};cursor:pointer;transition:background .14s;border-top:1px solid ${P.sidebarBorder};white-space:nowrap;overflow:hidden;}
.adm-lout:hover{background:rgba(220,38,38,.08);}

/* ─ Topbar ─ */
.adm-topbar{background:${P.topbar};border-bottom:1px solid ${P.border};padding:.8rem 1.5rem;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10;box-shadow:${P.shadow};transition:background .3s;gap:.75rem;}
.adm-tleft{display:flex;align-items:center;gap:.65rem;min-width:0;}
.adm-tright{display:flex;align-items:center;gap:.5rem;flex-shrink:0;}
.adm-bc{font-size:.7rem;color:${P.textMuted};}
.adm-bct{font-size:.95rem;font-weight:800;color:${P.text};}
.adm-srch{display:flex;align-items:center;gap:.5rem;background:${P.inputBg};border:1px solid ${P.border};border-radius:9px;padding:.4rem .8rem;transition:border-color .15s;}
.adm-srch:focus-within{border-color:${P.accent};}
.adm-srch input{background:transparent;border:none;outline:none;font-family:'Nunito',sans-serif;font-size:.79rem;color:${P.text};width:120px;}
.adm-srch input::placeholder{color:${P.textMuted};}
.tbtn{background:transparent;border:1px solid ${P.border};border-radius:9px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:${P.textSoft};transition:all .14s;flex-shrink:0;}
.tbtn:hover{background:${P.hoverBg};border-color:${P.accent};color:${P.accent};}

/* ─ Main ─ */
.adm-main{flex:1;overflow:auto;display:flex;flex-direction:column;}
.adm-content{padding:1.3rem 1.5rem;flex:1;}

/* ─ Banner ─ */
.adm-banner{background:${P.accentGrad};border-radius:14px;padding:1.6rem 1.75rem;margin-bottom:1.3rem;display:flex;justify-content:space-between;align-items:center;overflow:hidden;position:relative;box-shadow:0 8px 28px rgba(8,145,178,.28);}
.adm-banner::before{content:'';position:absolute;top:-35px;right:150px;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,.07);pointer-events:none;}

/* ─ Stats grid ─ */
.adm-stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:.85rem;margin-bottom:1.3rem;}
.adm-stat{background:${P.card};border-radius:12px;padding:1.05rem;box-shadow:${P.shadow};border:1px solid ${P.cardBorder};display:flex;align-items:center;gap:.8rem;transition:transform .18s,box-shadow .18s;cursor:default;}
.adm-stat:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(8,145,178,.13);}
.adm-si{width:44px;height:44px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}

/* ─ Card ─ */
.card{background:${P.card};border-radius:12px;padding:1.1rem;box-shadow:${P.shadow};border:1px solid ${P.cardBorder};margin-bottom:.95rem;transition:background .3s,border-color .3s;}
.card-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:.85rem;padding-bottom:.7rem;border-bottom:1px solid ${P.cardBorder};}
.ct{font-size:.83rem;font-weight:700;color:${P.text};display:flex;align-items:center;gap:6px;}

/* ─ Table ─ */
.adm-tw{background:${P.card};border-radius:12px;border:1px solid ${P.cardBorder};box-shadow:${P.shadow};overflow:hidden;margin-bottom:.85rem;}
.adm-tbl{width:100%;border-collapse:collapse;}
.adm-tbl thead tr{background:${dark ? '#1e293b' : '#f8fafc'};}
.adm-tbl th{text-align:left;padding:.72rem 1rem;font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:${P.textMuted};border-bottom:1px solid ${P.cardBorder};}
.adm-tbl td{padding:.72rem 1rem;font-size:.8rem;color:${P.text};border-bottom:1px solid ${dark ? '#1e293b' : '#f1f5f9'};}
.adm-tbl tbody tr:last-child td{border-bottom:none;}
.adm-tbl tbody tr:hover{background:${P.hoverBg};}

/* ─ Badge ─ */
.bdg{display:inline-flex;align-items:center;gap:3px;padding:.18rem .6rem;border-radius:999px;font-size:.66rem;font-weight:700;white-space:nowrap;}

/* ─ Row item ─ */
.t-row{display:flex;align-items:flex-start;gap:.75rem;padding:.8rem .85rem;background:${P.rowBg};border-radius:9px;margin-bottom:.38rem;border:1px solid ${P.cardBorder};transition:all .14s;}
.t-row:hover{background:${P.hoverBg};border-color:${P.accent};}

/* ─ Quick cards ─ */
.qcard{background:${P.card};border:1px solid ${P.cardBorder};border-radius:12px;padding:1.1rem;box-shadow:${P.shadow};cursor:pointer;transition:all .2s;text-align:left;}
.qcard:hover{border-color:${P.accent};background:${P.accentLight};transform:translateY(-2px);}

/* ─ Input ─ */
.adm-input{padding:.58rem .85rem;border:1px solid ${P.border};border-radius:8px;background:${P.inputBg};font-family:'Nunito',sans-serif;font-size:.8rem;color:${P.text};outline:none;transition:border-color .14s;}
.adm-input:focus{border-color:${P.accent};}
.adm-input::placeholder{color:${P.textMuted};}

/* ─ Buttons ─ */
.btn-accent{background:${P.accentGrad};color:#fff;border:none;padding:.52rem 1.05rem;border-radius:8px;font-family:'Nunito',sans-serif;font-size:.79rem;font-weight:700;cursor:pointer;transition:opacity .14s,transform .14s;display:inline-flex;align-items:center;gap:.4rem;box-shadow:0 4px 12px rgba(8,145,178,.28);}
.btn-accent:hover{opacity:.9;transform:translateY(-1px);}
.btn-ghost{background:transparent;border:1px solid ${P.border};color:${P.textSoft};padding:.45rem .85rem;border-radius:7px;font-family:'Nunito',sans-serif;font-size:.76rem;font-weight:500;cursor:pointer;transition:all .14s;display:inline-flex;align-items:center;gap:.4rem;}
.btn-ghost:hover{background:${P.hoverBg};border-color:${P.accent};color:${P.accent};}
.ibtn{background:transparent;border:1px solid ${P.border};border-radius:6px;padding:.3rem .42rem;cursor:pointer;transition:all .14s;display:inline-flex;align-items:center;justify-content:center;}
.ibtn:hover{background:${P.hoverBg};border-color:${P.accent};}

/* ─ Modal ─ */
.adm-ov{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(4px);}
.adm-modal{width:490px;background:${P.card};border-radius:16px;padding:1.7rem;box-shadow:0 24px 64px rgba(0,0,0,.22);border:1px solid ${P.cardBorder};animation:slideUp .2s ease;}
@keyframes slideUp{from{transform:translateY(16px);opacity:0;}to{transform:translateY(0);opacity:1;}}
.adm-mt{font-weight:800;font-size:.97rem;color:${P.text};margin-bottom:1.15rem;display:flex;align-items:center;justify-content:space-between;}
.fl{font-size:.71rem;font-weight:700;color:${P.textSoft};margin-bottom:.3rem;}

/* ─ Pagination ─ */
.adm-pg{display:flex;align-items:center;justify-content:center;gap:.65rem;margin-top:.7rem;}
.pgb{background:${P.card};border:1px solid ${P.border};border-radius:8px;padding:.36rem .72rem;cursor:pointer;font-size:.77rem;color:${P.textSoft};transition:all .14s;font-family:'Nunito',sans-serif;}
.pgb:hover:not(:disabled){background:${P.hoverBg};color:${P.accent};border-color:${P.accent};}
.pgb:disabled{opacity:.35;cursor:default;}

/* ─ Progress ─ */
.pb{height:7px;background:${dark ? '#1e293b' : '#f1f5f9'};border-radius:100px;overflow:hidden;}
.pf{height:100%;border-radius:100px;transition:width .5s;}

/* ─ filter row ─ */
.fr{display:flex;flex-wrap:wrap;gap:.58rem;margin-bottom:.85rem;align-items:center;}

/* ─ Stars ─ */
.stars{display:flex;gap:2px;}
.star{font-size:1rem;cursor:pointer;transition:transform .1s;line-height:1;}
.star:hover{transform:scale(1.25);}

/* ─ Sujet status buttons ─ */
.sst{padding:.28rem .62rem;border-radius:6px;font-family:'Nunito',sans-serif;font-size:.7rem;font-weight:700;cursor:pointer;transition:all .14s;display:inline-flex;align-items:center;gap:.3rem;}

/* ─ Audience pill ─ */
.apill{display:inline-flex;align-items:center;gap:4px;padding:.2rem .65rem;border-radius:999px;font-size:.66rem;font-weight:700;}

/* ─ Mobile ─ */
@media(max-width:700px){
  .adm-sb{position:fixed;z-index:50;height:100vh;left:0;top:0;}
  .sb-ov{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:49;backdrop-filter:blur(2px);}
  #ham{display:flex!important;}
  .adm-srch{display:none;}
}
@media(min-width:701px){
  .sb-ov{display:none;}
  #ham{display:none!important;}
}

/* ─ Anim ─ */
.anim{animation:fadeIn .2s ease;}
@keyframes fadeIn{from{opacity:0;transform:translateY(5px);}to{opacity:1;transform:none;}}
`;
}

// ══════════════════════════════════════════════════════════
//  MOCK DATA
// ══════════════════════════════════════════════════════════
const MOCK_PUBS = [
  {
    _id: 'p1',
    titre: 'Ouverture des inscriptions PFE 2026',
    contenu:
      "Les inscriptions pour les projets de fin d'études sont désormais ouvertes. Consultez la liste des sujets disponibles dans votre espace.",
    auteur: 'Admin',
    date: '2026-04-10',
    statut: 'PUBLIE',
    vues: 142,
    type: 'ANNONCE',
    audience: 'TOUS',
  },
  {
    _id: 'p2',
    titre: 'Guide de rédaction du rapport final',
    contenu:
      'Un guide actualisé pour la rédaction du rapport final de PFE est disponible en téléchargement dans la section ressources.',
    auteur: 'Admin',
    date: '2026-04-05',
    statut: 'PUBLIE',
    vues: 98,
    type: 'RESSOURCE',
    audience: 'ETUDIANT',
  },
  {
    _id: 'p3',
    titre: 'Calendrier des soutenances Mai 2026',
    contenu:
      "Le calendrier prévisionnel des soutenances a été mis en ligne. Consultez votre convocation dans l'espace dédié.",
    auteur: 'Admin',
    date: '2026-04-01',
    statut: 'BROUILLON',
    vues: 0,
    type: 'CALENDRIER',
    audience: 'ENCADRANT',
  },
];
const MOCK_FBS = [
  {
    _id: 'f1',
    auteur: 'Sarra Ben Ali',
    role: 'ETUDIANT',
    note: 5,
    commentaire: 'La plateforme est très intuitive, le système de matching est excellent !',
    date: '2026-04-15',
    statut: 'APPROUVE',
  },
  {
    _id: 'f2',
    auteur: 'Dr. Kamel Ayari',
    role: 'ENCADRANT',
    note: 4,
    commentaire: "Bonne initiative, j'aimerais plus de filtres dans la gestion des étudiants.",
    date: '2026-04-12',
    statut: 'APPROUVE',
  },
  {
    _id: 'f3',
    auteur: 'Mohamed Trabelsi',
    role: 'ETUDIANT',
    note: 3,
    commentaire: 'Le module de scoring IA pourrait être plus transparent dans ses critères.',
    date: '2026-04-10',
    statut: 'EN_ATTENTE',
  },
  {
    _id: 'f4',
    auteur: 'Leila Hammami',
    role: 'ETUDIANT',
    note: 5,
    commentaire: "Tout fonctionne parfaitement. L'interface est claire et agréable.",
    date: '2026-04-08',
    statut: 'APPROUVE',
  },
  {
    _id: 'f5',
    auteur: 'Dr. Faten Rejeb',
    role: 'ENCADRANT',
    note: 2,
    commentaire: "Il manque une notification email lors de l'affectation d'un nouvel étudiant.",
    date: '2026-04-05',
    statut: 'EN_ATTENTE',
  },
];

// ══════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════
function Bdg({ children, color, bg }) {
  return (
    <span className="bdg" style={{ color, background: bg }}>
      {children}
    </span>
  );
}
function Stars({ value, onChange }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className="star"
          onClick={() => onChange?.(s)}
          style={{ color: s <= value ? '#fbbf24' : '#d1d5db' }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
function StatCard({ icon, value, label, color, bg, sub, subColor, P }) {
  return (
    <div className="adm-stat">
      <div className="adm-si" style={{ background: bg }}>
        {icon(color)}
      </div>
      <div>
        <p style={{ fontWeight: 800, fontSize: '1.4rem', color, lineHeight: 1 }}>{value}</p>
        <p style={{ color: P.text, fontWeight: 600, fontSize: '.73rem', marginTop: '.14rem' }}>
          {label}
        </p>
        {sub && (
          <p
            style={{
              color: subColor || P.textMuted,
              fontSize: '.63rem',
              fontWeight: 700,
              marginTop: '.07rem',
            }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
function Pag({ page, setPage, total, limit, P }) {
  const tp = Math.ceil(total / limit);
  if (tp <= 1) return null;
  return (
    <div className="adm-pg">
      <button className="pgb" disabled={page <= 1} onClick={() => setPage(page - 1)}>
        ‹ Préc.
      </button>
      <span style={{ color: P.textSoft, fontSize: '.78rem', fontWeight: 600 }}>
        {page}/{tp}
      </span>
      <button className="pgb" disabled={page >= tp} onClick={() => setPage(page + 1)}>
        Suiv. ›
      </button>
    </div>
  );
}
function AudPill({ audience, P }) {
  const map = {
    TOUS: { label: 'Tous', color: P.accent, bg: P.accentLight },
    ETUDIANT: { label: 'Étudiants', color: P.success, bg: P.successLight },
    ENCADRANT: { label: 'Encadrants', color: P.purple, bg: P.purpleLight },
  };
  const c = map[audience] || { label: audience, color: P.textMuted, bg: P.cardBorder };
  return (
    <span className="apill" style={{ color: c.color, background: c.bg }}>
      {Icon.target(c.color)} {c.label}
    </span>
  );
}
function sujetCfg(statut, P) {
  return (
    {
      VALIDE: { label: 'Validé', color: P.success, bg: P.successLight },
      EN_COURS: { label: 'En cours', color: P.warning, bg: P.warningLight },
      REFUSE: { label: 'Refusé', color: P.danger, bg: P.dangerLight },
      EN_ATTENTE: { label: 'En attente', color: P.textMuted, bg: P.cardBorder },
    }[statut] || { label: statut, color: P.textMuted, bg: P.cardBorder }
  );
}

// ══════════════════════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════════════════════
export default function DashboardAdmin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('accueil');
  const [dark, setDark] = useState(false);
  const [col, setCol] = useState(false);
  const [sbOpen, setSbOpen] = useState(false);
  const P = getTheme(dark);

  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [uF, setUF] = useState({ role: '', isValidated: '', search: '' });

  const [refs, setRefs] = useState([]);
  const [refsTotal, setRefsTotal] = useState(0);
  const [refsPage, setRefsPage] = useState(1);
  const [rF, setRF] = useState({ type: '', search: '' });
  const [showAddRef, setShowAddRef] = useState(false);
  const [newRef, setNewRef] = useState({ type: 'ETUDIANT', code: '', label: '' });

  const [sujetsAll, setSujetsAll] = useState([]);
  const [sjF, setSjF] = useState('');

  const [affectations, setAffects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [lgF, setLgF] = useState({ action: '' });

  const [messages, setMessages] = useState([]);
  const [msgTotal, setMsgTotal] = useState(0);
  const [msgPage, setMsgPage] = useState(1);
  const [showReply, setShowReply] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [showNotif, setShowNotif] = useState(false);
  const [notifF, setNotifF] = useState({
    titre: '',
    contenu: '',
    type: 'SYSTEME',
    rolesCibles: [],
  });

  const [pubs, setPubs] = useState(MOCK_PUBS);
  const [showPub, setShowPub] = useState(false);
  const [editPub, setEditPub] = useState(null);
  const [pubF, setPubF] = useState({
    titre: '',
    contenu: '',
    type: 'ANNONCE',
    statut: 'BROUILLON',
    audience: 'TOUS',
  });

  const [fbs, setFbs] = useState(MOCK_FBS);
  const [fbF, setFbF] = useState('');
  const [showFb, setShowFb] = useState(false);
  const [fbForm, setFbForm] = useState({ auteur: '', role: 'ETUDIANT', note: 5, commentaire: '' });

  const [loading, setLoading] = useState(true);
  const [srch, setSrch] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);
  useEffect(() => {
    if (activePage === 'utilisateurs') fetchUsers();
    if (activePage === 'referentiels') fetchRefs();
    if (activePage === 'sujets') fetchSujets();
    if (activePage === 'affectations') fetchAffects();
    if (activePage === 'monitoring') fetchLogs();
    if (activePage === 'messagerie') fetchMessages();
  }, [activePage, usersPage, uF, refsPage, rF, logsPage, lgF, msgPage]);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/admin/stats');
      setStats(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  const fetchUsers = async () => {
    try {
      const p = { page: usersPage, limit: 15, ...uF };
      Object.keys(p).forEach((k) => !p[k] && delete p[k]);
      const { data } = await API.get('/admin/users', { params: p });
      setUsers(data.users || []);
      setUsersTotal(data.total || 0);
    } catch {}
  };
  const fetchRefs = async () => {
    try {
      const p = { page: refsPage, limit: 20, ...rF };
      Object.keys(p).forEach((k) => !p[k] && delete p[k]);
      const { data } = await API.get('/referentiels', { params: p });
      setRefs(data.referentiels || []);
      setRefsTotal(data.total || 0);
    } catch {}
  };
  const fetchSujets = async () => {
    try {
      const [a, b] = await Promise.all([API.get('/sujets/non-valides'), API.get('/sujets')]);
      const nv = (a.data || []).map((s) => ({ ...s, statut: s.statut || 'EN_ATTENTE' }));
      const vv = (b.data || []).map((s) => ({ ...s, statut: s.statut || 'VALIDE' }));
      const ids = new Set(nv.map((s) => s._id));
      setSujetsAll([...nv, ...vv.filter((s) => !ids.has(s._id))]);
    } catch {}
  };
  const fetchAffects = async () => {
    try {
      const { data } = await API.get('/admin/affectations');
      setAffects(data || []);
    } catch {}
  };
  const fetchLogs = async () => {
    try {
      const p = { page: logsPage, limit: 25, ...lgF };
      Object.keys(p).forEach((k) => !p[k] && delete p[k]);
      const { data } = await API.get('/admin/logs', { params: p });
      setLogs(data.logs || []);
      setLogsTotal(data.total || 0);
    } catch {}
  };
  const fetchMessages = async () => {
    try {
      const { data } = await API.get('/admin/messages', { params: { page: msgPage, limit: 15 } });
      setMessages(data.messages || []);
      setMsgTotal(data.total || 0);
    } catch {}
  };

  const handleValidateUser = async (id) => {
    try {
      await API.put(`/admin/users/${id}/validate`);
      fetchUsers();
      fetchStats();
    } catch {}
  };
  const handleDeleteUser = async (id) => {
    if (!confirm('Supprimer ?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      fetchUsers();
      fetchStats();
    } catch {}
  };

  const handleSujetStatus = async (id, statut) => {
    try {
      if (statut === 'VALIDE') await API.put(`/sujets/${id}/valider`);
      else if (statut === 'REFUSE') await API.delete(`/sujets/${id}`);
      else await API.put(`/sujets/${id}`, { statut });
      setSujetsAll((prev) => prev.map((s) => (s._id === id ? { ...s, statut } : s)));
      fetchStats();
    } catch {
      setSujetsAll((prev) => prev.map((s) => (s._id === id ? { ...s, statut } : s)));
    }
  };

  const handleAddRef = async (e) => {
    e.preventDefault();
    try {
      await API.post('/referentiels', newRef);
      setShowAddRef(false);
      setNewRef({ type: 'ETUDIANT', code: '', label: '' });
      fetchRefs();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };
  const handleDeleteRef = async (id) => {
    try {
      await API.delete(`/referentiels/${id}`);
      fetchRefs();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };
  const handleEditRef = async (ref) => {
    const nc = prompt('Nouveau code', ref.code);
    if (!nc) return;
    const nl = prompt('Nouveau label', ref.label || '') ?? '';
    try {
      await API.put(`/referentiels/${ref._id}`, { type: ref.type, code: nc, label: nl });
      fetchRefs();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const handleReplyMsg = async (id) => {
    try {
      await API.post(`/admin/messages/${id}/reply`, { reponse: replyText });
      setShowReply(null);
      setReplyText('');
      fetchMessages();
    } catch {}
  };
  const handleArchiveMsg = async (id) => {
    try {
      await API.put(`/admin/messages/${id}/archive`);
      fetchMessages();
    } catch {}
  };

  const handleSendNotif = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/notifications', notifF);
      setShowNotif(false);
      setNotifF({ titre: '', contenu: '', type: 'SYSTEME', rolesCibles: [] });
      alert('Notification envoyée !');
    } catch {}
  };

  const handleSavePub = (e) => {
    e.preventDefault();
    if (editPub) {
      setPubs(
        pubs.map((p) =>
          p._id === editPub._id ? { ...p, ...pubF, date: new Date().toISOString().slice(0, 10) } : p
        )
      );
    } else {
      setPubs([
        {
          _id: Date.now().toString(),
          ...pubF,
          auteur: 'Admin',
          date: new Date().toISOString().slice(0, 10),
          vues: 0,
        },
        ...pubs,
      ]);
    }
    setShowPub(false);
    setEditPub(null);
    setPubF({ titre: '', contenu: '', type: 'ANNONCE', statut: 'BROUILLON', audience: 'TOUS' });
  };
  const handlePublishPub = (id) =>
    setPubs(pubs.map((p) => (p._id === id ? { ...p, statut: 'PUBLIE' } : p)));
  const handleDeletePub = (id) => setPubs(pubs.filter((p) => p._id !== id));

  const filteredFbs = fbF ? fbs.filter((f) => f.statut === fbF) : fbs;
  const avgNote = fbs.length ? (fbs.reduce((s, f) => s + f.note, 0) / fbs.length).toFixed(1) : 0;
  const handleApproveFb = (id) =>
    setFbs(fbs.map((f) => (f._id === id ? { ...f, statut: 'APPROUVE' } : f)));
  const handleDeleteFb = (id) => setFbs(fbs.filter((f) => f._id !== id));
  const handleAddFb = (e) => {
    e.preventDefault();
    setFbs([
      {
        _id: Date.now().toString(),
        ...fbForm,
        date: new Date().toISOString().slice(0, 10),
        statut: 'APPROUVE',
      },
      ...fbs,
    ]);
    setShowFb(false);
    setFbForm({ auteur: '', role: 'ETUDIANT', note: 5, commentaire: '' });
  };

  const initials = `${user?.prenom?.[0] || 'A'}${user?.nom?.[0] || 'D'}`.toUpperCase();
  const allItems = NAV_SECTIONS.flatMap((s) => s.items);
  const activeItem = allItems.find((n) => n.id === activePage);

  const goTo = (id) => {
    setActivePage(id);
    setSbOpen(false);
  };

  if (loading)
    return (
      <>
        <style>{buildCSS(getTheme(false), false)}</style>
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            background: '#f0f9ff',
            fontFamily: 'Nunito,sans-serif',
          }}
        >
          <p style={{ color: '#0891b2', fontWeight: 600 }}>Chargement…</p>
        </div>
      </>
    );

  const sjFiltered = sjF ? sujetsAll.filter((s) => s.statut === sjF) : sujetsAll;

  // ── Sidebar JSX (shared)
  const SB = () => (
    <>
      <div className="adm-logo">
        <div className="adm-logo-icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3.33 2 8.67 2 12 0v-5" />
          </svg>
        </div>
        {!col && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="adm-logo-text">PFE Admin</div>
            <div className="adm-logo-sub">Console</div>
          </div>
        )}
        <button
          onClick={() => setCol(!col)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,.35)',
            cursor: 'pointer',
            padding: 2,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {col ? Icon.chevR('rgba(255,255,255,.4)') : Icon.chevL('rgba(255,255,255,.4)')}
        </button>
      </div>
      <nav className="adm-nav">
        {NAV_SECTIONS.map((sec, si) => (
          <div key={sec.label}>
            {si > 0 && <div className="adm-sep" />}
            {!col && <p className="adm-nl">{sec.label}</p>}
            {sec.items.map((item) => (
              <button
                key={item.id}
                className={`ni${activePage === item.id ? ' on' : ''}`}
                onClick={() => goTo(item.id)}
              >
                {item.icon('currentColor')}
                {!col && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flex: 1,
                    }}
                  >
                    {item.label}
                    {item.id === 'utilisateurs' && stats.usersEnAttente > 0 && (
                      <span className="adm-nb">{stats.usersEnAttente}</span>
                    )}
                    {item.id === 'sujets' && stats.sujetsEnAttente > 0 && (
                      <span className="adm-nb">{stats.sujetsEnAttente}</span>
                    )}
                    {item.id === 'messagerie' && stats.messagesNonLus > 0 && (
                      <span className="adm-nb">{stats.messagesNonLus}</span>
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
        <div className="adm-sep" />
        {!col && <p className="adm-nl">Compte</p>}
        <button
          className={`ni${activePage === 'profil' ? ' on' : ''}`}
          onClick={() => goTo('profil')}
        >
          {Icon.user('currentColor')}
          {!col && <span>Mon profil</span>}
        </button>
        <button className="ni" onClick={() => navigate('/parametres')}>
          {Icon.settings('currentColor')}
          {!col && <span>Paramètres</span>}
        </button>
      </nav>
      <div>
        {!col && (
          <div className="adm-upill">
            <div className="adm-av">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: '.75rem',
                  color: '#fff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.prenom || 'Admin'} {user?.nom || ''}
              </p>
              <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.62rem', fontWeight: 600 }}>
                Administrateur
              </p>
            </div>
          </div>
        )}
        <button
          className="adm-lout"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          {Icon.logout('currentColor')}
          {!col && <span>Déconnexion</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{buildCSS(P, dark)}</style>
      <div className="adm-root">
        {/* Desktop sidebar */}
        <aside className="adm-sb" style={{ width: col ? 58 : 230 }}>
          <SB />
        </aside>

        {/* Mobile sidebar + overlay */}
        {sbOpen && (
          <>
            <div className="sb-ov" onClick={() => setSbOpen(false)} />
            <aside
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                zIndex: 50,
                width: 230,
                height: '100vh',
                background: P.sidebar,
                borderRight: `1px solid ${P.sidebarBorder}`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <SB />
            </aside>
          </>
        )}

        {/* Main */}
        <div className="adm-main">
          {/* Topbar */}
          <div className="adm-topbar">
            <div className="adm-tleft">
              <button
                id="ham"
                className="tbtn"
                style={{ display: 'none' }}
                onClick={() => setSbOpen(true)}
              >
                {Icon.menu(P.textSoft)}
              </button>
              <div>
                <p className="adm-bc">Accueil / {activeItem?.label || 'Profil'}</p>
                <p className="adm-bct">{activeItem?.label || 'Mon Profil'}</p>
              </div>
            </div>
            <div className="adm-tright">
              <div className="adm-srch">
                {Icon.search(P.textMuted)}
                <input
                  placeholder="Rechercher…"
                  value={srch}
                  onChange={(e) => setSrch(e.target.value)}
                />
              </div>
              <button className="tbtn" title="Notifications" onClick={() => setShowNotif(true)}>
                {Icon.bell(P.textSoft)}
              </button>
              <button
                className="tbtn"
                onClick={() => setDark(!dark)}
                title={dark ? 'Mode clair' : 'Mode sombre'}
              >
                {dark ? Icon.sun(P.textSoft) : Icon.moon(P.textSoft)}
              </button>
              <button
                className="btn-accent"
                style={{ padding: '.38rem .85rem', fontSize: '.76rem' }}
                onClick={() => setActivePage('statistiques')}
              >
                {Icon.trend('#fff')}
                <span style={{ marginLeft: 3 }}>Stats</span>
              </button>
              <div className="adm-av" style={{ cursor: 'pointer' }} onClick={() => goTo('profil')}>
                {initials}
              </div>
            </div>
          </div>

          <div className="adm-content">
            {/* ── ACCUEIL ── */}
            {activePage === 'accueil' && (
              <div className="anim">
                <div className="adm-banner">
                  <div>
                    <p
                      style={{
                        color: 'rgba(255,255,255,.72)',
                        fontSize: '.79rem',
                        marginBottom: '.22rem',
                      }}
                    >
                      Bienvenue 👋
                    </p>
                    <h2
                      style={{
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '1.25rem',
                        marginBottom: '.22rem',
                        letterSpacing: '-.02em',
                      }}
                    >
                      {user?.prenom || 'Administrateur'} {user?.nom || ''}
                    </h2>
                    <p
                      style={{
                        color: 'rgba(255,255,255,.7)',
                        fontSize: '.79rem',
                        marginBottom: '.9rem',
                      }}
                    >
                      Plateforme PFE — Panneau d'administration
                    </p>
                    <div style={{ display: 'flex', gap: '.55rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => goTo('utilisateurs')}
                        style={{
                          background: 'rgba(255,255,255,.18)',
                          border: '0.5px solid rgba(255,255,255,.3)',
                          borderRadius: 999,
                          padding: '5px 13px',
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          fontFamily: 'Nunito,sans-serif',
                        }}
                      >
                        {Icon.users('#fff')} Utilisateurs
                      </button>
                      <button
                        onClick={() => goTo('sujets')}
                        style={{
                          background: 'rgba(255,255,255,.1)',
                          border: '0.5px solid rgba(255,255,255,.2)',
                          borderRadius: 999,
                          padding: '5px 13px',
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          fontFamily: 'Nunito,sans-serif',
                        }}
                      >
                        {Icon.doc('#fff')} Sujets PFE
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '3rem', opacity: 0.13 }}>🛡️</div>
                </div>
                <div className="adm-stats">
                  <StatCard
                    icon={Icon.users}
                    value={stats.totalUsers || 0}
                    label="Utilisateurs"
                    color={P.accent}
                    bg={P.accentLight}
                    P={P}
                    sub={`+${stats.usersEnAttente || 0} en attente`}
                    subColor={P.warning}
                  />
                  <StatCard
                    icon={Icon.users}
                    value={stats.totalEtudiants || 0}
                    label="Étudiants"
                    color={P.success}
                    bg={P.successLight}
                    P={P}
                  />
                  <StatCard
                    icon={Icon.users}
                    value={stats.totalEncadrants || 0}
                    label="Encadrants"
                    color={P.purple}
                    bg={P.purpleLight}
                    P={P}
                  />
                  <StatCard
                    icon={Icon.doc}
                    value={stats.totalSujets || 0}
                    label="Sujets"
                    color={P.info}
                    bg={P.infoLight}
                    P={P}
                    sub={`${stats.sujetsValides || 0} validés`}
                    subColor={P.success}
                  />
                  <StatCard
                    icon={Icon.newspaper}
                    value={pubs.filter((p) => p.statut === 'PUBLIE').length}
                    label="Publications"
                    color={P.purple}
                    bg={P.purpleLight}
                    P={P}
                  />
                  <StatCard
                    icon={Icon.star}
                    value={avgNote}
                    label="Note moy."
                    color={P.warning}
                    bg={P.warningLight}
                    P={P}
                    sub={`${fbs.length} avis`}
                  />
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill,minmax(185px,1fr))',
                    gap: '.9rem',
                  }}
                >
                  {[
                    {
                      label: 'Valider utilisateurs',
                      page: 'utilisateurs',
                      icon: Icon.check,
                      desc: `${stats.usersEnAttente || 0} en attente`,
                    },
                    {
                      label: 'Gérer les sujets',
                      page: 'sujets',
                      icon: Icon.doc,
                      desc: `${sujetsAll.filter((s) => s.statut === 'EN_ATTENTE').length} à traiter`,
                    },
                    {
                      label: 'Nouvelle publication',
                      page: 'publications',
                      icon: Icon.newspaper,
                      desc: 'Annonces & ressources',
                    },
                    {
                      label: 'Voir les feedbacks',
                      page: 'feedbacks',
                      icon: Icon.star,
                      desc: `Note moy. ${avgNote}/5`,
                    },
                  ].map((item, i) => (
                    <button key={i} className="qcard" onClick={() => goTo(item.page)}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 9,
                          background: P.accentLight,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '.55rem',
                        }}
                      >
                        {item.icon(P.accent)}
                      </div>
                      <p style={{ fontWeight: 700, color: P.text, fontSize: '.83rem' }}>
                        {item.label}
                      </p>
                      <p style={{ color: P.textMuted, fontSize: '.71rem', marginTop: '.14rem' }}>
                        {item.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── UTILISATEURS ── */}
            {activePage === 'utilisateurs' && (
              <div className="anim">
                <div className="fr">
                  <input
                    className="adm-input"
                    placeholder="Rechercher…"
                    value={uF.search}
                    onChange={(e) => {
                      setUF({ ...uF, search: e.target.value });
                      setUsersPage(1);
                    }}
                    style={{ minWidth: 180 }}
                  />
                  <select
                    className="adm-input"
                    value={uF.role}
                    onChange={(e) => {
                      setUF({ ...uF, role: e.target.value });
                      setUsersPage(1);
                    }}
                  >
                    <option value="">Tous les rôles</option>
                    <option value="ETUDIANT">Étudiant</option>
                    <option value="ENCADRANT">Encadrant</option>
                    <option value="ADMINISTRATEUR">Admin</option>
                  </select>
                  <select
                    className="adm-input"
                    value={uF.isValidated}
                    onChange={(e) => {
                      setUF({ ...uF, isValidated: e.target.value });
                      setUsersPage(1);
                    }}
                  >
                    <option value="">Tous statuts</option>
                    <option value="true">Validés</option>
                    <option value="false">En attente</option>
                  </select>
                </div>
                <div className="adm-tw">
                  <table className="adm-tbl">
                    <thead>
                      <tr>
                        {[
                          'Nom',
                          'Email',
                          'Rôle',
                          'Code Réf.',
                          'Statut',
                          'Inscription',
                          'Actions',
                        ].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td style={{ fontWeight: 700 }}>
                            {u.prenom} {u.nom}
                          </td>
                          <td style={{ color: P.textSoft }}>{u.email}</td>
                          <td>
                            <Bdg
                              color={
                                u.role === 'ADMINISTRATEUR'
                                  ? P.danger
                                  : u.role === 'ENCADRANT'
                                    ? P.purple
                                    : P.success
                              }
                              bg={
                                u.role === 'ADMINISTRATEUR'
                                  ? P.dangerLight
                                  : u.role === 'ENCADRANT'
                                    ? P.purpleLight
                                    : P.successLight
                              }
                            >
                              {u.role}
                            </Bdg>
                          </td>
                          <td
                            style={{
                              color: P.textMuted,
                              fontFamily: 'monospace',
                              fontSize: '.76rem',
                            }}
                          >
                            {u.codeReference || '—'}
                          </td>
                          <td>
                            <Bdg
                              color={u.isValidated ? P.success : P.warning}
                              bg={u.isValidated ? P.successLight : P.warningLight}
                            >
                              {u.isValidated ? 'Validé' : 'En attente'}
                            </Bdg>
                          </td>
                          <td style={{ color: P.textMuted, fontSize: '.73rem' }}>
                            {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '.32rem' }}>
                              {!u.isValidated && (
                                <button
                                  className="ibtn"
                                  title="Valider"
                                  onClick={() => handleValidateUser(u._id)}
                                >
                                  {Icon.checkSm(P.success)}
                                </button>
                              )}
                              {u.role !== 'ADMINISTRATEUR' && (
                                <button
                                  className="ibtn"
                                  title="Supprimer"
                                  onClick={() => handleDeleteUser(u._id)}
                                >
                                  {Icon.trash(P.danger)}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!users.length && (
                    <p
                      style={{
                        textAlign: 'center',
                        color: P.textMuted,
                        padding: '2rem',
                        fontSize: '.82rem',
                      }}
                    >
                      Aucun utilisateur
                    </p>
                  )}
                </div>
                <Pag page={usersPage} setPage={setUsersPage} total={usersTotal} limit={15} P={P} />
              </div>
            )}

            {/* ── RÉFÉRENTIELS ── */}
            {activePage === 'referentiels' && (
              <div className="anim">
                <div className="fr">
                  <input
                    className="adm-input"
                    placeholder="Rechercher…"
                    value={rF.search}
                    onChange={(e) => {
                      setRF({ ...rF, search: e.target.value });
                      setRefsPage(1);
                    }}
                    style={{ minWidth: 200 }}
                  />
                  <select
                    className="adm-input"
                    value={rF.type}
                    onChange={(e) => {
                      setRF({ ...rF, type: e.target.value });
                      setRefsPage(1);
                    }}
                  >
                    <option value="">Tous les types</option>
                    <option value="ETUDIANT">Matricules étudiants</option>
                    <option value="ENCADRANT">Codes encadrants</option>
                  </select>
                  <button
                    className="btn-accent"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => setShowAddRef(true)}
                  >
                    {Icon.plus('#fff')} Ajouter
                  </button>
                </div>
                <div className="adm-tw">
                  <table className="adm-tbl">
                    <thead>
                      <tr>
                        {['Type', 'Code', 'Label', 'Statut', 'Utilisé par', 'Actions'].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {refs.map((ref) => (
                        <tr key={ref._id}>
                          <td>
                            <Bdg
                              color={ref.type === 'ETUDIANT' ? P.success : P.purple}
                              bg={ref.type === 'ETUDIANT' ? P.successLight : P.purpleLight}
                            >
                              {ref.type === 'ETUDIANT' ? 'Étudiant' : 'Encadrant'}
                            </Bdg>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{ref.code}</td>
                          <td style={{ color: P.textSoft }}>{ref.label || '—'}</td>
                          <td>
                            <Bdg
                              color={ref.utilise ? P.success : P.textMuted}
                              bg={ref.utilise ? P.successLight : dark ? '#1e293b' : '#f1f5f9'}
                            >
                              {ref.utilise ? 'Utilisé' : 'Disponible'}
                            </Bdg>
                          </td>
                          <td style={{ color: P.textSoft }}>
                            {ref.utilisePar
                              ? `${ref.utilisePar.prenom} ${ref.utilisePar.nom}`
                              : '—'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '.32rem' }}>
                              <button className="ibtn" onClick={() => handleEditRef(ref)}>
                                {Icon.edit(P.accent)}
                              </button>
                              {!ref.utilise && (
                                <button className="ibtn" onClick={() => handleDeleteRef(ref._id)}>
                                  {Icon.trash(P.danger)}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!refs.length && (
                    <p
                      style={{
                        textAlign: 'center',
                        color: P.textMuted,
                        padding: '2rem',
                        fontSize: '.82rem',
                      }}
                    >
                      Aucun code
                    </p>
                  )}
                </div>
                <Pag page={refsPage} setPage={setRefsPage} total={refsTotal} limit={20} P={P} />
              </div>
            )}

            {/* ── SUJETS PFE ── */}
            {activePage === 'sujets' && (
              <div className="anim">
                {/* Status filter tabs */}
                <div className="fr" style={{ marginBottom: '1rem' }}>
                  {[
                    { val: '', label: 'Tous' },
                    { val: 'EN_ATTENTE', label: 'En attente' },
                    { val: 'EN_COURS', label: 'En cours' },
                    { val: 'VALIDE', label: 'Validés' },
                    { val: 'REFUSE', label: 'Refusés' },
                  ].map((f) => {
                    const act = sjF === f.val;
                    const cnt = sujetsAll.filter((s) => (f.val ? s.statut === f.val : true)).length;
                    return (
                      <button
                        key={f.val}
                        onClick={() => setSjF(f.val)}
                        style={{
                          padding: '.36rem .82rem',
                          borderRadius: 8,
                          border: `1px solid ${act ? P.accent : P.border}`,
                          background: act ? P.accentLight : 'transparent',
                          color: act ? P.accent : P.textSoft,
                          fontFamily: 'Nunito,sans-serif',
                          fontSize: '.77rem',
                          fontWeight: act ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all .14s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        {f.label}
                        {
                          <span
                            style={{
                              background: act ? P.accent : P.border,
                              color: act ? '#fff' : P.textSoft,
                              borderRadius: 999,
                              padding: '0 5px',
                              fontSize: '.63rem',
                              fontWeight: 800,
                            }}
                          >
                            {cnt}
                          </span>
                        }
                      </button>
                    );
                  })}
                </div>

                {sjFiltered.map((s) => {
                  const cfg = sujetCfg(s.statut || 'EN_ATTENTE', P);
                  return (
                    <div key={s._id} className="t-row">
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          background: cfg.color,
                          flexShrink: 0,
                          marginTop: 5,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, color: P.text, fontSize: '.84rem' }}>
                          {s.titre}
                        </p>
                        <p
                          style={{
                            color: P.textSoft,
                            fontSize: '.75rem',
                            marginTop: '.16rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {s.description}
                        </p>
                        {s.technologies?.length > 0 && (
                          <div
                            style={{
                              display: 'flex',
                              gap: '.28rem',
                              flexWrap: 'wrap',
                              marginTop: '.32rem',
                            }}
                          >
                            {s.technologies.map((t, i) => (
                              <span
                                key={i}
                                style={{
                                  background: P.accentLight,
                                  color: P.accent,
                                  padding: '.1rem .46rem',
                                  borderRadius: 999,
                                  fontSize: '.64rem',
                                  fontWeight: 700,
                                }}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '.3rem',
                          flexShrink: 0,
                          alignItems: 'flex-end',
                        }}
                      >
                        <Bdg color={cfg.color} bg={cfg.bg}>
                          {cfg.label}
                        </Bdg>
                        <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap' }}>
                          {s.statut !== 'EN_COURS' && (
                            <button
                              className="sst"
                              onClick={() => handleSujetStatus(s._id, 'EN_COURS')}
                              style={{
                                borderColor: P.warning,
                                color: P.warning,
                                background: P.warningLight,
                                border: `1px solid ${P.warning}`,
                              }}
                            >
                              {Icon.clock(P.warning)} En cours
                            </button>
                          )}
                          {s.statut !== 'VALIDE' && (
                            <button
                              className="sst"
                              onClick={() => handleSujetStatus(s._id, 'VALIDE')}
                              style={{
                                borderColor: P.success,
                                color: P.success,
                                background: P.successLight,
                                border: `1px solid ${P.success}`,
                              }}
                            >
                              {Icon.checkSm(P.success)} Valider
                            </button>
                          )}
                          {s.statut !== 'REFUSE' && (
                            <button
                              className="sst"
                              onClick={() => handleSujetStatus(s._id, 'REFUSE')}
                              style={{
                                borderColor: P.danger,
                                color: P.danger,
                                background: P.dangerLight,
                                border: `1px solid ${P.danger}`,
                              }}
                            >
                              {Icon.x(P.danger)} Refuser
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!sjFiltered.length && (
                  <div
                    className="card"
                    style={{ textAlign: 'center', padding: '3rem', color: P.textMuted }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '.65rem',
                        opacity: 0.4,
                      }}
                    >
                      {Icon.doc(P.textMuted)}
                    </div>
                    <p style={{ fontSize: '.84rem' }}>
                      Aucun sujet{sjF ? ` avec le statut "${sjF}"` : ''}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── AFFECTATIONS ── */}
            {activePage === 'affectations' && (
              <div className="anim">
                <div className="adm-tw">
                  <table className="adm-tbl">
                    <thead>
                      <tr>
                        {['Sujet', 'Étudiant', 'Encadrant', 'Statut', 'Date début'].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {affectations.map((p) => (
                        <tr key={p._id}>
                          <td style={{ fontWeight: 700 }}>{p.idSujet?.titre || p.titre || '—'}</td>
                          <td style={{ color: P.textSoft }}>
                            {p.idEtudiant?.utilisateur
                              ? `${p.idEtudiant.utilisateur.prenom} ${p.idEtudiant.utilisateur.nom}`
                              : '—'}
                          </td>
                          <td style={{ color: P.textSoft }}>
                            {p.idEncadrant?.utilisateur
                              ? `${p.idEncadrant.utilisateur.prenom} ${p.idEncadrant.utilisateur.nom}`
                              : '—'}
                          </td>
                          <td>
                            <Bdg
                              color={p.statutProjet === 'TERMINE' ? P.success : P.warning}
                              bg={p.statutProjet === 'TERMINE' ? P.successLight : P.warningLight}
                            >
                              {p.statutProjet}
                            </Bdg>
                          </td>
                          <td style={{ color: P.textMuted, fontSize: '.73rem' }}>
                            {p.dateDebut ? new Date(p.dateDebut).toLocaleDateString('fr-FR') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!affectations.length && (
                    <p
                      style={{
                        textAlign: 'center',
                        color: P.textMuted,
                        padding: '2rem',
                        fontSize: '.82rem',
                      }}
                    >
                      Aucune affectation
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── PUBLICATIONS ── */}
            {activePage === 'publications' && (
              <div className="anim">
                <div
                  style={{
                    display: 'flex',
                    gap: '.65rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', gap: '.75rem' }}>
                    {[
                      { label: 'Total', value: pubs.length, color: P.accent, bg: P.accentLight },
                      {
                        label: 'Publiées',
                        value: pubs.filter((p) => p.statut === 'PUBLIE').length,
                        color: P.success,
                        bg: P.successLight,
                      },
                      {
                        label: 'Brouillons',
                        value: pubs.filter((p) => p.statut === 'BROUILLON').length,
                        color: P.warning,
                        bg: P.warningLight,
                      },
                    ].map((s, i) => (
                      <div
                        key={i}
                        style={{
                          background: s.bg,
                          border: `1px solid ${P.cardBorder}`,
                          borderRadius: 9,
                          padding: '.7rem .95rem',
                          textAlign: 'center',
                        }}
                      >
                        <p
                          style={{
                            fontWeight: 800,
                            fontSize: '1.35rem',
                            color: s.color,
                            lineHeight: 1,
                          }}
                        >
                          {s.value}
                        </p>
                        <p
                          style={{
                            color: P.textSoft,
                            fontSize: '.68rem',
                            fontWeight: 600,
                            marginTop: '.12rem',
                          }}
                        >
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button
                    className="btn-accent"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => {
                      setEditPub(null);
                      setPubF({
                        titre: '',
                        contenu: '',
                        type: 'ANNONCE',
                        statut: 'BROUILLON',
                        audience: 'TOUS',
                      });
                      setShowPub(true);
                    }}
                  >
                    {Icon.plus('#fff')} Nouvelle publication
                  </button>
                </div>
                {pubs.map((pub) => (
                  <div
                    key={pub._id}
                    style={{
                      background: P.card,
                      border: `1px solid ${P.cardBorder}`,
                      borderRadius: 12,
                      padding: '1rem',
                      marginBottom: '.7rem',
                      transition: 'border-color .14s',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '.5rem',
                            marginBottom: '.42rem',
                            flexWrap: 'wrap',
                          }}
                        >
                          <Bdg
                            color={
                              pub.type === 'ANNONCE'
                                ? P.accent
                                : pub.type === 'RESSOURCE'
                                  ? P.success
                                  : P.purple
                            }
                            bg={
                              pub.type === 'ANNONCE'
                                ? P.accentLight
                                : pub.type === 'RESSOURCE'
                                  ? P.successLight
                                  : P.purpleLight
                            }
                          >
                            {pub.type}
                          </Bdg>
                          <Bdg
                            color={pub.statut === 'PUBLIE' ? P.success : P.warning}
                            bg={pub.statut === 'PUBLIE' ? P.successLight : P.warningLight}
                          >
                            {pub.statut === 'PUBLIE' ? 'Publié' : 'Brouillon'}
                          </Bdg>
                          <AudPill audience={pub.audience || 'TOUS'} P={P} />
                          <span
                            style={{
                              color: P.textMuted,
                              fontSize: '.69rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                            }}
                          >
                            {Icon.eye(P.textMuted)} {pub.vues} vues
                          </span>
                        </div>
                        <p
                          style={{
                            fontWeight: 700,
                            color: P.text,
                            fontSize: '.86rem',
                            marginBottom: '.28rem',
                          }}
                        >
                          {pub.titre}
                        </p>
                        <p style={{ color: P.textSoft, fontSize: '.78rem', lineHeight: 1.55 }}>
                          {pub.contenu}
                        </p>
                        <p style={{ color: P.textMuted, fontSize: '.68rem', marginTop: '.42rem' }}>
                          Par {pub.auteur} · {pub.date}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '.32rem', flexShrink: 0 }}>
                        {pub.statut === 'BROUILLON' && (
                          <button
                            className="ibtn"
                            title="Publier"
                            onClick={() => handlePublishPub(pub._id)}
                          >
                            {Icon.send(P.success)}
                          </button>
                        )}
                        <button
                          className="ibtn"
                          title="Modifier"
                          onClick={() => {
                            setEditPub(pub);
                            setPubF({
                              titre: pub.titre,
                              contenu: pub.contenu,
                              type: pub.type,
                              statut: pub.statut,
                              audience: pub.audience || 'TOUS',
                            });
                            setShowPub(true);
                          }}
                        >
                          {Icon.edit(P.accent)}
                        </button>
                        <button
                          className="ibtn"
                          title="Supprimer"
                          onClick={() => handleDeletePub(pub._id)}
                        >
                          {Icon.trash(P.danger)}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {!pubs.length && (
                  <p
                    style={{
                      color: P.textMuted,
                      textAlign: 'center',
                      padding: '3rem',
                      fontSize: '.84rem',
                    }}
                  >
                    Aucune publication
                  </p>
                )}
              </div>
            )}

            {/* ── FEEDBACKS ── */}
            {activePage === 'feedbacks' && (
              <div className="anim">
                <div className="card" style={{ marginBottom: '1.1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <p
                        style={{
                          fontWeight: 800,
                          fontSize: '2.7rem',
                          color: P.accent,
                          lineHeight: 1,
                        }}
                      >
                        {avgNote}
                      </p>
                      <Stars value={Math.round(avgNote)} />
                      <p style={{ color: P.textMuted, fontSize: '.71rem', marginTop: '.28rem' }}>
                        {fbs.length} avis
                      </p>
                    </div>
                    <div style={{ flex: 1, minWidth: 150 }}>
                      {[5, 4, 3, 2, 1].map((n) => {
                        const cnt = fbs.filter((f) => f.note === n).length;
                        const pct = fbs.length ? (cnt / fbs.length) * 100 : 0;
                        return (
                          <div
                            key={n}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '.58rem',
                              marginBottom: '.4rem',
                            }}
                          >
                            <span
                              style={{
                                color: P.textSoft,
                                fontSize: '.73rem',
                                fontWeight: 600,
                                minWidth: 10,
                              }}
                            >
                              {n}
                            </span>
                            <span style={{ color: '#fbbf24' }}>★</span>
                            <div className="pb" style={{ flex: 1 }}>
                              <div
                                className="pf"
                                style={{ width: `${pct}%`, background: '#fbbf24' }}
                              />
                            </div>
                            <span style={{ color: P.textMuted, fontSize: '.71rem', minWidth: 14 }}>
                              {cnt}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <button className="btn-accent" onClick={() => setShowFb(true)}>
                      {Icon.plus('#fff')} Ajouter
                    </button>
                  </div>
                </div>
                <div className="fr">
                  {[
                    ['', 'Tous'],
                    ['APPROUVE', 'Approuvés'],
                    ['EN_ATTENTE', 'En attente'],
                  ].map(([val, lbl]) => (
                    <button
                      key={val}
                      onClick={() => setFbF(val)}
                      style={{
                        padding: '.36rem .82rem',
                        borderRadius: 8,
                        border: `1px solid ${fbF === val ? P.accent : P.border}`,
                        background: fbF === val ? P.accentLight : 'transparent',
                        color: fbF === val ? P.accent : P.textSoft,
                        fontFamily: 'Nunito,sans-serif',
                        fontSize: '.77rem',
                        fontWeight: fbF === val ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all .14s',
                      }}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
                {filteredFbs.map((fb) => (
                  <div key={fb._id} className="t-row">
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: P.accentLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        color: P.accent,
                        fontSize: '.66rem',
                        flexShrink: 0,
                      }}
                    >
                      {fb.auteur
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '.48rem',
                          flexWrap: 'wrap',
                          marginBottom: '.18rem',
                        }}
                      >
                        <span style={{ fontWeight: 700, color: P.text, fontSize: '.82rem' }}>
                          {fb.auteur}
                        </span>
                        <Bdg
                          color={fb.role === 'ETUDIANT' ? P.success : P.purple}
                          bg={fb.role === 'ETUDIANT' ? P.successLight : P.purpleLight}
                        >
                          {fb.role}
                        </Bdg>
                        <Stars value={fb.note} />
                        <Bdg
                          color={fb.statut === 'APPROUVE' ? P.success : P.warning}
                          bg={fb.statut === 'APPROUVE' ? P.successLight : P.warningLight}
                        >
                          {fb.statut === 'APPROUVE' ? 'Approuvé' : 'En attente'}
                        </Bdg>
                      </div>
                      <p style={{ color: P.textSoft, fontSize: '.79rem', lineHeight: 1.55 }}>
                        {fb.commentaire}
                      </p>
                      <p style={{ color: P.textMuted, fontSize: '.68rem', marginTop: '.32rem' }}>
                        {fb.date}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '.32rem', flexShrink: 0 }}>
                      {fb.statut === 'EN_ATTENTE' && (
                        <button
                          className="ibtn"
                          title="Approuver"
                          onClick={() => handleApproveFb(fb._id)}
                        >
                          {Icon.checkSm(P.success)}
                        </button>
                      )}
                      <button
                        className="ibtn"
                        title="Supprimer"
                        onClick={() => handleDeleteFb(fb._id)}
                      >
                        {Icon.trash(P.danger)}
                      </button>
                    </div>
                  </div>
                ))}
                {!filteredFbs.length && (
                  <p
                    style={{
                      color: P.textMuted,
                      textAlign: 'center',
                      padding: '3rem',
                      fontSize: '.84rem',
                    }}
                  >
                    Aucun feedback
                  </p>
                )}
              </div>
            )}

            {/* ── MESSAGERIE CONTACT ── */}
            {activePage === 'messagerie' && (
              <div className="anim">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className="card"
                    style={{
                      borderLeft:
                        msg.statut === 'NOUVEAU'
                          ? `3px solid ${P.accent}`
                          : `1px solid ${P.cardBorder}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '.58rem',
                            marginBottom: '.3rem',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span style={{ fontWeight: 700, color: P.text, fontSize: '.82rem' }}>
                            {msg.nom}
                          </span>
                          <span style={{ color: P.textMuted, fontSize: '.71rem' }}>
                            {msg.email}
                          </span>
                          <Bdg
                            color={
                              msg.statut === 'NOUVEAU'
                                ? P.accent
                                : msg.statut === 'REPONDU'
                                  ? P.success
                                  : P.textMuted
                            }
                            bg={
                              msg.statut === 'NOUVEAU'
                                ? P.accentLight
                                : msg.statut === 'REPONDU'
                                  ? P.successLight
                                  : dark
                                    ? '#1e293b'
                                    : '#f1f5f9'
                            }
                          >
                            {msg.statut}
                          </Bdg>
                        </div>
                        <p
                          style={{
                            fontWeight: 700,
                            color: P.accent,
                            fontSize: '.8rem',
                            marginBottom: '.2rem',
                          }}
                        >
                          {msg.sujet}
                        </p>
                        <p style={{ color: P.textSoft, fontSize: '.78rem', lineHeight: 1.55 }}>
                          {msg.message}
                        </p>
                        {msg.reponse && (
                          <div
                            style={{
                              marginTop: '.62rem',
                              padding: '.62rem .8rem',
                              background: P.successLight,
                              borderLeft: `3px solid ${P.success}`,
                              borderRadius: '0 6px 6px 0',
                            }}
                          >
                            <p
                              style={{
                                fontSize: '.68rem',
                                color: P.success,
                                fontWeight: 700,
                                marginBottom: '.17rem',
                              }}
                            >
                              Réponse admin :
                            </p>
                            <p style={{ color: P.text, fontSize: '.78rem' }}>{msg.reponse}</p>
                          </div>
                        )}
                        <p
                          style={{
                            color: P.textMuted,
                            fontSize: '.68rem',
                            marginTop: '.42rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          {Icon.clock(P.textMuted)}{' '}
                          {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '.32rem', flexShrink: 0 }}>
                        {msg.statut !== 'REPONDU' && msg.statut !== 'ARCHIVE' && (
                          <button
                            className="ibtn"
                            title="Répondre"
                            onClick={() => {
                              setShowReply(msg._id);
                              setReplyText('');
                            }}
                          >
                            {Icon.send(P.accent)}
                          </button>
                        )}
                        {msg.statut !== 'ARCHIVE' && (
                          <button
                            className="ibtn"
                            title="Archiver"
                            onClick={() => handleArchiveMsg(msg._id)}
                          >
                            {Icon.archive(P.textSoft)}
                          </button>
                        )}
                      </div>
                    </div>
                    {showReply === msg._id && (
                      <div style={{ marginTop: '.85rem', display: 'flex', gap: '.58rem' }}>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Votre réponse…"
                          rows={2}
                          className="adm-input"
                          style={{ flex: 1, resize: 'vertical' }}
                        />
                        <button
                          className="btn-accent"
                          disabled={!replyText.trim()}
                          onClick={() => handleReplyMsg(msg._id)}
                          style={{ alignSelf: 'flex-end' }}
                        >
                          {Icon.send('#fff')}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {!messages.length && (
                  <p
                    style={{
                      color: P.textMuted,
                      textAlign: 'center',
                      padding: '3rem',
                      fontSize: '.84rem',
                    }}
                  >
                    Aucun message 📭
                  </p>
                )}
                <Pag page={msgPage} setPage={setMsgPage} total={msgTotal} limit={15} P={P} />
              </div>
            )}

            {/* ── MONITORING ── */}
            {activePage === 'monitoring' && (
              <div className="anim">
                <div className="fr">
                  <select
                    className="adm-input"
                    value={lgF.action}
                    onChange={(e) => {
                      setLgF({ ...lgF, action: e.target.value });
                      setLogsPage(1);
                    }}
                  >
                    <option value="">Toutes les actions</option>
                    {[
                      'LOGIN',
                      'LOGOUT',
                      'REGISTER',
                      'VALIDATE_USER',
                      'REJECT_USER',
                      'CREATE_SUJET',
                      'VALIDATE_SUJET',
                      'ASSIGN_PFE',
                      'SEND_NOTIFICATION',
                      'UPDATE_PROFILE',
                      'REPLY_SUPPORT',
                      'ADD_REFERENTIEL',
                    ].map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <button className="btn-ghost" onClick={fetchLogs}>
                    {Icon.refresh(P.accent)} Actualiser
                  </button>
                </div>
                <div className="adm-tw">
                  <table className="adm-tbl">
                    <thead>
                      <tr>
                        {['Action', 'Utilisateur', 'Rôle', 'Détails', 'IP', 'Date'].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log._id}>
                          <td>
                            <Bdg color={P.accent} bg={P.accentLight}>
                              {log.action}
                            </Bdg>
                          </td>
                          <td style={{ color: P.textSoft }}>{log.userEmail || '—'}</td>
                          <td style={{ color: P.textMuted, fontSize: '.73rem' }}>{log.userRole}</td>
                          <td
                            style={{
                              color: P.textSoft,
                              maxWidth: 220,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {log.details}
                          </td>
                          <td
                            style={{
                              color: P.textMuted,
                              fontFamily: 'monospace',
                              fontSize: '.72rem',
                            }}
                          >
                            {log.ip || '—'}
                          </td>
                          <td style={{ color: P.textMuted, fontSize: '.72rem' }}>
                            {new Date(log.createdAt).toLocaleString('fr-FR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!logs.length && (
                    <p
                      style={{
                        textAlign: 'center',
                        color: P.textMuted,
                        padding: '2rem',
                        fontSize: '.82rem',
                      }}
                    >
                      Aucun log
                    </p>
                  )}
                </div>
                <Pag page={logsPage} setPage={setLogsPage} total={logsTotal} limit={25} P={P} />
              </div>
            )}

            {/* ── STATISTIQUES ── */}
            {activePage === 'statistiques' && (
              <div className="anim">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div className="card">
                    <div className="card-hdr">
                      <span className="ct">{Icon.users(P.accent)} Répartition utilisateurs</span>
                    </div>
                    {[
                      {
                        label: 'Étudiants',
                        value: stats.totalEtudiants || 0,
                        color: P.success,
                        max: stats.totalUsers || 1,
                      },
                      {
                        label: 'Encadrants',
                        value: stats.totalEncadrants || 0,
                        color: P.purple,
                        max: stats.totalUsers || 1,
                      },
                      {
                        label: 'En attente',
                        value: stats.usersEnAttente || 0,
                        color: P.warning,
                        max: stats.totalUsers || 1,
                      },
                    ].map((item, i) => (
                      <div key={i} style={{ marginBottom: '.78rem' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '.26rem',
                          }}
                        >
                          <span style={{ color: P.textSoft, fontSize: '.78rem' }}>
                            {item.label}
                          </span>
                          <span style={{ fontWeight: 700, color: P.text, fontSize: '.78rem' }}>
                            {item.value}
                          </span>
                        </div>
                        <div className="pb">
                          <div
                            className="pf"
                            style={{
                              width: `${(item.value / item.max) * 100}%`,
                              background: item.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="card">
                    <div className="card-hdr">
                      <span className="ct">{Icon.doc(P.accent)} État des PFE</span>
                    </div>
                    {[
                      {
                        label: 'Sujets validés',
                        value: stats.sujetsValides || 0,
                        color: P.success,
                        max: stats.totalSujets || 1,
                      },
                      {
                        label: 'Sujets en attente',
                        value: stats.sujetsEnAttente || 0,
                        color: P.warning,
                        max: stats.totalSujets || 1,
                      },
                      {
                        label: 'Projets en cours',
                        value: stats.projetsEnCours || 0,
                        color: P.accent,
                        max: stats.totalProjets || 1,
                      },
                      {
                        label: 'Projets terminés',
                        value: stats.projetsTermines || 0,
                        color: P.info,
                        max: stats.totalProjets || 1,
                      },
                    ].map((item, i) => (
                      <div key={i} style={{ marginBottom: '.78rem' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '.26rem',
                          }}
                        >
                          <span style={{ color: P.textSoft, fontSize: '.78rem' }}>
                            {item.label}
                          </span>
                          <span style={{ fontWeight: 700, color: P.text, fontSize: '.78rem' }}>
                            {item.value}
                          </span>
                        </div>
                        <div className="pb">
                          <div
                            className="pf"
                            style={{
                              width: `${(item.value / item.max) * 100}%`,
                              background: item.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <div className="card-hdr">
                    <span className="ct">{Icon.trend(P.accent)} Résumé global</span>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill,minmax(125px,1fr))',
                      gap: '.9rem',
                    }}
                  >
                    {[
                      { ic: Icon.check, v: stats.totalCandidatures || 0, l: 'Candidatures' },
                      { ic: Icon.link, v: stats.totalProjets || 0, l: 'Projets' },
                      { ic: Icon.bar, v: stats.logsAujourdhui || 0, l: "Logs aujourd'hui" },
                      { ic: Icon.msg, v: stats.messagesNonLus || 0, l: 'Messages' },
                      { ic: Icon.newspaper, v: pubs.length, l: 'Publications' },
                      { ic: Icon.star, v: avgNote, l: 'Note moyenne' },
                    ].map((s, i) => (
                      <div
                        key={i}
                        style={{
                          textAlign: 'center',
                          background: dark ? '#1e293b' : P.bg,
                          border: `1px solid ${P.cardBorder}`,
                          borderRadius: 9,
                          padding: '.85rem',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: '.38rem',
                            opacity: 0.7,
                          }}
                        >
                          {s.ic(P.accent)}
                        </div>
                        <p
                          style={{
                            fontWeight: 800,
                            fontSize: '1.4rem',
                            color: P.accent,
                            lineHeight: 1,
                          }}
                        >
                          {s.v}
                        </p>
                        <p
                          style={{
                            color: P.textMuted,
                            fontSize: '.67rem',
                            marginTop: '.2rem',
                            fontWeight: 700,
                          }}
                        >
                          {s.l}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PROFIL ── */}
            {activePage === 'profil' && (
              <div className="anim">
                <div className="card">
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
                  >
                    <div
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: '50%',
                        background: P.accentGrad,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 17,
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '1rem', color: P.text }}>
                        {user?.prenom || 'Admin'} {user?.nom || ''}
                      </p>
                      <p style={{ color: P.textSoft, fontSize: '.79rem', marginTop: 3 }}>
                        {user?.email || ''}
                      </p>
                      <div style={{ marginTop: 6 }}>
                        <Bdg color={P.accent} bg={P.accentLight}>
                          Administrateur
                        </Bdg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ MODALS ══ */}

        {showAddRef && (
          <div
            className="adm-ov"
            onClick={(e) => e.target === e.currentTarget && setShowAddRef(false)}
          >
            <div className="adm-modal">
              <div className="adm-mt">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {Icon.doc(P.accent)} Ajouter un code référentiel
                </span>
                <button className="ibtn" onClick={() => setShowAddRef(false)}>
                  {Icon.x(P.textSoft)}
                </button>
              </div>
              <form onSubmit={handleAddRef} style={{ display: 'grid', gap: '.8rem' }}>
                <div>
                  <p className="fl">Type</p>
                  <select
                    className="adm-input"
                    style={{ width: '100%' }}
                    value={newRef.type}
                    onChange={(e) => setNewRef({ ...newRef, type: e.target.value })}
                  >
                    <option value="ETUDIANT">Matricule étudiant</option>
                    <option value="ENCADRANT">Code contrat encadrant</option>
                  </select>
                </div>
                <div>
                  <p className="fl">Code *</p>
                  <input
                    className="adm-input"
                    style={{ width: '100%' }}
                    placeholder="Ex: MAT2026001"
                    required
                    value={newRef.code}
                    onChange={(e) => setNewRef({ ...newRef, code: e.target.value })}
                  />
                </div>
                <div>
                  <p className="fl">Label (optionnel)</p>
                  <input
                    className="adm-input"
                    style={{ width: '100%' }}
                    placeholder="Ex: Ali Ben Ahmed"
                    value={newRef.label}
                    onChange={(e) => setNewRef({ ...newRef, label: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: '.58rem', marginTop: '.2rem' }}>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ flex: 1 }}
                    onClick={() => setShowAddRef(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-accent" style={{ flex: 1 }}>
                    {Icon.checkSm('#fff')} Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showNotif && (
          <div
            className="adm-ov"
            onClick={(e) => e.target === e.currentTarget && setShowNotif(false)}
          >
            <div className="adm-modal">
              <div className="adm-mt">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {Icon.bell(P.accent)} Envoyer une notification
                </span>
                <button className="ibtn" onClick={() => setShowNotif(false)}>
                  {Icon.x(P.textSoft)}
                </button>
              </div>
              <form onSubmit={handleSendNotif} style={{ display: 'grid', gap: '.8rem' }}>
                <div>
                  <p className="fl">Titre *</p>
                  <input
                    className="adm-input"
                    style={{ width: '100%' }}
                    placeholder="Titre"
                    required
                    value={notifF.titre}
                    onChange={(e) => setNotifF({ ...notifF, titre: e.target.value })}
                  />
                </div>
                <div>
                  <p className="fl">Contenu *</p>
                  <textarea
                    className="adm-input"
                    style={{ width: '100%', resize: 'vertical' }}
                    rows={3}
                    placeholder="Message…"
                    required
                    value={notifF.contenu}
                    onChange={(e) => setNotifF({ ...notifF, contenu: e.target.value })}
                  />
                </div>
                <div>
                  <p className="fl">Cible</p>
                  <select
                    className="adm-input"
                    style={{ width: '100%' }}
                    value={JSON.stringify(notifF.rolesCibles)}
                    onChange={(e) =>
                      setNotifF({ ...notifF, rolesCibles: JSON.parse(e.target.value) })
                    }
                  >
                    <option value="[]">Tous les utilisateurs</option>
                    <option value='["ETUDIANT"]'>Étudiants uniquement</option>
                    <option value='["ENCADRANT"]'>Encadrants uniquement</option>
                    <option value='["ETUDIANT","ENCADRANT"]'>Étudiants + Encadrants</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '.58rem', marginTop: '.2rem' }}>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ flex: 1 }}
                    onClick={() => setShowNotif(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-accent" style={{ flex: 1 }}>
                    {Icon.send('#fff')} Envoyer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showPub && (
          <div
            className="adm-ov"
            onClick={(e) => e.target === e.currentTarget && setShowPub(false)}
          >
            <div className="adm-modal">
              <div className="adm-mt">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {Icon.newspaper(P.accent)} {editPub ? 'Modifier' : 'Nouvelle'} publication
                </span>
                <button className="ibtn" onClick={() => setShowPub(false)}>
                  {Icon.x(P.textSoft)}
                </button>
              </div>
              <form onSubmit={handleSavePub} style={{ display: 'grid', gap: '.8rem' }}>
                <div>
                  <p className="fl">Titre *</p>
                  <input
                    className="adm-input"
                    style={{ width: '100%' }}
                    placeholder="Titre"
                    required
                    value={pubF.titre}
                    onChange={(e) => setPubF({ ...pubF, titre: e.target.value })}
                  />
                </div>
                <div>
                  <p className="fl">Contenu *</p>
                  <textarea
                    className="adm-input"
                    style={{ width: '100%', resize: 'vertical' }}
                    rows={3}
                    placeholder="Contenu…"
                    required
                    value={pubF.contenu}
                    onChange={(e) => setPubF({ ...pubF, contenu: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.65rem' }}>
                  <div>
                    <p className="fl">Type</p>
                    <select
                      className="adm-input"
                      style={{ width: '100%' }}
                      value={pubF.type}
                      onChange={(e) => setPubF({ ...pubF, type: e.target.value })}
                    >
                      <option value="ANNONCE">Annonce</option>
                      <option value="RESSOURCE">Ressource</option>
                      <option value="CALENDRIER">Calendrier</option>
                    </select>
                  </div>
                  <div>
                    <p className="fl">Audience</p>
                    <select
                      className="adm-input"
                      style={{ width: '100%' }}
                      value={pubF.audience}
                      onChange={(e) => setPubF({ ...pubF, audience: e.target.value })}
                    >
                      <option value="TOUS">Tous</option>
                      <option value="ETUDIANT">Étudiants</option>
                      <option value="ENCADRANT">Encadrants</option>
                    </select>
                  </div>
                  <div>
                    <p className="fl">Statut</p>
                    <select
                      className="adm-input"
                      style={{ width: '100%' }}
                      value={pubF.statut}
                      onChange={(e) => setPubF({ ...pubF, statut: e.target.value })}
                    >
                      <option value="BROUILLON">Brouillon</option>
                      <option value="PUBLIE">Publier</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '.58rem', marginTop: '.2rem' }}>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ flex: 1 }}
                    onClick={() => setShowPub(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-accent" style={{ flex: 1 }}>
                    {editPub ? (
                      <>{Icon.checkSm('#fff')} Enregistrer</>
                    ) : (
                      <>{Icon.newspaper('#fff')} Créer</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showFb && (
          <div className="adm-ov" onClick={(e) => e.target === e.currentTarget && setShowFb(false)}>
            <div className="adm-modal">
              <div className="adm-mt">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {Icon.star(P.accent)} Ajouter un feedback
                </span>
                <button className="ibtn" onClick={() => setShowFb(false)}>
                  {Icon.x(P.textSoft)}
                </button>
              </div>
              <form onSubmit={handleAddFb} style={{ display: 'grid', gap: '.8rem' }}>
                <div>
                  <p className="fl">Auteur *</p>
                  <input
                    className="adm-input"
                    style={{ width: '100%' }}
                    placeholder="Nom complet"
                    required
                    value={fbForm.auteur}
                    onChange={(e) => setFbForm({ ...fbForm, auteur: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem' }}>
                  <div>
                    <p className="fl">Rôle</p>
                    <select
                      className="adm-input"
                      style={{ width: '100%' }}
                      value={fbForm.role}
                      onChange={(e) => setFbForm({ ...fbForm, role: e.target.value })}
                    >
                      <option value="ETUDIANT">Étudiant</option>
                      <option value="ENCADRANT">Encadrant</option>
                    </select>
                  </div>
                  <div>
                    <p className="fl">Note</p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.32rem',
                        marginTop: '.32rem',
                      }}
                    >
                      <Stars
                        value={fbForm.note}
                        onChange={(n) => setFbForm({ ...fbForm, note: n })}
                      />
                      <span style={{ color: P.textSoft, fontSize: '.79rem' }}>{fbForm.note}/5</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="fl">Commentaire *</p>
                  <textarea
                    className="adm-input"
                    style={{ width: '100%', resize: 'vertical' }}
                    rows={3}
                    placeholder="Commentaire…"
                    required
                    value={fbForm.commentaire}
                    onChange={(e) => setFbForm({ ...fbForm, commentaire: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: '.58rem', marginTop: '.2rem' }}>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ flex: 1 }}
                    onClick={() => setShowFb(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-accent" style={{ flex: 1 }}>
                    {Icon.star('#fff')} Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
