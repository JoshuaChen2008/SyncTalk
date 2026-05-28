import { apiClient } from '../../../lib/api-client';

export type AuthUser = {
  id: string;
  username: string;
  email: string;
};

type AuthResponse = {
  user: AuthUser;
};

export type LoginInput = {
  identifier: string;
  password: string;
};

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
};

export async function getCurrentUser() {
  const response = await apiClient.get<AuthResponse>('/auth/me');
  return response.data.user;
}

export async function login(input: LoginInput) {
  const response = await apiClient.post<AuthResponse>('/auth/login', input);
  return response.data.user;
}

export async function register(input: RegisterInput) {
  const response = await apiClient.post<AuthResponse>('/auth/register', input);
  return response.data.user;
}

export async function logout() {
  await apiClient.post('/auth/logout');
}

export function getApiErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'error' in error.response.data &&
    typeof error.response.data.error === 'string'
  ) {
    return error.response.data.error;
  }

  return 'Something went wrong. Please try again.';
}
