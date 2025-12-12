import { create } from "zustand";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  language: "EN" | "TR";
  theme: "dark" | "light";
};

type UserState = {
  user: User;
  menuOpen: boolean;
};

type UserActions = {
  toggleTheme: () => void;
  toggleLanguage: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  logout: () => void;
};

const STORAGE_KEY = "planner-user";
const DEFAULT_USER: User = {
  id: "u1",
  name: "Demo Student",
  email: "demo.user@example.com",
  role: "user",
  language: "EN",
  theme: "dark",
};

const createMockUser = (): User => ({ ...DEFAULT_USER });

const persistUser = (user: User) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

const applyTheme = (theme: User["theme"]) => {
  if (typeof document === "undefined") return;
  document.body.classList.remove("theme-light", "theme-dark");
  const cls = theme === "light" ? "theme-light" : "theme-dark";
  document.body.classList.add(cls);
};

const loadUser = (): User => {
  const fallback = createMockUser();
  if (typeof window === "undefined") return fallback;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    persistUser(fallback);
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<User>;
    const hydrated: User = {
      ...fallback,
      ...parsed,
      id: parsed.id ?? fallback.id,
      role: parsed.role === "admin" ? "admin" : "user",
      language: parsed.language === "TR" ? "TR" : "EN",
      theme: parsed.theme === "light" ? "light" : "dark",
    };
    persistUser(hydrated);
    return hydrated;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    persistUser(fallback);
    return fallback;
  }
};

export const useUser = create<UserState & UserActions>((set, get) => {
  const initialUser = loadUser();
  applyTheme(initialUser.theme);

  return {
    user: initialUser,
    menuOpen: false,

    // TODO: Replace localStorage mock with backend auth + /me endpoint
    toggleTheme: () => {
      const current = get().user;
      const nextTheme: User["theme"] = current.theme === "dark" ? "light" : "dark";
      const updated: User = { ...current, theme: nextTheme };
      set({ user: updated });
      // TODO: Persist preferences to DB
      persistUser(updated);
      applyTheme(nextTheme);
    },

    toggleLanguage: () => {
      const current = get().user;
      const nextLanguage: User["language"] = current.language === "EN" ? "TR" : "EN";
      const updated: User = { ...current, language: nextLanguage };
      set({ user: updated });
      // TODO: Persist preferences to DB
      persistUser(updated);
    },

    openMenu: () => set({ menuOpen: true }),
    closeMenu: () => set({ menuOpen: false }),

    logout: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
      const resetUser = createMockUser();
      applyTheme(resetUser.theme);
      // TODO: Replace localStorage mock with backend auth + /me endpoint
      set({ user: resetUser, menuOpen: false });
    },
  };
});
