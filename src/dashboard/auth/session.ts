import type { AuthLoginResponse, AuthUser } from "../types/auth";
import { roleFromAuthUser } from "./roleRouting";

export const ACCESS_TOKEN_KEY = "access_token";
export const AUTH_USER_KEY = "user";

const LEGACY_KEYS = ["token", "role", "email"] as const;

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function hasValidAccessToken(): boolean {
  const token = getAccessToken();
  return Boolean(token && token.split(".").length === 3);
}

export function getStoredAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    const id = Number(parsed.id);
    const roleId = Number(parsed.roleId);
    if (
      !Number.isFinite(id) ||
      typeof parsed.fullname !== "string" ||
      typeof parsed.email !== "string" ||
      !Number.isFinite(roleId)
    ) {
      return null;
    }
    return {
      id,
      fullname: parsed.fullname,
      email: parsed.email,
      roleId,
      role: typeof parsed.role === "string" ? parsed.role : undefined,
    };
  } catch {
    return null;
  }
}

export function persistAuthSession(payload: AuthLoginResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, payload.access_token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(payload.user));
  localStorage.setItem("email", payload.user.email);
  localStorage.setItem("role", roleFromAuthUser(payload.user));

  for (const key of LEGACY_KEYS) {
    sessionStorage.removeItem(key);
  }
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("email");
}
