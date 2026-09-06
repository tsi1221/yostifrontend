import { PERMISSIONS_URL } from "../auth/endpoints";
import { getAccessToken } from "../auth/session";
import { isPreviewAccessToken } from "../users/usersService";
import type {
  Permission,
  PermissionOption,
  PermissionsListQuery,
  PermissionsListResponse,
} from "./types";

export { isPreviewAccessToken };

export class PermissionRequestError extends Error {
  status: number;
  code?: "UNAUTHORIZED" | "VALIDATION" | "NETWORK";

  constructor(message: string, status: number, code?: PermissionRequestError["code"]) {
    super(message);
    this.name = "PermissionRequestError";
    this.status = status;
    this.code = code;
  }
}

export const PERMISSIONS_INVALIDATE_EVENT = "yosti:permissions-invalidate";

export function invalidatePermissionsCache() {
  window.dispatchEvent(new CustomEvent(PERMISSIONS_INVALIDATE_EVENT));
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

function readApiMessage(raw: unknown, fallback: string) {
  const record = asRecord(raw);
  const message = record?.message;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }
  return fallback;
}

export function asPermissionId(value: unknown): number | undefined {
  const id = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return undefined;
  }
  return id;
}

export function permissionGroup(name: string) {
  const root = name.split(/[.:/_-]/)[0] || "general";
  return root.charAt(0).toUpperCase() + root.slice(1);
}

export function normalizePermission(raw: unknown): Permission | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const id = pickNumber(record.id, record.permissionId, record.permission_id);
  if (id === undefined) {
    return null;
  }

  return {
    id,
    name: pickString(record.name, record.key, record.slug, record.code, `Permission #${id}`),
    description: pickString(record.description, record.details, record.label),
  };
}

export function toPermissionOptions(permissions: Permission[]): PermissionOption[] {
  return permissions.map((permission) => ({
    value: permission.id,
    label: permission.name,
    description: permission.description,
  }));
}

export function buildPermissionsQueryString(query: PermissionsListQuery) {
  const params = new URLSearchParams();
  params.set("page", String(query.page || 1));
  params.set("pageSize", String(query.pageSize || 10));
  params.set("limit", String(query.pageSize || 10));

  if (query.search.trim()) {
    params.set("search", query.search.trim());
  }

  return params.toString();
}

function normalizePermissionsResponse(
  raw: unknown,
  query: PermissionsListQuery
): PermissionsListResponse {
  const record = asRecord(raw);
  const nested = asRecord(record?.data);
  const meta = asRecord(record?.meta) ?? asRecord(nested?.meta);
  const rows = Array.isArray(record?.data)
    ? record.data
    : Array.isArray(nested?.data)
      ? nested.data
      : Array.isArray(record?.permissions)
        ? record.permissions
        : [];

  const data = rows
    .map((row) => normalizePermission(row))
    .filter((row): row is Permission => Boolean(row));

  const total = pickNumber(meta?.total, record?.total, nested?.total) ?? data.length;
  const page = pickNumber(meta?.page, record?.page, nested?.page) ?? query.page;
  const pageSize =
    pickNumber(meta?.pageSize, record?.pageSize, record?.limit, nested?.pageSize) ??
    query.pageSize;
  const totalPages =
    pickNumber(meta?.totalPages, record?.totalPages, nested?.totalPages) ??
    Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));

  return {
    data,
    meta: { total, page, pageSize, totalPages },
  };
}

function authHeaders(): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAccessToken();
  if (!token) {
    throw new PermissionRequestError("Unauthorized", 401, "UNAUTHORIZED");
  }
  headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function fetchPermissionsList(
  query: PermissionsListQuery
): Promise<PermissionsListResponse> {
  let response: Response;
  try {
    response = await fetch(`${PERMISSIONS_URL}?${buildPermissionsQueryString(query)}`, {
      method: "GET",
      headers: authHeaders(),
    });
  } catch {
    throw new PermissionRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      "NETWORK"
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new PermissionRequestError(
      readApiMessage(raw, "Invalid permission filters."),
      400,
      "VALIDATION"
    );
  }
  if (response.status === 401) {
    throw new PermissionRequestError("Unauthorized", 401, "UNAUTHORIZED");
  }
  if (!response.ok) {
    throw new PermissionRequestError(
      readApiMessage(raw, "The server could not load permissions."),
      response.status
    );
  }

  return normalizePermissionsResponse(raw, query);
}
