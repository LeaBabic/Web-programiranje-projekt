import { create } from 'zustand';
import { api, TOKEN_KEY } from '../lib/api';
import type { AdminUser } from '../types';

interface AuthState {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  restore: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (email, password) => {
    const res = await api<{ token: string; user: AdminUser }>('/api/auth/admin/login', {
      method: 'POST',
      auth: false,
      body: { email, password },
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
      const res = await api<{ user: AdminUser }>('/api/auth/me');
      // Token običnog korisnika ne smije otvoriti admin panel.
      if (res.user.role !== 'admin') throw new Error('nije admin');
      set({ user: res.user, loading: false });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, loading: false });
    }
  },
}));
