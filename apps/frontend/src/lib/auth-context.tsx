'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAccessToken, clearTokens, setTokens } from '@/lib/api';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (accessToken: string, refreshToken: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      api.get('/users/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          clearTokens();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    setTokens(accessToken, refreshToken);
    setUser(userData);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
