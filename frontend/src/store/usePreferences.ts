import { create } from "zustand";

type Theme = "dark" | "light";
type Language = "EN" | "TR";

type PrefState = {
  theme: Theme;
  language: Language;
  menuOpen: boolean;
};

type PrefActions = {
  toggleTheme: () => void;
  toggleLanguage: () => void;
  openMenu: () => void;
  closeMenu: () => void;
};

const STORAGE_KEY = "planner-preferences";

const applyTheme = (theme: Theme) => {
  if (typeof document === "undefined") return;
  document.body.classList.remove("theme-light", "theme-dark");
  document.body.classList.add(theme === "light" ? "theme-light" : "theme-dark");
};

const loadPrefs = (): PrefState => {
  const fallback: PrefState = { theme: "dark", language: "EN", menuOpen: false };
  if (typeof window === "undefined") return fallback;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PrefState>;
    const hydrated: PrefState = {
      theme: parsed.theme === "light" ? "light" : "dark",
      language: parsed.language === "TR" ? "TR" : "EN",
      menuOpen: false,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hydrated));
    return hydrated;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
};

export const usePreferences = create<PrefState & PrefActions>((set, get) => {
  const initial = loadPrefs();
  applyTheme(initial.theme);

  const persist = (prefs: PrefState) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  };

  return {
    ...initial,
    toggleTheme: () => {
      const current = get().theme;
      const next: Theme = current === "dark" ? "light" : "dark";
      applyTheme(next);
      const prefs = { ...get(), theme: next, menuOpen: false };
      set({ theme: next, menuOpen: false });
      persist(prefs);
    },
    toggleLanguage: () => {
      const next: Language = get().language === "EN" ? "TR" : "EN";
      const prefs = { ...get(), language: next, menuOpen: false };
      set({ language: next, menuOpen: false });
      persist(prefs);
    },
    openMenu: () => set({ menuOpen: true }),
    closeMenu: () => set({ menuOpen: false }),
  };
});
