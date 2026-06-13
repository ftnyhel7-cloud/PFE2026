import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setupAxiosInterceptors } from './api/axios';
import NotificationPopup from './components/NotificationPopup';

import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import ProfilPage from './pages/ProfilPage';
import NotificationsPage from './pages/NotificationsPage';
import ParametresPage from './pages/ParametresPage';
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite';
import ConditionsUtilisation from './pages/ConditionsUtilisation';
import MessagerieePage from './pages/MessagerieePage';
import SujetsPage from './pages/dashboard/SujetsPage';
import QuizPage from './pages/dashboard/QuizPage';
import { NotifProvider } from './context/NotificationsContext';
import PublicationsPage from './pages/PublicationsPage';
import FeedbacksPage from './pages/FeedbacksPage';
import CalendrierPage from './pages/dashboard/CalendrierPage';
import GuidePFEPage from './pages/dashboard/GuidePFEPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import CandidaturePage from './pages/dashboard/CandidaturePage';
import ResetPassword from './pages/auth/ResetPassword';


function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F172A',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 48,
            height: 48,
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: '#6366F1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#94A3B8', fontSize: '.9rem' }}>Chargement...</p>
      </div>
    </div>
  );
}

function AxiosSetup() {
  const { accessToken, refreshAccessToken, logout } = useAuth();
  useEffect(() => {
    setupAxiosInterceptors({ getAccessToken: () => accessToken, refreshAccessToken, logout });
  }, [accessToken, refreshAccessToken, logout]);
  return null;
}

function GlobalNotificationPopup() {
  const { popupNotifications, showPopup, clearPopup } = useAuth();
  if (!showPopup || !popupNotifications || popupNotifications.length === 0) return null;
  return <NotificationPopup notifications={popupNotifications} onClose={clearPopup} />;
}

function AppRoutes() {
  return (
    <>
      <GlobalNotificationPopup />
      <Routes>
        {/* ── Publiques ── */}
        <Route path="/accueil" element={<LandingPage />} />
        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
        <Route path="/conditions-utilisation" element={<ConditionsUtilisation />} />

        {/* ── Auth ── */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPassword />
            </PublicOnlyRoute>
          }
        />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/quiz/token/:token" element={<QuizPage />} />

        {/* ── Protégées ── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <ProfilPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parametres"
          element={
            <ProtectedRoute>
              <ParametresPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messagerie"
          element={
            <ProtectedRoute>
              <MessagerieePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sujets"
          element={
            <ProtectedRoute>
              <SujetsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:candidatureId"
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidature/:idSujet"
          element={
            <ProtectedRoute>
              <CandidaturePage />
            </ProtectedRoute>
          }
        />
        <Route // ← ajouter
          path="/publications"
          element={
            <ProtectedRoute>
              <PublicationsPage />
            </ProtectedRoute>
          }
        />
        <Route // ← ajouter
          path="/feedbacks"
          element={
            <ProtectedRoute>
              <FeedbacksPage />
            </ProtectedRoute>
          }
        />
        <Route // ← ajouter
          path="/calendrier"
          element={
            <ProtectedRoute>
              <CalendrierPage />
            </ProtectedRoute>
          }
        />


        {/* ── Redirections ── */}
        <Route path="/" element={<Navigate to="/accueil" replace />} />
        <Route path="*" element={<Navigate to="/accueil" replace />} />

        <Route path="/guide-pfe" element={<GuidePFEPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotifProvider>
          <AxiosSetup />
          <AppRoutes />
        </NotifProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

