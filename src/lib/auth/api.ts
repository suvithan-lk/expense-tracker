import { apiClient } from "@/lib/api/client";
import type { ApiResponse, AuthPayload } from "@/types/auth";

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export function login(input: LoginInput) {
  return apiClient.post<ApiResponse<AuthPayload>>("/api/auth/login", input);
}

export function register(input: RegisterInput) {
  return apiClient.post<ApiResponse<AuthPayload>>("/api/auth/register", input);
}

export function refresh(refreshToken: string) {
  return apiClient.post<ApiResponse<AuthPayload>>("/api/auth/refresh", { refreshToken });
}

export function logout(refreshToken: string) {
  return apiClient.post<void>("/api/auth/logout", { refreshToken });
}
