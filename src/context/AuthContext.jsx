import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ FIX

  /* =========================
     INIT AUTH (ON LOAD)
  ========================= */
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser = JSON.parse(localStorage.getItem('user'));

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
      }
    } catch {
      localStorage.clear();
    } finally {
      setLoading(false); // ✅ selesai init
    }
  }, []);

  /* =========================
     LOGOUT
  ========================= */
  const logout = useCallback(() => {
    try {
      authService.logout?.();
    } catch {}

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setToken(null);
    setUser(null);

    navigate('/login', { replace: true });
  }, [navigate]);

  /* =========================
     GLOBAL LOGOUT LISTENER
  ========================= */
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('auth:logout', handler);

    return () => window.removeEventListener('auth:logout', handler);
  }, [logout]);

  /* =========================
     SYNC ANTAR TAB
  ========================= */
  useEffect(() => {
    const syncLogout = (e) => {
      if (e.key === 'token' && !e.newValue) {
        logout();
      }
    };

    window.addEventListener('storage', syncLogout);
    return () => window.removeEventListener('storage', syncLogout);
  }, [logout]);

  /* =========================
     LOGIN
  ========================= */
  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await authService.login(username, password);

      const jwt = res?.data?.token ?? res?.token;
      const userData = res?.data
        ? {
            username: res.data.username,
            name: res.data.name,
            role: res.data.role,
          }
        : { username };

      if (!jwt) throw new Error('Token tidak ditemukan');

      localStorage.setItem('token', jwt);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(jwt);
      setUser(userData);

      return res;
    } catch (err) {
      throw err; // biar bisa ditangkap di UI
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =========================
   HOOK
========================= */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}