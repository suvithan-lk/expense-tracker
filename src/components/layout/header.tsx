"use client";

import { useSyncExternalStore } from "react";
import { getAuthUser } from "@/lib/auth/session";

function subscribeToAuthChanges(onChange: () => void) {
  window.addEventListener("folia-auth-change", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("folia-auth-change", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getClientUser() {
  return getAuthUser();
}

function getServerUser() {
  return null;
}

export function Header({ onMenuClick, onLogout }: { onMenuClick: () => void; onLogout: () => void }) {
  const user = useSyncExternalStore(subscribeToAuthChanges, getClientUser, getServerUser);
  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "SK";

  return (
    <header className="app-header">
      <button
        className="menu-button"
        type="button"
        aria-label="Open navigation"
        onClick={onMenuClick}
      >
        <span />
        <span />
        <span />
      </button>
      <div className="header-context">
        <p className="header-eyebrow">Thursday, 17 September 2026</p>
        <p className="header-location">Colombo, Sri Lanka</p>
      </div>
      <div className="header-actions">
        <button className="icon-button" type="button" aria-label="Notifications">
          ♧
        </button>
        <button className="user-chip user-chip-button" type="button" onClick={onLogout} title="Log out">
          <span className="avatar">{initials}</span>
          <span className="user-name">{user?.name ?? "Your account"}</span>
          <span className="chevron" aria-hidden="true">⌄</span>
        </button>
      </div>
    </header>
  );
}
