const TOKEN_KEY = 'focus_token';
const LAST_EMAIL_KEY = 'focus_last_email';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getLastEmail(): string {
  return localStorage.getItem(LAST_EMAIL_KEY) ?? '';
}

export function setLastEmail(email: string): void {
  localStorage.setItem(LAST_EMAIL_KEY, email);
}
