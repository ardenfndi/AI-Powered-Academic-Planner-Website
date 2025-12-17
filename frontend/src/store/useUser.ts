import { create } from "zustand";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  school?: string | null;
  department?: string | null;
  createdAt?: string;
};

type PrefState = {
  language: "EN" | "TR";
  theme: "dark" | "light";
  menuOpen: boolean;
};

type PrefActions = {
  toggleTheme: () => void;
  toggleLanguage: () => void;
  openMenu: () => void;
  closeMenu: () => void;
};

const STORAGE_KEY = "planner-prefs";
const DEFAULT_PREFS: Pick<PrefState, "language" | "theme"> = {
  language: "EN",
  theme: "dark",
};

const persistPrefs = (prefs: Pick<PrefState, "language" | "theme">) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
};

const applyTheme = (theme: PrefState["theme"]) => {
  if (typeof document === "undefined") return;
  document.body.classList.remove("theme-light", "theme-dark");
  const cls = theme === "light" ? "theme-light" : "theme-dark";
  document.body.classList.add(cls);
};

const loadPrefs = (): Pick<PrefState, "language" | "theme"> => {
  if (typeof window === "undefined") return DEFAULT_PREFS;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    persistPrefs(DEFAULT_PREFS);
    return DEFAULT_PREFS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PrefState>;
    const hydrated: Pick<PrefState, "language" | "theme"> = {
      language: parsed.language === "TR" ? "TR" : "EN",
      theme: parsed.theme === "light" ? "light" : "dark",
    };
    persistPrefs(hydrated);
    return hydrated;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    persistPrefs(DEFAULT_PREFS);
    return DEFAULT_PREFS;
  }
};

export const useUser = create<PrefState & PrefActions>((set, get) => {
  const prefs = loadPrefs();
  applyTheme(prefs.theme);

  return {
    language: prefs.language,
    theme: prefs.theme,
    menuOpen: false,

    toggleTheme: () => {
      const nextTheme: PrefState["theme"] = get().theme === "dark" ? "light" : "dark";
      set({ theme: nextTheme });
      persistPrefs({ language: get().language, theme: nextTheme });
      applyTheme(nextTheme);
    },

    toggleLanguage: () => {
      const nextLanguage: PrefState["language"] = get().language === "EN" ? "TR" : "EN";
      set({ language: nextLanguage });
      persistPrefs({ language: nextLanguage, theme: get().theme });
    },

    openMenu: () => set({ menuOpen: true }),
    closeMenu: () => set({ menuOpen: false }),
  };
});
