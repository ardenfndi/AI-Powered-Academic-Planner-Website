import { useAuth } from "../hooks/useAuth";
import { usePreferences } from "../store/usePreferences";
import { t } from "../i18n";
import type { NavKey } from "./Sidebar";
import "./UserMenu.css";

type Props = {
  onNavigate: (page: NavKey) => void;
};

export default function UserMenu({ onNavigate }: Props) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const closeMenu = usePreferences((s) => s.closeMenu);
  const toggleTheme = usePreferences((s) => s.toggleTheme);
  const toggleLanguage = usePreferences((s) => s.toggleLanguage);
  const language = usePreferences((s) => s.language);
  const theme = usePreferences((s) => s.theme);

  const initials = user?.name ? user.name[0]?.toUpperCase() : "U";

  return (
    <div className="user-menu" onMouseLeave={closeMenu}>
      <div className="user-menu-header">
        <div className="user-menu-avatar">{initials || "U"}</div>
        <div className="user-menu-info">
          <div className="user-menu-name">{user.name}</div>
          <div className="user-menu-email">{user.email}</div>
        </div>
      </div>

      <div className="user-menu-block">
        <div className="user-menu-label">Quick links</div>
        <div className="user-menu-list">
          <button
            className="user-menu-item"
            onClick={() => {
              onNavigate("profile");
              closeMenu();
            }}
          >
            {t(language, "menu.profile")}
          </button>
          <button
            className="user-menu-item"
            onClick={() => {
              onNavigate("settings");
              closeMenu();
            }}
          >
            {t(language, "menu.settings")}
          </button>
        </div>
      </div>

      <div className="user-menu-block">
        <div className="user-menu-label">Preferences</div>
        <div className="user-menu-list">
          <button className="user-menu-row" onClick={toggleTheme}>
            <span>Theme</span>
            <span className="user-menu-toggle">
              {theme === "dark" ? "Dark" : "Light"}
            </span>
          </button>
          <button className="user-menu-row" onClick={toggleLanguage}>
            <span>Language</span>
            <span className="user-menu-toggle">{language === "EN" ? "EN" : "TR"}</span>
          </button>
        </div>
      </div>

      <button
        className="user-menu-logout"
        onClick={async () => {
          await logout();
          onNavigate("login");
          closeMenu();
        }}
      >
        {t(language, "menu.logout")}
      </button>

      <div className="user-menu-footer">
        <span>Privacy policy</span>
        <span>Terms of use</span>
      </div>
    </div>
  );
}
