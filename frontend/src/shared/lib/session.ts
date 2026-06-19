import { deleteCookie, getCookie, setCookie } from "./cookies";

// MVP: токены и роль хранятся в обычных cookie (не httpOnly) — их читает axios
// на клиенте, а RequireRole синхронно проверяет роль при рендере роутов.
// В продакшене стоит вынести в httpOnly-cookie.

export type Role = "manager" | "admin";

const ACCESS = "sfa_access";
const REFRESH = "sfa_refresh";
const ROLE = "sfa_role";
const NAME = "sfa_name";

export interface Session {
  access: string;
  refresh: string;
  role: Role;
  fullName: string;
}

export function saveSession(s: Session): void {
  setCookie(ACCESS, s.access);
  setCookie(REFRESH, s.refresh);
  setCookie(ROLE, s.role);
  setCookie(NAME, s.fullName);
}

export function setAccessToken(token: string): void {
  setCookie(ACCESS, token);
}

export function getAccessToken(): string | null {
  return getCookie(ACCESS);
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH);
}

export function getRole(): Role | null {
  return getCookie(ROLE) as Role | null;
}

export function getFullName(): string | null {
  return getCookie(NAME);
}

export function clearSession(): void {
  deleteCookie(ACCESS);
  deleteCookie(REFRESH);
  deleteCookie(ROLE);
  deleteCookie(NAME);
}

export function homeForRole(role: Role | null): string {
  return role === "admin" ? "/admin" : "/";
}
