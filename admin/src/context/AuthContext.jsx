import { createContext, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from '@shared/lib/api.js';

const AuthContext = createContext(null);

// Admin-only session: a valid login without the admin role is rejected and not stored.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!tokenStore.get()) return setReady(true);
    api('/auth/me')
      .then((u) => (u.role === 'admin' ? setUser(u) : tokenStore.set(null)))
      .catch(() => tokenStore.set(null))
      .finally(() => setReady(true));
  }, []);

  const login = async (email, password) => {
    const { token, user: u } = await api('/auth/login', { method: 'POST', body: { email, password } });
    if (u.role !== 'admin') throw new Error('This account does not have admin access');
    tokenStore.set(token);
    setUser(u);
    return u;
  };

  const logout = () => {
    tokenStore.set(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, ready, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
