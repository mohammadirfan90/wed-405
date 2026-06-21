import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const persistToken = useCallback((token) => {
    if (token) localStorage.setItem('cm_token', token);
    else localStorage.removeItem('cm_token');
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
      persistToken(null);
    } finally {
      setLoading(false);
    }
  }, [persistToken]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(async (phone, password) => {
    setError(null);
    const { data } = await api.post('/auth/login', { phone, password });
    persistToken(data.token);
    setUser(data.user);
    return data.user;
  }, [persistToken]);

  const register = useCallback(async (payload) => {
    setError(null);
    const { data } = await api.post('/auth/register', payload);
    persistToken(data.token);
    setUser(data.user);
    return data.user;
  }, [persistToken]);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch {}
    persistToken(null);
    setUser(null);
  }, [persistToken]);

  const value = useMemo(
    () => ({ user, loading, error, setError, login, register, logout, fetchMe, persistToken, setUser }),
    [user, loading, error, login, register, logout, fetchMe, persistToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
