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
  const setLanguage = usePreferences((s) => s.setLanguage);
  const language = usePreferences((s) => s.language);
  const theme = usePreferences((s) => s.theme);

  const initials = (user?.name || user?.email || "U")[0]?.toUpperCase() || "U";
  const displayName = user?.name || t(language, "user.guest");
  const displayEmail = user?.email || t(language, "user.notSignedIn");

  return (
    <div className="user-menu" onMouseLeave={closeMenu}>
      <div className="user-menu-header">
        <div className="user-menu-avatar">{initials || "U"}</div>
        <div className="user-menu-info">
          <div className="user-menu-name">{displayName}</div>
          <div className="user-menu-email">{displayEmail}</div>
        </div>
      </div>

      <div className="user-menu-block">
        <div className="user-menu-label">{t(language, "user.quickLinks")}</div>
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
          {user?.role === "admin" && (
            <button
              className="user-menu-item"
              onClick={() => {
                onNavigate("admin");
                closeMenu();
              }}
            >
              {t(language, "menu.admin")}
            </button>
          )}
        </div>
      </div>

      <div className="user-menu-block">
        <div className="user-menu-label">{t(language, "user.preferences")}</div>
        <div className="user-menu-list">
          <button className="user-menu-row" onClick={toggleTheme}>
            <span>{t(language, "user.theme")}</span>
            <span className="user-menu-toggle">{theme === "dark" ? t(language, "user.dark") : t(language, "user.light")}</span>
          </button>

          <div className="user-menu-row" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ flex: 1 }}>{t(language, "user.language")}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                className={`lang-btn ${language === "EN" ? "is-active" : ""}`}
                onClick={() => setLanguage("EN")}
                aria-pressed={language === "EN"}
              >
                EN
              </button>
              <button
                className={`lang-btn ${language === "TR" ? "is-active" : ""}`}
                onClick={() => setLanguage("TR")}
                aria-pressed={language === "TR"}
              >
                TR
              </button>
            </div>
          </div>
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
        <span>{t(language, "footer.privacy")}</span>
        <span>{t(language, "footer.terms")}</span>
      </div>
    </div>
  );
}
