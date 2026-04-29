// ═══════════════════════════════════════════════════════════
//  FRONTEND/src/context/AuthContext.jsx
//  Gestion globale de l'authentification
//  Access Token en mémoire (pas localStorage)
//  Refresh Token dans cookie HTTP-Only (géré par le serveur)
//  + Popup notifications au login
// ═══════════════════════════════════════════════════════════
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Instance Axios dédiée au refresh (sans intercepteur pour éviter boucle infinie)
const authAxios = axios.create({ baseURL: 'http://localhost:5000/api', withCredentials: true });

export function AuthProvider({ children }) {
  // ── State ────────────────────────────────────────────
  const [user,         setUser]         = useState(null);
  const [accessToken,  setAccessToken]  = useState(null); // En mémoire uniquement
  const [loading,      setLoading]      = useState(true);  // Chargement initial
  const [authError,    setAuthError]    = useState('');

  // Notifications popup (non lues à afficher après login)
  const [popupNotifications, setPopupNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  // Référence pour éviter les appels simultanés au refresh
  const refreshPromiseRef = useRef(null);

  // ─────────────────────────────────────────────────────
  //  RESTAURER LA SESSION au chargement
  //  Tente un refresh silencieux avec le cookie HTTP-Only
  // ─────────────────────────────────────────────────────
  useEffect(() => {
    silentRefresh();
  }, []);

  const silentRefresh = async () => {
    try {
      const { data } = await authAxios.post('/auth/refresh-token');
      if (data.status === 'success') {
        setAccessToken(data.accessToken);
        setUser(data.user);
      }
    } catch {
      // Pas de session active — normal si première visite
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────
  //  CONNEXION — récupère aussi les notifications popup
  // ─────────────────────────────────────────────────────
  const login = useCallback(async (email, motDePasse) => {
    setAuthError('');
    try {
      const { data } = await authAxios.post('/auth/login', {
        email,
        mot_de_passe: motDePasse,
      });

      if (data.status === 'success') {
        setAccessToken(data.accessToken); // En mémoire
        setUser(data.user);

        // Afficher les notifications popup si disponibles
        if (data.popupNotifications && data.popupNotifications.length > 0) {
          setPopupNotifications(data.popupNotifications);
          setShowPopup(true);
        }

        return { success: true, role: data.user.role };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur de connexion';
      const code = err.response?.data?.code || '';
      setAuthError(message);
      return { success: false, message, code };
    }
  }, []);

  // ─────────────────────────────────────────────────────
  //  INSCRIPTION — pas de token ici (connexion séparée)
  // ─────────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    setAuthError('');
    try {
      const { data } = await authAxios.post('/auth/register', formData);
      if (data.status === 'success') {
        // Ne pas définir de token ici, l'utilisateur se connecte ensuite.
        return { success: true, message: data.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de l\'inscription';
      setAuthError(message);
      return { success: false, message };
    }
  }, []);

  // ─────────────────────────────────────────────────────
  //  DÉCONNEXION
  // ─────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authAxios.post('/auth/logout');
    } catch {}
    // Vider l'état même si la requête échoue
    setUser(null);
    setAccessToken(null);
    setAuthError('');
    setPopupNotifications([]);
    setShowPopup(false);
  }, []);

  // ─────────────────────────────────────────────────────
  //  RAFRAÎCHIR LE TOKEN (appelé par l'intercepteur Axios)
  //  Gère les appels simultanés avec une promesse partagée
  // ─────────────────────────────────────────────────────
  const refreshAccessToken = useCallback(async () => {
    // Si un refresh est déjà en cours, attendre le même
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = (async () => {
      try {
        const { data } = await authAxios.post('/auth/refresh-token');
        if (data.status === 'success') {
          setAccessToken(data.accessToken);
          setUser(data.user);
          return data.accessToken;
        }
        throw new Error('Refresh échoué');
      } catch {
        // Session expirée → déconnexion forcée
        setUser(null);
        setAccessToken(null);
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, []);

  // ─────────────────────────────────────────────────────
  //  METTRE À JOUR LE PROFIL LOCALEMENT
  // ─────────────────────────────────────────────────────
  const updateUser = useCallback((newUser) => {
    setUser(newUser);
  }, []);

  // ─────────────────────────────────────────────────────
  //  FERMER LE POPUP
  // ─────────────────────────────────────────────────────
  const clearPopup = useCallback(() => {
    setShowPopup(false);
    setPopupNotifications([]);
  }, []);

  const value = {
    user,
    accessToken,
    loading,
    authError,
    isAuthenticated: !!user && !!accessToken,
    login,
    register,
    logout,
    updateUser,
    refreshAccessToken,
    setAuthError,
    // Popup notifications
    popupNotifications,
    showPopup,
    clearPopup,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
};
