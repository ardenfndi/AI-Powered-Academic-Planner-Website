import { create } from "zustand";
import * as api from "../api/auth";
import { usePreferences } from "../store/usePreferences";
import { t } from "../i18n";
import type { AuthUser } from "../store/useUser";

type AuthState = {
  user: AuthUser | null | undefined;
  loading: boolean;
  loadMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    school?: string,
    department?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  user: undefined,
  loading: true,

  async loadMe() {
    set({ loading: true });
    try {
      const u = await api.getCurrentUser();
      set({ user: u ?? null, loading: false });
    } catch (err) {
      console.error("Failed to load current user", err);
      set({ user: null, loading: false });
    }
  },

  async login(email, password) {
    set({ loading: true });
    const res = await api.login(email, password);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Login failed" }));
      set({ loading: false, user: null });
      const language = usePreferences.getState().language;
      throw new Error(err.error || t(language, "auth.errors.loginFailed"));
    }
    const data = await res.json().catch(() => ({}));
    set({ user: data.user ?? null, loading: false });
  },

  async register(name, email, password, school, department) {
    set({ loading: true });
    const res = await api.register(name, email, password, school, department);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Register failed" }));
      set({ loading: false, user: null });
      const language = usePreferences.getState().language;
      throw new Error(err.error || t(language, "auth.errors.registerFailed"));
    }
    const data = await res.json().catch(() => ({}));
    set({ user: data.user ?? null, loading: false });
  },

  async logout() {
    try {
      await api.logout();
    } finally {
      set({ user: null, loading: false });
    }
  },
}));
