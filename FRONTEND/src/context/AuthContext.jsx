// ═══════════════════════════════════════════════════════════
//  FRONTEND/src/context/AuthContext.jsx
//  Fix : silentRefresh lit maintenant les popupNotifications
//  ✅ Popup feedback affiché après 5 minutes d'utilisation
// ═══════════════════════════════════════════════════════════
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

// ── Délai avant affichage du popup feedback après login ──────
const FEEDBACK_POPUP_DELAY = 5 * 60 * 1000; // 5 minutes (en ms)

const AuthContext = createContext(null);

const authAxios = axios.create({ baseURL: 'http://localhost:5000/api', withCredentials: true });

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [authError,   setAuthError]   = useState('');

  const [popupNotifications, setPopupNotifications] = useState([]);
  const [showPopup,          setShowPopup]          = useState(false);

  const refreshPromiseRef = useRef(null);
  const feedbackTimerRef  = useRef(null); // ← timer pour le délai du popup

  useEffect(() => {
    silentRefresh();
  }, []);

  const silentRefresh = async () => {
    try {
      const { data } = await authAxios.post('/auth/refresh-token');
      if (data.status === 'success') {
        setAccessToken(data.accessToken);
        setUser(data.user);
        if (data.popupNotifications && data.popupNotifications.length > 0) {
          setPopupNotifications(data.popupNotifications);
          setShowPopup(true);
        }
      }
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Popup feedback affiché après 5 min (pas immédiatement)
  const login = useCallback(async (email, motDePasse) => {
    setAuthError('');
    try {
      const { data } = await authAxios.post('/auth/login', {
        email,
        mot_de_passe: motDePasse,
      });

      if (data.status === 'success') {
        setAccessToken(data.accessToken);
        setUser(data.user);

        if (data.popupNotifications && data.popupNotifications.length > 0) {
          setPopupNotifications(data.popupNotifications);
          if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
          feedbackTimerRef.current = setTimeout(() => {
            setShowPopup(true);
          }, FEEDBACK_POPUP_DELAY);
        }

        return { success: true, role: data.user.role };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur de connexion';
      const code    = err.response?.data?.code    || '';
      setAuthError(message);
      return { success: false, message, code };
    }
  }, []);

  const register = useCallback(async (formData) => {
    setAuthError('');
    try {
      const { data } = await authAxios.post('/auth/register', formData);
      if (data.status === 'success') {
        return { success: true, message: data.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || "Erreur lors de l'inscription";
      setAuthError(message);
      return { success: false, message };
    }
  }, []);

  // ✅ Annule le timer si l'utilisateur se déconnecte avant 5 min
  const logout = useCallback(async () => {
    try {
      await authAxios.post('/auth/logout');
    } catch {}
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    setUser(null);
    setAccessToken(null);
    setAuthError('');
    setPopupNotifications([]);
    setShowPopup(false);
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    refreshPromiseRef.current = (async () => {
      try {
        const { data } = await authAxios.post('/auth/refresh-token');
        if (data.status === 'success') {
          setAccessToken(data.accessToken);
          setUser(data.user);
          if (data.popupNotifications && data.popupNotifications.length > 0) {
            setPopupNotifications(data.popupNotifications);
            setShowPopup(true);
          }
          return data.accessToken;
        }
        throw new Error('Refresh échoué');
      } catch {
        setUser(null);
        setAccessToken(null);
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, []);

  const updateUser = useCallback((newUser) => setUser(newUser), []);

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
    popupNotifications,
    showPopup,
    clearPopup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
};
