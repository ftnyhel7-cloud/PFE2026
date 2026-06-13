import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import CalendrierPage from './CalendrierPage';
import Pusher from 'pusher-js';
import MessagerieePage from '../MessagerieePage';
import ParametresPage from '../ParametresPage';

const T = {
  sidebar: '#1a3d2b',
  sidebarDark: '#122b1e',
  sidebarAccent: '#4caf82',
  sidebarText: 'rgba(255,255,255,.55)',
  sidebarHover: 'rgba(255,255,255,.07)',
  sidebarActive: 'rgba(76,175,130,.18)',
  sidebarBorder: 'rgba(255,255,255,.08)',
  accent: '#2d9e6b',
  accentLight: '#e6f5ef',
  accentMid: '#4caf82',
  accentGrad: 'linear-gradient(135deg,#1a7a4f,#2d9e6b,#4caf82)',
  accentSoft: 'rgba(45,158,107,.12)',
  bg: '#f4faf7',
  card: '#ffffff',
  cardBorder: '#e0efe8',
  text: '#0f2d1e',
  textSoft: '#3d6b52',
  textMuted: '#7fa98e',
  success: '#16a34a',
  successLight: '#dcfce7',
  warning: '#d97706',
  warningLight: '#fef3c7',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  info: '#0891b2',
  infoLight: '#e0f7fa',
  purple: '#7c3aed',
  purpleLight: '#ede9fe',
  shadow: '0 2px 16px rgba(45,158,107,.10)',
  shadowMd: '0 6px 28px rgba(45,158,107,.16)',
};

const TASK_PAL = [
  { bg: '#F3E8FF', border: '#D8B4FE', text: '#6B21A8', dot: '#9333EA' },
  { bg: '#FFE4E6', border: '#FECDD3', text: '#9F1239', dot: '#F43F5E' },
  { bg: '#FEF3C7', border: '#FDE68A', text: '#92400E', dot: '#F59E0B' },
  { bg: '#DBEAFE', border: '#BFDBFE', text: '#1E40AF', dot: '#3B82F6' },
];

const STATUT_CFG = {
  TERMINEE: { c: '#166534', bg: '#DCFCE7', border: '#86EFAC', l: 'Terminée' },
  EN_COURS: { c: '#92400E', bg: '#FEF3C7', border: '#FDE68A', l: 'En cours' },
  A_FAIRE: { c: '#6B21A8', bg: '#F3E8FF', border: '#D8B4FE', l: 'À faire' },
};

const G = {
  bg: '#f0faf4',
  card: '#ffffff',
  border: '#c8e6d0',
  accent: '#1e8a5e',
  accentDark: '#155f42',
  accentLight: '#d4f0e2',
  accentMid: '#34a872',
  grad: 'linear-gradient(135deg,#155f42,#1e8a5e,#34a872)',
  text: '#0d2d1a',
  textSoft: '#3a6b4e',
  textMuted: '#7aad8e',
  success: '#16a34a',
  successBg: '#dcfce7',
  warning: '#d97706',
  warningBg: '#fef3c7',
  danger: '#dc2626',
  dangerBg: '#fee2e2',
  purple: '#7c3aed',
  purpleBg: '#ede9fe',
  shadow: '0 2px 12px rgba(30,138,94,.10)',
  shadowMd: '0 8px 28px rgba(30,138,94,.16)',
  pastel: [
    { bg: '#f0fdf4', border: '#bbf7d0', tag: '#16a34a', tagBg: '#dcfce7' },
    { bg: '#f0f9ff', border: '#bae6fd', tag: '#0369a1', tagBg: '#e0f2fe' },
    { bg: '#fdf4ff', border: '#e9d5ff', tag: '#7e22ce', tagBg: '#f3e8ff' },
    { bg: '#fff7ed', border: '#fed7aa', tag: '#c2410c', tagBg: '#ffedd5' },
    { bg: '#f0fdfa', border: '#99f6e4', tag: '#0f766e', tagBg: '#ccfbf1' },
    { bg: '#fefce8', border: '#fef08a', tag: '#a16207', tagBg: '#fef9c3' },
  ],
};

const I = {
  grid: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
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
  folder: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  check: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  send: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  award: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  ),
  cal: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  msg: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  bell: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  user: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  news: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <line x1="11" y1="8" x2="17" y2="8" />
      <line x1="11" y1="12" x2="17" y2="12" />
    </svg>
  ),
  logout: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  chevL: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  chevR: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  settings: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  x: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  progress: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  menu: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  close: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  search: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  code: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  pin: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  refresh: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  grad: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3.33 2 8.67 2 12 0v-5" />
    </svg>
  ),
  book: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  plus: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  file: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
};

// ── NAV — Notifications, Messagerie, Mon Profil en SPA (direct:null) ──
const NAV = [
  {
    section: 'Principal',
    items: [
      { id: 'accueil', icon: I.grid, label: 'Accueil', direct: null },
      { id: 'projet', icon: I.folder, label: 'Mon Projet', direct: null },
      { id: 'taches', icon: I.check, label: 'Mes Tâches', direct: null },
      { id: 'candidatures', icon: I.send, label: 'Candidatures', direct: null },
      { id: 'evaluations', icon: I.award, label: 'Mes Évaluations', direct: null },
    ],
  },
  {
    section: 'Contenu',
    items: [
      { id: 'calendrier', icon: I.cal, label: 'Calendrier', direct: null },
      { id: 'notifications', icon: I.bell, label: 'Notifications', direct: null },
      { id: 'messages', icon: I.msg, label: 'Messagerie', direct: null },
    ],
  },
  {
    section: 'Compte',
    items: [
      { id: 'profil', icon: I.user, label: 'Mon Profil', direct: null },
      {
        id: 'feedbacks',
        icon: () => (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="9" y1="10" x2="15" y2="10" />
            <line x1="12" y1="7" x2="12" y2="13" />
          </svg>
        ),
        label: 'Feedbacks',
        direct: null,
      },
    ],
  },
];

function Badge({ children, color, bg }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        padding: '.18rem .58rem',
        borderRadius: 999,
        fontSize: '.66rem',
        fontWeight: 700,
        color,
        background: bg,
      }}
    >
      {children}
    </span>
  );
}

function Btn({ children, variant = 'accent', onClick, disabled, style = {} }) {
  const styles = {
    accent: {
      background: T.accentGrad,
      color: '#fff',
      border: 'none',
      boxShadow: '0 4px 14px rgba(45,158,107,.3)',
    },
    ghost: { background: 'transparent', color: T.textSoft, border: `1px solid ${T.cardBorder}` },
    danger: { background: T.dangerLight, color: T.danger, border: `1px solid ${T.danger}` },
    success: { background: T.successLight, color: T.success, border: `1px solid ${T.success}` },
    purple: { background: T.purpleLight, color: T.purple, border: `1px solid ${T.purple}` },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '.38rem',
        padding: '.48rem .95rem',
        borderRadius: 8,
        fontFamily: 'inherit',
        fontSize: '.79rem',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all .15s',
        ...styles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: T.card,
        borderRadius: 14,
        border: `1px solid ${T.cardBorder}`,
        boxShadow: T.shadow,
        padding: '1.1rem',
        marginBottom: '.95rem',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, icon: IconComp, action }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '.85rem',
        paddingBottom: '.7rem',
        borderBottom: `1px solid ${T.cardBorder}`,
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontWeight: 700,
          fontSize: '.83rem',
          color: T.text,
        }}
      >
        <span style={{ color: T.accent }}>
          <IconComp />
        </span>{' '}
        {title}
      </span>
      {action}
    </div>
  );
}

function StatCard({ icon: IconComp, value, label, color, bg, sub }) {
  return (
    <div
      style={{
        background: T.card,
        borderRadius: 13,
        border: `1px solid ${T.cardBorder}`,
        boxShadow: T.shadow,
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '.85rem',
        transition: 'transform .18s,box-shadow .18s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = T.shadowMd;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = T.shadow;
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 11,
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}
      >
        <IconComp />
      </div>
      <div>
        <p style={{ fontWeight: 800, fontSize: '1.4rem', color, lineHeight: 1 }}>{value}</p>
        <p style={{ color: T.text, fontWeight: 600, fontSize: '.73rem', marginTop: '.12rem' }}>
          {label}
        </p>
        {sub && (
          <p
            style={{ color: T.textMuted, fontSize: '.62rem', fontWeight: 600, marginTop: '.06rem' }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function Progress({ value, color, label, count }) {
  return (
    <div style={{ marginBottom: '.72rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.24rem' }}>
        <span style={{ color: T.textSoft, fontSize: '.77rem' }}>{label}</span>
        <span style={{ fontWeight: 700, color: T.text, fontSize: '.77rem' }}>{count}</span>
      </div>
      <div style={{ height: 7, background: '#e6f5ef', borderRadius: 100, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${value}%`,
            background: color,
            borderRadius: 100,
            transition: 'width .6s ease',
          }}
        />
      </div>
    </div>
  );
}

function Sidebar({
  page,
  goTo,
  user,
  logout,
  navigate,
  collapsed,
  setCollapsed,
  mobileOpen,
  closeMobile,
}) {
  const initials = `${user?.prenom?.[0] || 'E'}${user?.nom?.[0] || ''}`.toUpperCase();
  return (
    <>
      {mobileOpen && (
        <div
          onClick={closeMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.5)',
            zIndex: 39,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}
      <aside
        className="etd-sidebar"
        style={{ width: collapsed ? 60 : 232 }}
        data-mobile={mobileOpen ? 'open' : 'closed'}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '.6rem',
            padding: '1.1rem .9rem',
            borderBottom: `1px solid ${T.sidebarBorder}`,
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: T.accentGrad,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(45,158,107,.4)',
            }}
          >
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
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{ fontWeight: 800, fontSize: '.88rem', color: '#fff', lineHeight: 1.1 }}
                >
                  PFE Étudiant
                </div>
                <div
                  style={{
                    fontSize: '.52rem',
                    color: 'rgba(255,255,255,.38)',
                    fontWeight: 700,
                    letterSpacing: '.15em',
                    textTransform: 'uppercase',
                    marginTop: 2,
                  }}
                >
                  Espace personnel
                </div>
              </div>
              <button
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  background: 'rgba(255,255,255,.07)',
                  border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 7,
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                title={collapsed ? 'Agrandir' : 'Réduire'}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,.6)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{
                    transition: 'transform .3s',
                    transform: collapsed ? 'rotate(180deg)' : 'none',
                  }}
                >
                  <rect x="3" y="3" width="7" height="18" rx="1.5" />
                  <path d="M14 7l4 5-4 5" />
                </svg>
              </button>
              <button
                onClick={closeMobile}
                className="etd-close-btn"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,.3)',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <I.close />
              </button>
            </>
          )}
        </div>
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            style={{
              margin: '.5rem auto',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,.35)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '.3rem',
            }}
          >
            <I.chevR />
          </button>
        )}
        <nav style={{ padding: '.6rem .45rem', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV.map((section, si) => (
            <div key={section.section}>
              {si > 0 && (
                <div style={{ height: 1, background: T.sidebarBorder, margin: '.38rem .45rem' }} />
              )}
              {!collapsed && (
                <p
                  style={{
                    color: 'rgba(255,255,255,.28)',
                    fontSize: '.58rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.12em',
                    padding: '.55rem .55rem .28rem',
                  }}
                >
                  {section.section}
                </p>
              )}
              {section.items.map((item) => (
                <button
                  key={item.id}
                  className={`etd-ni${page === item.id ? ' active' : ''}`}
                  onClick={() => {
                    if (item.direct) {
                      navigate(item.direct);
                      closeMobile();
                    } else {
                      goTo(item.id);
                      closeMobile();
                    }
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div
          style={{
            padding: '.5rem .55rem',
            borderTop: `1px solid ${T.sidebarBorder}`,
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {!collapsed && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '.6rem',
                padding: '.55rem',
                background: 'rgba(255,255,255,.06)',
                borderRadius: 9,
                marginBottom: '.4rem',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: T.accentGrad,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: '#fff',
                  fontSize: '.75rem',
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: '.77rem',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.prenom} {user?.nom}
                </p>
                <p style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.4)' }}>Étudiant</p>
              </div>
            </div>
          )}
          <button
            className="etd-ni"
            onClick={() => {
              logout();
              navigate('/accueil');
            }}
            style={{ color: 'rgba(239,68,68,.8)', width: '100%' }}
            title={collapsed ? 'Déconnexion' : undefined}
          >
            <I.logout />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

function Topbar({ page, navigate, user, onMenuClick, goTo }) {
  const allItems = NAV.flatMap((s) => s.items);
  const current = allItems.find((n) => n.id === page);
  const initials = `${user?.prenom?.[0] || 'E'}${user?.nom?.[0] || ''}`.toUpperCase();
  return (
    <div className="etd-topbar">
      <button
        onClick={onMenuClick}
        className="etd-menu-btn"
        style={{
          background: 'transparent',
          border: `1px solid ${T.cardBorder}`,
          borderRadius: 9,
          width: 36,
          height: 36,
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: T.textSoft,
          flexShrink: 0,
        }}
      >
        <I.menu />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
        {current && (
          <span style={{ color: T.accent }}>
            <current.icon />
          </span>
        )}
        <h1 style={{ fontWeight: 700, color: T.text, fontSize: '.95rem' }}>
          {current?.label || 'Dashboard'}
        </h1>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', gap: '.45rem', alignItems: 'center' }}>
        {[
          { title: 'Notifications', icon: I.bell, id: 'notifications' },
          { title: 'Messagerie', icon: I.msg, id: 'messages' },
          { title: 'Paramètres', icon: I.settings, id: 'parametres' },
        ].map(({ title, icon: Ic, id, path }) => (
          <button
            key={title}
            title={title}
            onClick={() => (id ? goTo(id) : navigate(path))}
            style={{
              background: 'transparent',
              border: `1px solid ${T.cardBorder}`,
              borderRadius: 9,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: T.textSoft,
              transition: 'all .14s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.accentLight;
              e.currentTarget.style.borderColor = T.accent;
              e.currentTarget.style.color = T.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = T.cardBorder;
              e.currentTarget.style.color = T.textSoft;
            }}
          >
            <Ic />
          </button>
        ))}
        <button
          onClick={() => goTo('profil')}
          title="Mon Profil"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '.5rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '.25rem .4rem',
            borderRadius: 8,
            transition: 'background .14s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = T.accentLight)}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: T.accentGrad,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: '#fff',
              fontSize: '.75rem',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(45,158,107,.3)',
            }}
          >
            {initials}
          </div>
          <span style={{ fontWeight: 600, fontSize: '.78rem', color: T.text }}>{user?.prenom}</span>
        </button>
      </div>
    </div>
  );
}

// ── PAGES SPA ──────────────────────────────────────────────

function PageFeedbacks() {
  const [monFeedback, setMonFeedback] = useState(null);
  const [feedbacksPublics, setFeedbacksPublics] = useState([]);
  const [loading, setLoading] = useState(true);

  const [note, setNote] = useState(0);
  const [hover, setHover] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    API.get('/feedbacks/publics')
      .then((r) => setFeedbacksPublics(r.data || []))
      .catch((err) => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (note === 0) return setMsg({ text: 'Veuillez sélectionner une note', type: 'error' });
    if (commentaire.trim().length < 10)
      return setMsg({ text: 'Commentaire trop court (10 caractères minimum)', type: 'error' });
    setSending(true);
    try {
      const { data } = await API.post('/feedbacks', { note, commentaire });
      setMonFeedback(data);
      setMsg({
        text: "Merci ! Votre avis sera visible après validation par l'administrateur.",
        type: 'success',
      });
    } catch (err) {
      console.error('Feedback error:', err.response?.status, err.response?.data);
      const m = err.response?.data?.message || "Erreur lors de l'envoi";
      setMsg({ text: m, type: 'error' });
      if (err.response?.status === 409) setMonFeedback({ note, commentaire, statut: 'EN_ATTENTE' });
    } finally {
      setSending(false);
    }
  };

  const NOTE_LABEL = {
    1: 'Très insatisfait',
    2: 'Insatisfait',
    3: 'Moyen',
    4: 'Satisfait',
    5: 'Très satisfait',
  };
  const NOTE_COLOR = { 1: T.danger, 2: '#f97316', 3: T.warning, 4: T.accent, 5: T.success };

  const Stars = ({ value, onSet, onHover, size = 32 }) => (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onSet && onSet(s)}
          onMouseEnter={() => onHover && onHover(s)}
          onMouseLeave={() => onHover && onHover(0)}
          style={{
            background: 'none',
            border: 'none',
            cursor: onSet ? 'pointer' : 'default',
            padding: 2,
            lineHeight: 1,
          }}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={(onHover ? hover : value) >= s ? '#f59e0b' : 'none'}
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );

  const pals = [
    { bg: '#f0fdf4', border: '#bbf7d0' },
    { bg: '#eff6ff', border: '#bfdbfe' },
    { bg: '#fdf4ff', border: '#e9d5ff' },
    { bg: '#fff7ed', border: '#fed7aa' },
    { bg: '#f0fdfa', border: '#99f6e4' },
  ];

  return (
    <div>
      <Card style={{ marginBottom: '1.25rem' }}>
        <CardHeader
          title="Donnez votre avis sur la plateforme"
          icon={() => (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          )}
        />

        {msg.text && (
          <div
            style={{
              padding: '.65rem .9rem',
              borderRadius: 9,
              marginBottom: '1rem',
              fontSize: '.82rem',
              fontWeight: 600,
              background: msg.type === 'success' ? T.successLight : T.dangerLight,
              color: msg.type === 'success' ? T.success : T.danger,
              border: `1px solid ${msg.type === 'success' ? T.success : T.danger}40`,
            }}
          >
            {msg.text}
          </div>
        )}

        {monFeedback ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: T.successLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: T.success,
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 style={{ fontWeight: 800, color: T.text, fontSize: '1rem', marginBottom: '.4rem' }}>
              Avis soumis !
            </h3>
            <p style={{ color: T.textMuted, fontSize: '.85rem', marginBottom: '1rem' }}>
              En attente de validation par l'administrateur.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '.75rem' }}>
              <Stars value={monFeedback.note} size={24} />
            </div>
            <p
              style={{
                color: T.textSoft,
                fontSize: '.85rem',
                fontStyle: 'italic',
                marginBottom: '.75rem',
              }}
            >
              "{monFeedback.commentaire}"
            </p>
            <span
              style={{
                background: T.warningLight,
                color: T.warning,
                padding: '.25rem .75rem',
                borderRadius: 100,
                fontSize: '.72rem',
                fontWeight: 700,
              }}
            >
              En attente de validation
            </span>
          </div>
        ) : (
          <form
            onSubmit={handleSend}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  color: T.textSoft,
                  fontSize: '.75rem',
                  fontWeight: 700,
                  marginBottom: '.65rem',
                }}
              >
                Votre note *
              </label>
              <Stars value={note} onSet={setNote} onHover={setHover} size={36} />
              {(hover || note) > 0 && (
                <p
                  style={{
                    color: NOTE_COLOR[hover || note],
                    fontWeight: 700,
                    fontSize: '.82rem',
                    marginTop: '.45rem',
                  }}
                >
                  {NOTE_LABEL[hover || note]}
                </p>
              )}
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  color: T.textSoft,
                  fontSize: '.75rem',
                  fontWeight: 700,
                  marginBottom: '.3rem',
                }}
              >
                Commentaire *{' '}
                <span style={{ color: T.textMuted, fontWeight: 400 }}>(10 caractères minimum)</span>
              </label>
              <textarea
                rows={4}
                placeholder="Partagez votre expérience avec la plateforme SmartPFE…"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                style={{
                  width: '100%',
                  padding: '.65rem .9rem',
                  borderRadius: 9,
                  border: `1.5px solid ${T.cardBorder}`,
                  fontSize: '.85rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                  color: T.text,
                  background: T.card,
                  resize: 'vertical',
                  lineHeight: 1.6,
                }}
              />
              <p
                style={{
                  color:
                    commentaire.length > 0 && commentaire.trim().length < 10
                      ? T.danger
                      : T.textMuted,
                  fontSize: '.72rem',
                  marginTop: '.25rem',
                }}
              >
                {commentaire.length} caractère{commentaire.length !== 1 ? 's' : ''}{' '}
                {commentaire.trim().length >= 10 ? '✓' : '(10 min)'}
              </p>
            </div>
            <button
              type="submit"
              disabled={sending || note === 0 || commentaire.trim().length < 10}
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '.38rem',
                padding: '.55rem 1.2rem',
                borderRadius: 9,
                fontFamily: 'inherit',
                fontSize: '.82rem',
                fontWeight: 700,
                cursor:
                  sending || note === 0 || commentaire.trim().length < 10
                    ? 'not-allowed'
                    : 'pointer',
                opacity: sending || note === 0 || commentaire.trim().length < 10 ? 0.5 : 1,
                background: T.accentGrad,
                color: '#fff',
                border: 'none',
                boxShadow: '0 4px 14px rgba(45,158,107,.3)',
              }}
            >
              {sending ? 'Envoi…' : 'Envoyer mon avis'}
            </button>
          </form>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Avis de la communauté"
          icon={() => (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          )}
          action={
            <span style={{ color: T.textMuted, fontSize: '.75rem' }}>
              {feedbacksPublics.length} avis
            </span>
          }
        />
        {loading && (
          <p style={{ color: T.textMuted, textAlign: 'center', padding: '2rem' }}>Chargement…</p>
        )}
        {!loading && feedbacksPublics.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2.5rem' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: T.accentLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: T.accent,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <p style={{ color: T.textMuted, fontSize: '.88rem' }}>
              Aucun avis public pour l'instant.
            </p>
          </div>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
            gap: '1rem',
          }}
        >
          {feedbacksPublics.map((f, i) => {
            const pal = pals[i % pals.length];
            return (
              <div
                key={f._id || i}
                style={{
                  background: pal.bg,
                  border: `1.5px solid ${pal.border}`,
                  borderRadius: 14,
                  padding: '1.1rem',
                  transition: 'transform .18s,box-shadow .18s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = T.shadowMd;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '.65rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: T.accentGrad,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        color: '#fff',
                        fontSize: '.75rem',
                        flexShrink: 0,
                      }}
                    >
                      {f.nomAuteur
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) || '?'}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: T.text, fontSize: '.82rem' }}>
                        {f.nomAuteur || 'Anonyme'}
                      </p>
                      <p style={{ color: T.textMuted, fontSize: '.68rem' }}>
                        {f.roleAuteur === 'ETUDIANT' ? 'Étudiant' : 'Encadrant'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill={f.note >= s ? '#f59e0b' : 'none'}
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p
                  style={{
                    color: T.textSoft,
                    fontSize: '.82rem',
                    lineHeight: 1.65,
                    fontStyle: 'italic',
                  }}
                >
                  "{f.commentaire}"
                </p>
                <p style={{ color: T.textMuted, fontSize: '.7rem', marginTop: '.55rem' }}>
                  {f.createdAt
                    ? new Date(f.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : ''}
                </p>
                {f.reponseAdmin && (
                  <div
                    style={{
                      marginTop: '.65rem',
                      background: 'rgba(255,255,255,.7)',
                      borderRadius: 8,
                      padding: '.6rem .85rem',
                      border: `1px solid ${pal.border}`,
                    }}
                  >
                    <p
                      style={{
                        color: T.accent,
                        fontWeight: 700,
                        fontSize: '.72rem',
                        marginBottom: '.2rem',
                      }}
                    >
                      ↩ Réponse de l'équipe
                    </p>
                    <p style={{ color: T.textSoft, fontSize: '.78rem' }}>{f.reponseAdmin}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function PageNotifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/notifications')
      .then((r) => setNotifs(r.data || []))
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    setNotifs((prev) => prev.map((n) => (n._id === id ? { ...n, lu: true } : n)));
    try {
      await API.put(`/notifications/${id}/lue`);
    } catch {}
  };

  const markAll = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, lu: true })));
    try {
      await API.put('/notifications/toutes-lues');
    } catch {}
  };

  const unread = notifs.filter((n) => !n.lu).length;

  const TYPE_CFG = {
    SYSTEME: { c: T.accent, bg: T.accentLight },
    CANDIDATURE: { c: T.purple, bg: T.purpleLight },
    QUIZ: { c: '#d97706', bg: '#fef3c7' },
    INTERVIEW: { c: T.success, bg: T.successLight },
    REFUSE: { c: T.danger, bg: T.dangerLight },
    EVALUATION: { c: T.warning, bg: T.warningLight },
    TACHE: { c: T.accent, bg: T.accentLight },
  };

  return (
    <div>
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '.85rem',
            paddingBottom: '.7rem',
            borderBottom: `1px solid ${T.cardBorder}`,
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 700,
              fontSize: '.83rem',
              color: T.text,
            }}
          >
            <span style={{ color: T.accent }}>
              <I.bell />
            </span>{' '}
            Mes Notifications{' '}
            <span
              style={{
                background: T.accentLight,
                color: T.accent,
                borderRadius: 999,
                padding: '1px 8px',
                fontSize: '.7rem',
                fontWeight: 700,
              }}
            >
              {notifs.length}
            </span>
          </span>
          {unread > 0 && (
            <button
              onClick={markAll}
              style={{
                background: T.accentGrad,
                color: '#fff',
                border: 'none',
                padding: '.38rem .9rem',
                borderRadius: 8,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '.76rem',
                fontWeight: 700,
              }}
            >
              ✓ Tout marquer lu
            </button>
          )}
        </div>
        {loading && (
          <p style={{ color: T.textMuted, textAlign: 'center', padding: '2rem' }}>Chargement…</p>
        )}
        {!loading && notifs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: T.accentLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: T.accent,
              }}
            >
              <I.bell />
            </div>
            <p style={{ color: T.textMuted, fontSize: '.88rem' }}>
              Aucune notification pour l'instant.
            </p>
          </div>
        )}
        {notifs.map((n, i) => {
          const cfg = TYPE_CFG[n.type] || TYPE_CFG['SYSTEME'];
          return (
            <div
              key={n._id || i}
              onClick={() => !n.lu && markRead(n._id)}
              style={{
                display: 'flex',
                gap: '.85rem',
                alignItems: 'flex-start',
                padding: '.85rem 0',
                borderBottom: `1px solid ${T.cardBorder}`,
                cursor: n.lu ? 'default' : 'pointer',
                opacity: n.lu ? 0.75 : 1,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: cfg.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: cfg.c,
                  flexShrink: 0,
                }}
              >
                <I.bell />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontWeight: 700,
                    color: T.text,
                    fontSize: '.85rem',
                    marginBottom: '.2rem',
                  }}
                >
                  {n.titre}
                </p>
                <p style={{ color: T.textSoft, fontSize: '.78rem', lineHeight: 1.6 }}>
                  {n.contenu}
                </p>
                <p style={{ color: T.textMuted, fontSize: '.7rem', marginTop: '.3rem' }}>
                  {n.createdAt
                    ? new Date(n.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </p>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '.4rem',
                  flexShrink: 0,
                }}
              >
                {n.type && (
                  <Badge color={cfg.c} bg={cfg.bg}>
                    {n.type}
                  </Badge>
                )}
                {!n.lu && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.accent }} />
                )}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function PageMessages() {
  return <MessagerieePage />;
}

function CVUploaderInline({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [drag, setDrag] = useState(false);

  const upload = async () => {
    if (!file) return setMsg('Sélectionnez un fichier PDF');
    setUploading(true);
    setMsg('');
    const fd = new FormData();
    fd.append('cv', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/etudiants/upload-cv', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('CV uploadé avec succès !');
        setFile(null);
        onSuccess(data.cvUrl);
      } else setMsg('Erreur : ' + (data.message || 'Échec'));
    } catch {
      setMsg('Erreur de connexion');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files[0];
          if (f?.type === 'application/pdf') {
            setFile(f);
            setMsg('');
          } else setMsg('PDF uniquement');
        }}
        onClick={() => document.getElementById('cv-upload-spa').click()}
        style={{
          border: `2px dashed ${drag ? T.accent : T.cardBorder}`,
          borderRadius: 12,
          padding: '1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: drag ? T.accentLight : T.bg,
          transition: 'all .2s',
          marginBottom: '1rem',
        }}
      >
        <input
          id="cv-upload-spa"
          type="file"
          accept=".pdf,.doc,.docx"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files[0];
            if (f) {
              setFile(f);
              setMsg('');
            }
          }}
        />
        <div
          style={{
            color: T.accent,
            marginBottom: '.5rem',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
        </div>
        <p
          style={{
            color: file ? T.accent : T.textMuted,
            fontWeight: file ? 600 : 400,
            fontSize: '.85rem',
          }}
        >
          {file ? file.name : 'Glissez votre CV PDF ici ou cliquez'}
        </p>
        <p style={{ color: T.textMuted, fontSize: '.73rem', marginTop: '.25rem' }}>
          PDF uniquement — Max 10 MB
        </p>
      </div>
      {msg && (
        <div
          style={{
            padding: '.6rem .85rem',
            borderRadius: 8,
            fontSize: '.8rem',
            marginBottom: '.75rem',
            background: msg.includes('succès') ? T.successLight : T.dangerLight,
            color: msg.includes('succès') ? T.success : T.danger,
            fontWeight: 600,
          }}
        >
          {msg}
        </div>
      )}
      {file && (
        <button
          onClick={upload}
          disabled={uploading}
          style={{
            width: '100%',
            padding: '.6rem',
            borderRadius: 9,
            background: T.accentGrad,
            color: '#fff',
            border: 'none',
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: '.82rem',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? 'Upload en cours…' : 'Uploader mon CV'}
        </button>
      )}
    </div>
  );
}

function PageProfil({ user: usr, profilExtra, navigate }) {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('infos');
  const [projet, setProjet] = useState(null);
  const [candidatures, setCandidatures] = useState([]);
  const [certifs, setCertifs] = useState([
    {
      id: 1,
      titre: 'AWS Cloud Practitioner',
      emetteur: 'Amazon Web Services',
      date: '2024-03',
      valide: true,
      url: '#',
    },
    {
      id: 2,
      titre: 'React Developer Certificate',
      emetteur: 'Meta',
      date: '2024-01',
      valide: true,
      url: '#',
    },
    {
      id: 3,
      titre: 'Python for Data Science',
      emetteur: 'IBM',
      date: '2023-11',
      valide: true,
      url: '#',
    },
  ]);
  const [showAddCertif, setShowAddCertif] = useState(false);
  const [newCertif, setNewCertif] = useState({ titre: '', emetteur: '', date: '', url: '' });
  const [formData, setFormData] = useState({
    nom: usr?.nom || '',
    prenom: usr?.prenom || '',
    email: usr?.email || '',
    telephone: usr?.telephone || '',
  });
  const [extraData, setExtraData] = useState({
    filiere: profilExtra?.filiere || '',
    matricule: profilExtra?.matricule || '',
    niveau: profilExtra?.niveau || '',
    cvUrl: profilExtra?.cvUrl || '',
  });
  const [mdpData, setMdpData] = useState({ nouveau: '', confirmer: '' });
  const [voir1, setVoir1] = useState(false);
  const [voir2, setVoir2] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingMdp, setSavingMdp] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [mdpMsg, setMdpMsg] = useState({ text: '', type: '' });

  const { logout } = useAuth();

  // Pastels
  const PP = {
    p1: { bg: '#f0fdf4', border: '#bbf7d0', icon: '#16a34a', iconBg: '#dcfce7' },
    p2: { bg: '#eff6ff', border: '#bfdbfe', icon: '#2563eb', iconBg: '#dbeafe' },
    p3: { bg: '#fdf4ff', border: '#e9d5ff', icon: '#7c3aed', iconBg: '#ede9fe' },
    p4: { bg: '#fff7ed', border: '#fed7aa', icon: '#ea580c', iconBg: '#ffedd5' },
    p5: { bg: '#fdf2f8', border: '#fbcfe8', icon: '#db2777', iconBg: '#fce7f3' },
    p6: { bg: '#f0fdfa', border: '#99f6e4', icon: '#0d9488', iconBg: '#ccfbf1' },
  };

  useEffect(() => {
    API.get('/projets/mon-projet')
      .then((r) => setProjet(r.data))
      .catch(() => {});
    API.get('/candidatures/mes-candidatures')
      .then((r) => setCandidatures(r.data))
      .catch(() => {});
  }, []);

  const showMessage = (text, type, setter) => {
    setter({ text, type });
    setTimeout(() => setter({ text: '', type: '' }), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.put('/auth/profile', formData);
      login(data, localStorage.getItem('token'));
      if (usr?.role === 'ETUDIANT')
        await API.put('/etudiants/mon-profil', {
          filiere: extraData.filiere,
          matricule: extraData.matricule,
          niveau: extraData.niveau,
          cvUrl: extraData.cvUrl,
        });
      showMessage('Profil sauvegardé !', 'success', setMsg);
    } catch (err) {
      showMessage('Erreur : ' + (err.response?.data?.message || 'Erreur'), 'error', setMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleChangeMdp = async (e) => {
    e.preventDefault();
    if (mdpData.nouveau !== mdpData.confirmer)
      return showMessage('Mots de passe différents', 'error', setMdpMsg);
    if (mdpData.nouveau.length < 8) return showMessage('Minimum 8 caractères', 'error', setMdpMsg);
    setSavingMdp(true);
    try {
      await API.put('/auth/profile', { mot_de_passe: mdpData.nouveau });
      showMessage('Mot de passe changé !', 'success', setMdpMsg);
      setMdpData({ nouveau: '', confirmer: '' });
    } catch (err) {
      showMessage('Erreur : ' + (err.response?.data?.message || 'Erreur'), 'error', setMdpMsg);
    } finally {
      setSavingMdp(false);
    }
  };

  const iStyle = {
    width: '100%',
    padding: '.65rem .9rem',
    borderRadius: 9,
    border: `1.5px solid ${T.cardBorder}`,
    fontSize: '.85rem',
    outline: 'none',
    fontFamily: 'inherit',
    color: T.text,
    background: T.card,
    transition: 'border-color .18s',
  };
  const lStyle = {
    display: 'block',
    color: T.textSoft,
    fontSize: '.75rem',
    fontWeight: 700,
    marginBottom: '.3rem',
  };
  const initials = `${usr?.prenom?.[0] || ''}${usr?.nom?.[0] || ''}`.toUpperCase();
  const roleLabel = { ETUDIANT: 'Étudiant', ENCADRANT: 'Encadrant', ADMINISTRATEUR: 'Admin' };
  const candCfg = {
    EN_ATTENTE: { c: T.warning, bg: T.warningLight, l: 'En attente' },
    QUIZ_REQUIS: { c: T.purple, bg: T.purpleLight, l: 'Quiz requis' },
    INTERVIEW: { c: T.success, bg: T.successLight, l: 'Interview' },
    ACCEPTE: { c: T.success, bg: T.successLight, l: 'Accepté' },
    REFUSE: { c: T.danger, bg: T.dangerLight, l: 'Refusé' },
  };

  const TABS = [
    { id: 'infos', label: 'Informations', icon: I.user, pastel: PP.p1 },
    { id: 'certifs', label: 'Certifications', icon: I.award, pastel: PP.p3 },
    { id: 'cv', label: 'CV & Documents', icon: I.file, pastel: PP.p2 },
    {
      id: 'secu',
      label: 'Sécurité',
      icon: () => (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      pastel: PP.p4,
    },
  ];

  const MsgBox = ({ m }) =>
    m?.text ? (
      <div
        style={{
          padding: '.65rem .9rem',
          borderRadius: 9,
          marginBottom: '1rem',
          fontSize: '.82rem',
          fontWeight: 600,
          background: m.type === 'success' ? T.successLight : T.dangerLight,
          color: m.type === 'success' ? T.success : T.danger,
          border: `1px solid ${m.type === 'success' ? T.success : T.danger}40`,
          display: 'flex',
          alignItems: 'center',
          gap: '.4rem',
        }}
      >
        {m.type === 'success' ? '✓' : '⚠'} {m.text}
      </div>
    ) : null;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: T.text }}>
      {/* Hero */}
      <div
        style={{
          background: T.accentGrad,
          borderRadius: 14,
          padding: '1.5rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: 40,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255,255,255,.07)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(255,255,255,.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: '#fff',
            fontSize: '1.5rem',
            flexShrink: 0,
            border: '3px solid rgba(255,255,255,.25)',
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontWeight: 800, color: '#fff', fontSize: '1.2rem', marginBottom: '.2rem' }}>
            {usr?.prenom} {usr?.nom}
          </h2>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.82rem', marginBottom: '.4rem' }}>
            {usr?.email}
          </p>
          <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
            <span
              style={{
                background: 'rgba(255,255,255,.2)',
                color: '#fff',
                fontSize: '.7rem',
                fontWeight: 700,
                padding: '3px 12px',
                borderRadius: 100,
              }}
            >
              {roleLabel[usr?.role] || usr?.role}
            </span>
            {profilExtra?.niveau && (
              <span
                style={{
                  background: 'rgba(255,255,255,.15)',
                  color: 'rgba(255,255,255,.85)',
                  fontSize: '.7rem',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 100,
                }}
              >
                {profilExtra.niveau}
              </span>
            )}
            {profilExtra?.filiere && (
              <span
                style={{
                  background: 'rgba(255,255,255,.15)',
                  color: 'rgba(255,255,255,.85)',
                  fontSize: '.7rem',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 100,
                }}
              >
                {profilExtra.filiere}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '.6rem', flexShrink: 0 }}>
          {[
            { v: certifs.length, l: 'Certifs', bg: 'rgba(139,92,246,.25)', c: '#c4b5fd' },
            { v: candidatures.length, l: 'Candidatures', bg: 'rgba(59,130,246,.25)', c: '#93c5fd' },
            { v: projet ? 1 : 0, l: 'Projet', bg: 'rgba(16,185,129,.25)', c: '#6ee7b7' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                textAlign: 'center',
                padding: '.65rem .9rem',
                background: s.bg,
                borderRadius: 10,
                border: `1px solid ${s.c}40`,
              }}
            >
              <p style={{ fontWeight: 800, fontSize: '1.2rem', color: s.c, lineHeight: 1 }}>
                {s.v}
              </p>
              <p
                style={{ color: 'rgba(255,255,255,.55)', fontSize: '.62rem', marginTop: '.15rem' }}
              >
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '.35rem',
          marginBottom: '1rem',
          background: T.accentLight,
          borderRadius: 11,
          padding: '.3rem',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '.4rem',
              padding: '.6rem 1rem',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '.8rem',
              fontWeight: activeTab === tab.id ? 700 : 500,
              background: activeTab === tab.id ? tab.pastel.bg : 'transparent',
              color: activeTab === tab.id ? tab.pastel.icon : 'rgba(0,0,0,.5)',
              transition: 'all .15s',
            }}
          >
            <tab.icon /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Infos */}
      {activeTab === 'infos' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
          <div>
            <div
              style={{
                background: PP.p1.bg,
                borderRadius: 14,
                border: `1.5px solid ${PP.p1.border}`,
                padding: '1.1rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '.85rem',
                  color: T.text,
                  marginBottom: '.85rem',
                  paddingBottom: '.65rem',
                  borderBottom: `1px solid ${PP.p1.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    background: PP.p1.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: PP.p1.icon,
                  }}
                >
                  <I.user />
                </div>{' '}
                Informations
              </div>
              {[
                ['Nom', usr?.nom],
                ['Prénom', usr?.prenom],
                ['Email', usr?.email],
                ['Téléphone', usr?.telephone],
              ].map(([l, v]) => (
                <div
                  key={l}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '.55rem 0',
                    borderBottom: `1px solid ${PP.p1.border}`,
                  }}
                >
                  <span style={{ color: T.textMuted, fontSize: '.78rem' }}>{l}</span>
                  <span style={{ color: T.text, fontWeight: 600, fontSize: '.8rem' }}>
                    {v || '—'}
                  </span>
                </div>
              ))}
            </div>
            {profilExtra && (
              <div
                style={{
                  background: PP.p2.bg,
                  borderRadius: 14,
                  border: `1.5px solid ${PP.p2.border}`,
                  padding: '1.1rem',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '.85rem',
                    color: T.text,
                    marginBottom: '.85rem',
                    paddingBottom: '.65rem',
                    borderBottom: `1px solid ${PP.p2.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 7,
                      background: PP.p2.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: PP.p2.icon,
                    }}
                  >
                    <I.award />
                  </div>{' '}
                  Académique
                </div>
                {[
                  ['Matricule', profilExtra?.matricule],
                  ['Filière', profilExtra?.filiere],
                  ['Niveau', profilExtra?.niveau],
                  ['Statut PFE', profilExtra?.statutPFE?.replace(/_/g, ' ')],
                ].map(([l, v]) => (
                  <div
                    key={l}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '.55rem 0',
                      borderBottom: `1px solid ${PP.p2.border}`,
                    }}
                  >
                    <span style={{ color: T.textMuted, fontSize: '.78rem' }}>{l}</span>
                    <span style={{ color: T.text, fontWeight: 600, fontSize: '.8rem' }}>
                      {v || '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {candidatures.length > 0 && (
              <div
                style={{
                  background: PP.p5.bg,
                  borderRadius: 14,
                  border: `1.5px solid ${PP.p5.border}`,
                  padding: '1.1rem',
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '.85rem',
                    color: T.text,
                    marginBottom: '.85rem',
                    paddingBottom: '.65rem',
                    borderBottom: `1px solid ${PP.p5.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 7,
                      background: PP.p5.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: PP.p5.icon,
                    }}
                  >
                    <I.send />
                  </div>{' '}
                  Candidatures
                </div>
                {candidatures.slice(0, 3).map((c) => {
                  const sc = candCfg[c.statut] || { c: T.textMuted, bg: T.cardBorder, l: c.statut };
                  return (
                    <div
                      key={c._id}
                      style={{ padding: '.55rem 0', borderBottom: `1px solid ${PP.p5.border}` }}
                    >
                      <p
                        style={{
                          fontWeight: 600,
                          color: T.text,
                          fontSize: '.8rem',
                          marginBottom: '.2rem',
                        }}
                      >
                        {c.idSujet?.titre || 'Sujet PFE'}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ color: T.textMuted, fontSize: '.7rem' }}>
                          Score IA : <strong style={{ color: T.accent }}>{c.scoreIA}/100</strong>
                        </span>
                        <span
                          style={{
                            background: sc.bg,
                            color: sc.c,
                            padding: '.15rem .55rem',
                            borderRadius: 100,
                            fontSize: '.67rem',
                            fontWeight: 700,
                          }}
                        >
                          {sc.l}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            <div
              style={{
                background: T.card,
                borderRadius: 14,
                border: `1px solid ${T.cardBorder}`,
                padding: '1.25rem',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '.88rem',
                  color: T.text,
                  marginBottom: '1rem',
                  paddingBottom: '.75rem',
                  borderBottom: `1px solid ${T.cardBorder}`,
                }}
              >
                Modifier mes informations
              </div>
              <MsgBox m={msg} />
              <form
                onSubmit={handleSave}
                style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.85rem' }}>
                  <div>
                    <label style={lStyle}>Nom</label>
                    <input
                      style={iStyle}
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label style={lStyle}>Prénom</label>
                    <input
                      style={iStyle}
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      placeholder="Votre prénom"
                    />
                  </div>
                </div>
                <div>
                  <label style={lStyle}>Email</label>
                  <input
                    type="email"
                    style={iStyle}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label style={lStyle}>Téléphone</label>
                  <input
                    style={iStyle}
                    placeholder="+216 XX XXX XXX"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  />
                </div>
                {usr?.role === 'ETUDIANT' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.85rem' }}>
                      <div>
                        <label style={lStyle}>Filière</label>
                        <input
                          style={iStyle}
                          placeholder="Informatique"
                          value={extraData.filiere}
                          onChange={(e) => setExtraData({ ...extraData, filiere: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={lStyle}>Matricule</label>
                        <input
                          style={iStyle}
                          placeholder="2023001"
                          value={extraData.matricule}
                          onChange={(e) =>
                            setExtraData({ ...extraData, matricule: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label style={lStyle}>Niveau</label>
                      <select
                        style={iStyle}
                        value={extraData.niveau}
                        onChange={(e) => setExtraData({ ...extraData, niveau: e.target.value })}
                      >
                        <option value="">Choisir</option>
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
                <Btn type="submit" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                  {saving ? 'Sauvegarde…' : 'Sauvegarder'}
                </Btn>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab Certifications */}
      {activeTab === 'certifs' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <h2 style={{ fontWeight: 800, color: T.text, fontSize: '1rem' }}>Mes certifications</h2>
            <Btn onClick={() => setShowAddCertif(true)}>
              <I.plus /> Ajouter
            </Btn>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
              gap: '1rem',
            }}
          >
            {certifs.map((c, i) => {
              const pals = [PP.p1, PP.p2, PP.p3, PP.p4, PP.p5, PP.p6];
              const pal = pals[i % 6];
              return (
                <div
                  key={c.id}
                  style={{
                    background: pal.bg,
                    border: `1.5px solid ${pal.border}`,
                    borderRadius: 14,
                    padding: '1.1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '.85rem',
                    transition: 'transform .2s,box-shadow .2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = T.shadowMd;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 11,
                      background: pal.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: pal.icon,
                      fontWeight: 800,
                      fontSize: '.85rem',
                      flexShrink: 0,
                      border: `1.5px solid ${pal.border}`,
                    }}
                  >
                    {c.emetteur.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        fontWeight: 700,
                        color: T.text,
                        fontSize: '.85rem',
                        marginBottom: '.2rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {c.titre}
                    </h3>
                    <p
                      style={{
                        color: pal.icon,
                        fontSize: '.75rem',
                        fontWeight: 600,
                        marginBottom: '.25rem',
                      }}
                    >
                      {c.emetteur}
                    </p>
                    {c.date && (
                      <p style={{ color: T.textMuted, fontSize: '.7rem' }}>Obtenu : {c.date}</p>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.65rem',
                        marginTop: '.5rem',
                      }}
                    >
                      {c.valide && (
                        <span
                          style={{
                            background: pal.iconBg,
                            color: pal.icon,
                            padding: '.15rem .55rem',
                            borderRadius: 100,
                            fontSize: '.65rem',
                            fontWeight: 700,
                          }}
                        >
                          Vérifié ✓
                        </span>
                      )}
                      <button
                        onClick={() => setCertifs((prev) => prev.filter((x) => x.id !== c.id))}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: T.textMuted,
                          marginLeft: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {showAddCertif && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15,45,30,.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem',
              }}
            >
              <div
                style={{
                  background: T.card,
                  borderRadius: 16,
                  padding: '1.75rem',
                  width: '100%',
                  maxWidth: 460,
                  boxShadow: '0 24px 60px rgba(0,0,0,.2)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <h2 style={{ fontWeight: 800, color: T.text, fontSize: '1rem' }}>
                    Ajouter une certification
                  </h2>
                  <button
                    onClick={() => setShowAddCertif(false)}
                    style={{
                      background: T.bg,
                      border: 'none',
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: T.textSoft,
                    }}
                  >
                    <I.x />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                  <div>
                    <label style={lStyle}>Titre *</label>
                    <input
                      style={iStyle}
                      placeholder="AWS Cloud Practitioner"
                      value={newCertif.titre}
                      onChange={(e) => setNewCertif({ ...newCertif, titre: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={lStyle}>Émetteur *</label>
                    <input
                      style={iStyle}
                      placeholder="Amazon, Google, Meta…"
                      value={newCertif.emetteur}
                      onChange={(e) => setNewCertif({ ...newCertif, emetteur: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={lStyle}>Date</label>
                    <input
                      type="month"
                      style={iStyle}
                      value={newCertif.date}
                      onChange={(e) => setNewCertif({ ...newCertif, date: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '.75rem', marginTop: '.25rem' }}>
                    <Btn
                      variant="ghost"
                      onClick={() => setShowAddCertif(false)}
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Annuler
                    </Btn>
                    <Btn
                      onClick={() => {
                        if (!newCertif.titre || !newCertif.emetteur) return;
                        setCertifs((prev) => [
                          ...prev,
                          { id: Date.now(), ...newCertif, valide: true },
                        ]);
                        setNewCertif({ titre: '', emetteur: '', date: '', url: '' });
                        setShowAddCertif(false);
                      }}
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Ajouter
                    </Btn>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab CV & Documents */}
      {activeTab === 'cv' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div
            style={{
              background: PP.p2.bg,
              borderRadius: 14,
              border: `1.5px solid ${PP.p2.border}`,
              padding: '1.25rem',
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: '.88rem',
                color: T.text,
                marginBottom: '1rem',
                paddingBottom: '.75rem',
                borderBottom: `1px solid ${PP.p2.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 7,
                  background: PP.p2.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: PP.p2.icon,
                }}
              >
                <I.file />
              </div>{' '}
              Mon CV actuel
            </div>
            {profilExtra?.cvUrl || extraData.cvUrl ? (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: PP.p2.iconBg,
                    border: `1px solid ${PP.p2.border}`,
                    borderRadius: 10,
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: PP.p2.icon,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    <I.file />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: T.text, fontSize: '.85rem' }}>
                      CV disponible
                    </p>
                    <p style={{ color: T.textMuted, fontSize: '.72rem', marginTop: '.1rem' }}>
                      Votre CV est en ligne
                    </p>
                  </div>
                  <a
                    href={profilExtra?.cvUrl || extraData.cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: PP.p2.icon,
                      color: '#fff',
                      padding: '.45rem .9rem',
                      borderRadius: 8,
                      fontSize: '.78rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    Voir →
                  </a>
                </div>
                <p
                  style={{
                    color: T.textSoft,
                    fontSize: '.78rem',
                    fontWeight: 600,
                    marginBottom: '.75rem',
                  }}
                >
                  Remplacer le CV :
                </p>
                <CVUploaderInline
                  onSuccess={(url) => {
                    setExtraData((p) => ({ ...p, cvUrl: url }));
                    showMessage('CV mis à jour !', 'success', setMsg);
                  }}
                />
              </div>
            ) : (
              <div>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    background: T.bg,
                    borderRadius: 10,
                    marginBottom: '1rem',
                    border: `1px dashed ${PP.p2.border}`,
                  }}
                >
                  <div
                    style={{
                      color: PP.p2.icon,
                      marginBottom: '.5rem',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="16 16 12 12 8 16" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    </svg>
                  </div>
                  <p style={{ color: T.textMuted, fontSize: '.85rem' }}>Aucun CV uploadé</p>
                </div>
                <CVUploaderInline
                  onSuccess={(url) => {
                    setExtraData((p) => ({ ...p, cvUrl: url }));
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <div
              style={{
                background: PP.p6.bg,
                borderRadius: 14,
                border: `1.5px solid ${PP.p6.border}`,
                padding: '1.25rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '.88rem',
                  color: T.text,
                  marginBottom: '1rem',
                  paddingBottom: '.75rem',
                  borderBottom: `1px solid ${PP.p6.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    background: PP.p6.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: PP.p6.icon,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>{' '}
                Lien vers mon CV
              </div>
              <p
                style={{
                  color: T.textMuted,
                  fontSize: '.8rem',
                  lineHeight: 1.65,
                  marginBottom: '1rem',
                }}
              >
                Renseignez un lien vers votre CV sur Google Drive, Dropbox ou tout autre service.
              </p>
              <div>
                <label
                  style={{
                    display: 'block',
                    color: T.textSoft,
                    fontSize: '.75rem',
                    fontWeight: 700,
                    marginBottom: '.3rem',
                  }}
                >
                  URL du CV
                </label>
                <input
                  style={{
                    width: '100%',
                    padding: '.65rem .9rem',
                    borderRadius: 9,
                    border: `1.5px solid ${T.cardBorder}`,
                    fontSize: '.85rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                    color: T.text,
                    background: T.card,
                  }}
                  placeholder="https://drive.google.com/…"
                  value={extraData.cvUrl}
                  onChange={(e) => setExtraData({ ...extraData, cvUrl: e.target.value })}
                />
              </div>
              <Btn
                style={{ marginTop: '.75rem' }}
                onClick={async () => {
                  try {
                    await API.put('/etudiants/mon-profil', { cvUrl: extraData.cvUrl });
                    showMessage('Lien CV sauvegardé !', 'success', setMsg);
                  } catch {}
                }}
              >
                Sauvegarder le lien
              </Btn>
            </div>
            <div
              style={{
                background: PP.p4.bg,
                borderRadius: 14,
                border: `1.5px solid ${PP.p4.border}`,
                padding: '1.25rem',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '.88rem',
                  color: T.text,
                  marginBottom: '1rem',
                  paddingBottom: '.75rem',
                  borderBottom: `1px solid ${PP.p4.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    background: PP.p4.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: PP.p4.icon,
                  }}
                >
                  <I.award />
                </div>{' '}
                Conseils
              </div>
              <ul
                style={{
                  paddingLeft: '1.1rem',
                  color: T.textSoft,
                  fontSize: '.8rem',
                  lineHeight: 2.1,
                }}
              >
                <li>Utilisez un CV en format PDF</li>
                <li>Incluez vos compétences techniques</li>
                <li>Mentionnez vos projets personnels</li>
                <li>Ajoutez vos certifications</li>
                <li>Gardez votre CV à jour régulièrement</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab Sécurité */}
      {activeTab === 'secu' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div
            style={{
              background: PP.p4.bg,
              borderRadius: 14,
              border: `1.5px solid ${PP.p4.border}`,
              padding: '1.25rem',
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: '.88rem',
                color: T.text,
                marginBottom: '1.25rem',
              }}
            >
              Changer le mot de passe
            </div>
            <MsgBox m={mdpMsg} />
            <form
              onSubmit={handleChangeMdp}
              style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}
            >
              <div>
                <label style={lStyle}>Nouveau mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={voir1 ? 'text' : 'password'}
                    style={{ ...iStyle, paddingRight: '3rem' }}
                    placeholder="Minimum 8 caractères"
                    value={mdpData.nouveau}
                    onChange={(e) => setMdpData({ ...mdpData, nouveau: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setVoir1(!voir1)}
                    style={{
                      position: 'absolute',
                      right: '.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: T.textMuted,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {voir1 ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {mdpData.nouveau.length > 0 && (
                  <div style={{ marginTop: '.35rem' }}>
                    <div
                      style={{
                        height: 3,
                        borderRadius: 2,
                        background: T.cardBorder,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          borderRadius: 2,
                          transition: 'all .3s',
                          width:
                            mdpData.nouveau.length < 6
                              ? '30%'
                              : mdpData.nouveau.length < 10
                                ? '65%'
                                : '100%',
                          background:
                            mdpData.nouveau.length < 6
                              ? T.danger
                              : mdpData.nouveau.length < 10
                                ? T.warning
                                : T.success,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: '.68rem',
                        color:
                          mdpData.nouveau.length < 6
                            ? T.danger
                            : mdpData.nouveau.length < 10
                              ? T.warning
                              : T.success,
                        fontWeight: 600,
                      }}
                    >
                      {mdpData.nouveau.length < 6
                        ? 'Faible'
                        : mdpData.nouveau.length < 10
                          ? 'Moyen'
                          : 'Fort'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label style={lStyle}>Confirmer</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={voir2 ? 'text' : 'password'}
                    style={{
                      ...iStyle,
                      paddingRight: '3rem',
                      borderColor:
                        mdpData.confirmer && mdpData.nouveau !== mdpData.confirmer
                          ? T.danger
                          : undefined,
                    }}
                    placeholder="Répétez le mot de passe"
                    value={mdpData.confirmer}
                    onChange={(e) => setMdpData({ ...mdpData, confirmer: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setVoir2(!voir2)}
                    style={{
                      position: 'absolute',
                      right: '.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: T.textMuted,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {voir2 ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {mdpData.confirmer && mdpData.nouveau !== mdpData.confirmer && (
                  <p style={{ color: T.danger, fontSize: '.72rem', marginTop: '.25rem' }}>
                    Ne correspondent pas
                  </p>
                )}
              </div>
              <Btn type="submit" disabled={savingMdp} style={{ alignSelf: 'flex-start' }}>
                {savingMdp ? 'Changement…' : 'Changer le mot de passe'}
              </Btn>
            </form>
          </div>
          <div
            style={{
              background: '#fffbfb',
              borderRadius: 14,
              border: `1.5px solid ${T.danger}40`,
              padding: '1.25rem',
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: '.88rem',
                color: T.danger,
                marginBottom: '.65rem',
              }}
            >
              ⚠ Zone dangereuse
            </div>
            <p
              style={{
                color: T.textMuted,
                fontSize: '.8rem',
                lineHeight: 1.7,
                marginBottom: '1.1rem',
              }}
            >
              La suppression est définitive et irréversible.
            </p>
            {!showDelete ? (
              <Btn variant="danger" onClick={() => setShowDelete(true)}>
                Supprimer mon compte
              </Btn>
            ) : (
              <div
                style={{
                  background: T.dangerLight,
                  border: `1px solid ${T.danger}40`,
                  borderRadius: 10,
                  padding: '1rem',
                }}
              >
                <p
                  style={{
                    color: T.danger,
                    fontWeight: 700,
                    fontSize: '.85rem',
                    marginBottom: '1rem',
                  }}
                >
                  Êtes-vous sûr ? Action irréversible.
                </p>
                <div style={{ display: 'flex', gap: '.65rem', flexWrap: 'wrap' }}>
                  <Btn
                    variant="danger"
                    onClick={() => {
                      logout();
                    }}
                  >
                    {' '}
                    Oui, supprimer
                  </Btn>
                  <Btn variant="ghost" onClick={() => setShowDelete(false)}>
                    Annuler
                  </Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── PAGES EXISTANTES ───────────────────────────────────────

function PageAccueil({ user, profilExtra, taches, candidatures, evaluations, goTo }) {
  const done = taches.filter((t) => t.statutTache === 'TERMINEE').length;
  const prog = taches.length > 0 ? Math.round((done / taches.length) * 100) : 0;
  const afaire = taches.filter((t) => t.statutTache === 'A_FAIRE').length;
  const tStatCfg = {
    TERMINEE: { c: T.success, bg: T.successLight, l: 'Terminée' },
    EN_COURS: { c: T.accent, bg: T.accentLight, l: 'En cours' },
    A_FAIRE: { c: T.warning, bg: T.warningLight, l: 'À faire' },
  };
  const candCfg = {
    EN_ATTENTE: { c: T.warning, bg: T.warningLight, l: 'En attente' },
    QUIZ_REQUIS: { c: T.purple, bg: T.purpleLight, l: 'Quiz requis' },
    INTERVIEW: { c: T.success, bg: T.successLight, l: 'Interview' },
    ACCEPTE: { c: T.success, bg: T.successLight, l: 'Accepté' },
    REFUSE: { c: T.danger, bg: T.dangerLight, l: 'Refusé' },
  };
  return (
    <div>
      <div
        style={{
          background: T.accentGrad,
          borderRadius: 16,
          padding: '1.75rem 2rem',
          marginBottom: '1.3rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(45,158,107,.25)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: 120,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(255,255,255,.07)',
            pointerEvents: 'none',
          }}
        />
        <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.8rem', marginBottom: '.2rem' }}>
          Bonjour 👋
        </p>
        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem', marginBottom: '.18rem' }}>
          {user?.prenom} {user?.nom}
        </h2>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.8rem', marginBottom: '1rem' }}>
          Statut :{' '}
          <strong style={{ color: '#fde68a' }}>
            {profilExtra?.statutPFE?.replace(/_/g, ' ') || 'Non affecté'}
          </strong>
        </p>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Mon Projet', id: 'projet' },
            { label: 'Mes Tâches', id: 'taches' },
            { label: 'Candidatures', id: 'candidatures' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => goTo(item.id)}
              style={{
                background: 'rgba(255,255,255,.18)',
                border: '1px solid rgba(255,255,255,.28)',
                borderRadius: 999,
                padding: '5px 14px',
                fontSize: '.73rem',
                fontWeight: 700,
                color: '#fff',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div
          style={{
            position: 'absolute',
            right: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: 0.12,
          }}
        >
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3.33 2 8.67 2 12 0v-5" />
          </svg>
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))',
          gap: '.85rem',
          marginBottom: '1.3rem',
        }}
      >
        <StatCard
          icon={I.progress}
          value={`${prog}%`}
          label="Progression"
          color={T.success}
          bg={T.successLight}
          sub={`${done}/${taches.length} tâches`}
        />
        <StatCard
          icon={I.send}
          value={candidatures.length}
          label="Candidatures"
          color={T.purple}
          bg={T.purpleLight}
          sub="soumises"
        />
        <StatCard
          icon={I.check}
          value={taches.length}
          label="Tâches"
          color={T.accent}
          bg={T.accentLight}
          sub={`${afaire} à faire`}
        />
        <StatCard
          icon={I.award}
          value={evaluations.length}
          label="Évaluations"
          color={T.warning}
          bg={T.warningLight}
        />
      </div>
      <Card>
        <CardHeader
          title="Avancement PFE"
          icon={I.progress}
          action={
            <span style={{ fontWeight: 800, color: T.accent, fontSize: '1.1rem' }}>{prog}%</span>
          }
        />
        <p style={{ color: T.textMuted, fontSize: '.75rem', marginBottom: '.75rem' }}>
          {done}/{taches.length} tâches terminées
        </p>
        <Progress
          value={prog}
          color={T.accentGrad}
          label="Tâches"
          count={`${done}/${taches.length}`}
        />
        {taches.length > 0 && (
          <>
            <Progress
              value={
                (taches.filter((t) => t.statutTache === 'EN_COURS').length / taches.length) * 100
              }
              color={T.accent}
              label="En cours"
              count={taches.filter((t) => t.statutTache === 'EN_COURS').length}
            />
            <Progress
              value={(afaire / taches.length) * 100}
              color={T.warning}
              label="À faire"
              count={afaire}
            />
          </>
        )}
      </Card>
      <Card>
        <CardHeader
          title="Tâches récentes"
          icon={I.check}
          action={
            <button
              onClick={() => goTo('taches')}
              style={{
                color: T.accent,
                fontSize: '.76rem',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Voir tout →
            </button>
          }
        />
        {taches.slice(0, 4).map((t, i) => {
          const pal = TASK_PAL[i % 4];
          const ts = tStatCfg[t.statutTache] || {
            c: T.textMuted,
            bg: T.cardBorder,
            l: t.statutTache,
          };
          return (
            <div
              key={t._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '.75rem',
                padding: '.68rem .8rem',
                background: pal.bg,
                borderRadius: 8,
                marginBottom: '.35rem',
                border: `1.5px solid ${pal.border}`,
              }}
            >
              <div
                style={{
                  width: 17,
                  height: 17,
                  borderRadius: 4,
                  border:
                    t.statutTache === 'TERMINEE' ? `2px solid #16a34a` : `2px solid ${pal.dot}`,
                  background: t.statutTache === 'TERMINEE' ? '#16a34a' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {t.statutTache === 'TERMINEE' && (
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span
                style={{
                  flex: 1,
                  color: t.statutTache === 'TERMINEE' ? T.textMuted : T.text,
                  fontSize: '.82rem',
                  fontWeight: 500,
                  textDecoration: t.statutTache === 'TERMINEE' ? 'line-through' : 'none',
                }}
              >
                {t.titre}
              </span>
              <Badge color={ts.c} bg={ts.bg}>
                {ts.l}
              </Badge>
            </div>
          );
        })}
        {taches.length === 0 && (
          <p
            style={{ color: T.textMuted, fontSize: '.82rem', textAlign: 'center', padding: '1rem' }}
          >
            Aucune tâche assignée.
          </p>
        )}
      </Card>
      {candidatures.length > 0 && (
        <Card>
          <CardHeader
            title="Mes candidatures"
            icon={I.send}
            action={
              <button
                onClick={() => goTo('candidatures')}
                style={{
                  color: T.accent,
                  fontSize: '.76rem',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Voir tout →
              </button>
            }
          />
          {candidatures.slice(0, 3).map((c) => {
            const sc = candCfg[c.statut] || { c: T.textMuted, bg: T.cardBorder, l: c.statut };
            return (
              <div
                key={c._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '.7rem .8rem',
                  background: T.bg,
                  borderRadius: 8,
                  marginBottom: '.35rem',
                  border: `1px solid ${T.cardBorder}`,
                }}
              >
                <div>
                  <p style={{ fontWeight: 600, color: T.text, fontSize: '.82rem' }}>
                    {c.idSujet?.titre || 'Sujet PFE'}
                  </p>
                  <p style={{ color: T.textMuted, fontSize: '.71rem', marginTop: '.1rem' }}>
                    Score IA : <strong style={{ color: T.accent }}>{c.scoreIA}/100</strong>
                  </p>
                </div>
                <Badge color={sc.c} bg={sc.bg}>
                  {sc.l}
                </Badge>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

function PageProjet({ projet, navigate }) {
  if (!projet)
    return (
      <Card style={{ textAlign: 'center', padding: '3rem' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: T.accentLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: T.accent,
          }}
        >
          <I.folder />
        </div>
        <p style={{ fontWeight: 700, color: T.text, fontSize: '.95rem', marginBottom: '.4rem' }}>
          Pas encore de projet PFE
        </p>
        <p style={{ color: T.textMuted, fontSize: '.83rem', marginBottom: '1.25rem' }}>
          Soumettez une candidature pour un sujet PFE.
        </p>
        <Btn onClick={() => navigate('/sujets')}>Voir les sujets PFE</Btn>
      </Card>
    );
  return (
    <div>
      <Card>
        <CardHeader title="Détails du projet" icon={I.folder} />
        <h3 style={{ fontWeight: 800, color: T.text, fontSize: '1.05rem', marginBottom: '.5rem' }}>
          {projet.titre || projet.idSujet?.titre}
        </h3>
        <p style={{ color: T.textSoft, fontSize: '.85rem', lineHeight: 1.7, marginBottom: '1rem' }}>
          {projet.idSujet?.description}
        </p>
        <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {projet.idSujet?.technologies?.map((t, i) => (
            <Badge key={i} color={T.accent} bg={T.accentLight}>
              {t}
            </Badge>
          ))}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))',
            gap: '.75rem',
          }}
        >
          {[
            { l: 'Statut', v: projet.statutProjet },
            {
              l: 'Début',
              v: projet.dateDebut ? new Date(projet.dateDebut).toLocaleDateString('fr-FR') : '—',
            },
            {
              l: 'Fin',
              v: projet.dateFin ? new Date(projet.dateFin).toLocaleDateString('fr-FR') : '—',
            },
          ].map((item) => (
            <div
              key={item.l}
              style={{
                background: T.bg,
                borderRadius: 9,
                padding: '.85rem',
                textAlign: 'center',
                border: `1px solid ${T.cardBorder}`,
              }}
            >
              <p style={{ color: T.textMuted, fontSize: '.7rem', marginBottom: '.3rem' }}>
                {item.l}
              </p>
              <p style={{ fontWeight: 700, color: T.text, fontSize: '.82rem' }}>{item.v || '—'}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PageTaches({ taches, onRefresh }) {
  const [selTache, setSelTache] = useState(null);
  const [saving, setSaving] = useState(false);
  const [localMsg, setLocalMsg] = useState('');
  const done = taches.filter((t) => t.statutTache === 'TERMINEE').length;
  const enCours = taches.filter((t) => t.statutTache === 'EN_COURS').length;
  const afaire = taches.filter((t) => t.statutTache === 'A_FAIRE').length;
  const changerStatut = async (tache, statut) => {
    setSaving(true);
    try {
      await API.put('/taches/' + tache._id + '/statut', { statutTache: statut });
      setLocalMsg(
        statut === 'TERMINEE'
          ? 'Tâche terminée ! Votre encadrant a été notifié.'
          : 'Tâche démarrée.'
      );
      setTimeout(() => setLocalMsg(''), 3500);
      setSelTache(null);
      if (onRefresh) onRefresh();
    } catch {
      setLocalMsg('Erreur lors de la mise à jour.');
      setTimeout(() => setLocalMsg(''), 3000);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div>
      {localMsg && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '.65rem 1rem',
            borderRadius: 10,
            background: '#DCFCE7',
            border: '1px solid #86EFAC',
            color: '#166534',
            fontSize: '.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#166534"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {localMsg}
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))',
          gap: '.85rem',
          marginBottom: '1.3rem',
        }}
      >
        {[
          { l: 'À faire', n: afaire, c: '#6B21A8', bg: '#F3E8FF' },
          { l: 'En cours', n: enCours, c: '#92400E', bg: '#FEF3C7' },
          { l: 'Terminées', n: done, c: '#166534', bg: '#DCFCE7' },
        ].map((s) => (
          <div
            key={s.l}
            style={{
              background: s.bg,
              borderRadius: 13,
              padding: '1rem',
              textAlign: 'center',
              border: `1px solid ${T.cardBorder}`,
              boxShadow: T.shadow,
            }}
          >
            <p style={{ fontWeight: 800, fontSize: '1.9rem', color: s.c, lineHeight: 1 }}>{s.n}</p>
            <p
              style={{
                color: T.textSoft,
                fontSize: '.78rem',
                fontWeight: 500,
                marginTop: '.25rem',
              }}
            >
              {s.l}
            </p>
          </div>
        ))}
      </div>
      <Card>
        <CardHeader title="Toutes les tâches" icon={I.check} />
        {taches.length === 0 && (
          <p
            style={{ color: T.textMuted, fontSize: '.82rem', textAlign: 'center', padding: '2rem' }}
          >
            Aucune tâche assignée.
          </p>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))',
            gap: '.85rem',
          }}
        >
          {taches.map((t, i) => {
            const pal = TASK_PAL[i % 4];
            const sc = STATUT_CFG[t.statutTache] || STATUT_CFG.A_FAIRE;
            const dl = t.dateLimite
              ? Math.ceil((new Date(t.dateLimite) - new Date()) / 86400000)
              : null;
            const isTerminee = t.statutTache === 'TERMINEE';
            return (
              <div
                key={t._id}
                style={{
                  background: pal.bg,
                  border: `1.5px solid ${pal.border}`,
                  borderRadius: 12,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'transform .15s,box-shadow .15s',
                  opacity: isTerminee ? 0.8 : 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
                onClick={() => setSelTache({ tache: t, pal, sc })}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: isTerminee ? '#16a34a' : pal.dot,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: pal.text,
                        textTransform: 'uppercase',
                        letterSpacing: '.05em',
                      }}
                    >
                      Tâche
                    </span>
                  </div>
                  <span
                    style={{
                      background: sc.bg,
                      color: sc.c,
                      border: `1px solid ${sc.border}`,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 999,
                    }}
                  >
                    {sc.l}
                  </span>
                </div>
                <p
                  style={{
                    fontWeight: 700,
                    color: isTerminee ? T.textMuted : '#1e293b',
                    fontSize: '.84rem',
                    marginBottom: 6,
                    textDecoration: isTerminee ? 'line-through' : 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.titre}
                </p>
                {dl !== null && !isTerminee && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: '.7rem',
                      fontWeight: 700,
                      color: dl <= 0 ? '#dc2626' : dl <= 3 ? '#d97706' : pal.text,
                      marginBottom: 8,
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>
                      {dl <= 0 ? 'Délai dépassé' : dl === 1 ? 'Demain' : `Limite J-${dl}`}
                    </span>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 8,
                    padding: '6px 10px',
                    background: 'rgba(255,255,255,.6)',
                    borderRadius: 8,
                    border: `1px solid ${pal.border}`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isTerminee) changerStatut(t, 'TERMINEE');
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      border: isTerminee ? `2px solid #16a34a` : `2px solid ${pal.dot}`,
                      background: isTerminee ? '#16a34a' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      cursor: isTerminee ? 'default' : 'pointer',
                      transition: 'all .2s',
                    }}
                  >
                    {isTerminee && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="3"
                        strokeLinecap="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '.73rem',
                      fontWeight: 600,
                      color: isTerminee ? '#16a34a' : pal.text,
                      cursor: isTerminee ? 'default' : 'pointer',
                    }}
                  >
                    {isTerminee ? 'Terminée ✓' : 'Marquer terminée'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      {selTache &&
        (() => {
          const { tache: t, pal, sc } = selTache;
          const isTerminee = t.statutTache === 'TERMINEE';
          const dl = t.dateLimite
            ? Math.ceil((new Date(t.dateLimite) - new Date()) / 86400000)
            : null;
          return (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15,23,42,.55)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 200,
                padding: '1rem',
              }}
              onClick={(e) => e.target === e.currentTarget && setSelTache(null)}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: 480,
                  background: '#fff',
                  borderRadius: 18,
                  overflow: 'hidden',
                  boxShadow: '0 24px 64px rgba(0,0,0,.2)',
                }}
              >
                <div
                  style={{
                    background: pal.bg,
                    padding: '1.2rem 1.4rem',
                    borderBottom: `1px solid ${pal.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <span
                      style={{
                        background: sc.bg,
                        color: sc.c,
                        border: `1px solid ${sc.border}`,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        marginBottom: 6,
                        display: 'inline-block',
                      }}
                    >
                      {sc.l}
                    </span>
                    <h3
                      style={{
                        fontWeight: 800,
                        fontSize: '1rem',
                        color: '#1e293b',
                        lineHeight: 1.35,
                      }}
                    >
                      {t.titre}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelTache(null)}
                    style={{
                      background: 'rgba(0,0,0,.08)',
                      border: 'none',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                    }}
                  >
                    <I.x />
                  </button>
                </div>
                <div style={{ padding: '1.25rem 1.4rem' }}>
                  {t.description && (
                    <p
                      style={{
                        color: '#475569',
                        fontSize: '.87rem',
                        lineHeight: 1.7,
                        marginBottom: '1rem',
                      }}
                    >
                      {t.description}
                    </p>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      marginBottom: '1.25rem',
                    }}
                  >
                    {t.dateDebut && (
                      <div
                        style={{
                          background: '#f8fafc',
                          borderRadius: 9,
                          padding: '8px 12px',
                          fontSize: '.82rem',
                          color: '#1e293b',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <strong>Date de début :</strong>{' '}
                        {new Date(t.dateDebut).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </div>
                    )}
                    {t.dateLimite && (
                      <div
                        style={{
                          background: dl <= 0 ? '#FEF2F2' : '#f8fafc',
                          borderRadius: 9,
                          padding: '8px 12px',
                          fontSize: '.82rem',
                          color: dl <= 0 ? '#dc2626' : '#1e293b',
                          border: `1px solid ${dl <= 0 ? '#fecaca' : '#e2e8f0'}`,
                        }}
                      >
                        <strong>Date limite :</strong>{' '}
                        {new Date(t.dateLimite).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                        {dl !== null && !isTerminee && (
                          <span style={{ fontWeight: 700, marginLeft: 8 }}>
                            ({dl <= 0 ? 'dépassée' : dl === 1 ? 'demain' : `J-${dl}`})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {!isTerminee && t.statutTache === 'A_FAIRE' && (
                      <button
                        disabled={saving}
                        onClick={() => changerStatut(t, 'EN_COURS')}
                        style={{
                          padding: '.75rem',
                          borderRadius: 10,
                          border: `1.5px solid ${pal.border}`,
                          background: pal.bg,
                          color: pal.text,
                          fontFamily: 'inherit',
                          fontWeight: 700,
                          fontSize: '.87rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        Démarrer cette tâche
                      </button>
                    )}
                    {!isTerminee && (
                      <button
                        disabled={saving}
                        onClick={() => changerStatut(t, 'TERMINEE')}
                        style={{
                          padding: '.75rem',
                          borderRadius: 10,
                          border: '1.5px solid #86EFAC',
                          background: '#DCFCE7',
                          color: '#166534',
                          fontFamily: 'inherit',
                          fontWeight: 700,
                          fontSize: '.87rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#166534"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {saving ? 'Enregistrement…' : 'Confirmer la finalisation'}
                      </button>
                    )}
                    {isTerminee && (
                      <div
                        style={{
                          padding: '.75rem',
                          borderRadius: 10,
                          background: '#DCFCE7',
                          border: '1.5px solid #86EFAC',
                          color: '#166534',
                          fontWeight: 700,
                          fontSize: '.87rem',
                          textAlign: 'center',
                        }}
                      >
                        Tâche terminée — Votre encadrant a été notifié.
                      </div>
                    )}
                    <button
                      onClick={() => setSelTache(null)}
                      style={{
                        padding: '.7rem',
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        background: 'transparent',
                        color: '#64748b',
                        fontFamily: 'inherit',
                        fontSize: '.87rem',
                        cursor: 'pointer',
                      }}
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}

function PageCandidatures({ candidatures, navigate }) {
  const candCfg = {
    EN_ATTENTE: { c: T.warning, bg: T.warningLight, l: 'En attente' },
    QUIZ_REQUIS: { c: T.purple, bg: T.purpleLight, l: 'Quiz requis' },
    INTERVIEW: { c: T.success, bg: T.successLight, l: 'Interview' },
    ACCEPTE: { c: T.success, bg: T.successLight, l: 'Accepté' },
    REFUSE: { c: T.danger, bg: T.dangerLight, l: 'Refusé' },
  };
  if (candidatures.length === 0)
    return (
      <Card style={{ textAlign: 'center', padding: '3rem' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: T.accentLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: T.accent,
          }}
        >
          <I.send />
        </div>
        <p style={{ color: T.textMuted, fontSize: '.9rem' }}>Aucune candidature soumise.</p>
      </Card>
    );
  return (
    <div>
      {candidatures.map((c) => {
        const sc = candCfg[c.statut] || { c: T.textMuted, bg: T.cardBorder, l: c.statut };
        return (
          <Card key={c._id}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '.75rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontWeight: 700,
                    color: T.text,
                    fontSize: '.88rem',
                    marginBottom: '.2rem',
                  }}
                >
                  {c.idSujet?.titre || 'Sujet PFE'}
                </p>
                <p style={{ color: T.textMuted, fontSize: '.73rem' }}>
                  Score IA : <strong style={{ color: T.accent }}>{c.scoreIA}/100</strong>
                </p>
              </div>
              <Badge color={sc.c} bg={sc.bg}>
                {sc.l}
              </Badge>
            </div>
            {c.statut === 'QUIZ_REQUIS' && (
              <div
                style={{
                  background: T.purpleLight,
                  borderRadius: 9,
                  padding: '.65rem .85rem',
                  marginTop: '.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <p style={{ fontWeight: 700, color: T.purple, fontSize: '.8rem' }}>
                    Quiz disponible !
                  </p>
                  <p style={{ color: '#6d28d9', fontSize: '.72rem' }}>
                    Passez le quiz pour continuer
                  </p>
                </div>
                <Btn variant="purple" onClick={() => navigate(`/quiz/${c._id}`)}>
                  Passer le quiz →
                </Btn>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function PageEvaluations({ evaluations }) {
  if (evaluations.length === 0)
    return (
      <Card style={{ textAlign: 'center', padding: '3rem' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: T.accentLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: T.accent,
          }}
        >
          <I.award />
        </div>
        <p style={{ fontWeight: 700, color: T.text, fontSize: '.9rem', marginBottom: '.4rem' }}>
          Aucune évaluation disponible
        </p>
        <p style={{ color: T.textMuted, fontSize: '.8rem' }}>
          Votre encadrant saisira votre note après la soutenance.
        </p>
      </Card>
    );
  return (
    <div>
      {evaluations.map((ev) => {
        const cfg =
          ev.note >= 16
            ? { c: T.success, bg: T.successLight }
            : ev.note >= 14
              ? { c: T.accent, bg: T.accentLight }
              : ev.note >= 12
                ? { c: T.warning, bg: T.warningLight }
                : { c: T.danger, bg: T.dangerLight };
        return (
          <Card key={ev._id}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontWeight: 700,
                    color: T.text,
                    fontSize: '.95rem',
                    marginBottom: '.3rem',
                  }}
                >
                  {ev.idProjet?.titre || 'Projet PFE'}
                </p>
                <p style={{ color: T.textMuted, fontSize: '.75rem' }}>
                  Encadrant : {ev.idEncadrant?.utilisateur?.prenom}{' '}
                  {ev.idEncadrant?.utilisateur?.nom}
                </p>
                {ev.observations && (
                  <p
                    style={{
                      color: T.textSoft,
                      fontSize: '.82rem',
                      lineHeight: 1.6,
                      marginTop: '.55rem',
                      background: T.bg,
                      borderRadius: 8,
                      padding: '6px 9px',
                      border: `1px solid ${T.cardBorder}`,
                    }}
                  >
                    {ev.observations}
                  </p>
                )}
              </div>
              <div
                style={{
                  textAlign: 'center',
                  background: cfg.bg,
                  border: `2px solid ${cfg.c}`,
                  borderRadius: 14,
                  padding: '.85rem 1.25rem',
                  minWidth: 90,
                  flexShrink: 0,
                }}
              >
                <p style={{ fontWeight: 800, fontSize: '1.9rem', color: cfg.c, lineHeight: 1 }}>
                  {ev.note}
                </p>
                <p style={{ color: cfg.c, fontSize: '.72rem', fontWeight: 700 }}>/20</p>
                <p
                  style={{ fontWeight: 700, color: cfg.c, fontSize: '.7rem', marginTop: '.25rem' }}
                >
                  {ev.mention}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function PubPopup({ pub, onClose }) {
  const tagCfg = {
    ANNONCE: { bg: T.accentLight, c: T.accent, label: 'Annonce' },
    RESSOURCE: { bg: T.purpleLight, c: T.purple, label: 'Ressource' },
    CALENDRIER: { bg: T.warningLight, c: T.warning, label: 'Calendrier' },
  };
  const tag = tagCfg[pub.type] || tagCfg['ANNONCE'];
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => e.currentTarget === e.target && onClose(pub)}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 18,
          width: '100%',
          maxWidth: 500,
          boxShadow: '0 24px 64px rgba(0,0,0,.2)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <button
          onClick={() => onClose(pub)}
          style={{
            position: 'absolute',
            top: '.85rem',
            right: '.85rem',
            background: 'rgba(0,0,0,.07)',
            border: 'none',
            width: 28,
            height: 28,
            borderRadius: '50%',
            cursor: 'pointer',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <I.x />
        </button>
        <div
          style={{
            padding: '1.4rem 1.6rem 1rem',
            background: tag.bg,
            borderBottom: `1px solid ${tag.c}30`,
          }}
        >
          <span
            style={{
              fontSize: '.7rem',
              fontWeight: 700,
              color: tag.c,
              textTransform: 'uppercase',
              letterSpacing: '.07em',
            }}
          >
            {tag.label}
          </span>
          <h3
            style={{
              fontWeight: 800,
              fontSize: '1.05rem',
              color: T.text,
              marginTop: '.35rem',
              lineHeight: 1.35,
            }}
          >
            {pub.titre}
          </h3>
          <p style={{ color: T.textMuted, fontSize: '.71rem', marginTop: '.25rem' }}>
            Publié le{' '}
            {new Date(pub.datePublication || pub.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div style={{ padding: '1.2rem 1.6rem 1.5rem' }}>
          <p style={{ color: '#475569', fontSize: '.87rem', lineHeight: 1.75 }}>{pub.contenu}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.1rem' }}>
            <Btn onClick={() => onClose(pub)}>J'ai compris ✓</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MODAL POSTULATION
// ══════════════════════════════════════════════════════════════
function ModalPostulation({ sujet, onClose, onSuccess, sujets }) {
  const [lettre, setLettre] = useState('');
  const [lettreMode, setLettreMode] = useState('texte'); // 'texte' | 'fichier'
  const [lettreFile, setLettreFile] = useState(null);
  const [lettreFileUrl, setLettreFileUrl] = useState('');
  const [lettreFileName, setLettreFileName] = useState('');
  const [uploadingLettre, setUploadingLettre] = useState(false);
  const [sujetFile, setSujetFile] = useState(null);
  const [sujetFileUrl, setSujetFileUrl] = useState('');
  const [sujetFileName, setSujetFileName] = useState('');
  const [uploadingSujet, setUploadingSujet] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [cvUrl, setCvUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [modalSujetReco, setModalSujetReco] = useState(null);

  const T = {
    accent: '#40916c',
    accentLight: '#d8f3dc',
    accentGrad: 'linear-gradient(135deg,#40916c,#52b788)',
    bg: '#f8fffe',
    card: '#fff',
    cardBorder: '#d8f3dc',
    text: '#1b4332',
    textSoft: '#40916c',
    textMuted: '#95d5b2',
    danger: '#dc2626',
    dangerLight: '#fee2e2',
    success: '#059669',
    successLight: '#d1fae5',
  };

  const decisionStyle = (d) =>
    ({
      QUIZ_REQUIS: { bg: '#fef3c7', color: '#92400e', label: 'Quiz requis' },
      INTERVIEW: { bg: '#dbeafe', color: '#1e40af', label: 'Entretien' },
      ACCEPTE: { bg: T.successLight, color: T.success, label: 'Accepté' },
      REFUSE: { bg: T.dangerLight, color: T.danger, label: 'Refusé' },
    })[d] || { bg: T.accentLight, color: T.accent, label: d };

  const ALLOWED_DOC_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const ALLOWED_DOC_LABEL = 'PDF, DOC, DOCX · max 10 MB';

  const handleCvChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      setError('Le CV doit être en format PDF, DOC ou DOCX');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Le CV ne doit pas dépasser 10 MB');
      return;
    }
    setCvFile(file);
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('cv', file);
      const res = await API.post('/etudiants/upload-cv', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCvUrl(res.data.cvUrl);
    } catch {
      setError("Erreur lors de l'upload du CV. Réessayez.");
      setCvFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSujetFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      setError('Le sujet doit être PDF, DOC ou DOCX');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier sujet ne doit pas dépasser 10 MB');
      return;
    }
    setSujetFile(file);
    setError('');
    setUploadingSujet(true);
    try {
      const fd = new FormData();
      fd.append('document', file);
      const res = await API.post('/etudiants/upload-document', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSujetFileUrl(res.data.documentUrl);
      setSujetFileName(file.name);
    } catch {
      setError("Erreur lors de l'upload du fichier sujet.");
      setSujetFile(null);
    } finally {
      setUploadingSujet(false);
    }
  };

  const handleLettreFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      setError('La lettre doit être PDF, DOC ou DOCX');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier lettre ne doit pas dépasser 10 MB');
      return;
    }
    setLettreFile(file);
    setError('');
    setUploadingLettre(true);
    try {
      const fd = new FormData();
      fd.append('document', file);
      const res = await API.post('/etudiants/upload-document', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLettreFileUrl(res.data.documentUrl);
      setLettreFileName(file.name);
    } catch {
      setError("Erreur lors de l'upload de la lettre.");
      setLettreFile(null);
    } finally {
      setUploadingLettre(false);
    }
  };

  const handleSubmit = async () => {
    if (!cvUrl) {
      setError('Veuillez uploader votre CV');
      return;
    }
    if (lettreMode === 'fichier' && !lettreFileUrl) {
      setError('Veuillez uploader votre lettre de motivation');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        idSujet: sujet._id,
        cvUrl,
        lettre: lettreMode === 'texte' ? lettre.trim() : '',
        sujetFileUrl: sujetFileUrl || '',
        sujetFileName: sujetFileName || '',
        lettreFileUrl: lettreMode === 'fichier' ? lettreFileUrl : '',
        lettreFileName: lettreMode === 'fichier' ? lettreFileName : '',
      };
      const res = await API.post('/candidatures', payload);
      setResult(res.data);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };
  if (modalSujetReco) {
    const sujetReco = sujets?.find((s) => s._id === modalSujetReco._id) || modalSujetReco;
    return (
      <ModalPostulation sujet={sujetReco} onClose={onClose} onSuccess={onSuccess} sujets={sujets} />
    );
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          background: '#fff',
          borderRadius: 20,
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,.22)',
          fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}
      >
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} .cv-drop-m{border:2px dashed ${T.cardBorder};border-radius:12px;padding:1.8rem 1rem;text-align:center;cursor:pointer;transition:all .2s;background:${T.bg};display:block} .cv-drop-m:hover{border-color:${T.accent};background:${T.accentLight}} .lettre-ta-m{width:100%;padding:.85rem 1rem;border:1.5px solid ${T.cardBorder};border-radius:10px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.87rem;color:${T.text};background:${T.bg};resize:vertical;outline:none;min-height:120px;transition:border-color .15s;box-sizing:border-box} .lettre-ta-m:focus{border-color:${T.accent};box-shadow:0 0 0 3px rgba(64,145,108,.1)}`}</style>

        {/* ── Résultat ── */}
        {result ? (
          <div style={{ padding: '2rem', animation: 'fadeUp .4s ease' }}>
            {/* Header résultat */}
            <div
              style={{
                background: T.accentGrad,
                borderRadius: 14,
                padding: '1.5rem',
                textAlign: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: 'rgba(255,255,255,.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto .65rem',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2
                style={{
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  marginBottom: '.2rem',
                }}
              >
                Candidature soumise !
              </h2>
              <p style={{ color: 'rgba(255,255,255,.8)', fontSize: '.82rem' }}>{sujet?.titre}</p>
            </div>

            {/* Score + Décision */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                padding: '1rem',
                background: T.bg,
                borderRadius: 12,
                border: `1px solid ${T.cardBorder}`,
              }}
            >
              <div>
                <p
                  style={{
                    color: T.textMuted,
                    fontSize: '.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.07em',
                    marginBottom: 4,
                  }}
                >
                  Score IA
                </p>
                <p style={{ fontWeight: 800, fontSize: '1.6rem', color: T.accent, margin: 0 }}>
                  {result.scoreIA}
                  <span style={{ fontSize: '.9rem', color: T.textMuted }}>/100</span>
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p
                  style={{
                    color: T.textMuted,
                    fontSize: '.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.07em',
                    marginBottom: 4,
                  }}
                >
                  Décision
                </p>
                <span
                  style={{
                    background: decisionStyle(result.decision).bg,
                    color: decisionStyle(result.decision).color,
                    padding: '4px 12px',
                    borderRadius: 999,
                    fontSize: '.78rem',
                    fontWeight: 700,
                  }}
                >
                  {decisionStyle(result.decision).label}
                </span>
              </div>
            </div>

            {/* Résumé IA */}
            {result.analyseIA?.resume && (
              <p
                style={{
                  color: T.textSoft,
                  fontSize: '.84rem',
                  lineHeight: 1.65,
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: T.accentLight,
                  borderRadius: 10,
                }}
              >
                {result.analyseIA.resume}
              </p>
            )}

            {/* Recommandation */}
            {result.recommandation && (
              <div
                style={{
                  background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
                  border: '1.5px solid #22c55e',
                  borderRadius: 14,
                  padding: '1.1rem',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.5rem',
                    marginBottom: '.65rem',
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, color: '#15803d', fontSize: '.8rem', margin: 0 }}>
                      Sujet recommandé par l'IA
                    </p>
                    <p style={{ color: '#16a34a', fontSize: '.7rem', margin: 0 }}>
                      Basé sur votre CV et votre filière
                    </p>
                  </div>
                </div>
                <p
                  style={{
                    fontWeight: 700,
                    color: '#166534',
                    fontSize: '.88rem',
                    padding: '.5rem .8rem',
                    background: 'rgba(255,255,255,.6)',
                    borderRadius: 8,
                    marginBottom: '.5rem',
                    border: '1px solid #86efac',
                  }}
                >
                  📌 {result.recommandation.sujet?.titre}
                </p>
                {result.recommandation.sujet?.technologies?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: '.5rem' }}>
                    {result.recommandation.sujet.technologies.slice(0, 5).map((t, i) => (
                      <span
                        key={i}
                        style={{
                          background: '#dcfce7',
                          color: '#15803d',
                          fontSize: '.67rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 99,
                          border: '1px solid #86efac',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <p
                  style={{
                    color: '#166534',
                    fontSize: '.78rem',
                    lineHeight: 1.6,
                    marginBottom: '.8rem',
                  }}
                >
                  💡 {result.recommandation.raison}
                </p>
                <button
                  onClick={() => setModalSujetReco(result.recommandation.sujet)}
                  style={{
                    width: '100%',
                    padding: '.6rem',
                    background: 'linear-gradient(135deg,#16a34a,#22c55e)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 9,
                    fontFamily: 'inherit',
                    fontSize: '.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(34,197,94,.35)',
                  }}
                >
                  Postuler à ce sujet →
                </button>
              </div>
            )}

            {/* Quiz info */}
            {result.decision === 'QUIZ_REQUIS' && (
              <div
                style={{
                  background: '#fff8e1',
                  border: '1px solid #f5c518',
                  borderRadius: 10,
                  padding: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <p
                  style={{ fontWeight: 700, color: '#92400e', fontSize: '.82rem', marginBottom: 4 }}
                >
                  📧 Un quiz vous a été envoyé par email
                </p>
                <p style={{ color: '#78350f', fontSize: '.8rem' }}>
                  Vérifiez votre boîte mail. Le lien est valable 48h. Le chronomètre (15 min)
                  démarre à l'ouverture.
                </p>
              </div>
            )}

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '.8rem',
                borderRadius: 10,
                border: 'none',
                background: T.accentGrad,
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: '.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(64,145,108,.3)',
              }}
            >
              Fermer
            </button>
          </div>
        ) : (
          <div style={{ padding: '2rem', animation: 'fadeUp .35s ease' }}>
            {/* Header modal */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <h2
                  style={{
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    color: '#1b4332',
                    margin: '0 0 .2rem',
                  }}
                >
                  Postuler
                </h2>
                <p style={{ color: T.textMuted, fontSize: '.78rem', margin: 0 }}>
                  L'IA analysera votre profil automatiquement
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: T.textMuted,
                  fontSize: '1.3rem',
                  lineHeight: 1,
                  padding: 4,
                }}
              >
                ✕
              </button>
            </div>

            {/* Info sujet */}
            <div
              style={{
                background: T.accentGrad,
                borderRadius: 12,
                padding: '1.1rem 1.25rem',
                marginBottom: '1.25rem',
              }}
            >
              <p
                style={{
                  color: 'rgba(255,255,255,.7)',
                  fontSize: '.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.1em',
                  margin: '0 0 .35rem',
                }}
              >
                Sujet sélectionné
              </p>
              <p
                style={{
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '.95rem',
                  lineHeight: 1.35,
                  margin: '0 0 .5rem',
                }}
              >
                {sujet?.titre}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {sujet?.technologies?.slice(0, 4).map((t, i) => (
                  <span
                    key={i}
                    style={{
                      background: 'rgba(255,255,255,.18)',
                      color: '#fff',
                      padding: '2px 9px',
                      borderRadius: 999,
                      fontSize: '.7rem',
                      fontWeight: 600,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div
                style={{
                  background: T.dangerLight,
                  border: `1px solid ${T.danger}`,
                  borderRadius: 9,
                  padding: '.7rem 1rem',
                  marginBottom: '1rem',
                  color: T.danger,
                  fontSize: '.82rem',
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            {/* Upload CV */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontWeight: 700,
                  fontSize: '.82rem',
                  color: T.text,
                  marginBottom: '.45rem',
                }}
              >
                CV (PDF ou Word) <span style={{ color: T.danger }}>*</span>
              </label>
              <label className="cv-drop-m">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCvChange}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
                {uploading ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      color: T.accent,
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        border: `2px solid ${T.accentLight}`,
                        borderTopColor: T.accent,
                        borderRadius: '50%',
                        animation: 'spin .7s linear infinite',
                      }}
                    />
                    <span style={{ fontSize: '.83rem', fontWeight: 600 }}>Upload en cours…</span>
                  </div>
                ) : cvUrl ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      color: T.success,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span style={{ fontSize: '.83rem', fontWeight: 700 }}>{cvFile?.name}</span>
                  </div>
                ) : (
                  <div>
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={T.textMuted}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      style={{ margin: '0 auto .5rem', display: 'block' }}
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p
                      style={{
                        color: T.textSoft,
                        fontSize: '.82rem',
                        fontWeight: 600,
                        margin: '0 0 4px',
                      }}
                    >
                      Cliquez pour uploader votre CV
                    </p>
                    <p style={{ color: T.textMuted, fontSize: '.72rem', margin: 0 }}>
                      PDF, DOC, DOCX · max 10 MB
                    </p>
                  </div>
                )}
              </label>
              {cvUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setCvFile(null);
                    setCvUrl('');
                  }}
                  style={{
                    marginTop: 5,
                    background: 'none',
                    border: 'none',
                    color: T.danger,
                    fontSize: '.73rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Supprimer et rechoisir
                </button>
              )}
            </div>

            {/* Lettre de motivation — texte ou fichier */}
            <div style={{ marginBottom: '1.1rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '.45rem',
                }}
              >
                <label style={{ fontWeight: 700, fontSize: '.82rem', color: T.text }}>
                  Lettre de motivation{' '}
                  <span style={{ color: T.textMuted, fontWeight: 400 }}>(optionnelle)</span>
                </label>
                <div
                  style={{
                    display: 'flex',
                    background: T.accentLight,
                    borderRadius: 8,
                    overflow: 'hidden',
                    border: `1px solid ${T.cardBorder}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setLettreMode('texte')}
                    style={{
                      padding: '3px 10px',
                      fontSize: '.7rem',
                      fontWeight: 700,
                      fontFamily: 'inherit',
                      border: 'none',
                      cursor: 'pointer',
                      background: lettreMode === 'texte' ? T.accent : 'transparent',
                      color: lettreMode === 'texte' ? '#fff' : T.textSoft,
                      transition: 'all .15s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    Écrire
                  </button>
                  <button
                    type="button"
                    onClick={() => setLettreMode('fichier')}
                    style={{
                      padding: '3px 10px',
                      fontSize: '.7rem',
                      fontWeight: 700,
                      fontFamily: 'inherit',
                      border: 'none',
                      cursor: 'pointer',
                      background: lettreMode === 'fichier' ? T.accent : 'transparent',
                      color: lettreMode === 'fichier' ? '#fff' : T.textSoft,
                      transition: 'all .15s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                    Fichier
                  </button>
                </div>
              </div>
              {lettreMode === 'texte' ? (
                <>
                  <textarea
                    className="lettre-ta-m"
                    placeholder="Expliquez pourquoi ce sujet vous intéresse, vos compétences pertinentes…"
                    value={lettre}
                    onChange={(e) => setLettre(e.target.value)}
                    maxLength={2000}
                  />
                  <p
                    style={{
                      textAlign: 'right',
                      color: T.textMuted,
                      fontSize: '.68rem',
                      marginTop: 3,
                    }}
                  >
                    {lettre.length}/2000
                  </p>
                </>
              ) : (
                <>
                  <label
                    className="cv-drop-m"
                    style={{
                      border: `2px dashed ${lettreFileUrl ? T.accent : T.cardBorder}`,
                      background: lettreFileUrl ? T.accentLight : T.bg,
                    }}
                  >
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleLettreFileChange}
                      style={{ display: 'none' }}
                      disabled={uploadingLettre}
                    />
                    {uploadingLettre ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          color: T.accent,
                        }}
                      >
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            border: `2px solid ${T.accentLight}`,
                            borderTopColor: T.accent,
                            borderRadius: '50%',
                            animation: 'spin .7s linear infinite',
                          }}
                        />
                        <span style={{ fontSize: '.83rem', fontWeight: 600 }}>
                          Upload en cours…
                        </span>
                      </div>
                    ) : lettreFileUrl ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          color: T.success,
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span style={{ fontSize: '.83rem', fontWeight: 700 }}>
                          {lettreFileName}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={T.textMuted}
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          style={{ margin: '0 auto .4rem', display: 'block' }}
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <p
                          style={{
                            color: T.textSoft,
                            fontSize: '.82rem',
                            fontWeight: 600,
                            margin: '0 0 4px',
                          }}
                        >
                          Cliquez pour uploader votre lettre
                        </p>
                        <p style={{ color: T.textMuted, fontSize: '.72rem', margin: 0 }}>
                          {ALLOWED_DOC_LABEL}
                        </p>
                      </div>
                    )}
                  </label>
                  {lettreFileUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setLettreFile(null);
                        setLettreFileUrl('');
                        setLettreFileName('');
                      }}
                      style={{
                        marginTop: 5,
                        background: 'none',
                        border: 'none',
                        color: T.danger,
                        fontSize: '.73rem',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      Supprimer et rechoisir
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Info IA */}
            <div
              style={{
                background: T.accentLight,
                borderRadius: 10,
                padding: '.8rem 1rem',
                marginBottom: '1.1rem',
                display: 'flex',
                gap: '.6rem',
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke={T.accent}
                strokeWidth="2"
                strokeLinecap="round"
                style={{ flexShrink: 0, marginTop: 2 }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p style={{ color: T.textSoft, fontSize: '.76rem', lineHeight: 1.6, margin: 0 }}>
                L'IA analysera votre CV et calculera un score de compatibilité. Si votre score est
                supérieur à 60/100, vous recevrez un email avec les prochaines étapes.
              </p>
            </div>

            {/* Bouton soumettre */}
            <button
              onClick={handleSubmit}
              disabled={submitting || uploading || uploadingSujet || uploadingLettre || !cvUrl}
              style={{
                width: '100%',
                padding: '.88rem',
                borderRadius: 10,
                border: 'none',
                background: T.accentGrad,
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: '.9rem',
                fontWeight: 700,
                cursor:
                  submitting || uploading || uploadingSujet || uploadingLettre || !cvUrl
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  submitting || uploading || uploadingSujet || uploadingLettre || !cvUrl ? 0.6 : 1,
                boxShadow: '0 4px 14px rgba(64,145,108,.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '.5rem',
              }}
            >
              {submitting ? (
                <>
                  <div
                    style={{
                      width: 15,
                      height: 15,
                      border: '2px solid rgba(255,255,255,.4)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin .7s linear infinite',
                    }}
                  />
                  Analyse IA en cours…
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Soumettre ma candidature
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MODAL POSTULATION — même contenu que CandidaturePage
// ══════════════════════════════════════════════════════════════
function PostulationModal({ sujet, onClose, onSuccess, sujets }) {
  const [lettre, setLettre] = useState('');
  const [lettreMode, setLettreMode] = useState('texte'); // 'texte' | 'fichier'
  const [lettreFile, setLettreFile] = useState(null);
  const [lettreFileUrl, setLettreFileUrl] = useState('');
  const [lettreFileName, setLettreFileName] = useState('');
  const [uploadingLettre, setUploadingLettre] = useState(false);
  const [sujetFile, setSujetFile] = useState(null);
  const [sujetFileUrl, setSujetFileUrl] = useState('');
  const [sujetFileName, setSujetFileName] = useState('');
  const [uploadingSujet, setUploadingSujet] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [cvUrl, setCvUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [modalSujetReco, setModalSujetReco] = useState(null);

  const T = {
    accent: '#40916c',
    accentLight: '#d8f3dc',
    accentGrad: 'linear-gradient(135deg,#40916c,#52b788)',
    bg: '#f8fffe',
    card: '#fff',
    cardBorder: '#d8f3dc',
    text: '#1b4332',
    textSoft: '#40916c',
    textMuted: '#95d5b2',
    danger: '#dc2626',
    dangerLight: '#fee2e2',
    success: '#059669',
    successLight: '#d1fae5',
  };

  const decisionStyle = (d) =>
    ({
      QUIZ_REQUIS: { bg: '#fef3c7', color: '#92400e', label: 'Quiz requis' },
      INTERVIEW: { bg: '#dbeafe', color: '#1e40af', label: 'Entretien' },
      ACCEPTE: { bg: T.successLight, color: T.success, label: 'Accepté' },
      REFUSE: { bg: T.dangerLight, color: T.danger, label: 'Refusé' },
    })[d] || { bg: T.accentLight, color: T.accent, label: d };

  const ALLOWED_DOC_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const ALLOWED_DOC_LABEL = 'PDF, DOC, DOCX · max 10 MB';

  const handleCvChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      setError('Le CV doit être en format PDF, DOC ou DOCX');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Le CV ne doit pas dépasser 10 MB');
      return;
    }
    setCvFile(file);
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('cv', file);
      const res = await API.post('/etudiants/upload-cv', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCvUrl(res.data.cvUrl);
    } catch {
      setError("Erreur lors de l'upload du CV.");
      setCvFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSujetFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      setError('Le sujet doit être PDF, DOC ou DOCX');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier sujet ne doit pas dépasser 10 MB');
      return;
    }
    setSujetFile(file);
    setError('');
    setUploadingSujet(true);
    try {
      const fd = new FormData();
      fd.append('document', file);
      const res = await API.post('/etudiants/upload-document', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSujetFileUrl(res.data.documentUrl);
      setSujetFileName(file.name);
    } catch {
      setError("Erreur lors de l'upload du fichier sujet.");
      setSujetFile(null);
    } finally {
      setUploadingSujet(false);
    }
  };

  const handleLettreFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      setError('La lettre doit être PDF, DOC ou DOCX');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier lettre ne doit pas dépasser 10 MB');
      return;
    }
    setLettreFile(file);
    setError('');
    setUploadingLettre(true);
    try {
      const fd = new FormData();
      fd.append('document', file);
      const res = await API.post('/etudiants/upload-document', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLettreFileUrl(res.data.documentUrl);
      setLettreFileName(file.name);
    } catch {
      setError("Erreur lors de l'upload de la lettre.");
      setLettreFile(null);
    } finally {
      setUploadingLettre(false);
    }
  };

  const handleSubmit = async () => {
    if (!cvUrl) {
      setError('Veuillez uploader votre CV');
      return;
    }
    if (lettreMode === 'fichier' && !lettreFileUrl) {
      setError('Veuillez uploader votre lettre de motivation');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        idSujet: sujet._id,
        cvUrl,
        lettre: lettreMode === 'texte' ? lettre.trim() : '',
        sujetFileUrl: sujetFileUrl || '',
        sujetFileName: sujetFileName || '',
        lettreFileUrl: lettreMode === 'fichier' ? lettreFileUrl : '',
        lettreFileName: lettreMode === 'fichier' ? lettreFileName : '',
      };
      const res = await API.post('/candidatures', payload);
      setResult(res.data);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  // Redirection vers sujet recommandé
  if (modalSujetReco) {
    const sujetReco = sujets?.find((s) => s._id === modalSujetReco._id) || modalSujetReco;
    return (
      <PostulationModal sujet={sujetReco} onClose={onClose} onSuccess={onSuccess} sujets={sujets} />
    );
  }

  // ── Overlay ──────────────────────────────────────────────
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && !result && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(10,30,20,.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: T.card,
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(0,0,0,.22)',
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          animation: 'fadeUp .3s ease',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* ── Résultat ───────────────────────────────────── */}
        {result ? (
          (() => {
            const dec = decisionStyle(result.decision);
            return (
              <div style={{ padding: '2rem' }}>
                {/* Header succès */}
                <div
                  style={{
                    background: T.accentGrad,
                    borderRadius: 12,
                    padding: '1.5rem',
                    textAlign: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      background: 'rgba(255,255,255,.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto .75rem',
                    }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h2
                    style={{
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '1.15rem',
                      marginBottom: '.25rem',
                    }}
                  >
                    Candidature soumise !
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,.8)', fontSize: '.82rem' }}>
                    {sujet?.titre}
                  </p>
                </div>

                {/* Score + décision */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: T.bg,
                    borderRadius: 12,
                    border: `1px solid ${T.cardBorder}`,
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <p
                      style={{
                        color: T.textMuted,
                        fontSize: '.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '.07em',
                        marginBottom: 4,
                      }}
                    >
                      Score IA
                    </p>
                    <p style={{ fontWeight: 800, fontSize: '1.6rem', color: T.accent, margin: 0 }}>
                      {result.scoreIA}
                      <span style={{ fontSize: '.9rem', color: T.textMuted }}>/100</span>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p
                      style={{
                        color: T.textMuted,
                        fontSize: '.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '.07em',
                        marginBottom: 4,
                      }}
                    >
                      Décision
                    </p>
                    <span
                      style={{
                        background: dec.bg,
                        color: dec.color,
                        padding: '4px 12px',
                        borderRadius: 999,
                        fontSize: '.78rem',
                        fontWeight: 700,
                      }}
                    >
                      {dec.label}
                    </span>
                  </div>
                </div>

                {/* Résumé IA */}
                {result.analyseIA?.resume && (
                  <p
                    style={{
                      color: T.textSoft,
                      fontSize: '.84rem',
                      lineHeight: 1.65,
                      padding: '1rem',
                      background: T.accentLight,
                      borderRadius: 10,
                      marginBottom: '1rem',
                    }}
                  >
                    {result.analyseIA.resume}
                  </p>
                )}

                {/* Recommandation sujet alternatif */}
                {result.recommandation && (
                  <div
                    style={{
                      background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
                      border: '1.5px solid #22c55e',
                      borderRadius: 14,
                      padding: '1.1rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.5rem',
                        marginBottom: '.65rem',
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: '#22c55e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                      <div>
                        <p
                          style={{
                            fontWeight: 800,
                            color: '#15803d',
                            fontSize: '.8rem',
                            margin: 0,
                          }}
                        >
                          Sujet recommandé par l'IA
                        </p>
                        <p style={{ color: '#16a34a', fontSize: '.7rem', margin: 0 }}>
                          Basé sur votre CV et votre profil
                        </p>
                      </div>
                    </div>
                    <p
                      style={{
                        fontWeight: 700,
                        color: '#166534',
                        fontSize: '.88rem',
                        padding: '.55rem .85rem',
                        background: 'rgba(255,255,255,.6)',
                        borderRadius: 8,
                        marginBottom: '.5rem',
                        border: '1px solid #86efac',
                      }}
                    >
                      📌 {result.recommandation.sujet?.titre}
                    </p>
                    {result.recommandation.sujet?.technologies?.length > 0 && (
                      <div
                        style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: '.5rem' }}
                      >
                        {result.recommandation.sujet.technologies.slice(0, 5).map((tech, i) => (
                          <span
                            key={i}
                            style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              fontSize: '.67rem',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: 99,
                              border: '1px solid #86efac',
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    <p
                      style={{
                        color: '#166534',
                        fontSize: '.78rem',
                        lineHeight: 1.6,
                        marginBottom: '.75rem',
                      }}
                    >
                      💡 {result.recommandation.raison}
                    </p>
                    <button
                      onClick={() => setModalSujetReco(result.recommandation.sujet)}
                      style={{
                        width: '100%',
                        padding: '.6rem',
                        background: 'linear-gradient(135deg,#16a34a,#22c55e)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 9,
                        fontFamily: 'inherit',
                        fontSize: '.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Voir ce sujet →
                    </button>
                  </div>
                )}

                {/* Info quiz */}
                {result.decision === 'QUIZ_REQUIS' && (
                  <div
                    style={{
                      background: '#fff8e1',
                      border: '1px solid #f5c518',
                      borderRadius: 10,
                      padding: '1rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 700,
                        color: '#92400e',
                        fontSize: '.82rem',
                        marginBottom: 4,
                      }}
                    >
                      📩 Un quiz vous a été envoyé par email
                    </p>
                    <p style={{ color: '#78350f', fontSize: '.78rem' }}>
                      Vérifiez votre boîte mail. Lien valable 48h — chrono de 15 min à l'ouverture.
                    </p>
                  </div>
                )}

                {/* Bouton fermer */}
                <button
                  onClick={onClose}
                  style={{
                    width: '100%',
                    padding: '.8rem',
                    borderRadius: 10,
                    border: 'none',
                    background: T.accentGrad,
                    color: '#fff',
                    fontFamily: 'inherit',
                    fontSize: '.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Retour aux sujets
                </button>
              </div>
            );
          })()
        ) : (
          /* ── Formulaire ───────────────────────────────────── */
          <div style={{ padding: '1.75rem' }}>
            {/* Header modal */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ flex: 1, paddingRight: '1rem' }}>
                <p
                  style={{
                    color: T.textMuted,
                    fontSize: '.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                    marginBottom: '.3rem',
                  }}
                >
                  Postuler pour
                </p>
                <h2
                  style={{
                    fontWeight: 800,
                    color: T.text,
                    fontSize: '1rem',
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  {sujet?.titre}
                </h2>
                {sujet?.technologies?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: '.5rem' }}>
                    {sujet.technologies.slice(0, 5).map((t, i) => (
                      <span
                        key={i}
                        style={{
                          background: T.accentLight,
                          color: T.accent,
                          padding: '2px 9px',
                          borderRadius: 999,
                          fontSize: '.68rem',
                          fontWeight: 600,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: T.textMuted,
                  fontSize: '1.4rem',
                  lineHeight: 1,
                  padding: 4,
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ borderTop: `1px solid ${T.cardBorder}`, paddingTop: '1.25rem' }}>
              <h3
                style={{
                  fontWeight: 800,
                  fontSize: '.95rem',
                  color: T.text,
                  marginBottom: '.2rem',
                }}
              >
                Votre candidature
              </h3>
              <p style={{ color: T.textMuted, fontSize: '.8rem', marginBottom: '1.25rem' }}>
                L'IA analysera votre CV et vous répondra par email.
              </p>

              {error && (
                <div
                  style={{
                    background: T.dangerLight,
                    border: `1px solid ${T.danger}`,
                    borderRadius: 9,
                    padding: '.7rem 1rem',
                    marginBottom: '1rem',
                    color: T.danger,
                    fontSize: '.82rem',
                    fontWeight: 600,
                  }}
                >
                  {error}
                </div>
              )}

              {/* Upload CV */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 700,
                    fontSize: '.8rem',
                    color: T.text,
                    marginBottom: '.45rem',
                  }}
                >
                  CV (PDF ou Word) <span style={{ color: T.danger }}>*</span>
                </label>
                <label
                  style={{
                    display: 'block',
                    border: `2px dashed ${cvUrl ? T.accent : T.cardBorder}`,
                    borderRadius: 12,
                    padding: '1.5rem 1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: cvUrl ? T.accentLight : T.bg,
                    transition: 'all .2s',
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCvChange}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        color: T.accent,
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          border: `2px solid ${T.accentLight}`,
                          borderTopColor: T.accent,
                          borderRadius: '50%',
                          animation: 'spin .7s linear infinite',
                        }}
                      />
                      <span style={{ fontSize: '.83rem', fontWeight: 600 }}>Upload en cours…</span>
                    </div>
                  ) : cvUrl ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        color: T.success,
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span style={{ fontSize: '.83rem', fontWeight: 700 }}>{cvFile?.name}</span>
                    </div>
                  ) : (
                    <div>
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={T.textMuted}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        style={{ margin: '0 auto .5rem', display: 'block' }}
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <p style={{ color: T.textSoft, fontSize: '.82rem', fontWeight: 600 }}>
                        Cliquez pour uploader votre CV
                      </p>
                      <p style={{ color: T.textMuted, fontSize: '.72rem', marginTop: 3 }}>
                        PDF, DOC, DOCX · max 10 MB
                      </p>
                    </div>
                  )}
                </label>
                {cvUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setCvFile(null);
                      setCvUrl('');
                    }}
                    style={{
                      marginTop: 5,
                      background: 'none',
                      border: 'none',
                      color: T.danger,
                      fontSize: '.73rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Supprimer et rechoisir
                  </button>
                )}
              </div>
              {/* Lettre de motivation — texte ou fichier */}
              <div style={{ marginBottom: '1.1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '.45rem',
                  }}
                >
                  <label style={{ fontWeight: 700, fontSize: '.8rem', color: T.text }}>
                    Lettre de motivation{' '}
                    <span style={{ color: T.textMuted, fontWeight: 400 }}>(optionnelle)</span>
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      background: T.accentLight,
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: `1px solid ${T.cardBorder}`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setLettreMode('texte')}
                      style={{
                        padding: '3px 10px',
                        fontSize: '.7rem',
                        fontWeight: 700,
                        fontFamily: 'inherit',
                        border: 'none',
                        cursor: 'pointer',
                        background: lettreMode === 'texte' ? T.accent : 'transparent',
                        color: lettreMode === 'texte' ? '#fff' : T.textSoft,
                        transition: 'all .15s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      Écrire
                    </button>
                    <button
                      type="button"
                      onClick={() => setLettreMode('fichier')}
                      style={{
                        padding: '3px 10px',
                        fontSize: '.7rem',
                        fontWeight: 700,
                        fontFamily: 'inherit',
                        border: 'none',
                        cursor: 'pointer',
                        background: lettreMode === 'fichier' ? T.accent : 'transparent',
                        color: lettreMode === 'fichier' ? '#fff' : T.textSoft,
                        transition: 'all .15s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                      </svg>
                      Fichier
                    </button>
                  </div>
                </div>
                {lettreMode === 'texte' ? (
                  <>
                    <textarea
                      placeholder="Expliquez pourquoi ce sujet vous intéresse, vos compétences pertinentes…"
                      value={lettre}
                      onChange={(e) => setLettre(e.target.value)}
                      maxLength={2000}
                      style={{
                        width: '100%',
                        padding: '.8rem 1rem',
                        border: `1.5px solid ${T.cardBorder}`,
                        borderRadius: 10,
                        fontFamily: "'Plus Jakarta Sans',sans-serif",
                        fontSize: '.85rem',
                        color: T.text,
                        background: T.bg,
                        resize: 'vertical',
                        outline: 'none',
                        minHeight: 130,
                        boxSizing: 'border-box',
                      }}
                    />
                    <p
                      style={{
                        textAlign: 'right',
                        color: T.textMuted,
                        fontSize: '.68rem',
                        marginTop: 3,
                      }}
                    >
                      {lettre.length}/2000
                    </p>
                  </>
                ) : (
                  <>
                    <label
                      style={{
                        display: 'block',
                        border: `2px dashed ${lettreFileUrl ? T.accent : T.cardBorder}`,
                        borderRadius: 12,
                        padding: '1.2rem 1rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: lettreFileUrl ? T.accentLight : T.bg,
                        transition: 'all .2s',
                      }}
                    >
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleLettreFileChange}
                        style={{ display: 'none' }}
                        disabled={uploadingLettre}
                      />
                      {uploadingLettre ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            color: T.accent,
                          }}
                        >
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              border: `2px solid ${T.accentLight}`,
                              borderTopColor: T.accent,
                              borderRadius: '50%',
                              animation: 'spin .7s linear infinite',
                            }}
                          />
                          <span style={{ fontSize: '.83rem', fontWeight: 600 }}>
                            Upload en cours…
                          </span>
                        </div>
                      ) : lettreFileUrl ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            color: T.success,
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span style={{ fontSize: '.83rem', fontWeight: 700 }}>
                            {lettreFileName}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={T.textMuted}
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            style={{ margin: '0 auto .4rem', display: 'block' }}
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <p style={{ color: T.textSoft, fontSize: '.8rem', fontWeight: 600 }}>
                            Cliquez pour uploader votre lettre
                          </p>
                          <p style={{ color: T.textMuted, fontSize: '.7rem', marginTop: 2 }}>
                            {ALLOWED_DOC_LABEL}
                          </p>
                        </div>
                      )}
                    </label>
                    {lettreFileUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setLettreFile(null);
                          setLettreFileUrl('');
                          setLettreFileName('');
                        }}
                        style={{
                          marginTop: 5,
                          background: 'none',
                          border: 'none',
                          color: T.danger,
                          fontSize: '.73rem',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Supprimer et rechoisir
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Info IA */}
              <div
                style={{
                  background: T.accentLight,
                  borderRadius: 10,
                  padding: '.8rem 1rem',
                  marginBottom: '1.1rem',
                  display: 'flex',
                  gap: '.6rem',
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={T.accent}
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ flexShrink: 0, marginTop: 2 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p style={{ color: T.textSoft, fontSize: '.76rem', lineHeight: 1.6, margin: 0 }}>
                  L'IA analysera votre CV et calculera un score de compatibilité. Si votre score est
                  supérieur à 60/100, vous recevrez un email avec les prochaines étapes.
                </p>
              </div>

              {/* Bouton soumettre */}
              <button
                onClick={handleSubmit}
                disabled={submitting || uploading || uploadingSujet || uploadingLettre || !cvUrl}
                style={{
                  width: '100%',
                  padding: '.85rem',
                  borderRadius: 10,
                  border: 'none',
                  background: T.accentGrad,
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: '.88rem',
                  fontWeight: 700,
                  cursor:
                    submitting || uploading || uploadingSujet || uploadingLettre || !cvUrl
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    submitting || uploading || uploadingSujet || uploadingLettre || !cvUrl
                      ? 0.6
                      : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '.5rem',
                  boxSizing: 'border-box',
                }}
              >
                {submitting ? (
                  <>
                    <div
                      style={{
                        width: 15,
                        height: 15,
                        border: '2px solid rgba(255,255,255,.4)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin .7s linear infinite',
                      }}
                    />
                    Analyse IA en cours…
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Soumettre ma candidature
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// INTERFACE SUJETS (étudiant non VALIDE)
// ══════════════════════════════════════════════════════════════
function InterfaceSujets({ user, logout, navigate, profilExtra, sujets, candidatures, onRefresh }) {
  const [onglet, setOnglet] = useState('sujets');
  const [search, setSearch] = useState('');
  const [filtreDomaine, setFiltreDomaine] = useState('');
  const [selSujet, setSelSujet] = useState(null);
  const [modalSujet, setModalSujet] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const domaines = [...new Set(sujets.map((s) => s.domaine).filter(Boolean))];
  const sujetsFiltrés = sujets.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.titre?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.technologies?.some((t) => t.toLowerCase().includes(q));
    const matchDomaine = !filtreDomaine || s.domaine === filtreDomaine;
    return matchSearch && matchDomaine;
  });

  const DISPO_CFG = {
    DISPONIBLE: { c: '#16a34a', bg: '#dcfce7', l: 'Disponible' },
    INDISPONIBLE: { c: '#dc2626', bg: '#fee2e2', l: 'Indisponible' },
    EN_ATTENTE: { c: '#d97706', bg: '#fef3c7', l: 'En attente' },
  };
  const NIVEAU_CFG = {
    DEBUTANT: { c: '#16a34a', bg: '#dcfce7', l: 'Débutant' },
    INTERMEDIAIRE: { c: '#d97706', bg: '#fef3c7', l: 'Intermédiaire' },
    AVANCE: { c: '#dc2626', bg: '#fee2e2', l: 'Avancé' },
  };
  const candCfg = {
    EN_ATTENTE: { c: G.warning, bg: G.warningBg, l: 'En attente' },
    QUIZ_REQUIS: { c: G.purple, bg: G.purpleBg, l: 'Quiz requis' },
    INTERVIEW: { c: G.success, bg: G.successBg, l: 'Interview' },
    ACCEPTE: { c: G.success, bg: G.successBg, l: 'Accepté' },
    REFUSE: { c: G.danger, bg: G.dangerBg, l: 'Refusé' },
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) await onRefresh();
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div
      style={{ minHeight: '100vh', background: G.bg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .sj-card{background:#fff;border-radius:14px;border:1.5px solid;padding:1.15rem 1.2rem;cursor:pointer;transition:box-shadow .18s,transform .18s;}
        .sj-card:hover{box-shadow:0 10px 32px rgba(30,138,94,.15);transform:translateY(-3px);}
        .sj-inp{width:100%;padding:.58rem .85rem .58rem 2.4rem;border-radius:10px;border:1.5px solid ${G.border};font-size:.82rem;font-family:'Plus Jakarta Sans',sans-serif;color:${G.text};background:#fff;outline:none;transition:border-color .15s,box-shadow .15s;}
        .sj-inp:focus{border-color:${G.accent};box-shadow:0 0 0 3px ${G.accentLight};}
        .sj-tab{padding:.52rem 1.15rem;border-radius:9px;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:.82rem;font-weight:600;transition:all .15s;display:flex;align-items:center;gap:.4rem;}
        ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-thumb{background:${G.border};border-radius:4px;}
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
      `}</style>

      <div
        style={{
          background: '#fff',
          borderBottom: `1px solid ${G.border}`,
          padding: '.85rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: G.shadow,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: G.grad,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(30,138,94,.3)',
            }}
          >
            <I.grad />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '.92rem', color: G.text, lineHeight: 1 }}>
              SmartPFE
            </div>
            <div
              style={{
                fontSize: '.58rem',
                color: G.accent,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.12em',
              }}
            >
              Plateforme PFE
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '.35rem',
            background: G.accentLight,
            borderRadius: 12,
            padding: '.3rem',
          }}
        >
          {[
            { id: 'sujets', icon: I.news, label: 'Sujets PFE', nav: false },
            { id: 'candidatures', icon: I.send, label: 'Candidatures', nav: false },
            { id: 'guide', icon: I.book, label: 'Guide PFE', nav: true, path: '/guide-pfe' },
            { id: 'profil', icon: I.user, label: 'Mon profil', nav: false },
          ].map((t) => (
            <button
              key={t.id}
              className="sj-tab"
              onClick={() => {
                if (t.nav) navigate(t.path);
                else setOnglet(t.id);
              }}
              style={{
                background: onglet === t.id ? '#fff' : 'transparent',
                color: onglet === t.id ? G.accent : G.textSoft,
                boxShadow: onglet === t.id ? G.shadow : 'none',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <t.icon />
              </span>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 700, fontSize: '.83rem', color: G.text }}>
              {user?.prenom} {user?.nom}
            </p>
            <p style={{ fontSize: '.67rem', color: G.textMuted }}>
              {profilExtra?.statutPFE?.replace(/_/g, ' ') || 'Non affecté'}
            </p>
          </div>
          <div
            onClick={() => navigate('/profil')}
            title="Mon Profil"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: G.grad,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#fff',
              fontSize: '.8rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(30,138,94,.25)',
            }}
          >
            {user?.prenom?.[0]}
            {user?.nom?.[0]}
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/accueil');
            }}
            style={{
              background: G.dangerBg,
              color: G.danger,
              border: '1px solid #fecaca',
              borderRadius: 9,
              padding: '.42rem .65rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <I.logout />
          </button>
        </div>
      </div>

      <div style={{ padding: '2rem 2.5rem' }}>
        {onglet === 'sujets' && (
          <div>
            <div
              style={{
                background: G.grad,
                borderRadius: 18,
                padding: '2.25rem 2.5rem',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(21,95,66,.25)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -50,
                  right: 60,
                  width: 220,
                  height: 220,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,.07)',
                  pointerEvents: 'none',
                }}
              />
              <p
                style={{
                  color: 'rgba(255,255,255,.78)',
                  fontSize: '.85rem',
                  marginBottom: '.35rem',
                }}
              >
                Bienvenue, {user?.prenom}
              </p>
              <h1
                style={{
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1.6rem',
                  marginBottom: '.6rem',
                  lineHeight: 1.25,
                }}
              >
                Découvrez les sujets PFE
              </h1>
              <p
                style={{
                  color: 'rgba(255,255,255,.78)',
                  fontSize: '.88rem',
                  marginBottom: '1.35rem',
                  maxWidth: 480,
                }}
              >
                Consultez les sujets proposés par vos encadrants et postulez en quelques clics.
              </p>
              <div
                style={{ display: 'flex', gap: '.65rem', flexWrap: 'wrap', alignItems: 'center' }}
              >
                <div
                  style={{
                    background: 'rgba(255,255,255,.15)',
                    borderRadius: 10,
                    padding: '.6rem 1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.5rem',
                  }}
                >
                  <span style={{ color: '#fff', display: 'flex' }}>
                    <I.news />
                  </span>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '.85rem' }}>
                    {sujets.length} sujets disponibles
                  </span>
                </div>
                <button
                  onClick={handleRefresh}
                  style={{
                    background: 'rgba(255,255,255,.15)',
                    border: '1px solid rgba(255,255,255,.25)',
                    borderRadius: 10,
                    padding: '.6rem 1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.5rem',
                    cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '.82rem',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      animation: refreshing ? 'spin 1s linear infinite' : 'none',
                    }}
                  >
                    <I.refresh />
                  </span>{' '}
                  Actualiser
                </button>
              </div>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
                gap: '.9rem',
                marginBottom: '1.75rem',
              }}
            >
              {[
                {
                  icon: I.news,
                  label: 'Sujets disponibles',
                  value: sujets.length,
                  color: G.accent,
                  bg: G.accentLight,
                },
                {
                  icon: I.send,
                  label: 'Mes candidatures',
                  value: candidatures.length,
                  color: G.purple,
                  bg: G.purpleBg,
                },
                {
                  icon: I.check,
                  label: 'Candidatures acc.',
                  value: candidatures.filter((c) => c.statut === 'ACCEPTE').length,
                  color: G.success,
                  bg: G.successBg,
                },
                {
                  icon: I.award,
                  label: 'En attente réponse',
                  value: candidatures.filter((c) => c.statut === 'EN_ATTENTE').length,
                  color: G.warning,
                  bg: G.warningBg,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: '#fff',
                    borderRadius: 13,
                    border: `1.5px solid ${G.border}`,
                    padding: '1rem 1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.85rem',
                    boxShadow: G.shadow,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 11,
                      background: stat.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.color,
                      flexShrink: 0,
                    }}
                  >
                    <stat.icon />
                  </div>
                  <div>
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: '1.5rem',
                        color: stat.color,
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </p>
                    <p
                      style={{
                        color: G.textMuted,
                        fontSize: '.72rem',
                        fontWeight: 600,
                        marginTop: '.1rem',
                      }}
                    >
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{ display: 'flex', gap: '.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}
            >
              <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 11,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: G.textMuted,
                    pointerEvents: 'none',
                    display: 'flex',
                  }}
                >
                  <I.search />
                </span>
                <input
                  type="text"
                  placeholder="Rechercher un sujet, technologie..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="sj-inp"
                />
              </div>
              {domaines.length > 0 && (
                <select
                  value={filtreDomaine}
                  onChange={(e) => setFiltreDomaine(e.target.value)}
                  style={{
                    padding: '.58rem .95rem',
                    borderRadius: 10,
                    border: `1.5px solid ${G.border}`,
                    fontSize: '.82rem',
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    color: G.text,
                    background: '#fff',
                    outline: 'none',
                    cursor: 'pointer',
                    minWidth: 180,
                  }}
                >
                  <option value="">Tous les domaines</option>
                  {domaines.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.1rem',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <p style={{ color: G.textMuted, fontSize: '.78rem', fontWeight: 600 }}>
                <strong style={{ color: G.accent }}>{sujetsFiltrés.length}</strong> sujet
                {sujetsFiltrés.length !== 1 ? 's' : ''} trouvé
                {sujetsFiltrés.length !== 1 ? 's' : ''}
              </p>
              {(search || filtreDomaine) && (
                <button
                  onClick={() => {
                    setSearch('');
                    setFiltreDomaine('');
                  }}
                  style={{
                    background: 'transparent',
                    border: `1.5px solid ${G.border}`,
                    color: G.textSoft,
                    padding: '.42rem .85rem',
                    borderRadius: 9,
                    cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    fontSize: '.78rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.35rem',
                  }}
                >
                  <I.x /> Réinitialiser
                </button>
              )}
            </div>
            {sujetsFiltrés.length === 0 ? (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  padding: '4rem',
                  textAlign: 'center',
                  border: `1.5px dashed ${G.border}`,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: G.accentLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.1rem',
                    color: G.accent,
                  }}
                >
                  <I.news />
                </div>
                <p
                  style={{
                    fontWeight: 700,
                    color: G.text,
                    fontSize: '.95rem',
                    marginBottom: '.4rem',
                  }}
                >
                  Aucun sujet trouvé
                </p>
                <p style={{ color: G.textMuted, fontSize: '.83rem' }}>
                  Modifiez vos critères de recherche.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
                  gap: '1.1rem',
                }}
              >
                {sujetsFiltrés.map((s, idx) => {
                  const pal = G.pastel[idx % G.pastel.length];
                  const niveau =
                    NIVEAU_CFG[s.niveau] ||
                    NIVEAU_CFG[s.niveauRequis?.toUpperCase().replace(' ', '')];
                  const encNom = s.idEncadrant?.utilisateur
                    ? `${s.idEncadrant.utilisateur.prenom} ${s.idEncadrant.utilisateur.nom}`
                    : null;
                  return (
                    <div
                      key={s._id}
                      className="sj-card"
                      style={{
                        background: pal.bg,
                        borderColor: pal.border,
                        boxShadow: `0 2px 8px ${pal.border}88`,
                      }}
                    >
                      {/* Header — domaine + niveau */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '.65rem',
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            background: pal.tagBg,
                            color: pal.tag,
                            fontSize: '.63rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 100,
                            textTransform: 'uppercase',
                            letterSpacing: '.05em',
                          }}
                        >
                          {s.domaine || 'PFE'}
                        </span>
                        {niveau && (
                          <span
                            style={{
                              background: niveau.bg,
                              color: niveau.c,
                              fontSize: '.63rem',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: 100,
                              flexShrink: 0,
                            }}
                          >
                            {niveau.l}
                          </span>
                        )}
                      </div>

                      {/* Titre complet */}
                      <p
                        style={{
                          fontWeight: 700,
                          color: G.text,
                          fontSize: '.92rem',
                          lineHeight: 1.4,
                          marginBottom: '.5rem',
                        }}
                      >
                        {s.titre}
                      </p>

                      {/* Description complète */}
                      {s.description && (
                        <p
                          style={{
                            color: G.textSoft,
                            fontSize: '.78rem',
                            lineHeight: 1.65,
                            marginBottom: '.6rem',
                          }}
                        >
                          {s.description}
                        </p>
                      )}

                      {/* Référence */}
                      {s.reference && (
                        <p
                          style={{ color: G.textMuted, fontSize: '.72rem', marginBottom: '.5rem' }}
                        >
                          Réf : <strong>{s.reference}</strong>
                        </p>
                      )}

                      {/* Technologies — toutes */}
                      {s.technologies?.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 4,
                            marginBottom: '.7rem',
                          }}
                        >
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              color: G.textMuted,
                              marginRight: 2,
                            }}
                          >
                            <I.code />
                          </span>
                          {s.technologies.map((tech, i) => (
                            <span
                              key={i}
                              style={{
                                background: 'rgba(255,255,255,.7)',
                                border: `1px solid ${pal.border}`,
                                color: pal.tag,
                                fontSize: '.63rem',
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: 100,
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer — encadrant + btn Postuler */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '.6rem',
                          borderTop: `1px solid ${pal.border}`,
                          gap: 8,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                          {encNom && (
                            <>
                              <div
                                style={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: '50%',
                                  background: pal.tagBg,
                                  color: pal.tag,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '.65rem',
                                  fontWeight: 800,
                                  flexShrink: 0,
                                }}
                              >
                                {encNom[0]?.toUpperCase()}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <p
                                  style={{
                                    margin: 0,
                                    color: G.textMuted,
                                    fontSize: '.6rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  Encadrant
                                </p>
                                <p
                                  style={{
                                    margin: 0,
                                    color: G.textSoft,
                                    fontSize: '.7rem',
                                    fontWeight: 700,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {encNom}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => setModalSujet(s)}
                          style={{
                            flexShrink: 0,
                            background: G.grad,
                            color: '#fff',
                            border: 'none',
                            borderRadius: 10,
                            padding: '8px 18px',
                            fontSize: '.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 3px 10px rgba(30,138,94,.3)',
                            fontFamily: "'Plus Jakarta Sans',sans-serif",
                          }}
                        >
                          Postuler →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {onglet === 'candidatures' && (
          <div>
            <h2
              style={{
                fontWeight: 700,
                fontSize: '1.05rem',
                color: G.text,
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '.5rem',
              }}
            >
              <span style={{ color: G.accent }}>
                <I.send />
              </span>{' '}
              Mes Candidatures
            </h2>
            {candidatures.length === 0 ? (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  padding: '4rem',
                  textAlign: 'center',
                  border: `1.5px dashed ${G.border}`,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: G.accentLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.1rem',
                    color: G.accent,
                  }}
                >
                  <I.send />
                </div>
                <p
                  style={{
                    fontWeight: 700,
                    color: G.text,
                    fontSize: '.95rem',
                    marginBottom: '.5rem',
                  }}
                >
                  Aucune candidature soumise
                </p>
                <button
                  onClick={() => setOnglet('sujets')}
                  style={{
                    background: G.grad,
                    color: '#fff',
                    border: 'none',
                    padding: '.7rem 1.5rem',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    fontWeight: 700,
                    fontSize: '.85rem',
                    boxShadow: '0 4px 14px rgba(30,138,94,.3)',
                  }}
                >
                  Voir les sujets →
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(380px,1fr))',
                  gap: '.9rem',
                }}
              >
                {candidatures.map((c) => {
                  const sc = candCfg[c.statut] || { c: G.textMuted, bg: '#f8fafc', l: c.statut };
                  return (
                    <div
                      key={c._id}
                      style={{
                        background: '#fff',
                        borderRadius: 14,
                        padding: '1.2rem 1.4rem',
                        border: `1.5px solid ${G.border}`,
                        boxShadow: G.shadow,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '.75rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontWeight: 700,
                              color: G.text,
                              fontSize: '.92rem',
                              marginBottom: '.25rem',
                            }}
                          >
                            {c.idSujet?.titre || 'Sujet PFE'}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: G.textMuted, fontSize: '.73rem' }}>
                              Score IA :
                            </span>
                            <span style={{ fontWeight: 800, color: G.accent, fontSize: '.82rem' }}>
                              {c.scoreIA}/100
                            </span>
                            <div
                              style={{
                                flex: 1,
                                maxWidth: 120,
                                height: 5,
                                background: G.accentLight,
                                borderRadius: 100,
                                overflow: 'hidden',
                                marginLeft: 4,
                              }}
                            >
                              <div
                                style={{
                                  width: `${c.scoreIA}%`,
                                  height: '100%',
                                  background: c.scoreIA >= 70 ? G.accent : G.warning,
                                  borderRadius: 100,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <span
                          style={{
                            background: sc.bg,
                            color: sc.c,
                            padding: '.25rem .8rem',
                            borderRadius: 100,
                            fontSize: '.7rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {sc.l}
                        </span>
                      </div>
                      {c.statut === 'QUIZ_REQUIS' && (
                        <div
                          style={{
                            background: G.purpleBg,
                            borderRadius: 10,
                            padding: '.75rem 1rem',
                            marginTop: '.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '.5rem',
                            flexWrap: 'wrap',
                            border: '1px solid #d8b4fe',
                          }}
                        >
                          <div>
                            <p
                              style={{
                                fontWeight: 700,
                                color: G.purple,
                                fontSize: '.83rem',
                                marginBottom: '.15rem',
                              }}
                            >
                              Quiz disponible
                            </p>
                            <p style={{ color: '#6d28d9', fontSize: '.73rem' }}>
                              Passez le quiz technique pour continuer
                            </p>
                          </div>
                          <button
                            onClick={() => navigate(`/quiz/${c._id}`)}
                            style={{
                              background: G.purple,
                              color: '#fff',
                              border: 'none',
                              padding: '.52rem 1.1rem',
                              borderRadius: 9,
                              cursor: 'pointer',
                              fontFamily: "'Plus Jakarta Sans',sans-serif",
                              fontWeight: 700,
                              fontSize: '.8rem',
                            }}
                          >
                            Passer le quiz →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {onglet === 'profil' && (
          <div style={{ maxWidth: 700 }}>
            <h2
              style={{
                fontWeight: 700,
                fontSize: '1.05rem',
                color: G.text,
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '.5rem',
              }}
            >
              <span style={{ color: G.accent }}>
                <I.user />
              </span>{' '}
              Mon Profil
            </h2>
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                border: `1.5px solid ${G.border}`,
                overflow: 'hidden',
                boxShadow: G.shadow,
              }}
            >
              <div
                style={{
                  background: G.grad,
                  padding: '2.25rem 2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -40,
                    right: 60,
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,.07)',
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: '#fff',
                    fontSize: '1.7rem',
                    flexShrink: 0,
                    border: '3px solid rgba(255,255,255,.3)',
                  }}
                >
                  {user?.prenom?.[0]}
                  {user?.nom?.[0]}
                </div>
                <div>
                  <h3
                    style={{
                      fontWeight: 800,
                      color: '#fff',
                      fontSize: '1.2rem',
                      marginBottom: '.2rem',
                    }}
                  >
                    {user?.prenom} {user?.nom}
                  </h3>
                  <p
                    style={{
                      color: 'rgba(255,255,255,.8)',
                      fontSize: '.83rem',
                      marginBottom: '.4rem',
                    }}
                  >
                    {user?.email}
                  </p>
                  <span
                    style={{
                      background: 'rgba(255,255,255,.2)',
                      color: '#fff',
                      fontSize: '.7rem',
                      fontWeight: 700,
                      padding: '3px 12px',
                      borderRadius: 100,
                    }}
                  >
                    Étudiant PFE
                  </span>
                </div>
              </div>
              <div style={{ padding: '1.75rem 2rem' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))',
                    gap: '.9rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  {[
                    { l: 'Filière', v: profilExtra?.filiere || '—' },
                    { l: 'Niveau', v: profilExtra?.niveau || '—' },
                    { l: 'Statut PFE', v: profilExtra?.statutPFE?.replace(/_/g, ' ') || '—' },
                  ].map((item) => (
                    <div
                      key={item.l}
                      style={{
                        background: G.bg,
                        borderRadius: 11,
                        padding: '1rem',
                        border: `1px solid ${G.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.65rem',
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 9,
                          background: G.accentLight,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: G.accent,
                          flexShrink: 0,
                        }}
                      >
                        <I.user />
                      </div>
                      <div>
                        <p
                          style={{ color: G.textMuted, fontSize: '.68rem', marginBottom: '.18rem' }}
                        >
                          {item.l}
                        </p>
                        <p style={{ fontWeight: 700, color: G.text, fontSize: '.84rem' }}>
                          {item.v}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/profil')}
                  style={{
                    background: G.grad,
                    color: '#fff',
                    border: 'none',
                    padding: '.72rem 1.6rem',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    fontWeight: 700,
                    fontSize: '.85rem',
                    boxShadow: '0 4px 14px rgba(30,138,94,.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.5rem',
                  }}
                >
                  <I.user /> Gérer mon profil complet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {selSujet &&
        (() => {
          const s = selSujet;
          const dispo = DISPO_CFG[s.disponibilite] || DISPO_CFG['EN_ATTENTE'];
          const niveau =
            NIVEAU_CFG[s.niveau] || NIVEAU_CFG[s.niveauRequis?.toUpperCase().replace(' ', '')];
          return (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(13,45,26,.5)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 200,
                padding: '1rem',
              }}
              onClick={(e) => e.target === e.currentTarget && setSelSujet(null)}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: 580,
                  background: '#fff',
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: '0 28px 72px rgba(13,45,26,.25)',
                  maxHeight: '92vh',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ background: G.grad, padding: '1.4rem 1.6rem', flexShrink: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 8,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: 6,
                          flexWrap: 'wrap',
                          marginBottom: '.55rem',
                        }}
                      >
                        <span
                          style={{
                            background: 'rgba(255,255,255,.2)',
                            color: '#fff',
                            fontSize: '.64rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 100,
                          }}
                        >
                          {s.domaine || 'PFE'}
                        </span>
                        {niveau && (
                          <span
                            style={{
                              background: 'rgba(255,255,255,.9)',
                              color: niveau.c,
                              fontSize: '.64rem',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: 100,
                            }}
                          >
                            {niveau.l}
                          </span>
                        )}
                      </div>
                      <h3
                        style={{
                          fontWeight: 800,
                          color: '#fff',
                          fontSize: '1.08rem',
                          lineHeight: 1.35,
                        }}
                      >
                        {s.titre}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelSujet(null)}
                      style={{
                        background: 'rgba(255,255,255,.15)',
                        border: 'none',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      <I.x />
                    </button>
                  </div>
                </div>
                <div style={{ padding: '1.4rem 1.6rem', overflowY: 'auto', flex: 1 }}>
                  {s.description && (
                    <div style={{ marginBottom: '1.1rem' }}>
                      <p
                        style={{
                          fontWeight: 700,
                          color: G.text,
                          fontSize: '.82rem',
                          marginBottom: '.4rem',
                        }}
                      >
                        Description
                      </p>
                      <p style={{ color: G.textSoft, fontSize: '.85rem', lineHeight: 1.78 }}>
                        {s.description}
                      </p>
                    </div>
                  )}
                  {s.technologies?.length > 0 && (
                    <div style={{ marginBottom: '1.1rem' }}>
                      <p
                        style={{
                          fontWeight: 700,
                          color: G.text,
                          fontSize: '.82rem',
                          marginBottom: '.45rem',
                        }}
                      >
                        Technologies
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {s.technologies.map((tech, i) => (
                          <span
                            key={i}
                            style={{
                              background: G.accentLight,
                              color: G.accent,
                              fontSize: '.73rem',
                              fontWeight: 600,
                              padding: '4px 12px',
                              borderRadius: 100,
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {s.idEncadrant?.utilisateur && (
                    <div
                      style={{
                        background: G.bg,
                        borderRadius: 11,
                        padding: '.9rem 1.1rem',
                        marginBottom: '1.1rem',
                        border: `1px solid ${G.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.85rem',
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: G.grad,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '.85rem',
                          flexShrink: 0,
                        }}
                      >
                        {(s.idEncadrant.utilisateur.prenom?.[0] || '') +
                          (s.idEncadrant.utilisateur.nom?.[0] || '')}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: G.text, fontSize: '.84rem' }}>
                          {s.idEncadrant.utilisateur.prenom} {s.idEncadrant.utilisateur.nom}
                        </p>
                        <p style={{ color: G.textMuted, fontSize: '.72rem' }}>
                          Encadrant · {s.idEncadrant.specialite || ''}
                        </p>
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '.7rem' }}>
                    {s.disponibilite === 'DISPONIBLE' && (
                      <button
                        onClick={() => {
                          setSelSujet(null);
                          navigate(`/candidater/${s._id}`);
                        }}
                        style={{
                          flex: 1,
                          padding: '.78rem',
                          borderRadius: 11,
                          background: G.grad,
                          color: '#fff',
                          border: 'none',
                          fontFamily: "'Plus Jakarta Sans',sans-serif",
                          fontWeight: 700,
                          fontSize: '.87rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(30,138,94,.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 7,
                        }}
                      >
                        <I.send /> Postuler à ce sujet
                      </button>
                    )}
                    <button
                      onClick={() => setSelSujet(null)}
                      style={{
                        padding: '.78rem 1.25rem',
                        borderRadius: 11,
                        background: 'transparent',
                        color: G.textSoft,
                        border: `1.5px solid ${G.border}`,
                        fontFamily: "'Plus Jakarta Sans',sans-serif",
                        fontWeight: 600,
                        fontSize: '.87rem',
                        cursor: 'pointer',
                      }}
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* ── Modal Postulation ── */}
      {modalSujet && (
        <PostulationModal
          sujet={modalSujet}
          onClose={() => setModalSujet(null)}
          onSuccess={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════
export default function DashboardEtudiant() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState('accueil');
  const [animKey, setAnimKey] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profilExtra, setProfilExtra] = useState(null);
  const [projet, setProjet] = useState(null);
  const [taches, setTaches] = useState([]);
  const [candidatures, setCandidatures] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [publications, setPublications] = useState([]);
  const [pubPopup, setPubPopup] = useState(null);
  const [sujets, setSujets] = useState([]);
  const [loading, setLoading] = useState(true);
  const pubPopupClosing = useRef(false);
  const pubShown = useRef(false);

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (publications.length > 0 && !pubShown.current) {
      const nonVue = publications.find(
        (p) => !localStorage.getItem('pfe_pub_seen_' + (user?._id || '') + '_' + p._id)
      );
      if (nonVue) {
        pubShown.current = true;
        setPubPopup(nonVue);
      }
    }
  }, [publications]);

  const handlePubPopupClose = async (pub) => {
    localStorage.setItem('pfe_pub_seen_' + (user?._id || '') + '_' + pub._id, '1');
    setPubPopup(null);
    try {
      await API.put('/publications/' + pub._id + '/vue');
    } catch {}
  };

  const fetchAll = async () => {
    try {
      const { data: e } = await API.get('/etudiants/mon-profil');
      setProfilExtra(e);
      try {
        const { data: p } = await API.get('/projets/mon-projet');
        setProjet(p);
      } catch {}
      try {
        const { data: t } = await API.get('/taches/mes-taches');
        setTaches(t);
      } catch {}
      try {
        const { data: c } = await API.get('/candidatures/mes-candidatures');
        setCandidatures(c);
      } catch {}
      try {
        const { data: ev } = await API.get('/evaluations/mes-evaluations');
        setEvaluations(ev);
      } catch {}
      try {
        const { data: s } = await API.get('/sujets');
        setSujets(s);
      } catch {}
      try {
        const { data: pubs } = await API.get('/publications?audience=ETUDIANT');
        const liste = pubs || [];
        setPublications(liste);
      } catch {}
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const goTo = (id) => {
    setPage(id);
    setAnimKey((k) => k + 1);
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: T.bg,
          fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 13,
              background: T.accentGrad,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto .85rem',
              boxShadow: '0 4px 16px rgba(45,158,107,.35)',
            }}
          >
            <svg
              width="22"
              height="22"
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
          <p style={{ color: T.accent, fontWeight: 700, fontSize: '.9rem' }}>Chargement…</p>
        </div>
      </div>
    );

  // ✅ Non VALIDE → InterfaceSujets
  if (profilExtra?.statutPFE !== 'VALIDE') {
    return (
      <InterfaceSujets
        user={user}
        logout={logout}
        navigate={navigate}
        profilExtra={profilExtra}
        sujets={sujets}
        candidatures={candidatures}
        onRefresh={fetchAll}
      />
    );
  }

  // ── DASHBOARD VALIDE ─────────────────────────────────────────
  return (
    <>
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:'Plus Jakarta Sans',sans-serif;}
      .etd-root{display:flex;min-height:100vh;background:${T.bg};font-family:'Plus Jakarta Sans',sans-serif;color:${T.text};}
      .etd-sidebar{height:100vh;position:sticky;top:0;display:flex;flex-direction:column;background:${T.sidebar};transition:width .22s ease;overflow:hidden;flex-shrink:0;z-index:20;}
      .etd-main{flex:1;display:flex;flex-direction:column;min-width:0;}
      .etd-topbar{position:sticky;top:0;z-index:10;background:#fff;border-bottom:1px solid ${T.cardBorder};padding:.75rem 1.5rem;display:flex;align-items:center;gap:.75rem;box-shadow:0 2px 12px rgba(45,158,107,.07);}
      .etd-content{padding:1.3rem 1.5rem;flex:1;overflow-y:auto;}
      .page-anim{animation:fadeSlide .22s ease;}
      @keyframes fadeSlide{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
      .etd-ni{display:flex;align-items:center;gap:.68rem;padding:.62rem .9rem .62rem 1rem;border-radius:9px;cursor:pointer;border:none;background:transparent;width:100%;text-align:left;font-family:'Plus Jakarta Sans',sans-serif;font-size:.82rem;font-weight:500;color:${T.sidebarText};border-left:3px solid transparent;transition:background .14s,color .14s;margin-bottom:.08rem;white-space:nowrap;}
      .etd-ni:hover{background:${T.sidebarHover};color:#fff;}
      .etd-ni.active{background:${T.sidebarActive};color:#fff;font-weight:700;border-left-color:${T.sidebarAccent};}
      .etd-ni svg{flex-shrink:0;opacity:.6;transition:opacity .14s;}
      .etd-ni:hover svg,.etd-ni.active svg{opacity:1;}
      .etd-close-btn{display:none !important;}
      ::-webkit-scrollbar{width:5px;height:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(45,158,107,.25);border-radius:3px;}
      @media(max-width:1024px){.etd-sidebar{width:60px !important;}.etd-sidebar .etd-ni span{display:none !important;}.etd-sidebar .etd-ni{padding:.62rem !important;justify-content:center;border-left:none !important;}}
      @media(max-width:768px){.etd-sidebar{position:fixed !important;width:232px !important;height:100vh;left:0;top:0;transform:translateX(-100%);transition:transform .22s ease,width .22s ease;box-shadow:0 8px 40px rgba(0,0,0,.3);}.etd-sidebar[data-mobile="open"]{transform:translateX(0) !important;}.etd-sidebar .etd-ni span{display:inline !important;}.etd-sidebar .etd-ni{padding:.62rem .9rem .62rem 1rem !important;justify-content:flex-start !important;border-left:3px solid transparent !important;}.etd-sidebar .etd-ni.active{border-left-color:${T.sidebarAccent} !important;}.etd-close-btn{display:flex !important;}.etd-menu-btn{display:flex !important;}.etd-content{padding:1rem !important;}.etd-topbar{padding:.65rem 1rem !important;}}
      @media(max-width:480px){.etd-content{padding:.75rem !important;}}
    `}</style>
      <div className="etd-root">
        <Sidebar
          page={page}
          goTo={goTo}
          user={user}
          logout={logout}
          navigate={navigate}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          closeMobile={() => setMobileOpen(false)}
        />
        <div className="etd-main">
          <Topbar
            page={page}
            navigate={navigate}
            user={user}
            onMenuClick={() => setMobileOpen(true)}
            goTo={goTo}
          />
          <div className="etd-content">
            <div key={animKey} className="page-anim">
              {page === 'accueil' && (
                <PageAccueil
                  user={user}
                  profilExtra={profilExtra}
                  taches={taches}
                  candidatures={candidatures}
                  evaluations={evaluations}
                  goTo={goTo}
                />
              )}
              {page === 'projet' && <PageProjet projet={projet} navigate={navigate} />}
              {page === 'taches' && <PageTaches taches={taches} onRefresh={fetchAll} />}
              {page === 'candidatures' && (
                <PageCandidatures candidatures={candidatures} navigate={navigate} />
              )}
              {page === 'evaluations' && <PageEvaluations evaluations={evaluations} />}
              {page === 'calendrier' && <CalendrierPage role="ETUDIANT" accentColor={T.accent} />}
              {page === 'notifications' && <PageNotifications />}
              {page === 'messages' && <PageMessages />}
              {page === 'feedbacks' && <PageFeedbacks />}
              {page === 'parametres' && <ParametresPage />}{' '}
              {page === 'profil' && (
                <PageProfil user={user} profilExtra={profilExtra} navigate={navigate} />
              )}
            </div>
          </div>
        </div>
      </div>
      {pubPopup && <PubPopup pub={pubPopup} onClose={handlePubPopupClose} />}
    </>
  );
}
