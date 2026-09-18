export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthPayload = {
  token: string;
  refreshToken: string;
  user: AuthUser;
};

export type ApiResponse<T> = {
  data: T;
  message: string;
};
