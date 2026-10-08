import { createContext, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from '@shared/lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!tokenStore.get()) return setReady(true);
    api('/auth/me')
      .then(setUser)
      .catch(() => tokenStore.set(null))
      .finally(() => setReady(true));
  }, []);

  const finish = ({ token, user: u }) => {
    tokenStore.set(token);
    setUser(u);
    return u;
  };

  const value = {
    user,
    ready,
    login: (email, password) => api('/auth/login', { method: 'POST', body: { email, password } }).then(finish),
    register: (form) => api('/auth/register', { method: 'POST', body: form }).then(finish),
    updateProfile: (form) => api('/auth/me', { method: 'PUT', body: form }).then(setUser),
    logout: () => {
      tokenStore.set(null);
      setUser(null);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
