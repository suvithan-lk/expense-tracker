import { clearSession, getAuthToken, getRefreshToken, updateTokens } from "@/lib/auth/session";

export type ApiError = {
  message: string;
  errors?: Record<string, string[]>;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
const authPathsExemptFromRefresh = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh"];

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${apiBaseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        const payload = (await response.json()) as { data: { token: string; refreshToken: string } };
        updateTokens(payload.data.token, payload.data.refreshToken);
        return payload.data.token;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function performFetch(path: string, options: RequestInit | undefined, token: string | null) {
  return fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  let response = await performFetch(path, options, getAuthToken());

  if (response.status === 401 && !authPathsExemptFromRefresh.includes(path)) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      response = await performFetch(path, options, newToken);
    } else {
      clearSession();
    }
  }

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(error?.message ?? "The request could not be completed.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
