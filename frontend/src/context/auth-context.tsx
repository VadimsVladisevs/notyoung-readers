import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CurrentUser } from '../types';
import * as api from '../services/api';

interface AuthContextType {
  user: CurrentUser | null;
  /** The user may write (start/finish books): role ADMIN. */
  isAdmin: boolean;
  /** Throws `ApiError` (401 on a wrong username or password). */
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Forget the user after the backend said the session is gone (401 on a write). */
  sessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    api.apiService.me()
      .then(setUser)
      .catch((err) => console.error('Error checking login:', err));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setUser(await api.apiService.login(username, password));
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.apiService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const sessionExpired = useCallback(() => setUser(null), []);

  const value: AuthContextType = {
    user,
    isAdmin: user?.roles.includes('ADMIN') ?? false,
    login,
    logout,
    sessionExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
