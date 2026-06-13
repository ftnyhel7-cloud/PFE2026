import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const publicAPI = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─────────────────────────────────────────────────────────────
//  PAGE TRANSITION HOOK
// ─────────────────────────────────────────────────────────────
function usePageTransition() {
  const navigate = useNavigate();
  const [transitioning, setTransitioning] = useState(false);

  const transitionTo = useCallback(
    (path) => {
      if (transitioning) return;
      setTransitioning(true);
      setTimeout(() => {
        navigate(path);
        setTimeout(() => setTransitioning(false), 400);
      }, 320);
    },
    [navigate, transitioning]
  );

  return { transitionTo, transitioning };
}

// ─────────────────────────────────────────────────────────────
//  RIPPLE HELPER
// ─────────────────────────────────────────────────────────────
function createRipple(e) {
  const button = e.currentTarget;
  const existing = button.querySelector('.ripple-el');
  if (existing) existing.remove();

  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  const rect = button.getBoundingClientRect();

  circle.className = 'ripple-el';
  Object.assign(circle.style, {
    width: `${diameter}px`,
    height: `${diameter}px`,
    left: `${e.clientX - rect.left - radius}px`,
    top: `${e.clientY - rect.top - radius}px`,
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.35)',
    transform: 'scale(0)',
    animation: 'ripple-anim 0.55s linear',
    pointerEvents: 'none',
  });

  button.style.position = 'relative';
  button.style.overflow = 'hidden';
  button.appendChild(circle);
  circle.addEventListener('animationend', () => circle.remove());
}

// ─────────────────────────────────────────────────────────────
//  ANIMATED BUTTON
// ─────────────────────────────────────────────────────────────
function AnimBtn({
  className = 'btn-main',
  style = {},
  onClick,
  disabled,
  children,
  type = 'button',
  glow = false,
}) {
  const [pressed, setPressed] = useState(false);

  const handlePointerDown = (e) => {
    createRipple(e);
    setPressed(true);
  };
  const handlePointerUp = () => setPressed(false);

  const pressStyle = pressed
    ? { transform: 'scale(0.95)', transition: 'transform 0.08s ease' }
    : { transition: 'transform 0.18s ease' };

  const glowStyle = glow
    ? { boxShadow: pressed ? '0 0 0 4px rgba(243,156,18,0.25)' : '0 0 0 0px rgba(243,156,18,0)' }
    : {};

  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      style={{ ...style, ...pressStyle, ...glowStyle, position: 'relative', overflow: 'hidden' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
//  SCROLL-REVEAL HOOK — fixed threshold for sections visible on load
// ─────────────────────────────────────────────────────────────
function useScrollReveal(delay = 0) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transition = `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.unobserve(el);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -10px 0px' }
    );

    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return ref;
}

// ─────────────────────────────────────────────────────────────
//  SVG ICONS
// ─────────────────────────────────────────────────────────────
const FacebookIcon = ({ size = 22 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="#fff"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const LinkedInIcon = ({ size = 22 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="#fff"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const XTwitterIcon = ({ size = 22 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="#fff"
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);
const YouTubeIcon = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="#fff"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const InstagramIcon = ({ size = 22 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="#fff"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const IconGraduation = ({ size = 28, color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
const IconUsers = ({ size = 28, color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconBook = ({ size = 28, color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const IconGlobe = ({ size = 28, color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const IconCode = ({ size = 24, color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);
const IconBrain = ({ size = 24, color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14z" />
  </svg>
);
const IconSmartphone = ({ size = 24, color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);
const IconShield = ({ size = 24, color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconBarChart = ({ size = 24, color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);
const IconCloud = ({ size = 24, color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
);
const IconRobot = ({ size = 24, color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="16" y1="16" x2="16" y2="16" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M9 21v1M15 21v1" />
  </svg>
);
const IconDashboard = ({ size = 24, color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconTeacher = ({ size = 24, color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 11l-4 4-2-2" />
  </svg>
);
const IconMapPin = ({ size = 20, color = '#F39C12' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconPhone = ({ size = 20, color = '#F39C12' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l1.84-1.84a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconMail = ({ size = 20, color = '#F39C12' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconLink = ({ size = 20, color = '#F39C12' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const IconArrowRight = ({ size = 18, color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconSend = ({ size = 18, color = '#fff' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IconCheck = ({ size = 16, color = '#065f46' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconAlertCircle = ({ size = 16, color = '#991b1b' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconLoader = ({ size = 18, color = '#fff' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ animation: 'spin 1s linear infinite' }}
  >
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
//  PAGE TRANSITION OVERLAY
// ─────────────────────────────────────────────────────────────
function TransitionOverlay({ active }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: active ? 'all' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #0d1f30 0%, #1a3a5c 100%)',
          transform: active ? 'scaleY(1)' : 'scaleY(0)',
          transformOrigin: active ? 'top' : 'bottom',
          transition: 'transform 0.35s cubic-bezier(0.76,0,0.24,1)',
        }}
      />
      <div
        style={{
          position: 'relative',
          opacity: active ? 1 : 0,
          transition: 'opacity 0.2s ease',
          transitionDelay: active ? '0.15s' : '0s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: '#F39C12',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: active ? 'logoSpin 0.6s ease infinite' : 'none',
          }}
        >
          <IconGraduation size={30} color="#fff" />
        </div>
        <div
          style={{
            color: '#F39C12',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          Chargement…
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { transitionTo, transitioning } = usePageTransition();
  const { user } = useAuth();
  const isLoggedIn = !!user || !!localStorage.getItem('token');
  const [statutPFE, setStatutPFE] = useState(null);

  useEffect(() => {
    if (user?.role === 'ETUDIANT') {
      import('../api/axios').then(({ default: API }) => {
        API.get('/etudiants/mon-profil')
          .then(({ data }) => setStatutPFE(data?.statutPFE))
          .catch(() => {});
      });
    }
  }, [user]);

  const [scrolled, setScrolled] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [contactForm, setContactForm] = useState({ nom: '', email: '', sujet: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactError, setContactError] = useState('');
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

  // scroll-reveal refs
  const revealFeatures = useScrollReveal(0);
  const revealStats = useScrollReveal(0);
  const revealDomaines = useScrollReveal(0);
  const revealEncadrants = useScrollReveal(0);
  const revealTestimonials = useScrollReveal(0);
  const revealAbout = useScrollReveal(0);
  const revealContact = useScrollReveal(0);

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

  // ── FETCH FEEDBACKS APPROUVÉS ─────────────────────────────
  useEffect(() => {
    publicAPI
      .get('/feedbacks/publics')
      .then(({ data }) => setTestimonials(Array.isArray(data) ? data : []))
      .catch(() => setTestimonials([]))
      .finally(() => setTestimonialsLoading(false));
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');
    setContactSuccess('');
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
      setTimeout(() => setContactSuccess(''), 6000);
    } catch (err) {
      setContactError(
        err.response?.data?.message || "Erreur lors de l'envoi. Réessayez plus tard."
      );
    } finally {
      setContactLoading(false);
    }
  };

  const handleField = (field) => (e) =>
    setContactForm((prev) => ({ ...prev, [field]: e.target.value }));

  const features = [
    {
      color: '#4A90D9',
      Icon: IconUsers,
      title: 'Encadrants Qualifies',
      desc: 'Des professeurs et professionnels expertes dans leurs domaines pour vous guider.',
    },
    {
      color: '#E74C3C',
      Icon: IconBook,
      title: 'Sujets Diversifies',
      desc: 'Plus de 100 sujets PFE dans tous les domaines technologiques et scientifiques.',
    },
    {
      color: '#27AE60',
      Icon: IconGlobe,
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
    { Icon: IconCode, title: 'Developpement Web', count: '24 sujets', color: '#4A90D9' },
    { Icon: IconBrain, title: 'Intelligence Artificielle', count: '18 sujets', color: '#9B59B6' },
    { Icon: IconSmartphone, title: 'Applications Mobile', count: '15 sujets', color: '#E74C3C' },
    { Icon: IconShield, title: 'Cybersecurite', count: '12 sujets', color: '#E67E22' },
    { Icon: IconBarChart, title: 'Big Data & Analytics', count: '10 sujets', color: '#27AE60' },
    { Icon: IconCloud, title: 'Cloud Computing', count: '8 sujets', color: '#1ABC9C' },
  ];

  const teachers = [
    { name: 'Dr. Mohamed Hammami', role: 'Genie Logiciel', sujets: 5, color: '#4A90D9' },
    { name: 'Dr. Fatma Ben Salem', role: 'Intelligence Artificielle', sujets: 4, color: '#9B59B6' },
    { name: 'Dr. Ahmed Trabelsi', role: 'Reseaux & Securite', sujets: 6, color: '#E74C3C' },
    { name: 'Dr. Sara Khalil', role: 'Developpement Mobile', sujets: 3, color: '#27AE60' },
  ];

  const socialLinks = [
    { href: 'https://facebook.com', bg: '#1877F2', label: 'Facebook', Icon: FacebookIcon },
    { href: 'https://linkedin.com', bg: '#0A66C2', label: 'LinkedIn', Icon: LinkedInIcon },
    { href: 'https://twitter.com', bg: '#14171A', label: 'X', Icon: XTwitterIcon },
    { href: 'https://youtube.com', bg: '#FF0000', label: 'YouTube', Icon: YouTubeIcon },
    { href: 'https://instagram.com', bg: '#C13584', label: 'Instagram', Icon: InstagramIcon },
  ];

  const footerContactItems = [
    { Icon: IconMapPin, val: 'Tunis, Tunisie' },
    { Icon: IconPhone, val: '+216 71 000 000' },
    { Icon: IconMail, val: 'contact@projectfinder.tn' },
    { Icon: IconLink, val: 'www.projectfinder.tn' },
  ];

  const aboutCards = [
    { Icon: IconGraduation, title: 'Pour les etudiants', desc: 'Trouvez votre sujet ideal' },
    { Icon: IconTeacher, title: 'Pour les encadrants', desc: 'Gerez vos etudiants' },
    { Icon: IconRobot, title: 'Analyse IA', desc: 'Score de compatibilite' },
    { Icon: IconDashboard, title: 'Dashboard', desc: 'Suivez votre progression' },
  ];

  // ── helper : label lisible pour roleAuteur ────────────────
  const roleLabel = (role) => {
    if (role === 'ETUDIANT') return 'Étudiant';
    if (role === 'ENCADRANT') return 'Encadrant';
    return role ?? '';
  };

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
      <TransitionOverlay active={transitioning} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }

        /* ── Keyframes ── */
        @keyframes fadeIn   { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse    { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } }
        @keyframes slideUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin     { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes logoSpin { 0%,100% { transform:scale(1) rotate(0deg); } 50% { transform:scale(1.12) rotate(8deg); } }
        @keyframes ripple-anim { to { transform: scale(3.5); opacity: 0; } }
        @keyframes shimmer  { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        @keyframes countUp  { from { opacity:0; transform:scale(.7) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }

        /* ── NEW animations ── */
        @keyframes floatUp   { 0%,100% { transform:translateY(0);   } 50% { transform:translateY(-8px); } }
        @keyframes starPop   { 0% { transform:scale(0) rotate(-30deg); opacity:0; } 60% { transform:scale(1.3) rotate(5deg); } 100% { transform:scale(1) rotate(0deg); opacity:1; } }
        @keyframes cardEntry { from { opacity:0; transform:translateY(40px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }

        .animate-fade { animation: fadeIn .8s ease both; }

        /* ── Navbar ── */
        .nav-link { color:#fff; text-decoration:none; font-size:.95rem; font-weight:500; padding:.4rem .8rem; border-radius:6px; transition:all .2s; cursor:pointer; }
        .nav-link:hover { background:rgba(255,255,255,.15); }

        /* ── Buttons ── */
        .btn-main {
          background:#F39C12; color:#fff; border:none; padding:.85rem 2.2rem;
          border-radius:8px; font-size:1rem; font-weight:700; cursor:pointer;
          font-family:'Poppins',sans-serif; transition:background .25s, box-shadow .25s;
          text-transform:uppercase; letter-spacing:.05em;
          display:inline-flex; align-items:center; gap:.5rem;
          position:relative; overflow:hidden;
        }
        .btn-main:hover  { background:#E67E22; box-shadow:0 8px 24px rgba(243,156,18,.4); }
        .btn-main:active { background:#cf6d17; }
        .btn-main:disabled { opacity:.6; cursor:not-allowed; box-shadow:none; }

        .btn-outline {
          background:transparent; color:#fff; border:2px solid rgba(255,255,255,.6);
          padding:.85rem 2.2rem; border-radius:8px; font-size:1rem; font-weight:600;
          cursor:pointer; font-family:'Poppins',sans-serif; transition:all .25s;
          position:relative; overflow:hidden;
        }
        .btn-outline:hover { background:rgba(255,255,255,.15); border-color:#fff; }

        /* ── Feature cards ── */
        .feature-card {
          background:#fff; border-radius:16px; padding:2.5rem 2rem; text-align:center;
          transition:transform .3s, box-shadow .3s; box-shadow:0 4px 20px rgba(0,0,0,.08);
          position:relative; overflow:hidden;
        }
        .feature-card::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.55) 50%,transparent 100%);
          background-size:400px 100%; opacity:0; transition:opacity .3s;
        }
        .feature-card:hover { transform:translateY(-8px); box-shadow:0 16px 40px rgba(0,0,0,.15); }
        .feature-card:hover::after { opacity:1; animation:shimmer .8s ease; }
        .feature-card:hover .feature-icon { animation:floatUp 1.2s ease infinite; }

        /* ── Course cards ── */
        .course-card {
          background:#fff; border-radius:14px; padding:1.75rem;
          transition:transform .3s, box-shadow .3s; box-shadow:0 4px 16px rgba(0,0,0,.07);
          cursor:pointer; border-left:5px solid transparent; position:relative; overflow:hidden;
        }
        .course-card::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent);
          background-size:400px 100%; opacity:0;
        }
        .course-card:hover { transform:translateY(-5px); box-shadow:0 12px 32px rgba(0,0,0,.12); }
        .course-card:hover::after { opacity:1; animation:shimmer .7s ease; }

        /* ── Teacher cards ── */
        .teacher-card {
          background:#fff; border-radius:16px; padding:2rem; text-align:center;
          transition:transform .3s, box-shadow .3s; box-shadow:0 4px 16px rgba(0,0,0,.07);
        }
        .teacher-card:hover { transform:translateY(-6px); box-shadow:0 16px 36px rgba(0,0,0,.12); }

        /* ── Testimonial cards — REDESIGNED ── */
        .testimonial-card {
          background:#fff; border-radius:20px; padding:1.75rem 1.75rem 1.5rem;
          border:1.5px solid #eef0f5;
          display:flex; flex-direction:column; gap:.9rem;
          transition:transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s;
          box-shadow:0 4px 20px rgba(0,0,0,.06);
          animation: cardEntry .5s ease both;
        }
        .testimonial-card:hover { transform:translateY(-7px) scale(1.01); box-shadow:0 20px 48px rgba(26,58,92,.13); }
        .star-item { display:inline-block; animation: starPop .4s ease both; }

        /* ── Slide dots ── */
        .slide-dot { width:10px; height:10px; border-radius:50%; background:rgba(255,255,255,.4); border:none; cursor:pointer; transition:all .3s; }
        .slide-dot.active { background:#F39C12; width:30px; border-radius:5px; }

        /* ── Contact form ── */
        .contact-input:focus { border-color: #1a3a5c !important; }
        .contact-success { background:#ecfdf5; border:1px solid #6ee7b7; color:#065f46; padding:.85rem 1.1rem; border-radius:10px; font-size:.88rem; font-weight:600; animation:slideUp .3s ease; display:flex; align-items:center; gap:.5rem; }
        .contact-error   { background:#fef2f2; border:1px solid #fca5a5; color:#991b1b; padding:.85rem 1.1rem; border-radius:10px; font-size:.88rem; font-weight:600; animation:slideUp .3s ease; display:flex; align-items:center; gap:.5rem; }
        input::placeholder, textarea::placeholder { color:#aaa; }

        /* ── About cards ── */
        .about-card { background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1); border-radius:16px; padding:1.5rem; transition:all .3s; }
        .about-card:hover { background:rgba(255,255,255,.11); transform:translateY(-4px); }

        /* ── Stat counter ── */
        .stat-num { animation:countUp .6s cubic-bezier(.22,1,.36,1) both; }

        /* ── Testimonial section loading skeleton ── */
        .testi-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 400px 100%;
          animation: shimmer 1.2s infinite;
          border-radius: 20px;
          height: 200px;
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 998,
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
          onClick={() => transitionTo('/')}
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
            }}
          >
            <IconGraduation size={26} color="#fff" />
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
          {isLoggedIn ? (
            <AnimBtn
              className="btn-main"
              style={{
                padding: '.6rem 1.4rem',
                fontSize: '.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '.5rem',
              }}
              glow
              onClick={() => transitionTo('/dashboard')}
            >
              <IconDashboard size={18} color="#fff" />
              {user?.role === 'ETUDIANT' && statutPFE !== 'VALIDE' ? 'Sujets PFE' : 'Dashboard'}
            </AnimBtn>
          ) : (
            <>
              <AnimBtn
                className="btn-outline"
                style={{ padding: '.6rem 1.4rem', fontSize: '.9rem' }}
                onClick={() => transitionTo('/login')}
              >
                Connexion
              </AnimBtn>
              <AnimBtn
                className="btn-main"
                style={{ padding: '.6rem 1.4rem', fontSize: '.9rem' }}
                glow
                onClick={() => transitionTo('/register')}
              >
                S'inscrire
              </AnimBtn>
            </>
          )}
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
        <div style={{ maxWidth: 900, textAlign: 'center', position: 'relative', width: '100%' }}>
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
              marginBottom: '2rem',
            }}
          >
            <AnimBtn className="btn-main" glow onClick={() => transitionTo('/auth')}>
              {slide.btn}
            </AnimBtn>
            <AnimBtn
              className="btn-outline"
              onClick={() =>
                document.getElementById('apropos').scrollIntoView({ behavior: 'smooth' })
              }
            >
              En savoir plus
            </AnimBtn>
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

          {/* ── Stats bar — fixed layout ── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              flexWrap: 'wrap',
              padding: '1.25rem 1.5rem',
              background: 'rgba(255,255,255,.06)',
              borderRadius: 16,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,.1)',
              maxWidth: 700,
              margin: '0 auto',
            }}
          >
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', minWidth: 90 }}>
                <div
                  className="stat-num"
                  style={{
                    fontWeight: 800,
                    fontSize: '2rem',
                    color: '#F39C12',
                    animationDelay: `${i * 0.12}s`,
                  }}
                >
                  {s.value}
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
        <div ref={revealFeatures} style={{ maxWidth: 1100, margin: '0 auto' }}>
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
              SmartPFE simplifie la gestion des projets de fin d'etudes.
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
              <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div
                  className="feature-icon"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: f.color + '18',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                  }}
                >
                  <f.Icon size={36} color={f.color} />
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
          ref={revealStats}
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
              <div
                className="stat-num"
                style={{
                  fontWeight: 800,
                  fontSize: '3rem',
                  color: '#F39C12',
                  lineHeight: 1,
                  animationDelay: `${i * 0.1}s`,
                }}
              >
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

      {/* ── DOMAINES — fixed: no empty space at bottom ── */}
      <section id="domaines" style={{ padding: '6rem 2.5rem 5rem', background: '#fff' }}>
        <div ref={revealDomaines} style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {courses.map((c, i) => (
              <div
                key={i}
                className="course-card"
                style={{ borderLeftColor: c.color, animationDelay: `${i * 0.08}s` }}
                onClick={() => transitionTo('/auth')}
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
                      flexShrink: 0,
                    }}
                  >
                    <c.Icon size={26} color={c.color} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1a3a5c', margin: 0 }}>
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
                  <IconArrowRight size={18} color={c.color} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENCADRANTS ── */}
      <section id="encadrants" style={{ padding: '6rem 2.5rem', background: '#f8fafc' }}>
        <div ref={revealEncadrants} style={{ maxWidth: 1100, margin: '0 auto' }}>
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

      {/* ── TÉMOIGNAGES — champs réels de l'API (nomAuteur, roleAuteur, note, commentaire) ── */}
      <section style={{ padding: '6rem 2.5rem', background: '#fff' }}>
        <div ref={revealTestimonials} style={{ maxWidth: 1100, margin: '0 auto' }}>
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
              Témoignages
            </div>
            <h2
              style={{ fontWeight: 800, fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', color: '#1a3a5c' }}
            >
              Ce que disent nos utilisateurs
            </h2>
            <p style={{ color: '#888', marginTop: '.75rem', fontSize: '.95rem' }}>
              Avis vérifiés et approuvés par notre équipe
            </p>
          </div>

          {/* Loading state */}
          {testimonialsLoading && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
                gap: '1.5rem',
              }}
            >
              {[1, 2, 3].map((n) => (
                <div key={n} className="testi-skeleton" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!testimonialsLoading && testimonials.length === 0 && (
            <div
              style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: '.95rem' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              Aucun témoignage disponible pour le moment.
            </div>
          )}

          {/* Cards — grille centrée même avec 1 seule carte ── */}
          {!testimonialsLoading && testimonials.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  testimonials.length === 1
                    ? 'minmax(280px, 480px)'
                    : testimonials.length === 2
                      ? 'repeat(2, minmax(280px, 480px))'
                      : 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
                justifyContent: 'center',
              }}
            >
              {testimonials.map((t, i) => (
                <div
                  key={t._id ?? i}
                  className="testimonial-card"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {/* ── Étoiles avec animation ── */}
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <span
                        key={s}
                        className="star-item"
                        style={{
                          color: s < (t.note ?? 0) ? '#F39C12' : '#e0e0e0',
                          fontSize: '1.15rem',
                          animationDelay: `${i * 0.1 + s * 0.07}s`,
                        }}
                      >
                        ★
                      </span>
                    ))}
                    {t.note != null && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: '.78rem',
                          color: '#999',
                          fontWeight: 600,
                        }}
                      >
                        ({t.note}/5)
                      </span>
                    )}
                  </div>

                  {/* ── Guillemet décoratif ── */}
                  <div
                    style={{
                      color: '#F39C12',
                      fontSize: '2.8rem',
                      lineHeight: 1,
                      marginBottom: '-.6rem',
                      fontFamily: 'Georgia, serif',
                      opacity: 0.85,
                    }}
                  >
                    "
                  </div>

                  {/* ── Commentaire — champ réel API ── */}
                  <p
                    style={{
                      color: '#4a4a5a',
                      lineHeight: 1.8,
                      fontSize: '.93rem',
                      fontStyle: 'italic',
                      flex: 1,
                      margin: 0,
                    }}
                  >
                    {t.commentaire || <em style={{ color: '#ccc' }}>Aucun commentaire.</em>}
                  </p>

                  {/* ── Auteur ── */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '.75rem',
                      borderTop: '1px solid #f2f4f8',
                      paddingTop: '1rem',
                      marginTop: 'auto',
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg,#1a3a5c,#4A90D9)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '1rem',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(26,58,92,.25)',
                      }}
                    >
                      {(t.nomAuteur ?? 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      {/* ── Nom — champ réel API ── */}
                      <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '.9rem' }}>
                        {t.nomAuteur ?? 'Anonyme'}
                      </div>
                      {/* ── Rôle — champ réel API ── */}
                      {t.roleAuteur && (
                        <div
                          style={{
                            color: '#F39C12',
                            fontSize: '.75rem',
                            fontWeight: 600,
                            marginTop: 2,
                          }}
                        >
                          {roleLabel(t.roleAuteur)}
                        </div>
                      )}
                    </div>
                    {/* ── Badge vérifié ── */}
                    <div
                      style={{
                        marginLeft: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: '#ecfdf5',
                        borderRadius: 100,
                        padding: '3px 10px',
                      }}
                    >
                      <IconCheck size={12} color="#059669" />
                      <span style={{ fontSize: '.7rem', color: '#059669', fontWeight: 600 }}>
                        Vérifié
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── A PROPOS ── */}
      <section style={{ padding: '6rem 2.5rem', background: '#1a3a5c' }}>
        <div
          ref={revealAbout}
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
              Bienvenue sur SmartPFE
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,.75)',
                lineHeight: 1.8,
                marginBottom: '1.25rem',
                fontSize: '.97rem',
              }}
            >
              SmartPFE est une plateforme innovante dediee a la gestion des projets de fin d'etudes
              en Tunisie.
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
            <AnimBtn className="btn-main" glow onClick={() => transitionTo('/auth')}>
              Rejoindre maintenant
            </AnimBtn>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {aboutCards.map((c, i) => (
              <div key={i} className="about-card">
                <div style={{ marginBottom: '.75rem' }}>
                  <c.Icon size={28} color="#F39C12" />
                </div>
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

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding: '6rem 2.5rem', background: '#fff' }}>
        <div ref={revealContact} style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
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

          {contactSuccess && (
            <div className="contact-success" style={{ marginBottom: '1.25rem' }}>
              <IconCheck size={16} color="#065f46" /> {contactSuccess}
            </div>
          )}
          {contactError && (
            <div className="contact-error" style={{ marginBottom: '1.25rem' }}>
              <IconAlertCircle size={16} color="#991b1b" /> {contactError}
            </div>
          )}

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
              <AnimBtn
                type="submit"
                className="btn-main"
                disabled={contactLoading}
                style={{ padding: '1rem 2.5rem' }}
                glow
              >
                {contactLoading ? (
                  <>
                    <IconLoader size={18} color="#fff" /> Envoi en cours...
                  </>
                ) : (
                  <>
                    <IconSend size={18} color="#fff" /> Envoyer le message
                  </>
                )}
              </AnimBtn>
              {contactLoading && (
                <span style={{ color: '#666', fontSize: '.82rem' }}>Veuillez patienter...</span>
              )}
            </div>
          </form>
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
                  }}
                >
                  <IconGraduation size={24} color="#fff" />
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
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                {socialLinks.map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: s.bg,
                      padding: '10px',
                      borderRadius: '50%',
                      textDecoration: 'none',
                      transition: 'all .22s',
                      border: '1.5px solid rgba(255,255,255,.12)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onPointerDown={createRipple}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <s.Icon size={20} />
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.4rem',
                    color: 'rgba(255,255,255,.6)',
                    fontSize: '.88rem',
                    marginBottom: '.6rem',
                    textDecoration: 'none',
                    transition: 'color .2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#F39C12')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,.6)')}
                >
                  <IconArrowRight size={14} color="currentColor" /> {link}
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.4rem',
                    color: 'rgba(255,255,255,.6)',
                    fontSize: '.88rem',
                    marginBottom: '.6rem',
                    textDecoration: 'none',
                    transition: 'color .2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#F39C12')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,.6)')}
                >
                  <IconArrowRight size={14} color="currentColor" /> {link}
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
                {footerContactItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start' }}>
                    <item.Icon size={16} color="#F39C12" />
                    <span
                      style={{ color: 'rgba(255,255,255,.6)', fontSize: '.85rem', lineHeight: 1.5 }}
                    >
                      {item.val}
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
              © 2026 SmartPFE — Tunisie
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
