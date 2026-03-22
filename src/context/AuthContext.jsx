import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  // FIX 1: Listen event auth:logout dari axios interceptor
  // Sebelumnya event dikirim tapi tidak ada yang listen → UI stuck, tidak redirect
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [logout]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await authService.login(username, password);

      // FIX 2: Backend return { status, data: { token, username, name, role } }
      // Sebelumnya: res.data?.user → selalu undefined karena key-nya bukan "user"
      const jwt      = res.data?.token    || res.token;
      const userData = res.data           // { token, username, name, role }
        ? { username: res.data.username, name: res.data.name, role: res.data.role }
        : { username };

      if (jwt) {
        localStorage.setItem('token', jwt);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(jwt);
        setUser(userData);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
