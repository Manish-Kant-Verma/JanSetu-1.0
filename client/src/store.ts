import { create } from 'zustand';
import { api, setToken, getToken } from './api';
import type { User } from './types';

interface AuthState {
  user: User | null;
  ready: boolean;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: any) => Promise<User>;
  logout: () => void;
}

export const homeFor = (role?: string) =>
  role === 'admin' ? '/admin' : role === 'government' ? '/gov' : role === 'jsmember' ? '/jsmember' : role === 'contractor' ? '/contractor' : '/citizen';

export const useAuth = create<AuthState>((set) => ({
  user: null,
  ready: false,
  bootstrap: async () => {
    if (!getToken()) { set({ ready: true }); return; }
    try {
      const { user } = await api.get('/auth/me');
      set({ user, ready: true });
    } catch {
      setToken(null);
      set({ user: null, ready: true });
    }
  },
  login: async (email, password) => {
    const { token, user } = await api.post('/auth/login', { email, password });
    setToken(token);
    set({ user });
    return user;
  },
  register: async (payload) => {
    const { token, user } = await api.post('/auth/register', payload);
    setToken(token);
    set({ user });
    return user;
  },
  logout: () => {
    setToken(null);
    set({ user: null });
  },
}));
