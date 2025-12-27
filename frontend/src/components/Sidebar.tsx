import "./Sidebar.css";
import { usePreferences } from "../store/usePreferences";
import { t } from "../i18n";

export type NavKey =
  | "planner"
  | "saved"
  | "admin"
  | "help"
  | "grades"
  | "profile"
  | "settings"
  | "login"
  | "register";

type SidebarProps = {
  active: NavKey;
  onSelect: (key: NavKey) => void;
};

const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
  </svg>
);

const IconFolder = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
  </svg>
);

const IconTools = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.7 19.3l-6.1-6.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.2l3.1 3.1-2.8 2.8-3.1-3.1c-1.2 2.4-.8 5.4 1.2 7.4 1.9 1.9 4.6 2.4 6.9 1.5l6.1 6.1c.4.4 1 .4 1.4 0l2.2-2.2c.4-.4.4-1 0-1.4z" />
  </svg>
);

const IconQuestion = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 17c-.8 0-1.5-.7-1.5-1.5S11.2 16 12 16s1.5.7 1.5 1.5S12.8 19 12 19zm1.3-5.5c-.3.2-.3.5-.3.8V15h-2v-.7c0-.8.4-1.5 1.1-2 .6-.4 1.4-.6 1.4-1.6 0-.9-.7-1.6-1.6-1.6-.8 0-1.4.5-1.6 1.3l-2-.3c.3-1.8 1.9-3 3.6-3 2.1 0 3.8 1.7 3.8 3.8-.1 1.4-.8 2.2-2.4 3.1z" />
  </svg>
);

const IconGrades = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 3h14a2 2 0 0 1 2 2v12.5a1.5 1.5 0 0 1-2.31 1.25L12 15.5l-6.69 3.25A1.5 1.5 0 0 1 3 17.5V5a2 2 0 0 1 2-2zm0 2v11.74l5.69-2.76a1.5 1.5 0 0 1 1.31 0L18.69 16V5H5zm3.5 7.5 1.75-1.75 1.25 1.25L16.5 8l1 1-5 5-2.25-2.25L8.5 13.5z" />
  </svg>
);

export default function Sidebar({ active, onSelect }: SidebarProps) {
  const language = usePreferences((s) => s.language);
  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">
          <img src="/image.png" className="sidebar-logo-img" alt="logo" />
          <div className="logo-text">
            <div>AI Academic</div>
            <div>Planner</div>
          </div>
        </div>

        <nav className="sidebar-links">
          <button
            className={`sidebar-item ${active === "planner" ? "active" : ""}`}
            onClick={() => onSelect("planner")}
          >
            <IconCalendar />
            <span>{t(language, "sidebar.planner")}</span>
          </button>

          <button
            className={`sidebar-item ${active === "saved" ? "active" : ""}`}
            onClick={() => onSelect("saved")}
          >
            <IconFolder />
            <span>{t(language, "sidebar.saved")}</span>
          </button>

          <button
            className={`sidebar-item ${active === "admin" ? "active" : ""}`}
            onClick={() => onSelect("admin")}
          >
            <IconTools />
            <span>{t(language, "sidebar.admin")}</span>
          </button>

          <button
            className={`sidebar-item ${active === "grades" ? "active" : ""}`}
            onClick={() => onSelect("grades")}
          >
            <IconGrades />
            <span>{t(language, "sidebar.grades")}</span>
          </button>

          <button
            className={`sidebar-item ${active === "help" ? "active" : ""}`}
            onClick={() => onSelect("help")}
          >
            <IconQuestion />
            <span>{t(language, "sidebar.help")}</span>
          </button>
        </nav>
      </div>

      <div className="sidebar-footer">{t(language, "badge.version")}</div>
    </aside>
  );
}
