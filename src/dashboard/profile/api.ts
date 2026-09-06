import { USERS_ME_URL, USERS_URL } from "../auth/endpoints";
import { normalizeAuthUser } from "../auth/loginService";
import {
  getAccessToken,
  getStoredAuthUser,
  isPreviewAccessToken,
  mergeAuthUser,
  persistAuthUser,
} from "../auth/session";
import { sanitizeApiMessage } from "../apiMessage";
import type { AuthUser } from "../types/auth";
import type {
  ProfileFieldErrors,
  ProfileFormValues,
  ProfileUpdatePayload,
} from "./types";

export class ProfileRequestError extends Error {
  status: number;
  fields?: ProfileFieldErrors;

  constructor(message: string, status: number, fields?: ProfileFieldErrors) {
    super(message);
    this.name = "ProfileRequestError";
    this.status = status;
    this.fields = fields;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function readApiMessage(data: unknown, fallback: string) {
  const record = asRecord(data);
  const message = record?.message;
  if (typeof message === "string" && message.trim()) {
    return sanitizeApiMessage(message, fallback);
  }
  if (Array.isArray(message)) {
    return sanitizeApiMessage(
      message.filter((item) => typeof item === "string").join(", "),
      fallback
    );
  }
  return fallback;
}

function readFieldErrors(data: unknown): ProfileFieldErrors | undefined {
  const record = asRecord(data);
  const raw = asRecord(record?.errors) ?? asRecord(record?.fields);
  if (!raw) {
    return undefined;
  }

  const fields: ProfileFieldErrors = {};
  for (const key of ["fullname", "companyName", "country", "phoneWhatsapp"] as const) {
    const value = raw[key];
    if (typeof value === "string" && value.trim()) {
      fields[key] = value.trim();
    } else if (Array.isArray(value) && typeof value[0] === "string") {
      fields[key] = value[0];
    }
  }
  return Object.keys(fields).length > 0 ? fields : undefined;
}

function unwrapUser(raw: unknown): AuthUser | null {
  const record = asRecord(raw);
  const nested = asRecord(record?.data);
  return (
    normalizeAuthUser(record?.user) ??
    normalizeAuthUser(nested?.user) ??
    normalizeAuthUser(record) ??
    normalizeAuthUser(nested)
  );
}

async function authorizedJson(
  url: string,
  init: RequestInit
): Promise<{ status: number; data: unknown }> {
  const token = getAccessToken();
  if (!token) {
    throw new ProfileRequestError("Unauthorized", 401);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ProfileRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const data: unknown = await response.json().catch(() => null);
  return { status: response.status, data };
}

export function validateProfileForm(values: ProfileFormValues): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};
  if (!values.fullname.trim()) {
    errors.fullname = "Full name is required.";
  } else if (values.fullname.trim().length < 2) {
    errors.fullname = "Full name must be at least 2 characters.";
  }
  if (!values.country.trim()) {
    errors.country = "Country is required.";
  }
  if (!values.phoneWhatsapp.trim()) {
    errors.phoneWhatsapp = "Phone / WhatsApp number is required.";
  } else if (values.phoneWhatsapp.trim().length < 7) {
    errors.phoneWhatsapp = "Enter a valid phone number.";
  }
  return errors;
}

export function profileFormFromUser(user: AuthUser | null): ProfileFormValues {
  return {
    fullname: user?.fullname ?? "",
    companyName: user?.companyName ?? "",
    country: user?.country ?? "",
    phoneWhatsapp: user?.phoneWhatsapp ?? "",
  };
}

export async function fetchCurrentProfile(): Promise<AuthUser | null> {
  const stored = getStoredAuthUser();
  const { status, data } = await authorizedJson(USERS_ME_URL, { method: "GET" });

  if (status === 200 || status === 201) {
    return unwrapUser(data);
  }

  if (status === 404 && stored?.id) {
    const fallback = await authorizedJson(`${USERS_URL}/${stored.id}`, {
      method: "GET",
    });
    if (fallback.status === 200 || fallback.status === 201) {
      return unwrapUser(fallback.data);
    }
    if (fallback.status === 401) {
      throw new ProfileRequestError("Unauthorized", 401);
    }
    return stored;
  }

  if (status === 401) {
    throw new ProfileRequestError("Unauthorized", 401);
  }

  return stored;
}

export async function refreshStoredAuthProfile(): Promise<AuthUser | null> {
  const stored = getStoredAuthUser();
  if (!stored) {
    return null;
  }

  try {
    const remote = await fetchCurrentProfile();
    if (!remote) {
      return stored;
    }
    const next = mergeAuthUser(stored, remote);
    persistAuthUser(next);
    return next;
  } catch (cause) {
    if (
      cause instanceof ProfileRequestError &&
      cause.status === 401 &&
      isPreviewAccessToken()
    ) {
      return stored;
    }
    return stored;
  }
}

export async function updateCurrentProfile(
  payload: ProfileUpdatePayload
): Promise<AuthUser> {
  const stored = getStoredAuthUser();
  if (!stored) {
    throw new ProfileRequestError("Unauthorized", 401);
  }

  const body = JSON.stringify(payload);
  const primary = await authorizedJson(USERS_ME_URL, {
    method: "PATCH",
    body,
  });

  let status = primary.status;
  let data = primary.data;

  if (status === 404) {
    const fallback = await authorizedJson(`${USERS_URL}/${stored.id}`, {
      method: "PATCH",
      body,
    });
    status = fallback.status;
    data = fallback.data;
  }

  if (status === 200 || status === 201) {
    const remote = unwrapUser(data);
    const next = mergeAuthUser(stored, {
      ...payload,
      ...remote,
    });
    persistAuthUser(next);
    return next;
  }

  if (status === 400) {
    throw new ProfileRequestError(
      readApiMessage(data, "Please correct the highlighted fields."),
      400,
      readFieldErrors(data)
    );
  }

  if (status === 401) {
    throw new ProfileRequestError("Unauthorized", 401);
  }

  if (status === 403) {
    throw new ProfileRequestError(
      "Access Denied: You do not have the required permissions to update this profile.",
      403
    );
  }

  throw new ProfileRequestError(
    readApiMessage(data, "Unable to update your profile. Please try again."),
    status
  );
}

export function saveProfileLocally(values: ProfileFormValues): AuthUser {
  const stored = getStoredAuthUser();
  if (!stored) {
    throw new ProfileRequestError("Unauthorized", 401);
  }

  const next = mergeAuthUser(stored, values);
  persistAuthUser(next);
  return next;
}
