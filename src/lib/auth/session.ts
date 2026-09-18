import type { AuthUser } from "@/types/auth";

const tokenKey = "folia.auth.token";
const refreshTokenKey = "folia.auth.refreshToken";
const userKey = "folia.auth.user";

let cachedRawUser: string | null = null;
let cachedUser: AuthUser | null = null;

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(tokenKey);
}

export function getRefreshToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(refreshTokenKey);
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = window.localStorage.getItem(userKey);
  if (!storedUser) {
    cachedRawUser = null;
    cachedUser = null;
    return null;
  }

  if (storedUser === cachedRawUser) {
    return cachedUser;
  }

  try {
    cachedUser = JSON.parse(storedUser) as AuthUser;
    cachedRawUser = storedUser;
    return cachedUser;
  } catch {
    clearSession();
    return null;
  }
}

export function setSession(token: string, refreshToken: string, user: AuthUser) {
  window.localStorage.setItem(tokenKey, token);
  window.localStorage.setItem(refreshTokenKey, refreshToken);
  window.localStorage.setItem(userKey, JSON.stringify(user));
  window.dispatchEvent(new Event("folia-auth-change"));
}

export function updateTokens(token: string, refreshToken: string) {
  window.localStorage.setItem(tokenKey, token);
  window.localStorage.setItem(refreshTokenKey, refreshToken);
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(tokenKey);
  window.localStorage.removeItem(refreshTokenKey);
  window.localStorage.removeItem(userKey);
  window.dispatchEvent(new Event("folia-auth-change"));
}
