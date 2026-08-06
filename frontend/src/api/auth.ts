import { User } from '../types/domain';
import { apiClient } from './client';

export interface AuthResponse {
  user: User;
  token: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function register(
  email: string,
  password: string,
  fullName: string,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', {
    email,
    password,
    fullName,
  });
  return data;
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<{ user: User }>('/auth/me');
  return data.user;
}

export interface AnthropicKeyStatus {
  hasAnthropicKey: boolean;
  anthropicKeyLast4: string | null;
}

export async function setAnthropicKey(apiKey: string): Promise<AnthropicKeyStatus> {
  const { data } = await apiClient.put<AnthropicKeyStatus>('/auth/anthropic-key', { apiKey });
  return data;
}

export async function removeAnthropicKey(): Promise<AnthropicKeyStatus> {
  const { data } = await apiClient.delete<AnthropicKeyStatus>('/auth/anthropic-key');
  return data;
}
