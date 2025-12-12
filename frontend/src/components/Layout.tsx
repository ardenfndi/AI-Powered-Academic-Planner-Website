import type { ReactNode } from "react";
import Sidebar, { type NavKey } from "./Sidebar";
import Topbar from "./Topbar";
import "./Layout.css";

type LayoutProps = {
  children: ReactNode;
  activePage: NavKey;
  onNavigate: (page: NavKey) => void;
};

export default function Layout({
  children,
  activePage,
  onNavigate,
}: LayoutProps) {
  return (
    <div className="layout-root">
      <Sidebar active={activePage} onSelect={onNavigate} />
      <div className="layout-main">
        <Topbar onNavigate={onNavigate} />
        <div className="layout-center">
          <div className="layout-page">{children}</div>
        </div>
      </div>
    </div>
  );
}
