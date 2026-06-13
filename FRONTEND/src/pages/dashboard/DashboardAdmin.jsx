// DashboardAdmin.jsx — v5 Redesign
// ✅ Notifications: no popups, dedicated section for students & supervisors
// ✅ Sujets PFE: only Validé / Refusé (no En cours), immutable once set
// ✅ Search: fully functional
// ✅ SPA with sidebar + smooth transitions, green palette theme
// ✅ Déconnexion fonctionnelle
// ✅ FIX: PageUtilisateurs — variable `paged` définie + filtrée côté client
// ✅ FIX: Messagerie — badge de compteur sur l'onglet sidebar
// ✅ FIX: URLs messages corrigées /admin/messages → /support/messages
// ✅ FIX: Réponse et archivage messages corrigés
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

// ─── THEME ────────────────────────────────────────────────
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

// ─── ICONS ────────────────────────────────────────────────
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
  users: () => (
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
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  doc: () => (
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
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
  link: () => (
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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
  star: () => (
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
  bar: () => (
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
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  trend: () => (
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
  search: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
  checkSm: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  clock: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  trash: () => (
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
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  ),
  send: () => (
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
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  edit: () => (
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
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
  userCheck: () => (
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  ),
  archive: () => (
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
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
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
  eye: () => (
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
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
};

// ─── MOCK DATA ─────────────────────────────────────────────
const MOCK_USERS = [
  {
    _id: 'u1',
    prenom: 'Sarra',
    nom: 'Ben Ali',
    email: 'sarra@univ.tn',
    role: 'ETUDIANT',
    isValidated: true,
    codeReference: 'MAT2026001',
    createdAt: '2026-01-15',
  },
  {
    _id: 'u2',
    prenom: 'Mohamed',
    nom: 'Trabelsi',
    email: 'med@univ.tn',
    role: 'ETUDIANT',
    isValidated: false,
    codeReference: 'MAT2026002',
    createdAt: '2026-02-10',
  },
  {
    _id: 'u3',
    prenom: 'Kamel',
    nom: 'Ayari',
    email: 'kayari@univ.tn',
    role: 'ENCADRANT',
    isValidated: true,
    codeReference: 'ENC2026001',
    createdAt: '2025-09-01',
  },
  {
    _id: 'u4',
    prenom: 'Faten',
    nom: 'Rejeb',
    email: 'frejeb@univ.tn',
    role: 'ENCADRANT',
    isValidated: true,
    codeReference: 'ENC2026002',
    createdAt: '2025-09-01',
  },
  {
    _id: 'u5',
    prenom: 'Leila',
    nom: 'Hammami',
    email: 'leila@univ.tn',
    role: 'ETUDIANT',
    isValidated: false,
    codeReference: 'MAT2026003',
    createdAt: '2026-03-05',
  },
];

const MOCK_SUJETS = [
  {
    _id: 's1',
    titre: 'Système de matching IA pour PFE',
    description: "Développement d'un système de matching basé sur l'IA.",
    technologies: ['React', 'Python', 'TensorFlow'],
    statut: 'EN_ATTENTE',
    encadrant: 'Dr. Kamel Ayari',
    dateDepot: '2026-04-01',
  },
  {
    _id: 's2',
    titre: 'Application mobile de gestion RH',
    description: "Conception d'une application mobile complète pour la GRH.",
    technologies: ['Flutter', 'Node.js', 'MongoDB'],
    statut: 'VALIDE',
    encadrant: 'Dr. Faten Rejeb',
    dateDepot: '2026-03-20',
  },
  {
    _id: 's3',
    titre: "Deep Learning pour la détection d'anomalies",
    description: "Système de détection d'anomalies industrielles.",
    technologies: ['Python', 'PyTorch', 'OpenCV'],
    statut: 'EN_ATTENTE',
    encadrant: 'Dr. Kamel Ayari',
    dateDepot: '2026-04-10',
  },
  {
    _id: 's4',
    titre: 'Blockchain pour la supply chain',
    description: 'Solution blockchain pour la chaîne logistique.',
    technologies: ['Solidity', 'React', 'Web3.js'],
    statut: 'REFUSE',
    encadrant: 'Dr. Faten Rejeb',
    dateDepot: '2026-03-15',
  },
  {
    _id: 's5',
    titre: 'Plateforme e-learning adaptative',
    description: "Plateforme d'apprentissage adaptative utilisant l'IA.",
    technologies: ['Vue.js', 'FastAPI', 'PostgreSQL'],
    statut: 'EN_ATTENTE',
    encadrant: 'Dr. Kamel Ayari',
    dateDepot: '2026-04-18',
  },
];

const MOCK_NOTIFS = [
  {
    _id: 'n1',
    type: 'NOUVEAU_UTILISATEUR',
    titre: 'Nouvel utilisateur inscrit',
    description: 'Ali Ben Salah vient de créer un compte étudiant.',
    auteur: 'Ali Ben Salah',
    date: '2026-04-30T09:30:00',
    lu: false,
    cible: 'ADMIN',
  },
  {
    _id: 'n2',
    type: 'MESSAGE',
    titre: 'Nouveau message de contact',
    description: 'Un message a été envoyé depuis le formulaire de contact.',
    auteur: 'Darren Smith',
    date: '2026-04-29T14:22:00',
    lu: false,
    cible: 'ADMIN',
  },
  {
    _id: 'n3',
    type: 'SUJET_VALIDE',
    titre: 'Sujet validé',
    description: "Votre sujet 'Application mobile' a été validé.",
    auteur: 'Admin',
    date: '2026-04-29T11:05:00',
    lu: true,
    cible: 'ENCADRANT',
    encadrant: 'Dr. Faten Rejeb',
  },
  {
    _id: 'n4',
    type: 'SUJET_REFUSE',
    titre: 'Sujet refusé',
    description: "Votre sujet 'Blockchain' a été refusé par l'administrateur.",
    auteur: 'Admin',
    date: '2026-04-28T16:40:00',
    lu: false,
    cible: 'ENCADRANT',
    encadrant: 'Dr. Faten Rejeb',
  },
  {
    _id: 'n5',
    type: 'CONNEXION',
    titre: 'Connexion administrateur',
    description: 'Une connexion depuis un nouvel appareil a été détectée.',
    auteur: 'Système',
    date: '2026-04-28T08:15:00',
    lu: true,
    cible: 'ADMIN',
  },
  {
    _id: 'n6',
    type: 'AFFECTATION',
    titre: 'Nouveau projet affecté',
    description: "Vous avez été affecté(e) au sujet 'Système de matching IA'.",
    auteur: 'Admin',
    date: '2026-04-27T13:50:00',
    lu: false,
    cible: 'ETUDIANT',
    etudiant: 'Sarra Ben Ali',
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

const MOCK_EVALS = [
  {
    _id: 'e1',
    etudiant: { prenom: 'Sarra', nom: 'Ben Ali' },
    sujet: 'Système de matching IA pour PFE',
    encadrant: { prenom: 'Dr. Kamel', nom: 'Ayari' },
    note: 16.5,
    mention: 'Bien',
    date: '2026-04-20',
  },
  {
    _id: 'e2',
    etudiant: { prenom: 'Mohamed', nom: 'Trabelsi' },
    sujet: 'Application mobile de gestion RH',
    encadrant: { prenom: 'Dr. Faten', nom: 'Rejeb' },
    note: 14.0,
    mention: 'Assez Bien',
    date: '2026-04-19',
  },
  {
    _id: 'e3',
    etudiant: { prenom: 'Leila', nom: 'Hammami' },
    sujet: 'Plateforme e-learning adaptative',
    encadrant: { prenom: 'Dr. Kamel', nom: 'Ayari' },
    note: 18.5,
    mention: 'Très Bien',
    date: '2026-04-18',
  },
  {
    _id: 'e4',
    etudiant: { prenom: 'Ahmed', nom: 'Khelifi' },
    sujet: 'Blockchain pour la supply chain',
    encadrant: { prenom: 'Dr. Faten', nom: 'Rejeb' },
    note: 12.0,
    mention: 'Passable',
    date: '2026-04-17',
  },
];

const MOCK_PUBS = [
  {
    _id: 'p1',
    titre: 'Ouverture des inscriptions PFE 2026',
    contenu: "Les inscriptions pour les projets de fin d'études sont désormais ouvertes.",
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
    contenu: 'Un guide actualisé pour la rédaction du rapport final de PFE est disponible.',
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
    contenu: 'Le calendrier prévisionnel des soutenances a été mis en ligne.',
    auteur: 'Admin',
    date: '2026-04-01',
    statut: 'BROUILLON',
    vues: 0,
    type: 'CALENDRIER',
    audience: 'ENCADRANT',
  },
];

const NAV = [
  {
    section: 'Navigation',
    items: [
      { id: 'accueil', icon: I.grid, label: 'Accueil' },
      { id: 'utilisateurs', icon: I.users, label: 'Utilisateurs' },
      { id: 'sujets', icon: I.check, label: 'Sujets PFE' },
      { id: 'affectations', icon: I.link, label: 'Affectations' },
      { id: 'evaluations', icon: I.award, label: 'Évaluations' },
    ],
  },
  {
    section: 'Contenu',
    items: [
      { id: 'publications', icon: I.news, label: 'Publications' },
      { id: 'feedbacks', icon: I.star, label: 'Feedbacks' },
      { id: 'messagerie', icon: I.msg, label: 'Messagerie' },
      { id: 'notifications', icon: I.bell, label: 'Notifications', badge: true },
    ],
  },
  {
    section: 'Analytics',
    items: [
      { id: 'monitoring', icon: I.bar, label: 'Monitoring' },
      { id: 'statistiques', icon: I.trend, label: 'Statistiques' },
    ],
  },
];

// ─── HELPERS ──────────────────────────────────────────────
function Badge({ children, color, bg, style = {} }) {
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
        ...style,
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

function IconBtn({ icon: IconComp, onClick, color = T.accent, bg = T.accentSoft, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: bg,
        border: 'none',
        borderRadius: 7,
        padding: '.3rem .42rem',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        transition: 'all .14s',
      }}
    >
      <IconComp />
    </button>
  );
}

function Input({ value, onChange, placeholder, style = {} }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        padding: '.52rem .85rem',
        border: `1px solid ${T.cardBorder}`,
        borderRadius: 8,
        background: '#f8fdf9',
        fontFamily: 'inherit',
        fontSize: '.8rem',
        color: T.text,
        outline: 'none',
        transition: 'border-color .14s',
        ...style,
      }}
      onFocus={(e) => (e.target.style.borderColor = T.accent)}
      onBlur={(e) => (e.target.style.borderColor = T.cardBorder)}
    />
  );
}

function Select({ value, onChange, children, style = {} }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        padding: '.52rem .85rem',
        border: `1px solid ${T.cardBorder}`,
        borderRadius: 8,
        background: '#f8fdf9',
        fontFamily: 'inherit',
        fontSize: '.8rem',
        color: T.text,
        outline: 'none',
        ...style,
      }}
    >
      {children}
    </select>
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

function Stars({ value }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= value ? '#f59e0b' : '#d1fae5', fontSize: '.9rem' }}>
          ★
        </span>
      ))}
    </span>
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
        transition: 'transform .18s, box-shadow .18s',
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

function Pagination({ page, setPage, total, limit }) {
  const tp = Math.ceil(total / limit);
  if (tp <= 1) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '.65rem',
        marginTop: '.7rem',
      }}
    >
      <button
        disabled={page <= 1}
        onClick={() => setPage((p) => p - 1)}
        style={{
          background: T.card,
          border: `1px solid ${T.cardBorder}`,
          borderRadius: 8,
          padding: '.36rem .72rem',
          cursor: page <= 1 ? 'default' : 'pointer',
          fontSize: '.77rem',
          color: T.textSoft,
          opacity: page <= 1 ? 0.4 : 1,
          fontFamily: 'inherit',
        }}
      >
        ‹ Préc.
      </button>
      <span style={{ color: T.textMuted, fontSize: '.78rem', fontWeight: 600 }}>
        {page}/{tp}
      </span>
      <button
        disabled={page >= tp}
        onClick={() => setPage((p) => p + 1)}
        style={{
          background: T.card,
          border: `1px solid ${T.cardBorder}`,
          borderRadius: 8,
          padding: '.36rem .72rem',
          cursor: page >= tp ? 'default' : 'pointer',
          fontSize: '.77rem',
          color: T.textSoft,
          opacity: page >= tp ? 0.4 : 1,
          fontFamily: 'inherit',
        }}
      >
        Suiv. ›
      </button>
    </div>
  );
}

function notifCfg(type) {
  return (
    {
      NOUVEAU_UTILISATEUR: {
        label: 'Nouvel utilisateur',
        color: T.success,
        bg: T.successLight,
        icon: I.userCheck,
      },
      MESSAGE: { label: 'Message', color: T.accent, bg: T.accentLight, icon: I.msg },
      SUJET_VALIDE: { label: 'Sujet validé', color: T.success, bg: T.successLight, icon: I.check },
      SUJET_REFUSE: { label: 'Sujet refusé', color: T.danger, bg: T.dangerLight, icon: I.x },
      CONNEXION: { label: 'Connexion', color: T.info, bg: T.infoLight, icon: I.user },
      AFFECTATION: { label: 'Affectation', color: T.purple, bg: T.purpleLight, icon: I.link },
      EVALUATION: { label: 'Évaluation', color: T.warning, bg: T.warningLight, icon: I.award },

      FEEDBACK: { label: 'Feedback', color: T.warning, bg: T.warningLight, icon: I.star },
    }[type] || { label: type, color: T.textMuted, bg: T.cardBorder, icon: I.bell }
  );
}

function mentionColor(note) {
  if (note >= 16) return { color: T.success, bg: T.successLight };
  if (note >= 14) return { color: T.accent, bg: T.accentLight };
  if (note >= 12) return { color: T.warning, bg: T.warningLight };
  return { color: T.danger, bg: T.dangerLight };
}

// ─── PAGE COMPONENTS ──────────────────────────────────────

function PageAccueil({ users, sujets, evals, fbs, notifs, stats, goTo }) {
  const approvedFbs = fbs.filter((f) => f.statut === 'APPROUVE');
  const avgNote = approvedFbs.length
    ? (approvedFbs.reduce((s, f) => s + f.note, 0) / approvedFbs.length).toFixed(1)
    : '—';
  const pending = stats.usersEnAttente || users.filter((u) => !u.isValidated).length;
  const pendingSujets = sujets.filter((s) => s.statut === 'EN_ATTENTE').length;
  const unread = notifs.filter((n) => !n.lu).length;

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
        <div
          style={{
            position: 'absolute',
            bottom: -30,
            right: 40,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(255,255,255,.05)',
            pointerEvents: 'none',
          }}
        />
        <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.8rem', marginBottom: '.2rem' }}>
          Bienvenue 👋
        </p>
        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem', marginBottom: '.18rem' }}>
          Administrateur PFE
        </h2>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.8rem', marginBottom: '1rem' }}>
          Plateforme de gestion des Projets de Fin d'Études
        </p>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Utilisateurs', id: 'utilisateurs' },
            { label: 'Sujets PFE', id: 'sujets' },
            { label: 'Statistiques', id: 'statistiques' },
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
            fontSize: '3.5rem',
            opacity: 0.12,
          }}
        >
          🛡️
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
          icon={I.users}
          value={users.length}
          label="Utilisateurs"
          color={T.accent}
          bg={T.accentLight}
          sub={`${pending} en attente`}
        />
        <StatCard
          icon={I.check}
          value={sujets.length}
          label="Sujets PFE"
          color={T.info}
          bg={T.infoLight}
          sub={`${pendingSujets} à traiter`}
        />
        <StatCard
          icon={I.award}
          value={evals.length}
          label="Évaluations"
          color={T.warning}
          bg={T.warningLight}
        />
        <StatCard
          icon={I.star}
          value={avgNote}
          label="Note moy."
          color={T.success}
          bg={T.successLight}
          sub={`${approvedFbs.length} approuvés`}
        />
        <StatCard
          icon={I.bell}
          value={unread}
          label="Non lues"
          color={T.purple}
          bg={T.purpleLight}
          sub="notifications"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(195px,1fr))',
          gap: '.85rem',
        }}
      >
        {[
          {
            label: 'Valider utilisateurs',
            page: 'utilisateurs',
            icon: I.userCheck,
            desc: `${pending} comptes en attente`,
            color: T.accent,
            bg: T.accentLight,
          },
          {
            label: 'Gérer les sujets',
            page: 'sujets',
            icon: I.check,
            desc: `${pendingSujets} sujets à traiter`,
            color: T.info,
            bg: T.infoLight,
          },
          {
            label: 'Voir évaluations',
            page: 'evaluations',
            icon: I.award,
            desc: `${evals.length} notes saisies`,
            color: T.warning,
            bg: T.warningLight,
          },
          {
            label: 'Notifications',
            page: 'notifications',
            icon: I.bell,
            desc: `${unread} non lues`,
            color: T.purple,
            bg: T.purpleLight,
          },
        ].map((item, i) => (
          <button
            key={i}
            onClick={() => goTo(item.page)}
            style={{
              background: T.card,
              border: `1px solid ${T.cardBorder}`,
              borderRadius: 13,
              padding: '1.1rem',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'inherit',
              transition: 'all .2s',
              boxShadow: T.shadow,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = item.color;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = T.shadowMd;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = T.cardBorder;
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = T.shadow;
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: item.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: item.color,
                marginBottom: '.6rem',
              }}
            >
              <item.icon />
            </div>
            <p style={{ fontWeight: 700, color: T.text, fontSize: '.84rem' }}>{item.label}</p>
            <p style={{ color: T.textMuted, fontSize: '.72rem', marginTop: '.14rem' }}>
              {item.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function PageUtilisateurs({
  users,
  usersPage,
  setUsersPage,
  usersTotal,
  uF,
  setUF,
  onValidate,
  onEdit,
  onToggleActive,
  onDelete,
  showAddUser,
  setShowAddUser,
  addUserForm,
  setAddUserForm,
  addUserError,
  setAddUserError,
  addUserLoading,
  onAddUser,
}) {
  const LIMIT = 50;

  const filtered = useMemo(() => {
    let list = [...users];
    if (uF.search) {
      const q = uF.search.toLowerCase();
      list = list.filter((u) =>
        `${u.prenom} ${u.nom} ${u.email} ${u.codeReference || ''}`.toLowerCase().includes(q)
      );
    }
    if (uF.role) list = list.filter((u) => u.role === uF.role);
    if (uF.isValidated !== '') list = list.filter((u) => String(u.isValidated) === uF.isValidated);
    return list;
  }, [users, uF]);

  const paged = useMemo(() => {
    const start = (usersPage - 1) * LIMIT;
    return filtered.slice(start, start + LIMIT);
  }, [filtered, usersPage]);

  const total = usersTotal > 0 ? usersTotal : filtered.length;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '.6rem',
          flexWrap: 'wrap',
          marginBottom: '1rem',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '.4rem',
            background: '#f8fdf9',
            border: `1px solid ${T.cardBorder}`,
            borderRadius: 8,
            padding: '.48rem .8rem',
            flex: 1,
            minWidth: 180,
          }}
        >
          <span style={{ color: T.textMuted }}>
            <I.search />
          </span>
          <input
            value={uF.search}
            onChange={(e) => {
              setUF((f) => ({ ...f, search: e.target.value }));
              setUsersPage(1);
            }}
            placeholder="Rechercher…"
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              fontSize: '.8rem',
              color: T.text,
              width: '100%',
            }}
          />
        </div>
        <Select
          value={uF.role}
          onChange={(e) => {
            setUF((f) => ({ ...f, role: e.target.value }));
            setUsersPage(1);
          }}
        >
          <option value="">Tous les rôles</option>
          <option value="ETUDIANT">Étudiant</option>
          <option value="ENCADRANT">Encadrant</option>
          <option value="ADMINISTRATEUR">Admin</option>
        </Select>
        <Select
          value={uF.isValidated}
          onChange={(e) => {
            setUF((f) => ({ ...f, isValidated: e.target.value }));
            setUsersPage(1);
          }}
        >
          <option value="">Tous statuts</option>
          <option value="true">Validés</option>
          <option value="false">En attente</option>
        </Select>
        <span style={{ color: T.textMuted, fontSize: '.78rem' }}>
          {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
        </span>
        <Btn
          onClick={() => setShowAddUser(true)}
          style={{ fontSize: '.74rem', marginLeft: 'auto' }}
        >
          <I.plus /> Ajouter
        </Btn>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4faf7' }}>
              {['Nom', 'Email', 'Rôle', 'Réf.', 'Statut', 'Inscription', 'Actions'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '.7rem 1rem',
                    fontSize: '.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.07em',
                    color: T.textMuted,
                    borderBottom: `1px solid ${T.cardBorder}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((u) => (
              <tr
                key={u._id}
                style={{ borderBottom: `1px solid #f0f9f5` }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fdf9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
              >
                <td
                  style={{
                    padding: '.7rem 1rem',
                    fontWeight: 700,
                    fontSize: '.8rem',
                    color: T.text,
                  }}
                >
                  {u.prenom} {u.nom}
                </td>
                <td style={{ padding: '.7rem 1rem', color: T.textSoft, fontSize: '.78rem' }}>
                  {u.email}
                </td>
                <td style={{ padding: '.7rem 1rem' }}>
                  <Badge
                    color={
                      u.role === 'ADMINISTRATEUR'
                        ? T.danger
                        : u.role === 'ENCADRANT'
                          ? T.purple
                          : T.success
                    }
                    bg={
                      u.role === 'ADMINISTRATEUR'
                        ? T.dangerLight
                        : u.role === 'ENCADRANT'
                          ? T.purpleLight
                          : T.successLight
                    }
                  >
                    {u.role}
                  </Badge>
                </td>
                <td
                  style={{
                    padding: '.7rem 1rem',
                    color: T.textMuted,
                    fontFamily: 'monospace',
                    fontSize: '.75rem',
                  }}
                >
                  {u.codeReference ||
                    u.matricule ||
                    u.reference ||
                    u.code ||
                    u.numEtudiant ||
                    '—'}{' '}
                </td>
                <td style={{ padding: '.7rem 1rem' }}>
                  <Badge
                    color={u.isValidated ? T.success : T.warning}
                    bg={u.isValidated ? T.successLight : T.warningLight}
                  >
                    {u.isValidated ? 'Validé' : 'En attente'}
                  </Badge>
                </td>
                <td style={{ padding: '.7rem 1rem', color: T.textMuted, fontSize: '.72rem' }}>
                  {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td style={{ padding: '.7rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '.3rem' }}>
                    {!u.isValidated && (
                      <IconBtn
                        icon={I.checkSm}
                        onClick={() => onValidate(u._id)}
                        color={T.success}
                        bg={T.successLight}
                        title="Valider"
                      />
                    )}

                    <IconBtn
                      icon={u.isActive ? I.x : I.checkSm}
                      onClick={() => onToggleActive(u._id)}
                      color={u.isActive ? T.warning : T.success}
                      bg={u.isActive ? T.warningLight : T.successLight}
                      title={u.isActive ? 'Désactiver' : 'Activer'}
                    />

                    <IconBtn
                      icon={I.edit}
                      onClick={() => onEdit(u)}
                      color={T.accent}
                      bg={T.accentLight}
                      title="Modifier"
                    />

                    {u.role !== 'ADMINISTRATEUR' && (
                      <IconBtn
                        icon={I.trash}
                        onClick={() => onDelete(u._id)}
                        color={T.danger}
                        bg={T.dangerLight}
                        title="Supprimer"
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!paged.length && (
          <p
            style={{ textAlign: 'center', color: T.textMuted, padding: '2rem', fontSize: '.82rem' }}
          >
            Aucun utilisateur trouvé
          </p>
        )}
      </Card>
      <Pagination page={usersPage} setPage={setUsersPage} total={total} limit={LIMIT} />

      {showAddUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,25,20,.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '1rem',
          }}
          onClick={(e) => e.target === e.currentTarget && setShowAddUser(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 500,
              background: '#fff',
              borderRadius: 16,
              padding: '1.75rem',
              boxShadow: '0 24px 60px rgba(0,0,0,.2)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}
            >
              <h3 style={{ fontWeight: 800, fontSize: 15, color: T.text }}>
                Ajouter un utilisateur
              </h3>
              <button
                onClick={() => setShowAddUser(false)}
                style={{
                  background: '#f0f3f6',
                  border: 'none',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: T.textSoft,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>
            {addUserError && (
              <div
                style={{
                  background: T.dangerLight,
                  border: `1px solid ${T.danger}40`,
                  borderRadius: 9,
                  padding: '10px 14px',
                  marginBottom: 12,
                  color: T.danger,
                  fontSize: 13,
                }}
              >
                ⚠ {addUserError}
              </div>
            )}
            <form onSubmit={onAddUser} style={{ display: 'grid', gap: '.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem' }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 4 }}>
                    Prénom *
                  </p>
                  <input
                    required
                    placeholder="Prénom"
                    value={addUserForm.prenom}
                    onChange={(e) => setAddUserForm((p) => ({ ...p, prenom: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '.65rem .9rem',
                      borderRadius: 9,
                      border: `1px solid ${T.cardBorder}`,
                      fontFamily: 'inherit',
                      fontSize: 13,
                      color: T.text,
                      outline: 'none',
                      background: '#f8fdf9',
                    }}
                  />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 4 }}>
                    Nom *
                  </p>
                  <input
                    required
                    placeholder="Nom"
                    value={addUserForm.nom}
                    onChange={(e) => setAddUserForm((p) => ({ ...p, nom: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '.65rem .9rem',
                      borderRadius: 9,
                      border: `1px solid ${T.cardBorder}`,
                      fontFamily: 'inherit',
                      fontSize: 13,
                      color: T.text,
                      outline: 'none',
                      background: '#f8fdf9',
                    }}
                  />
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 4 }}>
                  Email *
                </p>
                <input
                  required
                  type="email"
                  placeholder="email@exemple.com"
                  value={addUserForm.email}
                  onChange={(e) => setAddUserForm((p) => ({ ...p, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '.65rem .9rem',
                    borderRadius: 9,
                    border: `1px solid ${T.cardBorder}`,
                    fontFamily: 'inherit',
                    fontSize: 13,
                    color: T.text,
                    outline: 'none',
                    background: '#f8fdf9',
                  }}
                />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 4 }}>
                  Mot de passe *
                </p>
                <input
                  required
                  type="password"
                  placeholder="Minimum 6 caractères"
                  value={addUserForm.mot_de_passe}
                  onChange={(e) => setAddUserForm((p) => ({ ...p, mot_de_passe: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '.65rem .9rem',
                    borderRadius: 9,
                    border: `1px solid ${T.cardBorder}`,
                    fontFamily: 'inherit',
                    fontSize: 13,
                    color: T.text,
                    outline: 'none',
                    background: '#f8fdf9',
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem' }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 4 }}>
                    Rôle *
                  </p>
                  <select
                    value={addUserForm.role}
                    onChange={(e) => setAddUserForm((p) => ({ ...p, role: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '.65rem .9rem',
                      borderRadius: 9,
                      border: `1px solid ${T.cardBorder}`,
                      fontFamily: 'inherit',
                      fontSize: 13,
                      color: T.text,
                      outline: 'none',
                      background: '#f8fdf9',
                    }}
                  >
                    <option value="ETUDIANT">Étudiant</option>
                    <option value="ENCADRANT">Encadrant</option>
                    <option value="ADMINISTRATEUR">Administrateur</option>
                  </select>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 4 }}>
                    Téléphone
                  </p>
                  <input
                    placeholder="+216 XX XXX XXX"
                    value={addUserForm.telephone}
                    onChange={(e) => setAddUserForm((p) => ({ ...p, telephone: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '.65rem .9rem',
                      borderRadius: 9,
                      border: `1px solid ${T.cardBorder}`,
                      fontFamily: 'inherit',
                      fontSize: 13,
                      color: T.text,
                      outline: 'none',
                      background: '#f8fdf9',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '.65rem', marginTop: '.25rem' }}>
                <Btn
                  variant="ghost"
                  onClick={() => setShowAddUser(false)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Annuler
                </Btn>
                <Btn
                  type="submit"
                  disabled={addUserLoading}
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  {addUserLoading ? '⏳ Création...' : 'Créer'}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PageSujets({ sujets, setSujets, setNotifs, onDecision }) {
  const [filter, setFilter] = useState('');
  const [modalDelai, setModalDelai] = useState(false); // modal global
  const [delaiForm, setDelaiForm] = useState({
    dateDebutPostulation: '',
    dateFinPostulation: '',
    maxCandidatsInterview: 5,
  });
  const [savingDelai, setSavingDelai] = useState(false);
  const [delaiOk, setDelaiOk] = useState(false);
  const [delaiProgress, setDelaiProgress] = useState(0); // nb sujets traités

  const ouvrirModalDelai = () => {
    // Pré-remplir avec les valeurs communes (1er sujet qui en a)
    const ref = sujets.find((s) => s.dateDebutPostulation) || sujets[0];
    setDelaiForm({
      dateDebutPostulation: ref?.dateDebutPostulation ? ref.dateDebutPostulation.slice(0, 10) : '',
      dateFinPostulation: ref?.dateFinPostulation ? ref.dateFinPostulation.slice(0, 10) : '',
      maxCandidatsInterview: ref?.maxCandidatsInterview || 5,
    });
    setDelaiOk(false);
    setDelaiProgress(0);
    setModalDelai(true);
  };

  const sauvegarderDelai = async () => {
    setSavingDelai(true);
    setDelaiProgress(0);
    try {
      // Appliquer le délai à TOUS les sujets en parallèle
      const promises = sujets.map(
        (s) =>
          API.put(`/sujets/${s._id}/delai`, delaiForm)
            .then(() => setDelaiProgress((p) => p + 1))
            .catch(() => {}) // ignorer les erreurs individuelles
      );
      await Promise.all(promises);
      // Mettre à jour tous les sujets dans le state local
      setSujets((prev) => prev.map((s) => ({ ...s, ...delaiForm })));
      setDelaiOk(true);
      setTimeout(() => {
        setModalDelai(false);
        setDelaiOk(false);
      }, 1800);
    } catch (err) {
      alert('Erreur : ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingDelai(false);
    }
  };
  const filtered = filter ? sujets.filter((s) => s.statut === filter) : sujets;
  const counts = {
    EN_ATTENTE: sujets.filter((s) => s.statut === 'EN_ATTENTE').length,
    VALIDE: sujets.filter((s) => s.statut === 'VALIDE').length,
    REFUSE: sujets.filter((s) => s.statut === 'REFUSE').length,
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.1rem',
          alignItems: 'center',
        }}
      >
        {[
          { val: '', label: 'Tous', cnt: sujets.length, color: T.accent },
          { val: 'EN_ATTENTE', label: 'En attente', cnt: counts.EN_ATTENTE, color: T.warning },
          { val: 'VALIDE', label: 'Validés', cnt: counts.VALIDE, color: T.success },
          { val: 'REFUSE', label: 'Refusés', cnt: counts.REFUSE, color: T.danger },
        ].map((f) => (
          <button
            key={f.val}
            onClick={() => setFilter(f.val)}
            style={{
              padding: '.36rem .85rem',
              borderRadius: 8,
              border: `1px solid ${filter === f.val ? f.color : T.cardBorder}`,
              background: filter === f.val ? `${f.color}18` : 'transparent',
              color: filter === f.val ? f.color : T.textSoft,
              fontFamily: 'inherit',
              fontSize: '.77rem',
              fontWeight: filter === f.val ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            {f.label}
            <span
              style={{
                background: filter === f.val ? f.color : T.cardBorder,
                color: filter === f.val ? '#fff' : T.textSoft,
                borderRadius: 999,
                padding: '0 5px',
                fontSize: '.62rem',
                fontWeight: 800,
              }}
            >
              {f.cnt}
            </span>
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <Btn
            variant="ghost"
            onClick={ouvrirModalDelai}
            style={{
              fontSize: '.78rem',
              padding: '.42rem 1rem',
              border: '1.5px solid #1a7a8a',
              color: '#1a7a8a',
              display: 'flex',
              alignItems: 'center',
              gap: '.4rem',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Délai de postulation — Tous les sujets
          </Btn>
        </div>
      </div>
      {filtered.map((s) => {
        const isDecided = s.statut === 'VALIDE' || s.statut === 'REFUSE';
        const statusColor =
          s.statut === 'VALIDE' ? T.success : s.statut === 'REFUSE' ? T.danger : T.warning;
        const statusBg =
          s.statut === 'VALIDE'
            ? T.successLight
            : s.statut === 'REFUSE'
              ? T.dangerLight
              : T.warningLight;
        const label =
          s.statut === 'VALIDE' ? 'Validé' : s.statut === 'REFUSE' ? 'Refusé' : 'En attente';
        return (
          <div
            key={s._id}
            style={{
              background: T.card,
              border: `1px solid ${T.cardBorder}`,
              borderLeft: `3px solid ${statusColor}`,
              borderRadius: 12,
              padding: '.95rem 1.1rem',
              marginBottom: '.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '.85rem',
              transition: 'box-shadow .15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = T.shadowMd)}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.55rem',
                  marginBottom: '.32rem',
                  flexWrap: 'wrap',
                }}
              >
                <p style={{ fontWeight: 700, color: T.text, fontSize: '.85rem' }}>{s.titre}</p>
                <Badge color={statusColor} bg={statusBg}>
                  {label}
                </Badge>
                {isDecided && (
                  <Badge color={T.textMuted} bg="#f0f9f5" style={{ fontSize: '.6rem' }}>
                    Définitif
                  </Badge>
                )}
              </div>
              <p
                style={{
                  color: T.textSoft,
                  fontSize: '.76rem',
                  marginBottom: '.32rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {s.description}
              </p>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '.7rem', flexWrap: 'wrap' }}
              >
                <span
                  style={{
                    color: T.textMuted,
                    fontSize: '.72rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <svg
                    width="11"
                    height="11"
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
                  {s.encadrant}
                </span>
                <span
                  style={{
                    color: T.textMuted,
                    fontSize: '.72rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <svg
                    width="11"
                    height="11"
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
                  {s.dateDepot}
                </span>
                {s.technologies?.map((t, i) => (
                  <span
                    key={i}
                    style={{
                      background: T.accentLight,
                      color: T.accent,
                      padding: '.1rem .45rem',
                      borderRadius: 999,
                      fontSize: '.63rem',
                      fontWeight: 700,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.4rem', flexShrink: 0, alignItems: 'center' }}>
              {isDecided ? (
                <span
                  style={{
                    color: T.textMuted,
                    fontSize: '.72rem',
                    fontStyle: 'italic',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Décision finale
                </span>
              ) : (
                <>
                  <Btn
                    variant="success"
                    onClick={() => onDecision(s._id, 'VALIDE')}
                    style={{ fontSize: '.74rem', padding: '.38rem .8rem' }}
                  >
                    <I.checkSm /> Valider
                  </Btn>
                  <Btn
                    variant="danger"
                    onClick={() => onDecision(s._id, 'REFUSE')}
                    style={{ fontSize: '.74rem', padding: '.38rem .8rem' }}
                  >
                    <I.x /> Refuser
                  </Btn>
                </>
              )}
            </div>
          </div>
        );
      })}
      {!filtered.length && (
        <Card style={{ textAlign: 'center', padding: '3rem', color: T.textMuted }}>
          <p style={{ fontSize: '2rem', marginBottom: '.65rem', opacity: 0.35 }}>📋</p>
          <p style={{ fontSize: '.84rem' }}>Aucun sujet{filter ? ` avec ce statut` : ''}</p>
        </Card>
      )}

      {/* ── Modal délai de postulation ── */}
      {modalDelai && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: '2rem',
              width: '100%',
              maxWidth: 420,
              boxShadow: '0 20px 60px rgba(0,0,0,.2)',
            }}
          >
            <h3
              style={{
                fontWeight: 800,
                fontSize: '1.1rem',
                color: '#1e293b',
                marginBottom: '.35rem',
                display: 'flex',
                alignItems: 'center',
                gap: '.4rem',
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: 4, verticalAlign: 'middle' }}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Délai de postulation
            </h3>
            <p style={{ color: '#64748b', fontSize: '.82rem', marginBottom: '1.25rem' }}>
              S'applique à <strong>{sujets.length}</strong> sujet{sujets.length > 1 ? 's' : ''}
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '.9rem',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '.78rem',
                    fontWeight: 700,
                    color: '#475569',
                    marginBottom: '.3rem',
                  }}
                >
                  Date d'ouverture des candidatures
                </label>
                <input
                  type="date"
                  value={delaiForm.dateDebutPostulation}
                  onChange={(e) =>
                    setDelaiForm((f) => ({ ...f, dateDebutPostulation: e.target.value }))
                  }
                  style={{
                    width: '100%',
                    padding: '.65rem .85rem',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 8,
                    fontFamily: 'inherit',
                    fontSize: '.85rem',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '.78rem',
                    fontWeight: 700,
                    color: '#475569',
                    marginBottom: '.3rem',
                  }}
                >
                  Date de clôture des candidatures
                </label>
                <input
                  type="date"
                  value={delaiForm.dateFinPostulation}
                  onChange={(e) =>
                    setDelaiForm((f) => ({ ...f, dateFinPostulation: e.target.value }))
                  }
                  style={{
                    width: '100%',
                    padding: '.65rem .85rem',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 8,
                    fontFamily: 'inherit',
                    fontSize: '.85rem',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '.78rem',
                    fontWeight: 700,
                    color: '#475569',
                    marginBottom: '.3rem',
                  }}
                >
                  Nombre max de candidats convoqués en entretien
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={delaiForm.maxCandidatsInterview}
                  onChange={(e) =>
                    setDelaiForm((f) => ({
                      ...f,
                      maxCandidatsInterview: parseInt(e.target.value) || 5,
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: '.65rem .85rem',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 8,
                    fontFamily: 'inherit',
                    fontSize: '.85rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {delaiOk && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #22c55e',
                  borderRadius: 8,
                  padding: '.65rem .9rem',
                  marginBottom: '1rem',
                  color: '#16a34a',
                  fontWeight: 700,
                  fontSize: '.82rem',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginRight: 5, verticalAlign: 'middle' }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Délai enregistré !
              </div>
            )}

            <div style={{ display: 'flex', gap: '.65rem' }}>
              <button
                onClick={() => setModalDelai(null)}
                style={{
                  flex: 1,
                  padding: '.7rem',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 8,
                  background: 'transparent',
                  color: '#64748b',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  fontSize: '.85rem',
                  cursor: 'pointer',
                }}
              >
                Annuler
              </button>
              <button
                onClick={sauvegarderDelai}
                disabled={savingDelai}
                style={{
                  flex: 2,
                  padding: '.7rem',
                  border: 'none',
                  borderRadius: 8,
                  background: '#1a7a8a',
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  fontSize: '.85rem',
                  cursor: savingDelai ? 'wait' : 'pointer',
                  opacity: savingDelai ? 0.7 : 1,
                }}
              >
                {savingDelai ? 'Enregistrement…' : 'Enregistrer le délai'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PageNotifications({ notifs, setNotifs }) {
  const [viewFilter, setViewFilter] = useState('ALL');
  const [showSendForm, setShowSendForm] = useState(false);
  const [sendForm, setSendForm] = useState({
    titre: '',
    description: '',
    cible: 'TOUS',
    type: 'SYSTEME',
  });
  const [sendSuccess, setSendSuccess] = useState(false);

  const filtered = viewFilter === 'ALL' ? notifs : notifs.filter((n) => n.cible === viewFilter);
  const unread = notifs.filter((n) => !n.lu);
  const read = filtered.filter((n) => n.lu);
  const unreadFiltered = filtered.filter((n) => !n.lu);

  const markRead = async (id) => {
    setNotifs((prev) => prev.map((n) => (n._id === id ? { ...n, lu: true } : n)));
    try {
      await API.put(`/notifications/${id}/lue`);
    } catch {}
  };
  const dismiss = (id) => setNotifs((prev) => prev.filter((n) => n._id !== id));
  const markAll = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, lu: true })));
    try {
      await API.put('/notifications/toutes-lues');
    } catch {}
  };
  const handleSend = async () => {
    if (!sendForm.titre.trim() || !sendForm.description.trim()) return;
    let rolesCibles = [];
    if (sendForm.cible === 'TOUS') rolesCibles = ['ETUDIANT', 'ENCADRANT', 'ADMINISTRATEUR'];
    else if (sendForm.cible === 'ETUDIANT') rolesCibles = ['ETUDIANT'];
    else if (sendForm.cible === 'ENCADRANT') rolesCibles = ['ENCADRANT'];
    try {
      await API.post('/admin/notifications', {
        titre: sendForm.titre,
        contenu: sendForm.description,
        type: sendForm.type || 'SYSTEME',
        rolesCibles,
      });
      const cibles = sendForm.cible === 'TOUS' ? ['ETUDIANT', 'ENCADRANT'] : [sendForm.cible];
      const newNotifs = cibles.map((cible) => ({
        _id: `n_send_${Date.now()}_${cible}`,
        type: sendForm.type,
        titre: sendForm.titre,
        description: sendForm.description,
        auteur: 'Admin',
        date: new Date().toISOString(),
        lu: false,
        cible,
      }));
      setNotifs((prev) => [...newNotifs, ...prev]);
      setSendForm({ titre: '', description: '', cible: 'TOUS', type: 'SYSTEME' });
      setShowSendForm(false);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur envoi notification:', err);
      alert("Erreur lors de l'envoi. Vérifiez la console.");
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '.65rem',
        }}
      >
        <div>
          <h2
            style={{ fontWeight: 800, fontSize: '1.4rem', color: T.text, letterSpacing: '-.02em' }}
          >
            Notifications
          </h2>
          <p style={{ color: T.textMuted, fontSize: '.78rem', marginTop: '.1rem' }}>
            {unread.length} non lue{unread.length !== 1 ? 's' : ''} · {notifs.length} au total
          </p>
        </div>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          {unread.length > 0 && (
            <Btn variant="ghost" onClick={markAll} style={{ fontSize: '.74rem' }}>
              <I.checkSm /> Tout marquer lu
            </Btn>
          )}
          <Btn onClick={() => setShowSendForm((s) => !s)} style={{ fontSize: '.74rem' }}>
            <I.send /> Envoyer une notification
          </Btn>
        </div>
      </div>

      {sendSuccess && (
        <div
          style={{
            background: T.successLight,
            border: `1px solid ${T.success}`,
            borderRadius: 10,
            padding: '.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '.6rem',
            color: T.success,
            fontWeight: 700,
            fontSize: '.82rem',
          }}
        >
          <I.checkSm /> Notification envoyée avec succès !
        </div>
      )}

      {showSendForm && (
        <Card style={{ border: `2px solid ${T.accent}`, marginBottom: '1.2rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '.95rem',
            }}
          >
            <span
              style={{
                fontWeight: 700,
                color: T.text,
                fontSize: '.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ color: T.accent }}>
                <I.send />
              </span>{' '}
              Envoyer une notification
            </span>
            <IconBtn
              icon={I.x}
              onClick={() => setShowSendForm(false)}
              color={T.textMuted}
              bg={T.cardBorder}
            />
          </div>
          <div style={{ display: 'grid', gap: '.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem' }}>
              <div>
                <p
                  style={{
                    fontSize: '.7rem',
                    fontWeight: 700,
                    color: T.textSoft,
                    marginBottom: '.28rem',
                  }}
                >
                  Destinataires *
                </p>
                <Select
                  value={sendForm.cible}
                  onChange={(e) => setSendForm((f) => ({ ...f, cible: e.target.value }))}
                  style={{ width: '100%' }}
                >
                  <option value="TOUS">Tous (étudiants + encadrants)</option>
                  <option value="ETUDIANT">Étudiants uniquement</option>
                  <option value="ENCADRANT">Encadrants uniquement</option>
                </Select>
              </div>
              <div>
                <p
                  style={{
                    fontSize: '.7rem',
                    fontWeight: 700,
                    color: T.textSoft,
                    marginBottom: '.28rem',
                  }}
                >
                  Type
                </p>
                <Select
                  value={sendForm.type}
                  onChange={(e) => setSendForm((f) => ({ ...f, type: e.target.value }))}
                  style={{ width: '100%' }}
                >
                  {[
                    { val: 'SYSTEME', label: 'Système' },
                    { val: 'ANNONCE', label: 'Annonce' },
                    { val: 'RAPPEL', label: 'Rappel' },
                    { val: 'MESSAGE', label: 'Message' },
                  ].map((o) => (
                    <option key={o.val} value={o.val}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <p
                style={{
                  fontSize: '.7rem',
                  fontWeight: 700,
                  color: T.textSoft,
                  marginBottom: '.28rem',
                }}
              >
                Titre *
              </p>
              <Input
                value={sendForm.titre}
                onChange={(e) => setSendForm((f) => ({ ...f, titre: e.target.value }))}
                placeholder="Ex: Rappel dépôt rapport final"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <p
                style={{
                  fontSize: '.7rem',
                  fontWeight: 700,
                  color: T.textSoft,
                  marginBottom: '.28rem',
                }}
              >
                Message *
              </p>
              <textarea
                value={sendForm.description}
                onChange={(e) => setSendForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Contenu de la notification…"
                rows={3}
                style={{
                  padding: '.52rem .85rem',
                  border: `1px solid ${T.cardBorder}`,
                  borderRadius: 8,
                  background: '#f8fdf9',
                  fontFamily: 'inherit',
                  fontSize: '.8rem',
                  color: T.text,
                  outline: 'none',
                  resize: 'vertical',
                  width: '100%',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
              <Btn
                variant="ghost"
                onClick={() => setShowSendForm(false)}
                style={{ fontSize: '.78rem' }}
              >
                Annuler
              </Btn>
              <Btn
                onClick={handleSend}
                disabled={!sendForm.titre.trim() || !sendForm.description.trim()}
                style={{ fontSize: '.78rem' }}
              >
                <I.send /> Envoyer
              </Btn>
            </div>
          </div>
        </Card>
      )}

      <div
        style={{
          display: 'flex',
          gap: '.4rem',
          marginBottom: '1.25rem',
          background: '#f4faf7',
          borderRadius: 10,
          padding: '.3rem',
        }}
      >
        {[
          { val: 'ALL', label: 'Toutes', cnt: notifs.length },
          { val: 'ADMIN', label: 'Admin', cnt: notifs.filter((n) => n.cible === 'ADMIN').length },
          {
            val: 'ENCADRANT',
            label: 'Encadrants',
            cnt: notifs.filter((n) => n.cible === 'ENCADRANT').length,
          },
          {
            val: 'ETUDIANT',
            label: 'Étudiants',
            cnt: notifs.filter((n) => n.cible === 'ETUDIANT').length,
          },
        ].map((tab) => (
          <button
            key={tab.val}
            onClick={() => setViewFilter(tab.val)}
            style={{
              flex: 1,
              padding: '.42rem .6rem',
              borderRadius: 8,
              border: 'none',
              background: viewFilter === tab.val ? T.card : 'transparent',
              color: viewFilter === tab.val ? T.accent : T.textSoft,
              fontFamily: 'inherit',
              fontSize: '.76rem',
              fontWeight: viewFilter === tab.val ? 700 : 500,
              cursor: 'pointer',
              boxShadow: viewFilter === tab.val ? T.shadow : 'none',
              transition: 'all .15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            {tab.label}
            {tab.cnt > 0 && (
              <span
                style={{
                  background: viewFilter === tab.val ? T.accentLight : '#e0efe8',
                  color: viewFilter === tab.val ? T.accent : T.textMuted,
                  borderRadius: 999,
                  padding: '0 6px',
                  fontSize: '.63rem',
                  fontWeight: 800,
                }}
              >
                {tab.cnt}
              </span>
            )}
          </button>
        ))}
      </div>

      {unreadFiltered.length > 0 && (
        <div style={{ marginBottom: '1.3rem' }}>
          <p
            style={{
              fontSize: '.67rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              color: T.textMuted,
              marginBottom: '.6rem',
            }}
          >
            Non lues · {unreadFiltered.length}
          </p>
          {unreadFiltered.map((notif) => {
            const cfg = notifCfg(notif.type);
            return (
              <div
                key={notif._id}
                onClick={() => markRead(notif._id)}
                style={{
                  background: T.card,
                  border: `1px solid ${T.cardBorder}`,
                  borderLeft: `3px solid ${cfg.color}`,
                  borderRadius: 12,
                  padding: '.9rem 1rem',
                  marginBottom: '.46rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '.85rem',
                  cursor: 'pointer',
                  transition: 'all .15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fdf9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = T.card)}
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
                    color: cfg.color,
                    flexShrink: 0,
                  }}
                >
                  <cfg.icon />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '.5rem',
                      marginBottom: '.2rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Badge color={cfg.color} bg={cfg.bg}>
                      {cfg.label}
                    </Badge>
                    <span style={{ fontWeight: 700, color: T.text, fontSize: '.82rem' }}>
                      {notif.titre}
                    </span>
                    {notif.cible !== 'ADMIN' && (
                      <Badge color={T.purple} bg={T.purpleLight} style={{ fontSize: '.6rem' }}>
                        {notif.cible}
                      </Badge>
                    )}
                  </div>
                  <p
                    style={{
                      color: T.textSoft,
                      fontSize: '.78rem',
                      lineHeight: 1.5,
                      marginBottom: '.2rem',
                    }}
                  >
                    {notif.description}
                  </p>
                  <p style={{ color: T.accent, fontSize: '.7rem', fontWeight: 700 }}>
                    {notif.auteur}
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
                  <span
                    style={{
                      color: T.textMuted,
                      fontSize: '.67rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <I.clock />{' '}
                    {new Date(notif.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismiss(notif._id);
                    }}
                    style={{
                      background: T.dangerLight,
                      border: 'none',
                      borderRadius: 6,
                      padding: '.2rem .4rem',
                      cursor: 'pointer',
                      color: T.danger,
                      fontSize: '.68rem',
                      fontFamily: 'inherit',
                      fontWeight: 700,
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {read.length > 0 && (
        <div>
          <p
            style={{
              fontSize: '.67rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              color: T.textMuted,
              marginBottom: '.6rem',
            }}
          >
            Lues · {read.length}
          </p>
          {read.map((notif) => {
            const cfg = notifCfg(notif.type);
            return (
              <div
                key={notif._id}
                style={{
                  background: T.card,
                  border: `1px solid ${T.cardBorder}`,
                  borderRadius: 12,
                  padding: '.8rem 1rem',
                  marginBottom: '.4rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '.85rem',
                  opacity: 0.7,
                }}
              >
                <div
                  style={{
                    width: 35,
                    height: 35,
                    borderRadius: 9,
                    background: cfg.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: cfg.color,
                    flexShrink: 0,
                    opacity: 0.8,
                  }}
                >
                  <cfg.icon />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '.5rem',
                      marginBottom: '.18rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontWeight: 700, color: T.text, fontSize: '.8rem' }}>
                      {notif.titre}
                    </span>
                    {notif.cible !== 'ADMIN' && (
                      <Badge color={T.purple} bg={T.purpleLight} style={{ fontSize: '.6rem' }}>
                        {notif.cible}
                      </Badge>
                    )}
                  </div>
                  <p style={{ color: T.textMuted, fontSize: '.76rem', lineHeight: 1.5 }}>
                    {notif.description}
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
                  <span style={{ color: T.textMuted, fontSize: '.66rem', whiteSpace: 'nowrap' }}>
                    {new Date(notif.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <button
                    onClick={() => dismiss(notif._id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: T.textMuted,
                      fontSize: '.7rem',
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {filtered.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '4rem', color: T.textMuted }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '.8rem', opacity: 0.3 }}>🔔</p>
          <p style={{ fontSize: '.84rem' }}>Aucune notification</p>
        </Card>
      )}
    </div>
  );
}

function PageFeedbacks({ fbs, setFbs }) {
  const [filter, setFilter] = useState('');
  const [toast, setToast] = useState(null);
  const approved = fbs.filter((f) => f.statut === 'APPROUVE');
  const avgNote = approved.length
    ? (approved.reduce((s, f) => s + f.note, 0) / approved.length).toFixed(1)
    : 0;
  const filtered = filter ? fbs.filter((f) => f.statut === filter) : fbs;

  const showToast = (msg, color = T.success) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const approve = async (id) => {
    try {
      await API.put(`/feedbacks/${id}/statut`, { statut: 'APPROUVE' });
      setFbs((prev) => prev.map((f) => (f._id === id ? { ...f, statut: 'APPROUVE' } : f)));
    } catch {
      alert("Erreur lors de l'approbation");
    }
  };

  const reject = async (id) => {
    try {
      await API.put(`/feedbacks/${id}/statut`, { statut: 'REJETE' });
      setFbs((prev) => prev.filter((f) => f._id !== id));
    } catch {
      // fallback: just remove locally if API doesn't support REJETE
      setFbs((prev) => prev.filter((f) => f._id !== id));
    }
  };

  const remove = async (id) => {
    try {
      await API.delete(`/feedbacks/${id}`);
      setFbs((prev) => prev.filter((f) => f._id !== id));
      showToast("L'avis a été supprimé");
    } catch {
      alert('Erreur suppression');
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: T.danger,
            color: '#fff',
            padding: '.65rem 1.4rem',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: '.82rem',
            boxShadow: '0 4px 18px rgba(0,0,0,.18)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '.5rem',
            animation: 'fadeIn .2s ease',
          }}
        >
          🗑️ {toast.msg}
        </div>
      )}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 800, fontSize: '2.8rem', color: T.accent, lineHeight: 1 }}>
              {avgNote}
            </p>
            <Stars value={Math.round(Number(avgNote))} />
            <p style={{ color: T.textMuted, fontSize: '.71rem', marginTop: '.28rem' }}>
              {approved.length} avis approuvés
            </p>
            {fbs.filter((f) => f.statut === 'EN_ATTENTE').length > 0 && (
              <p
                style={{
                  color: T.warning,
                  fontSize: '.65rem',
                  fontWeight: 700,
                  marginTop: '.1rem',
                }}
              >
                {fbs.filter((f) => f.statut === 'EN_ATTENTE').length} en attente
              </p>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            {[5, 4, 3, 2, 1].map((n) => {
              const cnt = approved.filter((f) => f.note === n).length;
              return (
                <Progress
                  key={n}
                  label={`${n} ★`}
                  count={cnt}
                  value={approved.length ? (cnt / approved.length) * 100 : 0}
                  color="#f59e0b"
                />
              );
            })}
          </div>
        </div>
      </Card>
      <div style={{ display: 'flex', gap: '.45rem', marginBottom: '1rem' }}>
        {[
          ['', 'Tous'],
          ['APPROUVE', 'Approuvés'],
          ['EN_ATTENTE', 'En attente'],
        ].map(([val, lbl]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            style={{
              padding: '.36rem .82rem',
              borderRadius: 8,
              border: `1px solid ${filter === val ? T.accent : T.cardBorder}`,
              background: filter === val ? T.accentLight : 'transparent',
              color: filter === val ? T.accent : T.textSoft,
              fontFamily: 'inherit',
              fontSize: '.77rem',
              fontWeight: filter === val ? 700 : 500,
              cursor: 'pointer',
            }}
          >
            {lbl}
          </button>
        ))}
      </div>
      {filtered.map((fb) => (
        <div
          key={fb._id}
          style={{
            background: T.card,
            border: `1px solid ${T.cardBorder}`,
            borderRadius: 11,
            padding: '.9rem 1rem',
            marginBottom: '.46rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '.75rem',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: T.accentLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: T.accent,
              fontSize: '.62rem',
              flexShrink: 0,
            }}
          >
            {(fb.nomAuteur || fb.auteur || '?')
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
              <span style={{ fontWeight: 700, color: T.text, fontSize: '.82rem' }}>
                {fb.nomAuteur || fb.auteur || '—'}
              </span>{' '}
              <Badge
                color={(fb.roleAuteur || fb.role) === 'ETUDIANT' ? T.success : T.purple}
                bg={(fb.roleAuteur || fb.role) === 'ETUDIANT' ? T.successLight : T.purpleLight}
              >
                {fb.roleAuteur || fb.role}
              </Badge>
              <Stars value={fb.note} />
              <Badge
                color={fb.statut === 'APPROUVE' ? T.success : T.warning}
                bg={fb.statut === 'APPROUVE' ? T.successLight : T.warningLight}
              >
                {fb.statut === 'APPROUVE' ? 'Approuvé' : 'En attente'}
              </Badge>
            </div>
            <p style={{ color: T.textSoft, fontSize: '.78rem', lineHeight: 1.55 }}>
              {fb.commentaire}
            </p>
            <p style={{ color: T.textMuted, fontSize: '.67rem', marginTop: '.3rem' }}>{fb.date}</p>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '.4rem',
              flexShrink: 0,
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            {fb.statut === 'EN_ATTENTE' ? (
              <div style={{ display: 'flex', gap: '.35rem' }}>
                <button
                  onClick={() => approve(fb._id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '.32rem',
                    padding: '.38rem .82rem',
                    borderRadius: 8,
                    border: `1.5px solid ${T.success}`,
                    background: T.successLight,
                    color: T.success,
                    fontFamily: 'inherit',
                    fontSize: '.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all .14s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#bbf7d0';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = T.successLight;
                    e.currentTarget.style.transform = '';
                  }}
                  title="Approuver ce feedback"
                >
                  <I.checkSm /> Approuver
                </button>
                <button
                  onClick={() => reject(fb._id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '.32rem',
                    padding: '.38rem .82rem',
                    borderRadius: 8,
                    border: `1.5px solid ${T.danger}`,
                    background: T.dangerLight,
                    color: T.danger,
                    fontFamily: 'inherit',
                    fontSize: '.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all .14s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fecaca';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = T.dangerLight;
                    e.currentTarget.style.transform = '';
                  }}
                  title="Rejeter ce feedback"
                >
                  <I.x /> Rejeter
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '.3rem',
                    padding: '.28rem .7rem',
                    borderRadius: 999,
                    fontSize: '.68rem',
                    fontWeight: 700,
                    color: T.success,
                    background: T.successLight,
                    border: `1px solid ${T.success}40`,
                  }}
                >
                  <I.checkSm /> Approuvé
                </span>
                <IconBtn
                  icon={I.trash}
                  onClick={() => remove(fb._id)}
                  color={T.danger}
                  bg={T.dangerLight}
                  title="Supprimer"
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function PageEvaluations({ evals }) {
  const [search, setSearch] = useState('');
  const filtered = search
    ? evals.filter((e) =>
        `${e.etudiant.prenom} ${e.etudiant.nom} ${e.sujet} ${e.encadrant.prenom} ${e.encadrant.nom}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : evals;
  const avg = evals.length
    ? (evals.reduce((s, e) => s + e.note, 0) / evals.length).toFixed(1)
    : '—';

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))',
          gap: '.85rem',
          marginBottom: '1.1rem',
        }}
      >
        <StatCard
          icon={I.award}
          value={evals.length}
          label="Total évaluations"
          color={T.accent}
          bg={T.accentLight}
        />
        <StatCard
          icon={I.trend}
          value={avg}
          label="Moyenne générale"
          color={T.success}
          bg={T.successLight}
        />
        <StatCard
          icon={I.star}
          value={evals.filter((e) => e.note >= 16).length}
          label="Mention Bien+"
          color={T.warning}
          bg={T.warningLight}
        />
        <StatCard
          icon={I.users}
          value={[...new Set(evals.map((e) => e.encadrant.nom))].length}
          label="Encadrants"
          color={T.purple}
          bg={T.purpleLight}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '.4rem',
            background: '#f8fdf9',
            border: `1px solid ${T.cardBorder}`,
            borderRadius: 8,
            padding: '.48rem .8rem',
            flex: 1,
            maxWidth: 380,
          }}
        >
          <span style={{ color: T.textMuted }}>
            <I.search />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher étudiant, sujet, encadrant…"
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              fontSize: '.8rem',
              color: T.text,
              width: '100%',
            }}
          />
        </div>
        <span style={{ color: T.textMuted, fontSize: '.78rem' }}>
          {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4faf7' }}>
              {['Étudiant', 'Sujet PFE', 'Encadrant', 'Note /20', 'Mention', 'Date'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '.7rem 1rem',
                    fontSize: '.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.07em',
                    color: T.textMuted,
                    borderBottom: `1px solid ${T.cardBorder}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((ev) => {
              const nc = mentionColor(ev.note);
              return (
                <tr
                  key={ev._id}
                  style={{ borderBottom: `1px solid #f0f9f5` }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fdf9')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '.7rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.52rem' }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: T.accentLight,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '.62rem',
                          fontWeight: 800,
                          color: T.accent,
                        }}
                      >
                        {ev.etudiant.prenom[0]}
                        {ev.etudiant.nom[0]}
                      </div>
                      <span style={{ fontWeight: 700, color: T.text, fontSize: '.8rem' }}>
                        {ev.etudiant.prenom} {ev.etudiant.nom}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '.7rem 1rem',
                      color: T.textSoft,
                      fontSize: '.78rem',
                      maxWidth: 220,
                    }}
                  >
                    <p
                      style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {ev.sujet}
                    </p>
                  </td>
                  <td style={{ padding: '.7rem 1rem', color: T.textSoft, fontSize: '.78rem' }}>
                    {ev.encadrant.prenom} {ev.encadrant.nom}
                  </td>
                  <td style={{ padding: '.7rem 1rem' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        background: nc.bg,
                        color: nc.color,
                        fontWeight: 800,
                        fontSize: '.95rem',
                      }}
                    >
                      {ev.note}
                    </div>
                  </td>
                  <td style={{ padding: '.7rem 1rem' }}>
                    <Badge color={nc.color} bg={nc.bg}>
                      {ev.mention}
                    </Badge>
                  </td>
                  <td style={{ padding: '.7rem 1rem', color: T.textMuted, fontSize: '.72rem' }}>
                    {new Date(ev.date).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!filtered.length && (
          <p
            style={{ textAlign: 'center', color: T.textMuted, padding: '2rem', fontSize: '.82rem' }}
          >
            Aucune évaluation trouvée
          </p>
        )}
      </Card>
      <Card>
        <CardHeader title="Distribution des notes" icon={I.bar} />
        {[
          { label: '16 – 20 (Très Bien / Bien)', min: 16, max: 20, color: T.success },
          { label: '14 – 15.99 (Assez Bien)', min: 14, max: 15.99, color: T.accent },
          { label: '12 – 13.99 (Passable)', min: 12, max: 13.99, color: T.warning },
          { label: '< 12 (Insuffisant)', min: 0, max: 11.99, color: T.danger },
        ].map((range, i) => {
          const cnt = evals.filter((e) => e.note >= range.min && e.note <= range.max).length;
          return (
            <Progress
              key={i}
              label={range.label}
              count={cnt}
              value={evals.length ? (cnt / evals.length) * 100 : 0}
              color={range.color}
            />
          );
        })}
      </Card>
    </div>
  );
}

function PagePublications({ pubs, setPubs, onRefresh, loading }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    titre: '',
    contenu: '',
    type: 'ANNONCE',
    statut: 'BROUILLON',
    audience: 'TOUS',
  });

  const resetForm = () => {
    setForm({ titre: '', contenu: '', type: 'ANNONCE', statut: 'BROUILLON', audience: 'TOUS' });
    setEditing(null);
    setShowForm(false);
  };

  const save = async () => {
    if (!form.titre.trim() || !form.contenu.trim()) return;
    if (saving) return;
    setSaving(true);
    try {
      let pubId = null;
      if (editing) {
        await API.put(`/publications/${editing._id}`, {
          titre: form.titre,
          contenu: form.contenu,
          type: form.type,
          audience: form.audience,
        });
        pubId = editing._id;
      } else {
        const { data: created } = await API.post('/publications', {
          titre: form.titre,
          contenu: form.contenu,
          type: form.type,
          audience: form.audience,
        });
        pubId = created._id;
      }
      if (form.statut === 'PUBLIE' && (!editing || editing.statut !== 'PUBLIE')) {
        await API.put(`/publications/${pubId}/publier`);
      }
      await onRefresh();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handlePublier = async (pub) => {
    try {
      await API.put(`/publications/${pub._id}/publier`);
      await onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };
  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette publication ?')) return;
    try {
      await API.delete(`/publications/${id}`);
      await onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '.6rem',
        }}
      >
        <div style={{ display: 'flex', gap: '.7rem' }}>
          {[
            { label: 'Total', v: pubs.length, c: T.accent },
            {
              label: 'Publiées',
              v: pubs.filter((p) => p.statut === 'PUBLIE').length,
              c: T.success,
            },
            {
              label: 'Brouillons',
              v: pubs.filter((p) => p.statut === 'BROUILLON').length,
              c: T.warning,
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: `${s.c}15`,
                border: `1px solid ${T.cardBorder}`,
                borderRadius: 9,
                padding: '.65rem .9rem',
                textAlign: 'center',
              }}
            >
              <p style={{ fontWeight: 800, fontSize: '1.3rem', color: s.c, lineHeight: 1 }}>
                {s.v}
              </p>
              <p
                style={{
                  color: T.textSoft,
                  fontSize: '.67rem',
                  fontWeight: 600,
                  marginTop: '.1rem',
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
        <Btn
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <I.plus /> Nouvelle publication
        </Btn>
      </div>

      {showForm && (
        <Card style={{ border: `2px solid ${T.accent}`, marginBottom: '1rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '.9rem',
            }}
          >
            <span style={{ fontWeight: 700, color: T.text, fontSize: '.88rem' }}>
              {editing ? 'Modifier' : 'Nouvelle'} publication
            </span>
            <IconBtn icon={I.x} onClick={resetForm} color={T.textMuted} bg={T.cardBorder} />
          </div>
          <div style={{ display: 'grid', gap: '.75rem' }}>
            <Input
              value={form.titre}
              onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
              placeholder="Titre *"
              style={{ width: '100%' }}
            />
            <textarea
              value={form.contenu}
              onChange={(e) => setForm((f) => ({ ...f, contenu: e.target.value }))}
              placeholder="Contenu *"
              rows={3}
              style={{
                padding: '.52rem .85rem',
                border: `1px solid ${T.cardBorder}`,
                borderRadius: 8,
                background: '#f8fdf9',
                fontFamily: 'inherit',
                fontSize: '.8rem',
                color: T.text,
                outline: 'none',
                resize: 'vertical',
                width: '100%',
              }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.6rem' }}>
              <Select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                style={{ width: '100%' }}
              >
                <option value="ANNONCE">Annonce</option>
                <option value="RESSOURCE">Ressource</option>
                <option value="CALENDRIER">Calendrier</option>
              </Select>
              <Select
                value={form.audience}
                onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
                style={{ width: '100%' }}
              >
                <option value="TOUS">Tous</option>
                <option value="ETUDIANT">Étudiants</option>
                <option value="ENCADRANT">Encadrants</option>
              </Select>
              <Select
                value={form.statut}
                onChange={(e) => setForm((f) => ({ ...f, statut: e.target.value }))}
                style={{ width: '100%' }}
              >
                <option value="BROUILLON">Brouillon</option>
                <option value="PUBLIE">Publier maintenant</option>
              </Select>
            </div>
            {form.statut === 'PUBLIE' && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 8,
                  padding: '.6rem .85rem',
                  fontSize: '.78rem',
                  color: T.success,
                  fontWeight: 500,
                }}
              >
                🔔 Une notification sera envoyée automatiquement à tous les destinataires.
              </div>
            )}
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <Btn variant="ghost" onClick={resetForm} style={{ flex: 1 }}>
                Annuler
              </Btn>
              <Btn
                onClick={save}
                style={{ flex: 1 }}
                disabled={!form.titre || !form.contenu || saving}
              >
                <I.checkSm /> {saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Créer'}
              </Btn>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <p style={{ color: T.textMuted, textAlign: 'center', padding: '2rem' }}>Chargement...</p>
      ) : pubs.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem', color: T.textMuted }}>
          <p style={{ fontSize: '2rem', marginBottom: '.65rem', opacity: 0.35 }}>📢</p>
          <p style={{ fontSize: '.84rem' }}>Aucune publication. Créez-en une !</p>
        </Card>
      ) : (
        pubs.map((pub) => (
          <div
            key={pub._id}
            style={{
              background: T.card,
              border: `1px solid ${T.cardBorder}`,
              borderRadius: 12,
              padding: '1rem 1.1rem',
              marginBottom: '.6rem',
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
                    marginBottom: '.4rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <Badge
                    color={
                      pub.type === 'ANNONCE'
                        ? T.accent
                        : pub.type === 'RESSOURCE'
                          ? T.success
                          : T.purple
                    }
                    bg={
                      pub.type === 'ANNONCE'
                        ? T.accentLight
                        : pub.type === 'RESSOURCE'
                          ? T.successLight
                          : T.purpleLight
                    }
                  >
                    {pub.type}
                  </Badge>
                  <Badge
                    color={pub.statut === 'PUBLIE' ? T.success : T.warning}
                    bg={pub.statut === 'PUBLIE' ? T.successLight : T.warningLight}
                  >
                    {pub.statut === 'PUBLIE' ? 'Publié' : 'Brouillon'}
                  </Badge>
                  <Badge color={T.info} bg={T.infoLight}>
                    {pub.audience}
                  </Badge>
                  <span
                    style={{
                      color: T.textMuted,
                      fontSize: '.68rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <I.eye /> {pub.vues || 0} vues
                  </span>
                </div>
                <p
                  style={{
                    fontWeight: 700,
                    color: T.text,
                    fontSize: '.86rem',
                    marginBottom: '.25rem',
                  }}
                >
                  {pub.titre}
                </p>
                <p style={{ color: T.textSoft, fontSize: '.78rem', lineHeight: 1.55 }}>
                  {pub.contenu}
                </p>
                <p style={{ color: T.textMuted, fontSize: '.67rem', marginTop: '.4rem' }}>
                  {new Date(pub.datePublication || pub.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '.3rem', flexShrink: 0 }}>
                {pub.statut === 'BROUILLON' && (
                  <IconBtn
                    icon={I.send}
                    onClick={() => handlePublier(pub)}
                    color={T.success}
                    bg={T.successLight}
                    title="Publier"
                  />
                )}
                <IconBtn
                  icon={I.edit}
                  onClick={() => {
                    setEditing(pub);
                    setForm({
                      titre: pub.titre,
                      contenu: pub.contenu,
                      type: pub.type,
                      statut: pub.statut,
                      audience: pub.audience || 'TOUS',
                    });
                    setShowForm(true);
                  }}
                  color={T.accent}
                  bg={T.accentLight}
                  title="Modifier"
                />
                <IconBtn
                  icon={I.trash}
                  onClick={() => handleDelete(pub._id)}
                  color={T.danger}
                  bg={T.dangerLight}
                  title="Supprimer"
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function PageAffectations({ affectations }) {
  return (
    <div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4faf7' }}>
              {['Sujet', 'Étudiant', 'Encadrant', 'Statut', 'Date début'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '.7rem 1rem',
                    fontSize: '.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.07em',
                    color: T.textMuted,
                    borderBottom: `1px solid ${T.cardBorder}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {affectations.map((p) => (
              <tr key={p._id} style={{ borderBottom: `1px solid #f0f9f5` }}>
                <td style={{ padding: '.7rem 1rem', fontWeight: 700, color: T.text }}>
                  {p.idSujet?.titre || p.titre || '—'}
                </td>
                <td style={{ padding: '.7rem 1rem', color: T.textSoft }}>
                  {p.idEtudiant?.utilisateur
                    ? `${p.idEtudiant.utilisateur.prenom} ${p.idEtudiant.utilisateur.nom}`
                    : '—'}
                </td>
                <td style={{ padding: '.7rem 1rem', color: T.textSoft }}>
                  {p.idEncadrant?.utilisateur
                    ? `${p.idEncadrant.utilisateur.prenom} ${p.idEncadrant.utilisateur.nom}`
                    : '—'}
                </td>
                <td style={{ padding: '.7rem 1rem' }}>
                  <Badge
                    color={p.statutProjet === 'TERMINE' ? T.success : T.warning}
                    bg={p.statutProjet === 'TERMINE' ? T.successLight : T.warningLight}
                  >
                    {p.statutProjet}
                  </Badge>
                </td>
                <td style={{ padding: '.7rem 1rem', color: T.textMuted, fontSize: '.72rem' }}>
                  {p.dateDebut ? new Date(p.dateDebut).toLocaleDateString('fr-FR') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!affectations.length && (
          <p
            style={{ textAlign: 'center', color: T.textMuted, padding: '2rem', fontSize: '.82rem' }}
          >
            Aucune affectation
          </p>
        )}
      </Card>
    </div>
  );
}

// ✅ FIX PRINCIPAL : PageMessagerie avec les bonnes URLs /support/messages
function PageMessagerie({
  messages,
  msgPage,
  setMsgPage,
  msgTotal,
  showReply,
  setShowReply,
  replyText,
  setReplyText,
  onReply,
  onArchive,
}) {
  return (
    <div>
      {messages.map((msg) => (
        <Card
          key={msg._id}
          style={{
            borderLeft:
              msg.statut === 'NOUVEAU' ? `3px solid ${T.accent}` : `1px solid ${T.cardBorder}`,
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
                <span style={{ fontWeight: 700, color: T.text, fontSize: '.82rem' }}>
                  {msg.nom}
                </span>
                <span style={{ color: T.textMuted, fontSize: '.71rem' }}>{msg.email}</span>
                <Badge
                  color={
                    msg.statut === 'NOUVEAU'
                      ? T.accent
                      : msg.statut === 'REPONDU'
                        ? T.success
                        : T.textMuted
                  }
                  bg={
                    msg.statut === 'NOUVEAU'
                      ? T.accentLight
                      : msg.statut === 'REPONDU'
                        ? T.successLight
                        : '#f1f5f9'
                  }
                >
                  {msg.statut}
                </Badge>
              </div>
              <p
                style={{
                  fontWeight: 700,
                  color: T.accent,
                  fontSize: '.8rem',
                  marginBottom: '.2rem',
                }}
              >
                {msg.sujet}
              </p>
              <p style={{ color: T.textSoft, fontSize: '.78rem', lineHeight: 1.55 }}>
                {msg.message}
              </p>
              {msg.reponse && (
                <div
                  style={{
                    marginTop: '.62rem',
                    padding: '.62rem .8rem',
                    background: T.successLight,
                    borderLeft: `3px solid ${T.success}`,
                    borderRadius: '0 6px 6px 0',
                  }}
                >
                  <p
                    style={{
                      fontSize: '.68rem',
                      color: T.success,
                      fontWeight: 700,
                      marginBottom: '.17rem',
                    }}
                  >
                    Réponse admin :
                  </p>
                  <p style={{ color: T.text, fontSize: '.78rem' }}>{msg.reponse}</p>
                </div>
              )}
              <p
                style={{
                  color: T.textMuted,
                  fontSize: '.68rem',
                  marginTop: '.42rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <I.clock />{' '}
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
                <IconBtn
                  icon={I.send}
                  onClick={() => {
                    setShowReply(msg._id);
                    setReplyText('');
                  }}
                  color={T.accent}
                  bg={T.accentLight}
                  title="Répondre"
                />
              )}
              {msg.statut !== 'ARCHIVE' && (
                <IconBtn
                  icon={I.archive}
                  onClick={() => onArchive(msg._id)}
                  color={T.textSoft}
                  bg={T.cardBorder}
                  title="Archiver"
                />
              )}
            </div>
          </div>
          {showReply === msg._id && (
            <div style={{ marginTop: '.85rem', display: 'flex', gap: '.58rem' }}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Votre réponse… (sera envoyée par email au visiteur)"
                rows={2}
                style={{
                  flex: 1,
                  padding: '.52rem .85rem',
                  border: `1px solid ${T.cardBorder}`,
                  borderRadius: 8,
                  background: '#f8fdf9',
                  fontFamily: 'inherit',
                  fontSize: '.8rem',
                  color: T.text,
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
              <Btn
                onClick={() => onReply(msg._id)}
                disabled={!replyText.trim()}
                style={{ alignSelf: 'flex-end' }}
              >
                <I.send />
              </Btn>
            </div>
          )}
        </Card>
      ))}
      {!messages.length && (
        <p style={{ textAlign: 'center', color: T.textMuted, padding: '3rem', fontSize: '.84rem' }}>
          Aucun message 📭
        </p>
      )}
      <Pagination page={msgPage} setPage={setMsgPage} total={msgTotal} limit={15} />
    </div>
  );
}

function PageMonitoring({ logs, logsTotal, logsPage, setLogsPage, lgF, setLgF, onRefresh }) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '.6rem',
          flexWrap: 'wrap',
          marginBottom: '1rem',
          alignItems: 'center',
        }}
      >
        <Select
          value={lgF.action}
          onChange={(e) => {
            setLgF((f) => ({ ...f, action: e.target.value }));
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
        </Select>
        <Btn variant="ghost" onClick={onRefresh} style={{ fontSize: '.78rem' }}>
          <I.refresh /> Actualiser
        </Btn>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4faf7' }}>
              {['Action', 'Utilisateur', 'Rôle', 'Détails', 'IP', 'Date'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '.7rem 1rem',
                    fontSize: '.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.07em',
                    color: T.textMuted,
                    borderBottom: `1px solid ${T.cardBorder}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} style={{ borderBottom: `1px solid #f0f9f5` }}>
                <td style={{ padding: '.7rem 1rem' }}>
                  <Badge color={T.accent} bg={T.accentLight}>
                    {log.action}
                  </Badge>
                </td>
                <td style={{ padding: '.7rem 1rem', color: T.textSoft, fontSize: '.78rem' }}>
                  {log.userEmail || '—'}
                </td>
                <td style={{ padding: '.7rem 1rem', color: T.textMuted, fontSize: '.73rem' }}>
                  {log.userRole}
                </td>
                <td
                  style={{
                    padding: '.7rem 1rem',
                    color: T.textSoft,
                    maxWidth: 220,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '.78rem',
                  }}
                >
                  {log.details}
                </td>
                <td
                  style={{
                    padding: '.7rem 1rem',
                    color: T.textMuted,
                    fontFamily: 'monospace',
                    fontSize: '.72rem',
                  }}
                >
                  {log.ip || '—'}
                </td>
                <td style={{ padding: '.7rem 1rem', color: T.textMuted, fontSize: '.72rem' }}>
                  {new Date(log.createdAt).toLocaleString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!logs.length && (
          <p
            style={{ textAlign: 'center', color: T.textMuted, padding: '2rem', fontSize: '.82rem' }}
          >
            Aucun log
          </p>
        )}
      </Card>
      <Pagination page={logsPage} setPage={setLogsPage} total={logsTotal} limit={25} />
    </div>
  );
}

function PageStatistiques({ users, sujets, evals, fbs, pubs, stats = {} }) {
  const approvedFbs = fbs.filter((f) => f.statut === 'APPROUVE');
  const avgFb = approvedFbs.length
    ? (approvedFbs.reduce((s, f) => s + f.note, 0) / approvedFbs.length).toFixed(1)
    : 0;

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <Card>
          <CardHeader title="Répartition utilisateurs" icon={I.users} />
          <Progress
            label="Étudiants"
            count={users.filter((u) => u.role === 'ETUDIANT').length}
            value={(users.filter((u) => u.role === 'ETUDIANT').length / (users.length || 1)) * 100}
            color={T.success}
          />
          <Progress
            label="Encadrants"
            count={users.filter((u) => u.role === 'ENCADRANT').length}
            value={(users.filter((u) => u.role === 'ENCADRANT').length / (users.length || 1)) * 100}
            color={T.purple}
          />
          <Progress
            label="En attente validation"
            count={users.filter((u) => !u.isValidated).length}
            value={(users.filter((u) => !u.isValidated).length / (users.length || 1)) * 100}
            color={T.warning}
          />
        </Card>
        <Card>
          <CardHeader title="État des sujets PFE" icon={I.doc} />
          <Progress
            label="En attente"
            count={sujets.filter((s) => s.statut === 'EN_ATTENTE').length}
            value={
              (sujets.filter((s) => s.statut === 'EN_ATTENTE').length / (sujets.length || 1)) * 100
            }
            color={T.warning}
          />
          <Progress
            label="Validés"
            count={sujets.filter((s) => s.statut === 'VALIDE').length}
            value={
              (sujets.filter((s) => s.statut === 'VALIDE').length / (sujets.length || 1)) * 100
            }
            color={T.success}
          />
          <Progress
            label="Refusés"
            count={sujets.filter((s) => s.statut === 'REFUSE').length}
            value={
              (sujets.filter((s) => s.statut === 'REFUSE').length / (sujets.length || 1)) * 100
            }
            color={T.danger}
          />
        </Card>
      </div>
      <Card>
        <CardHeader title="Résumé global" icon={I.trend} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))',
            gap: '.9rem',
          }}
        >
          {[
            { ic: I.users, v: users.length, l: 'Utilisateurs' },
            { ic: I.check, v: sujets.length, l: 'Sujets PFE' },
            { ic: I.award, v: evals.length, l: 'Évaluations' },
            { ic: I.star, v: avgFb, l: 'Note moy. FB' },
            { ic: I.news, v: pubs.length, l: 'Publications' },
            { ic: I.check, v: pubs.filter((p) => p.statut === 'PUBLIE').length, l: 'Publiées' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                textAlign: 'center',
                background: T.bg,
                border: `1px solid ${T.cardBorder}`,
                borderRadius: 10,
                padding: '.85rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '.38rem',
                  color: T.accent,
                }}
              >
                <s.ic />
              </div>
              <p style={{ fontWeight: 800, fontSize: '1.4rem', color: T.accent, lineHeight: 1 }}>
                {s.v}
              </p>
              <p
                style={{
                  color: T.textMuted,
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
      </Card>
    </div>
  );
}

// ─── SEARCH INDEX ─────────────────────────────────────────
function buildIndex(users, sujets, pubs, fbs, evals) {
  return [
    ...users.map((u) => ({
      type: 'Utilisateur',
      label: `${u.prenom} ${u.nom}`,
      sub: u.email,
      page: 'utilisateurs',
      color: T.accent,
      bg: T.accentLight,
    })),
    ...sujets.map((s) => ({
      type: 'Sujet PFE',
      label: s.titre,
      sub: s.encadrant,
      page: 'sujets',
      color: T.info,
      bg: T.infoLight,
    })),
    ...pubs.map((p) => ({
      type: 'Publication',
      label: p.titre,
      sub: p.type,
      page: 'publications',
      color: T.purple,
      bg: T.purpleLight,
    })),
    ...fbs.map((f) => ({
      type: 'Feedback',
      label: f.auteur,
      sub: f.commentaire?.slice(0, 50),
      page: 'feedbacks',
      color: T.warning,
      bg: T.warningLight,
    })),
    ...evals.map((e) => ({
      type: 'Évaluation',
      label: `${e.etudiant.prenom} ${e.etudiant.nom}`,
      sub: e.sujet,
      page: 'evaluations',
      color: T.success,
      bg: T.successLight,
    })),
  ];
}

// ─── MAIN COMPONENT ───────────────────────────────────────
export default function DashboardAdmin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState('accueil');
  const [collapsed, setCollapsed] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  // ── State ────────────────────────────────────────────────
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [uF, setUF] = useState({ role: '', isValidated: '', search: '' });
  const [sujets, setSujets] = useState(MOCK_SUJETS);
  const [affectations, setAffects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [lgF, setLgF] = useState({ action: '' });
  const [messages, setMessages] = useState([]);
  const [msgTotal, setMsgTotal] = useState(0);
  const [msgPage, setMsgPage] = useState(1);
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const [fbs, setFbs] = useState([]);
  const [evals, setEvals] = useState(MOCK_EVALS);
  const [pubs, setPubs] = useState(MOCK_PUBS);
  const [pubsLoading, setPubsLoading] = useState(false);
  const [srch, setSrch] = useState('');
  const [srchFocus, setSrchFocus] = useState(false);
  const [showReply, setShowReply] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    mot_de_passe: '',
    role: 'ETUDIANT',
    telephone: '',
  });
  const [editUser, setEditUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({});
  const [editUserError, setEditUserError] = useState('');
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState('');
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [replyText, setReplyText] = useState('');

  // ── Fetch functions ──────────────────────────────────────
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
      const p = { page: usersPage, limit: 50, ...uF };
      Object.keys(p).forEach((k) => !p[k] && delete p[k]);
      const { data } = await API.get('/admin/users', { params: p });
      setUsers(data.users || []);
      setUsersTotal(data.total || 0);
    } catch {
      setUsers(MOCK_USERS);
      setUsersTotal(MOCK_USERS.length);
    }
  };

  const fetchSujets = async () => {
    try {
      const [a, b] = await Promise.all([API.get('/sujets/non-valides'), API.get('/sujets')]);
      const nv = (a.data || []).map((s) => ({ ...s, statut: 'EN_ATTENTE' }));
      const vv = (b.data || []).map((s) => ({ ...s, statut: 'VALIDE' })); // ✅ forcé VALIDE
      const ids = new Set(nv.map((s) => s._id));
      setSujets([...nv, ...vv.filter((s) => !ids.has(s._id))]);
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
  //ajout nouveau
  const fetchFbs = async () => {
    try {
      const { data } = await API.get('/feedbacks');
      setFbs(data || []);
    } catch {
      setFbs([]);
    }
  };

  // ✅ FIX PRINCIPAL : URL corrigée /support/messages
  const fetchMessages = async () => {
    try {
      const { data } = await API.get('/support/messages', { params: { page: msgPage, limit: 15 } });
      // Normalise les deux formats possibles : { messages, total } ou tableau direct
      setMessages(data.messages || data || []);
      setMsgTotal(data.total || (data.messages || data || []).length);
    } catch (err) {
      console.error('Erreur chargement messages:', err.response?.status, err.response?.data);
      setMessages([]);
    }
  };

  const fetchNotifs = async () => {
    try {
      // Récupérer les notifications de l'admin depuis /notifications
      const { data } = await API.get('/notifications');
      const liste = Array.isArray(data) ? data : data.notifications || [];

      setNotifs(
        liste.map((n) => ({
          _id: n._id,
          type: n.type,
          titre: n.titre,
          description: n.contenu,
          contenu: n.contenu,
          auteur: 'Admin',
          date: n.createdAt,
          lu: n.lu ?? false,
          cible: 'ADMIN',
        }))
      );
    } catch (err) {
      console.error('fetchNotifs error:', err);
    }
  };
  const fetchEvals = async () => {
    try {
      const { data } = await API.get('/evaluations');
      const normalized = (data || []).map((ev) => ({
        _id: ev._id,
        etudiant: {
          prenom: ev.idEtudiant?.utilisateur?.prenom || '—',
          nom: ev.idEtudiant?.utilisateur?.nom || '',
        },
        sujet: ev.idProjet?.titre || '—',
        encadrant: {
          prenom: ev.idEncadrant?.utilisateur?.prenom || '—',
          nom: ev.idEncadrant?.utilisateur?.nom || '',
        },
        note: ev.note ?? 0,
        mention: ev.mention ?? '—',
        date: ev.dateEvaluation || ev.createdAt,
      }));
      setEvals(normalized);
    } catch {
      setEvals(MOCK_EVALS);
    }
  };

  const fetchPubs = async () => {
    setPubsLoading(true);
    try {
      const { data } = await API.get('/publications/admin/all');
      const unique = Array.isArray(data)
        ? data.filter((p, i, arr) => arr.findIndex((x) => x._id === p._id) === i)
        : [];
      setPubs(unique);
    } catch {
      setPubs(MOCK_PUBS);
    } finally {
      setPubsLoading(false);
    }
  };

  // ── Effects ──────────────────────────────────────────────
  useEffect(() => {
    fetchStats();
    fetchPubs();
    fetchNotifs();
    fetchFbs();
  }, []);
  useEffect(() => {
    if (page === 'utilisateurs') fetchUsers();
    if (page === 'sujets') fetchSujets();
    if (page === 'affectations') fetchAffects();
    if (page === 'notifications') fetchNotifs();
    if (page === 'monitoring') fetchLogs();
    if (page === 'messagerie') fetchMessages();
    if (page === 'evaluations') fetchEvals();
    if (page === 'publications') fetchPubs();
    if (page === 'feedbacks') fetchFbs();
  }, [page, usersPage, uF, logsPage, lgF, msgPage]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddUserError('');
    if (!addUserForm.prenom.trim() || !addUserForm.nom.trim())
      return setAddUserError('Nom et prénom obligatoires.');
    if (!addUserForm.email.trim()) return setAddUserError('Email obligatoire.');
    if (addUserForm.mot_de_passe.length < 6)
      return setAddUserError('Mot de passe minimum 6 caractères.');
    setAddUserLoading(true);
    try {
      await API.post('/admin/users', addUserForm);
      setShowAddUser(false);
      setAddUserForm({
        prenom: '',
        nom: '',
        email: '',
        mot_de_passe: '',
        role: 'ETUDIANT',
        telephone: '',
      });
      setAddUserError('');
      fetchUsers();
      fetchStats();
    } catch (err) {
      setAddUserError(err.response?.data?.message || 'Erreur lors de la création.');
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleOpenEdit = (u) => {
    setEditUser(u);
    setEditUserForm({
      prenom: u.prenom,
      nom: u.nom,
      email: u.email,
      role: u.role,
      telephone: u.telephone || '',
      codeReference: u.codeReference || '',
    });
    setEditUserError('');
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setEditUserError('');
    if (!editUserForm.prenom?.trim() || !editUserForm.nom?.trim())
      return setEditUserError('Nom et prénom obligatoires.');
    setEditUserLoading(true);
    try {
      await API.put(`/admin/users/${editUser._id}`, {
        prenom: editUserForm.prenom,
        nom: editUserForm.nom,
        email: editUserForm.email,
        role: editUserForm.role,
        telephone: editUserForm.telephone,
        codeReference: editUserForm.codeReference,
      });
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      setEditUserError(err.response?.data?.message || 'Erreur lors de la modification.');
    } finally {
      setEditUserLoading(false);
    }
  };

  // ── Handlers ─────────────────────────────────────────────
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
  const handleToggleActive = async (id) => {
    try {
      await API.put(`/admin/users/${id}/toggle-active`);
      fetchUsers();
    } catch (err) {
      alert('Erreur lors du changement de statut');
    }
  };

  const handleSujetDecision = async (id, decision) => {
    try {
      if (decision === 'VALIDE') {
        await API.put(`/sujets/${id}/valider`);
      } else {
        // Refus → on met valide:false via une route dédiée
        // ou on supprime selon ta logique
        await API.delete(`/sujets/${id}`);
      }
      // ✅ Recharger depuis la base pour avoir le vrai état
      await fetchSujets();
      fetchStats();
    } catch (err) {
      alert('Erreur : ' + (err.response?.data?.message || err.message));
    }
  };

  // ✅ FIX : URLs corrigées /support/messages/:id/reply et /support/messages/:id/archive
  const handleReplyMsg = async (id) => {
    try {
      await API.post(`/support/messages/${id}/reply`, { reponse: replyText });
      setShowReply(null);
      setReplyText('');
      fetchMessages();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'envoi de la réponse");
    }
  };

  const handleArchiveMsg = async (id) => {
    try {
      await API.put(`/support/messages/${id}/archive`);
      fetchMessages();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'archivage");
    }
  };

  // ── Computed ─────────────────────────────────────────────
  const unread = notifs.filter((n) => !n.lu).length;
  const pendingUsers = stats.usersEnAttente || 0;
  const pendingSujets = sujets.filter((s) => s.statut === 'EN_ATTENTE').length;
  const newMessagesCount = messages.filter((m) => m.statut === 'NOUVEAU').length;

  const searchIndex = useMemo(
    () => buildIndex(users, sujets, pubs, fbs, evals),
    [users, sujets, pubs, fbs, evals]
  );
  const searchResults = useMemo(() => {
    if (!srch.trim() || srch.length < 2) return [];
    const q = srch.toLowerCase();
    return searchIndex
      .filter(
        (item) => item.label.toLowerCase().includes(q) || (item.sub || '').toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [srch, searchIndex]);

  const goTo = useCallback((id) => {
    setPage(id);
    setAnimKey((k) => k + 1);
    setSrch('');
  }, []);

  const badgeFor = (id) => {
    if (id === 'utilisateurs' && pendingUsers > 0) return pendingUsers;
    if (id === 'sujets' && pendingSujets > 0) return pendingSujets;
    if (id === 'notifications' && unread > 0) return unread;
    if (id === 'messagerie' && newMessagesCount > 0) return newMessagesCount;
    return null;
  };

  const pageLabel = NAV.flatMap((s) => s.items).find((n) => n.id === page)?.label || 'Mon Profil';
  const initials = `${user?.prenom?.[0] || 'A'}${user?.nom?.[0] || 'D'}`.toUpperCase();

  if (loading)
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: T.bg,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Plus Jakarta Sans',sans-serif;}
        .adm-root{display:flex;min-height:100vh;background:${T.bg};font-family:'Plus Jakarta Sans',sans-serif;color:${T.text};}
        .adm-sidebar{height:100vh;position:sticky;top:0;display:flex;flex-direction:column;background:${T.sidebar};transition:width .22s ease;overflow:hidden;flex-shrink:0;z-index:20;}
        .adm-main{flex:1;display:flex;flex-direction:column;min-width:0;}
        .adm-topbar{position:sticky;top:0;z-index:10;background:#fff;border-bottom:1px solid ${T.cardBorder};padding:.75rem 1.5rem;display:flex;align-items:center;gap:.75rem;box-shadow:0 2px 12px rgba(45,158,107,.07);}
        .adm-content{padding:1.3rem 1.5rem;flex:1;}
        .page-anim{animation:fadeSlide .22s ease;}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
        .ni{display:flex;align-items:center;gap:.68rem;padding:.62rem .9rem .62rem 1rem;border-radius:9px;cursor:pointer;border:none;background:transparent;width:100%;text-align:left;font-family:'Plus Jakarta Sans',sans-serif;font-size:.82rem;font-weight:500;color:${T.sidebarText};border-left:3px solid transparent;transition:background .14s,color .14s;margin-bottom:.08rem;white-space:nowrap;}
        .ni:hover{background:${T.sidebarHover};color:#fff;}
        .ni.active{background:${T.sidebarActive};color:#fff;font-weight:700;border-left-color:${T.sidebarAccent};}
        .ni svg{flex-shrink:0;opacity:.6;transition:opacity .14s;}
        .ni:hover svg,.ni.active svg{opacity:1;}
        .srch-drop{position:absolute;top:calc(100% + 6px);left:0;right:0;background:#fff;border:1px solid ${T.cardBorder};border-radius:10px;box-shadow:${T.shadowMd};z-index:50;max-height:300px;overflow-y:auto;}
        .srch-item{display:flex;align-items:center;gap:.6rem;padding:.58rem .85rem;cursor:pointer;transition:background .12s;}
        .srch-item:hover{background:${T.accentLight};}
        .tbtn{background:transparent;border:1px solid ${T.cardBorder};border-radius:9px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:${T.textSoft};transition:all .14s;flex-shrink:0;position:relative;}
        .tbtn:hover{background:${T.accentLight};border-color:${T.accent};color:${T.accent};}
        .notif-dot{position:absolute;top:5px;right:5px;width:7px;height:7px;border-radius:50%;background:${T.danger};border:2px solid #fff;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(45,158,107,.25);border-radius:3px;}
      `}</style>

      <div className="adm-root">
        {/* ── SIDEBAR ── */}
        <aside className="adm-sidebar" style={{ width: collapsed ? 60 : 232 }}>
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
                    PFE Admin
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
                    Console
                  </div>
                </div>
                <button
                  onClick={() => setCollapsed(true)}
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
                  <I.chevL />
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
                  <div
                    style={{ height: 1, background: T.sidebarBorder, margin: '.38rem .45rem' }}
                  />
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
                {section.items.map((item) => {
                  const badge = badgeFor(item.id);
                  return (
                    <button
                      key={item.id}
                      className={`ni${page === item.id ? ' active' : ''}`}
                      onClick={() => goTo(item.id)}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon />
                      {!collapsed && (
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flex: 1,
                          }}
                        >
                          {item.label}
                          {badge > 0 && (
                            <span
                              style={{
                                background: T.danger,
                                color: '#fff',
                                borderRadius: 999,
                                fontSize: '.58rem',
                                fontWeight: 800,
                                padding: '.1rem .42rem',
                                minWidth: 18,
                                textAlign: 'center',
                              }}
                            >
                              {badge}
                            </span>
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
            <div style={{ height: 1, background: T.sidebarBorder, margin: '.38rem .45rem' }} />
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
                Compte
              </p>
            )}
            <button
              className={`ni${page === 'profil' ? ' active' : ''}`}
              onClick={() => goTo('profil')}
              title={collapsed ? 'Profil' : undefined}
            >
              <I.user />
              {!collapsed && <span>Mon profil</span>}
            </button>
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
                  background: 'rgba(255,255,255,.07)',
                  borderRadius: 10,
                  padding: '.75rem .7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.6rem',
                  marginBottom: '.4rem',
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: T.accentGrad,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: '#fff',
                    fontSize: '.68rem',
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: '.74rem',
                      color: '#fff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user?.prenom || 'Admin'} {user?.nom || ''}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,.38)', fontSize: '.6rem', fontWeight: 600 }}>
                    {user?.email || 'admin@pfe.tn'}
                  </p>
                </div>
              </div>
            )}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '.65rem',
                padding: '.55rem .9rem',
                width: '100%',
                border: 'none',
                background: 'transparent',
                fontFamily: 'inherit',
                fontSize: '.8rem',
                fontWeight: 700,
                color: T.danger,
                cursor: 'pointer',
                borderRadius: 8,
                transition: 'background .14s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(220,38,38,.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              onClick={handleLogout}
            >
              <I.logout />
              {!collapsed && <span>Déconnexion</span>}
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="adm-main">
          <div className="adm-topbar">
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '.68rem', color: T.textMuted }}>Accueil / {pageLabel}</p>
              <p style={{ fontSize: '.95rem', fontWeight: 800, color: T.text }}>{pageLabel}</p>
            </div>

            <div style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.45rem',
                  background: '#f4faf7',
                  border: `1px solid ${srchFocus ? T.accent : T.cardBorder}`,
                  borderRadius: 9,
                  padding: '.42rem .8rem',
                  transition: 'border-color .15s',
                }}
              >
                <span style={{ color: T.textMuted }}>
                  <I.search />
                </span>
                <input
                  value={srch}
                  onChange={(e) => setSrch(e.target.value)}
                  onFocus={() => setSrchFocus(true)}
                  onBlur={() => setTimeout(() => setSrchFocus(false), 150)}
                  placeholder="Rechercher…"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontFamily: 'inherit',
                    fontSize: '.79rem',
                    color: T.text,
                    width: 160,
                  }}
                />
                {srch && (
                  <button
                    onClick={() => setSrch('')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: T.textMuted,
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0,
                    }}
                  >
                    <I.x />
                  </button>
                )}
              </div>
              {srchFocus && srch.length >= 2 && (
                <div className="srch-drop">
                  {searchResults.length > 0 ? (
                    searchResults.map((item, i) => (
                      <div
                        key={i}
                        className="srch-item"
                        onClick={() => {
                          goTo(item.page);
                          setSrch('');
                        }}
                      >
                        <span
                          style={{
                            fontSize: '.63rem',
                            fontWeight: 700,
                            padding: '.1rem .42rem',
                            borderRadius: 999,
                            background: item.bg,
                            color: item.color,
                            flexShrink: 0,
                          }}
                        >
                          {item.type}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontWeight: 700,
                              fontSize: '.79rem',
                              color: T.text,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.label}
                          </p>
                          {item.sub && (
                            <p
                              style={{
                                fontSize: '.68rem',
                                color: T.textMuted,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.sub}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        padding: '1rem',
                        textAlign: 'center',
                        color: T.textMuted,
                        fontSize: '.79rem',
                      }}
                    >
                      Aucun résultat
                    </div>
                  )}
                </div>
              )}
            </div>

            <button className="tbtn" onClick={() => goTo('notifications')} title="Notifications">
              <span style={{ color: T.textSoft }}>
                <I.bell />
              </span>
              {unread > 0 && <span className="notif-dot" />}
            </button>

            <button
              className="tbtn"
              onClick={() => goTo('messagerie')}
              title="Messagerie"
              style={{ position: 'relative' }}
            >
              <span style={{ color: T.textSoft }}>
                <I.msg />
              </span>
              {newMessagesCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: T.danger,
                    color: '#fff',
                    borderRadius: 999,
                    fontSize: '.55rem',
                    fontWeight: 800,
                    padding: '1px 5px',
                    minWidth: 16,
                    textAlign: 'center',
                    border: '2px solid #fff',
                  }}
                >
                  {newMessagesCount}
                </span>
              )}
            </button>

            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: T.accentGrad,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: '#fff',
                fontSize: '.72rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(45,158,107,.35)',
                flexShrink: 0,
              }}
              onClick={() => goTo('profil')}
            >
              {initials}
            </div>
          </div>

          <div className="adm-content">
            <div key={animKey} className="page-anim">
              {page === 'accueil' && (
                <PageAccueil
                  users={users}
                  sujets={sujets}
                  evals={evals}
                  fbs={fbs}
                  notifs={notifs}
                  stats={stats}
                  goTo={goTo}
                />
              )}
              {page === 'utilisateurs' && (
                <PageUtilisateurs
                  users={users}
                  usersPage={usersPage}
                  setUsersPage={setUsersPage}
                  usersTotal={usersTotal}
                  uF={uF}
                  setUF={setUF}
                  onValidate={handleValidateUser}
                  onDelete={handleDeleteUser}
                  showAddUser={showAddUser}
                  setShowAddUser={setShowAddUser}
                  addUserForm={addUserForm}
                  setAddUserForm={setAddUserForm}
                  addUserError={addUserError}
                  setAddUserError={setAddUserError}
                  addUserLoading={addUserLoading}
                  onAddUser={handleAddUser}
                  onEdit={handleOpenEdit}
                  onToggleActive={handleToggleActive}
                />
              )}
              {page === 'sujets' && (
                <PageSujets
                  sujets={sujets}
                  setSujets={setSujets}
                  setNotifs={setNotifs}
                  onDecision={handleSujetDecision}
                />
              )}
              {page === 'affectations' && <PageAffectations affectations={affectations} />}
              {page === 'evaluations' && <PageEvaluations evals={evals} />}
              {page === 'publications' && (
                <PagePublications
                  pubs={pubs}
                  setPubs={setPubs}
                  onRefresh={fetchPubs}
                  loading={pubsLoading}
                />
              )}
              {page === 'feedbacks' && <PageFeedbacks fbs={fbs} setFbs={setFbs} />}
              {page === 'messagerie' && (
                <PageMessagerie
                  messages={messages}
                  msgPage={msgPage}
                  setMsgPage={setMsgPage}
                  msgTotal={msgTotal}
                  showReply={showReply}
                  setShowReply={setShowReply}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  onReply={handleReplyMsg}
                  onArchive={handleArchiveMsg}
                />
              )}
              {page === 'notifications' && (
                <PageNotifications notifs={notifs} setNotifs={setNotifs} />
              )}
              {page === 'monitoring' && (
                <PageMonitoring
                  logs={logs}
                  logsTotal={logsTotal}
                  logsPage={logsPage}
                  setLogsPage={setLogsPage}
                  lgF={lgF}
                  setLgF={setLgF}
                  onRefresh={fetchLogs}
                />
              )}
              {page === 'statistiques' && (
                <PageStatistiques
                  users={users}
                  sujets={sujets}
                  evals={evals}
                  fbs={fbs}
                  pubs={pubs}
                  stats={stats}
                />
              )}
              {page === 'profil' && (
                <Card>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
                  >
                    <div
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: '50%',
                        background: T.accentGrad,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 17,
                        color: '#fff',
                        boxShadow: '0 4px 16px rgba(45,158,107,.35)',
                      }}
                    >
                      {`${user?.prenom?.[0] || 'A'}${user?.nom?.[0] || 'D'}`.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '1rem', color: T.text }}>
                        {user?.prenom || 'Admin'} {user?.nom || ''}
                      </p>
                      <p style={{ color: T.textSoft, fontSize: '.79rem', marginTop: 3 }}>
                        {user?.email || ''}
                      </p>
                      <div style={{ marginTop: 6 }}>
                        <Badge color={T.accent} bg={T.accentLight}>
                          Administrateur
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      {editUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,25,20,.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '1rem',
          }}
          onClick={(e) => e.target === e.currentTarget && setEditUser(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 500,
              background: '#fff',
              borderRadius: 16,
              padding: '1.75rem',
              boxShadow: '0 24px 60px rgba(0,0,0,.2)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}
            >
              <h3 style={{ fontWeight: 800, fontSize: 15, color: T.text }}>
                Modifier l'utilisateur
              </h3>
              <button
                onClick={() => setEditUser(null)}
                style={{
                  background: '#f0f3f6',
                  border: 'none',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: T.textSoft,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>
            {editUserError && (
              <div
                style={{
                  background: T.dangerLight,
                  border: `1px solid ${T.danger}40`,
                  borderRadius: 9,
                  padding: '10px 14px',
                  marginBottom: 12,
                  color: T.danger,
                  fontSize: 13,
                }}
              >
                ⚠ {editUserError}
              </div>
            )}
            <form onSubmit={handleEditUser} style={{ display: 'grid', gap: '.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem' }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 4 }}>
                    Prénom *
                  </p>
                  <input
                    required
                    value={editUserForm.prenom || ''}
                    onChange={(e) => setEditUserForm((p) => ({ ...p, prenom: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '.65rem .9rem',
                      borderRadius: 9,
                      border: `1px solid ${T.cardBorder}`,
                      fontFamily: 'inherit',
                      fontSize: 13,
                      color: T.text,
                      outline: 'none',
                      background: '#f8fdf9',
                    }}
                  />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 4 }}>
                    Nom *
                  </p>
                  <input
                    required
                    value={editUserForm.nom || ''}
                    onChange={(e) => setEditUserForm((p) => ({ ...p, nom: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '.65rem .9rem',
                      borderRadius: 9,
                      border: `1px solid ${T.cardBorder}`,
                      fontFamily: 'inherit',
                      fontSize: 13,
                      color: T.text,
                      outline: 'none',
                      background: '#f8fdf9',
                    }}
                  />
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 4 }}>
                  Email *
                </p>
                <input
                  required
                  type="email"
                  value={editUserForm.email || ''}
                  onChange={(e) => setEditUserForm((p) => ({ ...p, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '.65rem .9rem',
                    borderRadius: 9,
                    border: `1px solid ${T.cardBorder}`,
                    fontFamily: 'inherit',
                    fontSize: 13,
                    color: T.text,
                    outline: 'none',
                    background: '#f8fdf9',
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem' }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 4 }}>
                    Rôle *
                  </p>
                  <select
                    value={editUserForm.role || 'ETUDIANT'}
                    onChange={(e) => setEditUserForm((p) => ({ ...p, role: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '.65rem .9rem',
                      borderRadius: 9,
                      border: `1px solid ${T.cardBorder}`,
                      fontFamily: 'inherit',
                      fontSize: 13,
                      color: T.text,
                      outline: 'none',
                      background: '#f8fdf9',
                    }}
                  >
                    <option value="ETUDIANT">Étudiant</option>
                    <option value="ENCADRANT">Encadrant</option>
                    <option value="ADMINISTRATEUR">Administrateur</option>
                  </select>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 4 }}>
                    Téléphone
                  </p>
                  <input
                    placeholder="+216 XX XXX XXX"
                    value={editUserForm.telephone || ''}
                    onChange={(e) => setEditUserForm((p) => ({ ...p, telephone: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '.65rem .9rem',
                      borderRadius: 9,
                      border: `1px solid ${T.cardBorder}`,
                      fontFamily: 'inherit',
                      fontSize: 13,
                      color: T.text,
                      outline: 'none',
                      background: '#f8fdf9',
                    }}
                  />
                </div>
              </div>

              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 4 }}>
                  Code Référence
                </p>
                <input
                  placeholder="Ex: MAT2026001"
                  value={editUserForm.codeReference || ''}
                  onChange={(e) =>
                    setEditUserForm((p) => ({ ...p, codeReference: e.target.value }))
                  }
                  style={{
                    width: '100%',
                    padding: '.65rem .9rem',
                    borderRadius: 9,
                    border: `1px solid ${T.cardBorder}`,
                    fontFamily: 'inherit',
                    fontSize: 13,
                    color: T.text,
                    outline: 'none',
                    background: '#f8fdf9',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '.65rem', marginTop: '.25rem' }}>
                <Btn
                  variant="ghost"
                  onClick={() => setEditUser(null)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Annuler
                </Btn>
                <Btn
                  type="submit"
                  disabled={editUserLoading}
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  {editUserLoading ? (
                    '⏳ Enregistrement...'
                  ) : (
                    <>
                      <I.checkSm /> Enregistrer
                    </>
                  )}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
