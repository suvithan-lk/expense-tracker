"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { logout } from "@/lib/auth/api";
import { clearSession, getAuthToken, getRefreshToken } from "@/lib/auth/session";

function subscribeToAuthChanges(onChange: () => void) {
  window.addEventListener("folia-auth-change", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("folia-auth-change", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getClientSession() {
  return Boolean(getAuthToken());
}

function getServerSession() {
  return false;
}

function subscribeToHydration() {
  return () => undefined;
}

function getClientHydration() {
  return true;
}

function getServerHydration() {
  return false;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/register";
  const hasSession = useSyncExternalStore(subscribeToAuthChanges, getClientSession, getServerSession);
  const isHydrated = useSyncExternalStore(subscribeToHydration, getClientHydration, getServerHydration);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if ((pathname === "/login" || pathname === "/register") && hasSession) {
      router.replace("/dashboard");
      return;
    }

    if (!isPublicPage && !hasSession) {
      router.replace("/login");
      return;
    }

  }, [hasSession, isHydrated, isPublicPage, pathname, router]);

  if (isPublicPage) {
    return children;
  }

  if (!isHydrated || !hasSession) {
    return <div className="auth-check" aria-label="Checking your session">Checking your session...</div>;
  }

  return (
    <div className="app-shell">
      <div
        className={`sidebar-backdrop ${isSidebarOpen ? "sidebar-backdrop-visible" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />
      <div className={`sidebar-drawer ${isSidebarOpen ? "sidebar-drawer-open" : ""}`}>
        <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
      </div>
      <div className="app-main">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          onLogout={() => {
            const refreshToken = getRefreshToken();
            if (refreshToken) {
              logout(refreshToken).catch(() => undefined);
            }
            clearSession();
            router.replace("/login");
          }}
        />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
