const TOKEN_KEY = 'focus_token';
const LAST_EMAIL_KEY = 'focus_last_email';
const THEME_KEY = 'focus_theme';

export type Theme = 'light' | 'dark';

export function getStoredTheme(): Theme | null {
  const value = localStorage.getItem(THEME_KEY);
  return value === 'light' || value === 'dark' ? value : null;
}

export function setStoredTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme);
}

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
