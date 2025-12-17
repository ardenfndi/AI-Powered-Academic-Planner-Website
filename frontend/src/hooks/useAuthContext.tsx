import React, { createContext, useContext, useEffect, useState } from "react";
import * as api from "../api/auth";
import type { AuthUser } from "../store/useUser";

type AuthContextValue = {
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

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    setLoading(true);
    const u = await api.getCurrentUser();
    setUser(u ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void loadMe();
  }, []);

  async function login(email: string, password: string) {
    const res = await api.login(email, password);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Login failed" }));
      throw new Error(err.error || "Login failed");
    }
    const data = await res.json();
    setUser(data.user ?? null);
  }

  async function register(name: string, email: string, password: string, school?: string, department?: string) {
    const res = await api.register(name, email, password, school, department);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Register failed" }));
      throw new Error(err.error || "Register failed");
    }
    const data = await res.json();
    setUser(data.user ?? null);
  }

  async function logout() {
    const res = await api.logout();
    // ignore errors, but clear client state always
    setUser(null);
    return res;
  }

  return (
    <AuthContext.Provider value={{ user, loading, loadMe, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
