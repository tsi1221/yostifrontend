import api, { readApiError } from "../../lib/api";
import type {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthUser,
} from "../types/auth";

export { AUTH_LOGIN_URL } from "./endpoints";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function pickNumber(...values: unknown[]) {
  for (const value of values) {
    const number = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(number)) {
      return number;
    }
  }
  return undefined;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    return asRecord(JSON.parse(atob(padded)));
  } catch {
    return null;
  }
}

function readApiMessage(data: unknown) {
  const record = asRecord(data);
  const message = record?.message;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }
  if (Array.isArray(message)) {
    return message.filter((item) => typeof item === "string").join(", ");
  }
  return undefined;
}

function pickRoleFromList(value: unknown) {
  if (!Array.isArray(value)) {
    return {
      role: undefined as string | undefined,
      roleId: undefined as number | undefined,
    };
  }

  for (const item of value) {
    if (typeof item === "string" && item.trim()) {
      return { role: item.trim(), roleId: undefined };
    }
    const record = asRecord(item);
    if (!record) {
      continue;
    }
    const role = pickString(
      record.name,
      record.roleName,
      record.role_name,
      record.title,
      record.role,
    );
    const roleId = pickNumber(record.id, record.roleId, record.role_id);
    if (role || roleId !== undefined) {
      return { role, roleId };
    }
  }

  return { role: undefined, roleId: undefined };
}

export function normalizeAuthUser(raw: unknown): AuthUser | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const roleRecord = asRecord(record.role);
  const fromRoles = pickRoleFromList(record.roles);
  const fromAuthorities = pickRoleFromList(record.authorities);
  const rawId =
    record.id ?? record.userId ?? record.user_id ?? record._id ?? record.sub;
  const id = pickNumber(rawId) ?? (pickString(rawId) ? 0 : undefined);
  const fullname = pickString(
    record.fullname,
    record.full_name,
    record.fullName,
    record.name,
    record.username,
  );
  const email = pickString(record.email, record.userEmail, record.mail);
  const roleId = pickNumber(
    record.roleId,
    record.role_id,
    record.roleID,
    typeof record.role === "number" ? record.role : undefined,
    roleRecord?.id,
    roleRecord?.roleId,
    roleRecord?.role_id,
    fromRoles.roleId,
    fromAuthorities.roleId,
  );
  const role = pickString(
    typeof record.role === "string" ? record.role : undefined,
    record.roleName,
    record.role_name,
    roleRecord?.name,
    roleRecord?.roleName,
    roleRecord?.title,
    fromRoles.role,
    fromAuthorities.role,
  );

  if (id === undefined || !email) {
    return null;
  }
  if (!fullname && !email) {
    return null;
  }
  if (roleId === undefined && !role) {
    return null;
  }

  return {
    id,
    fullname: fullname || email,
    email,
    roleId: roleId ?? 0,
    role,
    companyName: pickString(
      record.companyName,
      record.company_name,
      record.company,
    ),
    country: pickString(record.country),
    phoneWhatsapp: pickString(
      record.phoneWhatsapp,
      record.phone_whatsapp,
      record.phone,
      record.whatsapp,
    ),
    languagePreference: pickString(
      record.languagePreference,
      record.language_preference,
      record.language,
    ),
  };
}

function normalizeLoginPayload(raw: unknown): AuthLoginResponse | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const nested = asRecord(record.data);
  const token = pickString(
    record.access_token,
    record.accessToken,
    record.token,
    typeof record.data === "string" ? record.data : undefined,
    nested?.access_token,
    nested?.accessToken,
    nested?.token,
  );
  const jwt = token ? decodeJwtPayload(token) : null;
  const user =
    normalizeAuthUser(record.user) ??
    normalizeAuthUser(nested?.user) ??
    normalizeAuthUser(record) ??
    normalizeAuthUser(nested) ??
    normalizeAuthUser(jwt) ??
    normalizeAuthUser(jwt?.user);

  if (!token || !user) {
    return null;
  }

  return { access_token: token, user };
}

export async function loginWithPassword(
  credentials: AuthLoginRequest,
): Promise<AuthLoginResponse> {
  const email = credentials.email.trim().toLowerCase();
  const password = credentials.password;

  try {
    const response = await api.post(
      "/auth/login",
      { email, password },
      { validateStatus: () => true },
    );
    const data: unknown = response.data;

    if (response.status === 200 || response.status === 201) {
      const payload = normalizeLoginPayload(data);
      if (payload) {
        return payload;
      }
      throw new Error("We couldn't complete sign-in. Please try again.");
    }

    throw new Error(
      readApiMessage(data) ||
        (response.status === 401
          ? "Invalid email or password."
          : "Unable to sign in. Please try again."),
    );
  } catch (error) {
    if (error instanceof Error && !/status code/i.test(error.message)) {
      throw error;
    }
    throw new Error(
      readApiError(error, "Unable to sign in. Please try again."),
    );
  }
}
