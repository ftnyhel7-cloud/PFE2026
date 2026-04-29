// ═══════════════════════════════════════════════════════════
//  FRONTEND/src/api/axios.js
//  Instance Axios configurée avec :
//  - Access Token automatiquement attaché
//  - Refresh automatique sur erreur 401
//  - Redirection vers login si session expirée
// ═══════════════════════════════════════════════════════════
import axios from 'axios';

// ── Instance principale ──────────────────────────────────
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Nécessaire pour envoyer le cookie refresh
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15 secondes max
});

// ── Référence vers la fonction de refresh du context ────
// Sera injectée via setupAxiosInterceptors()
let _refreshAccessToken = null;
let _logout = null;
let _getAccessToken = null;

/**
 * À appeler une fois dans App.jsx après le montage du AuthProvider
 * Injecte les fonctions du contexte dans Axios
 */
export function setupAxiosInterceptors({ refreshAccessToken, logout, getAccessToken }) {
  _refreshAccessToken = refreshAccessToken;
  _logout = logout;
  _getAccessToken = getAccessToken;
}

// ── INTERCEPTEUR REQUEST : attacher le token ─────────────
API.interceptors.request.use(
  (config) => {
    const token = _getAccessToken?.();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── INTERCEPTEUR RESPONSE : gérer les 401 ───────────────
API.interceptors.response.use(
  // Réponse OK → passer directement
  (response) => response,

  // Erreur → tenter un refresh si 401
  async (error) => {
    const originalRequest = error.config;

    // Éviter la boucle infinie sur la route refresh elle-même
    if (originalRequest.url?.includes('/auth/refresh-token')) {
      return Promise.reject(error);
    }

    // Si 401 et pas déjà retentée
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (_refreshAccessToken) {
        const newToken = await _refreshAccessToken();

        if (newToken) {
          // Rejouer la requête originale avec le nouveau token
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return API(originalRequest);
        } else {
          // Refresh échoué → session terminée
          _logout?.();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default API;
