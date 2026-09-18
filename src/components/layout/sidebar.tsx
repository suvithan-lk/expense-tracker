"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems, type NavigationIcon } from "@/config/navigation";

const icons: Record<NavigationIcon, string> = {
  grid: "▦",
  "arrow-up": "↗",
  "arrow-down": "↘",
  target: "◎",
  chart: "⌁",
  settings: "⚙",
};

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <div className="brand-mark">fa</div>
        <div>
          <p className="brand-name">folia</p>
          <p className="brand-caption">personal finance</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        <p className="nav-label">Workspace</p>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              className={`nav-link ${isActive ? "nav-link-active" : ""}`}
              href={item.href}
              key={item.href}
              onClick={onNavigate}
            >
              <span className="nav-icon" aria-hidden="true">
                {icons[item.icon]}
              </span>
              {item.label}
              {isActive && <span className="nav-active-dot" aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="advisor-note">
          <span className="spark-icon" aria-hidden="true">✦</span>
          <div>
            <p className="advisor-note-title">Your clarity corner</p>
            <p className="advisor-note-copy">Small steps make strong habits.</p>
          </div>
        </div>
        <p className="sidebar-version">Folia v0.1 · LKR</p>
      </div>
    </aside>
  );
}
