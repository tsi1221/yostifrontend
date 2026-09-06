import type { AuthLoginRequest, AuthLoginResponse, AuthUser } from "../types/auth";
import { AUTH_LOGIN_URL } from "./endpoints";
import { loginWithPreviewAccount } from "./previewUsers";

export { AUTH_LOGIN_URL };

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
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
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
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

export function normalizeAuthUser(raw: unknown): AuthUser | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const roleRecord = asRecord(record.role);
  const rawId = record.id ?? record.userId ?? record.user_id ?? record._id;
  const id = pickNumber(rawId) ?? (pickString(rawId) ? 0 : undefined);
  const fullname = pickString(
    record.fullname,
    record.full_name,
    record.fullName,
    record.name
  );
  const email = pickString(record.email);
  const roleId = pickNumber(
    record.roleId,
    record.role_id,
    record.roleID,
    roleRecord?.id,
    roleRecord?.roleId,
    roleRecord?.role_id
  );
  const role = pickString(
    typeof record.role === "string" ? record.role : undefined,
    record.roleName,
    record.role_name,
    roleRecord?.name,
    roleRecord?.roleName,
    roleRecord?.title
  );

  if (id === undefined || !fullname || !email) {
    return null;
  }
  if (roleId === undefined && !role) {
    return null;
  }

  return {
    id,
    fullname,
    email,
    roleId: roleId ?? 0,
    role,
    companyName: pickString(
      record.companyName,
      record.company_name,
      record.company
    ),
    country: pickString(record.country),
    phoneWhatsapp: pickString(
      record.phoneWhatsapp,
      record.phone_whatsapp,
      record.phone,
      record.whatsapp
    ),
    languagePreference: pickString(
      record.languagePreference,
      record.language_preference,
      record.language
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
    nested?.access_token,
    nested?.accessToken,
    nested?.token
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
  credentials: AuthLoginRequest
): Promise<AuthLoginResponse> {
  const email = credentials.email.trim().toLowerCase();
  const password = credentials.password;

  try {
    const response = await fetch(AUTH_LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data: unknown = await response.json().catch(() => null);

    if (response.status === 200 || response.status === 201) {
      const payload = normalizeLoginPayload(data);
      if (payload) {
        return payload;
      }
    }

    const preview = loginWithPreviewAccount(email, password);
    if (preview) {
      return preview;
    }

    throw new Error(
      readApiMessage(data) ||
        (response.status === 401
          ? "Invalid email or password."
          : "Unable to sign in. Please try again.")
    );
  } catch (error) {
    if (error instanceof Error && error.message !== "Failed to fetch") {
      const preview = loginWithPreviewAccount(email, password);
      if (preview) {
        return preview;
      }
      throw error;
    }
  }

  const preview = loginWithPreviewAccount(email, password);
  if (preview) {
    return preview;
  }

  throw new Error("Invalid email or password.");
}
