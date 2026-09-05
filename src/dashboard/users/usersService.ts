import { USERS_URL } from "../auth/endpoints";
import { getAccessToken } from "../auth/session";
import type {
  ManagedUser,
  ManagedUserRole,
  UsersListQuery,
  UsersListResponse,
} from "./types";

export class UsersRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "UsersRequestError";
    this.status = status;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
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

export function isPreviewAccessToken(token: string | null) {
  return Boolean(token && token.split(".").at(-1) === "preview");
}

export function buildUsersQueryString(query: UsersListQuery) {
  const params = new URLSearchParams();
  params.set("page", String(query.page || 1));
  params.set("pageSize", String(query.pageSize || 10));

  const textFilters = [
    "search",
    "fullname",
    "email",
    "phoneWhatsapp",
    "companyName",
  ] as const;

  for (const key of textFilters) {
    const value = query[key].trim();
    if (value) {
      params.set(key, value);
    }
  }

  if (query.roleId !== "") {
    params.set("roleId", String(query.roleId));
  }

  return params.toString();
}

function normalizeRole(raw: unknown, fallbackId = 0): ManagedUserRole {
  const record = asRecord(raw);
  if (record) {
    return {
      id: pickNumber(record.id, record.roleId, record.role_id) ?? fallbackId,
      name: pickString(record.name, record.role, record.roleName) || "Unknown",
      description: pickString(record.description),
    };
  }

  if (typeof raw === "string" && raw.trim()) {
    return { id: fallbackId, name: raw.trim(), description: "" };
  }

  return { id: fallbackId, name: "Unknown", description: "" };
}

function normalizeUser(raw: unknown): ManagedUser | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const id = pickNumber(record.id, record.userId, record.user_id);
  const email = pickString(record.email);
  if (id === undefined || !email) {
    return null;
  }

  const roleId = pickNumber(record.roleId, record.role_id);
  return {
    id,
    fullname: pickString(record.fullname, record.full_name, record.fullName, record.name) || "Unnamed user",
    email,
    companyName: pickString(record.companyName, record.company_name),
    country: pickString(record.country),
    phoneWhatsapp: pickString(record.phoneWhatsapp, record.phone_whatsapp, record.phone),
    language_preference: pickString(
      record.language_preference,
      record.languagePreference,
      record.language
    ) || "en",
    role: normalizeRole(record.role, roleId ?? 0),
  };
}

function normalizeUsersResponse(raw: unknown, query: UsersListQuery): UsersListResponse {
  const record = asRecord(raw);
  const nested = asRecord(record?.data);
  const rows = Array.isArray(record?.data)
    ? record.data
    : Array.isArray(nested?.data)
      ? nested.data
      : Array.isArray(nested?.users)
        ? nested.users
        : Array.isArray(record?.users)
          ? record.users
          : [];

  const data = rows
    .map((row) => normalizeUser(row))
    .filter((row): row is ManagedUser => Boolean(row));

  const metaRecord = asRecord(record?.meta) ?? nested;
  const total = pickNumber(metaRecord?.total, record?.total, nested?.total) ?? data.length;
  const page = pickNumber(metaRecord?.page, record?.page) ?? query.page;
  const pageSize = pickNumber(metaRecord?.pageSize, metaRecord?.page_size, record?.pageSize) ?? query.pageSize;
  const totalPages =
    pickNumber(metaRecord?.totalPages, metaRecord?.total_pages, record?.totalPages) ??
    Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));

  return {
    data,
    meta: { total, page, pageSize, totalPages },
  };
}

export async function fetchUsersList(query: UsersListQuery): Promise<UsersListResponse> {
  const token = getAccessToken();
  if (!token) {
    throw new UsersRequestError("Unauthorized", 401);
  }

  let response: Response;
  try {
    response = await fetch(`${USERS_URL}?${buildUsersQueryString(query)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new UsersRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new UsersRequestError("Unauthorized", 401);
  }
  if (response.status === 403) {
    throw new UsersRequestError(
      "Access Denied: You do not have the required permissions to view this resource.",
      403
    );
  }
  if (!response.ok) {
    throw new UsersRequestError(
      `Unable to load users. Server returned ${response.status}.`,
      response.status
    );
  }

  return normalizeUsersResponse(raw, query);
}
