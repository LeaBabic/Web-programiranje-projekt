import { create } from 'zustand';
import { api, TOKEN_KEY } from '../lib/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  /** Dohvaća korisnika iz spremljenog tokena pri pokretanju aplikacije. */
  restore: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (email, password) => {
    const res = await api<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    localStorage.setItem(TOKEN_KEY, res.token);
    set({ user: res.user });
  },

  register: async (name, email, password) => {
    const res = await api<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    localStorage.setItem(TOKEN_KEY, res.token);
    set({ user: res.user });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null });
  },

  restore: async () => {
    if (!localStorage.getItem(TOKEN_KEY)) return set({ loading: false });
    try {
      const res = await api<{ user: User }>('/api/auth/me', { auth: true });
      set({ user: res.user, loading: false });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, loading: false });
    }
  },

  setUser: (user) => set({ user }),
}));
