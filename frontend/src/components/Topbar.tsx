import { useEffect, useRef } from "react";
import UserMenu from "./UserMenu";
import { useUser } from "../store/useUser";
import { t } from "../i18n";
import type { NavKey } from "./Sidebar";
import "./Topbar.css";

type Props = {
  onNavigate: (page: NavKey) => void;
};

export default function Topbar({ onNavigate }: Props) {
  const user = useUser((s) => s.user);
  const menuOpen = useUser((s) => s.menuOpen);
  const toggleTheme = useUser((s) => s.toggleTheme);
  const toggleLanguage = useUser((s) => s.toggleLanguage);
  const openMenu = useUser((s) => s.openMenu);
  const closeMenu = useUser((s) => s.closeMenu);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const avatarLabel = user.name ? user.name[0]?.toUpperCase() : "U";

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
        <div className="topbar-title">{t(user.language, "page.plannerTitle")}</div>
        <div className="topbar-subtitle">
          Build and generate your weekly schedule with AI
        </div>
      </div>

      <div className="topbar-right" ref={wrapperRef}>
        <button
          className="topbar-icon-btn"
          title={`Switch to ${user.theme === "dark" ? "light" : "dark"} mode`}
          onClick={toggleTheme}
        >
          {user.theme === "dark" ? "Dark" : "Light"}
        </button>

        <button
          className="topbar-icon-btn topbar-lang"
          title="Toggle language"
          onClick={toggleLanguage}
        >
          {user.language === "EN" ? "EN > TR" : "TR > EN"}
        </button>

        <div className="topbar-avatar-wrap">
          <button
            className="topbar-avatar"
            aria-label="Open user menu"
            onClick={() => (menuOpen ? closeMenu() : openMenu())}
          >
            <span className="avatar-circle">{avatarLabel || "U"}</span>
          </button>
          {menuOpen && <UserMenu onNavigate={onNavigate} />}
        </div>
      </div>
    </header>
  );
}
