const AUTH_KEY = 'nch_admin_authed';

const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME ?? 'nepalcrickethub.com';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'nepalcrickethub.com';

export function isAdminAuthed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === 'true';
}

export function attemptLogin(username: string, password: string): boolean {
  const ok = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
  if (ok && typeof window !== 'undefined') {
    localStorage.setItem(AUTH_KEY, 'true');
  }
  return ok;
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}
