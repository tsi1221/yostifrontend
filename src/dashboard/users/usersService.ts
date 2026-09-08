import { USERS_URL } from "../auth/endpoints";
import { backendRoleNameFromId } from "../auth/backendRoles";
import { getAccessToken } from "../auth/session";
import { sanitizeApiMessage } from "../apiMessage";
import {
  buildListQueryVariants,
  fetchAuthorizedList,
  readJsonMessage,
} from "../http";
import { extractListRows, pickEntityId } from "../listResponse";
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

export function buildUsersQueryString(query: UsersListQuery) {
  return buildListQueryVariants(
    query.page,
    query.pageSize,
    usersQueryExtras(query),
  )[0];
}

function usersQueryExtras(query: UsersListQuery) {
  const extras: Record<string, string | number | undefined> = {
    search: query.search.trim() || undefined,
    fullname: query.fullname.trim() || undefined,
    email: query.email.trim() || undefined,
    phoneWhatsapp: query.phoneWhatsapp.trim() || undefined,
    companyName: query.companyName.trim() || undefined,
  };

  if (query.roleId !== "") {
    extras.roleId = query.roleId;
    extras.role_id = query.roleId;
    extras.role = backendRoleNameFromId(query.roleId);
  }

  return extras;
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

  const id = pickEntityId(record.id, record.userId, record.user_id, record._id);
  const email = pickString(record.email, record.userEmail, record.mail);
  if (id === undefined) {
    return null;
  }

  const roleId = pickNumber(
    record.roleId,
    record.role_id,
    typeof record.role === "number" ? record.role : undefined,
  );
  return {
    id,
    fullname:
      pickString(
        record.fullname,
        record.full_name,
        record.fullName,
        record.name,
      ) || "Unnamed user",
    email,
    companyName: pickString(record.companyName, record.company_name),
    country: pickString(record.country),
    phoneWhatsapp: pickString(
      record.phoneWhatsapp,
      record.phone_whatsapp,
      record.phone,
    ),
    language_preference:
      pickString(
        record.language_preference,
        record.languagePreference,
        record.language,
      ) || "en",
    role: normalizeRole(record.role, roleId ?? 0),
  };
}

function normalizeUsersResponse(
  raw: unknown,
  query: UsersListQuery,
): UsersListResponse {
  const record = asRecord(raw);
  const nested = asRecord(record?.data);
  const rows = extractListRows(raw);

  const data = rows
    .map((row) => normalizeUser(row))
    .filter((row): row is ManagedUser => Boolean(row));

  const metaRecord = asRecord(record?.meta) ?? nested;
  const total =
    pickNumber(metaRecord?.total, record?.total, nested?.total) ?? data.length;
  const page = pickNumber(metaRecord?.page, record?.page) ?? query.page;
  const pageSize =
    pickNumber(metaRecord?.pageSize, metaRecord?.page_size, record?.pageSize) ??
    query.pageSize;
  const totalPages =
    pickNumber(
      metaRecord?.totalPages,
      metaRecord?.total_pages,
      record?.totalPages,
    ) ?? Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));

  return {
    data,
    meta: { total, page, pageSize, totalPages },
  };
}

export async function fetchUsersList(
  query: UsersListQuery,
): Promise<UsersListResponse> {
  if (!getAccessToken()) {
    throw new UsersRequestError("Unauthorized", 401);
  }

  const result = await fetchAuthorizedList(
    USERS_URL,
    buildListQueryVariants(query.page, query.pageSize, usersQueryExtras(query)),
  );

  if (result.status === 401) {
    throw new UsersRequestError("Unauthorized", 401);
  }
  if (!result.ok) {
    throw new UsersRequestError(
      sanitizeApiMessage(
        readJsonMessage(result.data, ""),
        "We couldn't load this information. Please try again.",
      ),
      result.status,
    );
  }

  return normalizeUsersResponse(result.data, query);
}
