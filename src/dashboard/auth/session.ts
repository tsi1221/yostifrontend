import type { AuthLoginResponse, AuthUser } from "../types/auth";
import { roleFromAuthUser } from "./roleRouting";

export const ACCESS_TOKEN_KEY = "access_token";
export const AUTH_USER_KEY = "user";
export const AUTH_PROFILE_UPDATED_EVENT = "yosti:auth-profile-updated";
export const GRANT_SESSION_KEY = "yosti:role-permissions-granted";

const PENDING_REGISTER_PROFILE_KEY = "yosti_pending_register_profile";
const LEGACY_KEYS = ["token", "role", "email"] as const;
const TOKEN_KEYS = ["access_token", "accessToken", "token"] as const;

export interface PendingRegisterProfile {
  email: string;
  fullname: string;
  companyName: string;
  country: string;
  phoneWhatsapp: string;
}

function readStoredToken(storage: Storage) {
  for (const key of TOKEN_KEYS) {
    const value = storage.getItem(key);
    if (value && value.trim()) {
      return value.replace(/^Bearer\s+/i, "").trim();
    }
  }
  return null;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return readStoredToken(localStorage) ?? readStoredToken(sessionStorage);
}

export function isPreviewAccessToken(token: string | null = getAccessToken()) {
  return Boolean(token && token.split(".").at(-1) === "preview");
}

export function hasValidAccessToken(): boolean {
  const token = getAccessToken();
  return Boolean(token && token.split(".").length === 3);
}

export function mergeAuthUser(
  base: AuthUser,
  patch?: Partial<AuthUser> | null
): AuthUser {
  if (!patch) {
    return base;
  }

  return {
    ...base,
    id: Number.isFinite(patch.id) ? Number(patch.id) : base.id,
    fullname: patch.fullname?.trim() || base.fullname,
    email: patch.email?.trim() || base.email,
    roleId: Number.isFinite(patch.roleId) ? Number(patch.roleId) : base.roleId,
    role: patch.role?.trim() || base.role,
    companyName: patch.companyName?.trim() || base.companyName,
    country: patch.country?.trim() || base.country,
    phoneWhatsapp: patch.phoneWhatsapp?.trim() || base.phoneWhatsapp,
    languagePreference: patch.languagePreference?.trim() || base.languagePreference,
  };
}

export function getStoredAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser> & {
      name?: unknown;
      userId?: unknown;
      _id?: unknown;
      role_id?: unknown;
    };
    const id = Number(parsed.id ?? parsed.userId ?? parsed._id);
    const roleId = Number(parsed.roleId ?? parsed.role_id ?? 0);
    const fullname =
      typeof parsed.fullname === "string" && parsed.fullname.trim()
        ? parsed.fullname
        : typeof parsed.name === "string"
          ? parsed.name
          : "";
    const email = typeof parsed.email === "string" ? parsed.email : "";
    if (!Number.isFinite(id) || !email) {
      return null;
    }
    return {
      id,
      fullname: fullname || email,
      email,
      roleId: Number.isFinite(roleId) ? roleId : 0,
      role: typeof parsed.role === "string" ? parsed.role : undefined,
      companyName:
        typeof parsed.companyName === "string" ? parsed.companyName : undefined,
      country: typeof parsed.country === "string" ? parsed.country : undefined,
      phoneWhatsapp:
        typeof parsed.phoneWhatsapp === "string"
          ? parsed.phoneWhatsapp
          : undefined,
      languagePreference:
        typeof parsed.languagePreference === "string"
          ? parsed.languagePreference
          : undefined,
    };
  } catch {
    return null;
  }
}

export function persistPendingRegisterProfile(profile: PendingRegisterProfile) {
  localStorage.setItem(
    PENDING_REGISTER_PROFILE_KEY,
    JSON.stringify({
      email: profile.email.trim().toLowerCase(),
      fullname: profile.fullname.trim(),
      companyName: profile.companyName.trim(),
      country: profile.country.trim(),
      phoneWhatsapp: profile.phoneWhatsapp.trim(),
    })
  );
}

export function consumePendingRegisterProfile(
  email: string
): PendingRegisterProfile | null {
  const raw = localStorage.getItem(PENDING_REGISTER_PROFILE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PendingRegisterProfile>;
    if (
      typeof parsed.email !== "string" ||
      parsed.email.trim().toLowerCase() !== email.trim().toLowerCase()
    ) {
      return null;
    }
    localStorage.removeItem(PENDING_REGISTER_PROFILE_KEY);
    return {
      email: parsed.email.trim().toLowerCase(),
      fullname: typeof parsed.fullname === "string" ? parsed.fullname : "",
      companyName:
        typeof parsed.companyName === "string" ? parsed.companyName : "",
      country: typeof parsed.country === "string" ? parsed.country : "",
      phoneWhatsapp:
        typeof parsed.phoneWhatsapp === "string" ? parsed.phoneWhatsapp : "",
    };
  } catch {
    localStorage.removeItem(PENDING_REGISTER_PROFILE_KEY);
    return null;
  }
}

export function notifyAuthProfileUpdated() {
  window.dispatchEvent(new Event(AUTH_PROFILE_UPDATED_EVENT));
}

export function persistAuthUser(user: AuthUser, notify = true) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem("email", user.email);
  localStorage.setItem("role", roleFromAuthUser(user));
  if (notify) {
    notifyAuthProfileUpdated();
  }
}

export function persistAuthSession(payload: AuthLoginResponse) {
  const pending = consumePendingRegisterProfile(payload.user.email);
  const user = mergeAuthUser(payload.user, pending);

  localStorage.setItem(ACCESS_TOKEN_KEY, payload.access_token);
  localStorage.setItem("accessToken", payload.access_token);
  localStorage.setItem("token", payload.access_token);
  persistAuthUser(user, false);
  localStorage.setItem("email", user.email);
  localStorage.setItem("role", roleFromAuthUser(user));

  for (const key of LEGACY_KEYS) {
    sessionStorage.removeItem(key);
  }
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem("accessToken");
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  localStorage.removeItem(PENDING_REGISTER_PROFILE_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("email");
  sessionStorage.removeItem(GRANT_SESSION_KEY);
}
