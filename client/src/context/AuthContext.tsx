import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, post, tokenStore } from '../lib/api';
import type { Role, User } from '../lib/types';

interface AuthResponse {
  token: string;
  user: User;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  studentNo?: string;
  employeeNo?: string;
  department?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  setUser: (u: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 새로고침 시 토큰으로 세션 복원
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setLoading(false);
      return;
    }
    api<{ user: User }>('/auth/me')
      .then((r) => setUser(r.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const r = await post<AuthResponse>('/auth/login', { email, password });
    tokenStore.set(r.token);
    setUser(r.user);
    return r.user;
  };

  const register = async (payload: RegisterPayload) => {
    const r = await post<AuthResponse>('/auth/register', payload);
    tokenStore.set(r.token);
    setUser(r.user);
    return r.user;
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setUser }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
