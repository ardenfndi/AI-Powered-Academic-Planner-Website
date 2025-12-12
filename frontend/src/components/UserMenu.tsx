import { useUser } from "../store/useUser";
import { t } from "../i18n";
import type { NavKey } from "./Sidebar";
import "./UserMenu.css";

type Props = {
  onNavigate: (page: NavKey) => void;
};

export default function UserMenu({ onNavigate }: Props) {
  const user = useUser((s) => s.user);
  const closeMenu = useUser((s) => s.closeMenu);
  const toggleTheme = useUser((s) => s.toggleTheme);
  const toggleLanguage = useUser((s) => s.toggleLanguage);
  const logout = useUser((s) => s.logout);

  const initials = user.name ? user.name[0]?.toUpperCase() : "U";

  return (
    <div className="user-menu" onMouseLeave={closeMenu}>
      <div className="user-menu-header">
        <div className="user-menu-avatar">{initials || "U"}</div>
        <div className="user-menu-info">
          <div className="user-menu-name">Merhaba, {user.name}!</div>
          <div className="user-menu-email">{user.email}</div>
        </div>
      </div>

      {/* TODO: Replace localStorage mock with backend auth + /me endpoint */}
      <button
        className="user-menu-primary"
        onClick={() => {
          onNavigate("settings");
          closeMenu();
        }}
      >
        {t(user.language, "menu.settings")}
      </button>

      <div className="user-menu-section">
        <button
          className="user-menu-item"
          onClick={() => {
            onNavigate("profile");
            closeMenu();
          }}
        >
          {t(user.language, "menu.profile")}
        </button>
        <button
          className="user-menu-item"
          onClick={() => {
            onNavigate("saved");
            closeMenu();
          }}
        >
          {t(user.language, "menu.saved")}
        </button>
        <button
          className="user-menu-item"
          onClick={() => {
            onNavigate("settings");
            closeMenu();
          }}
        >
          {t(user.language, "menu.settings")}
        </button>
      </div>

      <div className="user-menu-section">
        <button className="user-menu-row" onClick={toggleTheme}>
          <span>Theme</span>
          <span className="user-menu-toggle">
            {user.theme === "dark" ? "Dark" : "Light"}
          </span>
        </button>
        <button className="user-menu-row" onClick={toggleLanguage}>
          <span>Language</span>
          <span className="user-menu-toggle">
            {user.language === "EN" ? "EN" : "TR"}
          </span>
        </button>
      </div>

      <button
        className="user-menu-logout"
        onClick={() => {
          logout();
          onNavigate("planner");
          closeMenu();
        }}
      >
        {t(user.language, "menu.logout")}
      </button>

      <div className="user-menu-footer">
        <span>Privacy policy</span>
        <span>Terms of use</span>
      </div>
    </div>
  );
}
