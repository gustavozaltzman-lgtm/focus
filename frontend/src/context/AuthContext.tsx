import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth';
import { clearToken, getToken, setLastEmail, setToken } from '../lib/storage';
import { User } from '../types/domain';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  loginWithSession: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi
      .getCurrentUser()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login: async (email, password) => {
        const result = await authApi.login(email, password);
        queryClient.clear();
        setToken(result.token);
        setLastEmail(result.user.email);
        setUser(result.user);
      },
      register: async (email, password, fullName) => {
        const result = await authApi.register(email, password, fullName);
        queryClient.clear();
        setToken(result.token);
        setLastEmail(result.user.email);
        setUser(result.user);
      },
      loginWithSession: (nextUser, token) => {
        queryClient.clear();
        setToken(token);
        setLastEmail(nextUser.email);
        setUser(nextUser);
      },
      logout: () => {
        queryClient.clear();
        clearToken();
        setUser(null);
      },
      updateUser: (patch) => {
        setUser((current) => (current ? { ...current, ...patch } : current));
      },
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
