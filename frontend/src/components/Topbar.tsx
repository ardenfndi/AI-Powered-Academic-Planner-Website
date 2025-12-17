import { useEffect, useRef } from "react";
import UserMenu from "./UserMenu";
import { useAuth } from "../hooks/useAuth";
import { usePreferences } from "../store/usePreferences";
import { t } from "../i18n";
import type { NavKey } from "./Sidebar";
import "./Topbar.css";

type Props = {
  onNavigate: (page: NavKey) => void;
};

export default function Topbar({ onNavigate }: Props) {
  const user = useAuth((s) => s.user);
  const language = usePreferences((s) => s.language);
  const theme = usePreferences((s) => s.theme);
  const menuOpen = usePreferences((s) => s.menuOpen);
  const toggleTheme = usePreferences((s) => s.toggleTheme);
  const toggleLanguage = usePreferences((s) => s.toggleLanguage);
  const openMenu = usePreferences((s) => s.openMenu);
  const closeMenu = usePreferences((s) => s.closeMenu);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const avatarLabel = user?.name ? user.name[0]?.toUpperCase() : "U";

  useEffect(() => {
    if (!menuOpen) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (wrapperRef.current && target && !wrapperRef.current.contains(target)) {
        closeMenu();
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen, closeMenu]);

  return (
    <header className="topbar2">
      <div className="topbar-left">
        <div className="topbar-title">{t(language, "page.plannerTitle")}</div>
        <div className="topbar-subtitle">
          Build and generate your weekly schedule with AI
        </div>
      </div>

      <div className="topbar-right" ref={wrapperRef}>
        <div className="topbar-actions">
          <button
            type="button"
            aria-label="Toggle theme"
            className={`topbar-action-btn${theme === "dark" ? " is-active" : ""}`}
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2M12 19v2M5.64 5.64l1.41 1.41M16.95 16.95l1.41 1.41M3 12h2M19 12h2M5.64 18.36l1.41-1.41M16.95 7.05l1.41-1.41M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
                />
              </svg>
            )}
          </button>

          <button
            type="button"
            aria-label="Switch language"
            className="topbar-action-btn"
            onClick={toggleLanguage}
          >
            <div className="topbar-lang-stack">
              <span>EN</span>
              <span className="topbar-lang-divider" />
              <span>TR</span>
            </div>
          </button>

          <div className="topbar-avatar-wrap">
            <button
              type="button"
              aria-label="Open settings"
              className="topbar-action-btn"
              onClick={() => (menuOpen ? closeMenu() : openMenu())}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M11.05 2.5a1 1 0 0 1 1.9 0l.36 1.3a7.1 7.1 0 0 1 1.7.73l1.25-.5a1 1 0 0 1 1.23.46l.95 1.65a1 1 0 0 1-.23 1.24l-1.04.84a6.96 6.96 0 0 1 .05 1.76l1.05.84a1 1 0 0 1 .23 1.24l-.95 1.65a1 1 0 0 1-1.23.46l-1.25-.5a7.1 7.1 0 0 1-1.7.73l-.36 1.3a1 1 0 0 1-1.9 0l-.36-1.3a7.1 7.1 0 0 1-1.7-.73l-1.25.5a1 1 0 0 1-1.23-.46l-.95-1.65a1 1 0 0 1 .23-1.24l1.04-.84a6.96 6.96 0 0 1-.05-1.76l-1.05-.84a1 1 0 0 1-.23-1.24l.95-1.65a1 1 0 0 1 1.23-.46l1.25.5a7.1 7.1 0 0 1 1.7-.73l.36-1.3Zm.95 6a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"
                />
              </svg>
            </button>
            {menuOpen && <UserMenu onNavigate={onNavigate} />}
          </div>
        </div>
      </div>
    </header>
  );
}
