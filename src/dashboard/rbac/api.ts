import { ROLES_URL } from "../auth/endpoints";
import { getAccessToken } from "../auth/session";
import {
  PermissionRequestError,
  fetchPermissionsList,
  permissionGroup,
} from "../permissions/api";
import { isPreviewAccessToken } from "../users/usersService";
import type {
  CreateRolePayload,
  CreateRoleResult,
  RoleFieldErrors,
  RoleFormValues,
  RolePermission,
  RoleRecord,
  RolesListQuery,
  RolesListResponse,
  UpdateRolePayload,
} from "./types";

export { isPreviewAccessToken };

export class RoleRequestError extends Error {
  status: number;
  fields?: RoleFieldErrors;
  code?: "NOT_FOUND" | "NAME_CONFLICT" | "UNAUTHORIZED" | "VALIDATION" | "NETWORK";

  constructor(
    message: string,
    status: number,
    fields?: RoleFieldErrors,
    code?: RoleRequestError["code"]
  ) {
    super(message);
    this.name = "RoleRequestError";
    this.status = status;
    this.fields = fields;
    this.code = code;
  }
}

export const ROLE_NAME_TAKEN_MESSAGE = "Role name is already taken";
export const ROLE_NAME_EXISTS_MESSAGE = "Role name already exists";
export const ROLE_NAME_CONFLICT_MESSAGE = "Role name conflict";
export const ROLE_NOT_FOUND_MESSAGE = "This role could not be found or has been removed.";
export const CREATE_ROLE_SUCCESS_MESSAGE = "Role created successfully.";
export const UPDATE_ROLE_SUCCESS_MESSAGE = "Role updated successfully.";
export const ROLES_INVALIDATE_EVENT = "yosti:roles-invalidate";

export function invalidateRolesCache() {
  window.dispatchEvent(new CustomEvent(ROLES_INVALIDATE_EVENT));
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
  if (Array.isArray(message)) {
    const text = message.filter((item) => typeof item === "string").join(", ");
    if (text) {
      return text;
    }
  }
  return fallback;
}

const FIELD_KEYS: Array<keyof RoleFieldErrors> = ["name", "description", "permissionIds"];

function parseFieldErrors(raw: unknown): RoleFieldErrors {
  const record = asRecord(raw);
  const fields: RoleFieldErrors = {};
  const nested = asRecord(record?.fields) ?? asRecord(record?.errors) ?? asRecord(record?.message);

  if (nested) {
    for (const key of Object.keys(nested)) {
      const mapped = key === "permission_ids" ? "permissionIds" : key;
      if (FIELD_KEYS.includes(mapped as keyof RoleFieldErrors)) {
        const value = pickString(nested[key]);
        if (value) {
          fields[mapped as keyof RoleFieldErrors] = value;
        }
      }
    }
  }

  return fields;
}

export function asRoleId(value: unknown): number | undefined {
  const id = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return undefined;
  }
  return id;
}

export function roleDetailUrl(id: number) {
  return `${ROLES_URL}/${id}`;
}

export function snippet(details: string, length = 160) {
  const text = details.replace(/\s+/g, " ").trim();
  if (text.length <= length) {
    return text;
  }
  return `${text.slice(0, length).trim()}…`;
}

export const FALLBACK_PERMISSIONS: RolePermission[] = [
  { id: 1, name: "users.read", description: "View user accounts", group: "Users" },
  { id: 2, name: "users.write", description: "Create and update user accounts", group: "Users" },
  { id: 3, name: "roles.read", description: "View roles and assigned permissions", group: "Roles" },
  { id: 4, name: "roles.write", description: "Create and update roles", group: "Roles" },
  { id: 5, name: "requests.read", description: "View sourcing requests", group: "Sourcing" },
  { id: 6, name: "requests.write", description: "Create and update sourcing requests", group: "Sourcing" },
  { id: 7, name: "shipments.read", description: "View shipments", group: "Logistics" },
  { id: 8, name: "shipments.write", description: "Create and update shipments", group: "Logistics" },
  { id: 9, name: "inspections.read", description: "View quality inspections", group: "Quality" },
  { id: 10, name: "inspections.write", description: "Create and update inspections", group: "Quality" },
  { id: 11, name: "trips.read", description: "View visa / trip records", group: "Trips" },
  { id: 12, name: "trips.write", description: "Create and update trips", group: "Trips" },
  { id: 13, name: "payments.read", description: "View payments", group: "Payments" },
  { id: 14, name: "payments.write", description: "Create and update payments", group: "Payments" },
  { id: 15, name: "supports.read", description: "View support tickets", group: "Support" },
  { id: 16, name: "supports.write", description: "Create and update support tickets", group: "Support" },
  { id: 17, name: "services.read", description: "View catalog services", group: "Catalog" },
  { id: 18, name: "services.write", description: "Create and update services", group: "Catalog" },
  { id: 19, name: "blogs.read", description: "View blog posts", group: "Content" },
  { id: 20, name: "blogs.write", description: "Create and update blog posts", group: "Content" },
  { id: 21, name: "projects.read", description: "View projects", group: "Content" },
  { id: 22, name: "projects.write", description: "Create and update projects", group: "Content" },
  { id: 23, name: "contacts.read", description: "View contact inbox", group: "Contacts" },
  { id: 24, name: "contacts.write", description: "Update contact records", group: "Contacts" },
  { id: 25, name: "files.read", description: "View uploaded files", group: "Files" },
  { id: 26, name: "files.write", description: "Upload and delete files", group: "Files" },
];

function inferGroup(name: string, explicit = "") {
  if (explicit) {
    return explicit;
  }
  const root = name.split(/[.:/_-]/)[0] || "General";
  return root.charAt(0).toUpperCase() + root.slice(1);
}

export function normalizePermission(raw: unknown): RolePermission | null {
  if (typeof raw === "number" && Number.isInteger(raw) && raw > 0) {
    return {
      id: raw,
      name: `Permission #${raw}`,
      description: "",
      group: "Assigned",
    };
  }

  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const id = pickNumber(record.id, record.permissionId, record.permission_id);
  if (id === undefined) {
    return null;
  }

  const name = pickString(record.name, record.key, record.slug, record.code, `Permission #${id}`);
  return {
    id,
    name,
    description: pickString(record.description, record.details, record.label),
    group: inferGroup(name, pickString(record.group, record.module, record.resource, record.category)),
  };
}

function collectPermissionIds(record: Record<string, unknown>, permissions: RolePermission[]) {
  const fromArray = (value: unknown) => {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .map((item) => {
        if (typeof item === "number") {
          return item;
        }
        return pickNumber(asRecord(item)?.id, asRecord(item)?.permissionId);
      })
      .filter((item): item is number => item !== undefined && Number.isInteger(item) && item > 0);
  };

  const ids = [
    ...fromArray(record.permissionIds),
    ...fromArray(record.permission_ids),
    ...fromArray(record.permissions),
    ...permissions.map((item) => item.id),
  ];

  return [...new Set(ids)];
}

export function normalizeRole(raw: unknown): RoleRecord | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const id = pickNumber(record.id, record.roleId, record.role_id);
  if (id === undefined) {
    return null;
  }

  const embedded = Array.isArray(record.permissions)
    ? record.permissions
        .map((item) => normalizePermission(item))
        .filter((item): item is RolePermission => Boolean(item))
    : [];

  return {
    id,
    name: pickString(record.name, record.title, record.role),
    description: pickString(record.description, record.details, record.summary),
    permissionIds: collectPermissionIds(record, embedded),
    permissions: embedded,
  };
}

function roleFromResponse(raw: unknown): RoleRecord | null {
  return (
    normalizeRole(raw) ??
    normalizeRole(asRecord(raw)?.data) ??
    normalizeRole(asRecord(raw)?.role)
  );
}

export function validateRoleForm(values: RoleFormValues): RoleFieldErrors {
  const errors: RoleFieldErrors = {};
  if (!values.name.trim()) {
    errors.name = "Role name is required.";
  }
  if (!values.description.trim()) {
    errors.description = "Description is required.";
  }
  return errors;
}

export function formValuesToPayload(values: RoleFormValues): CreateRolePayload {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    permissionIds: [...new Set(values.permissionIds)].sort((a, b) => a - b),
  };
}

export function roleToFormValues(role: RoleRecord): RoleFormValues {
  return {
    name: role.name,
    description: role.description,
    permissionIds: [...role.permissionIds],
  };
}

export function mergePermissionCatalog(
  catalog: RolePermission[],
  extras: RolePermission[] = [],
  selectedIds: number[] = []
) {
  const byId = new Map<number, RolePermission>();
  for (const permission of [...catalog, ...extras]) {
    if (!byId.has(permission.id)) {
      byId.set(permission.id, permission);
    }
  }
  for (const id of selectedIds) {
    if (!byId.has(id)) {
      byId.set(id, {
        id,
        name: `Permission #${id}`,
        description: "Assigned on this role",
        group: "Assigned",
      });
    }
  }
  return [...byId.values()].sort((a, b) => a.group.localeCompare(b.group) || a.id - b.id);
}

function requireToken() {
  const token = getAccessToken();
  if (!token) {
    throw new RoleRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  return token;
}

function authHeaders(required: boolean): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (required) {
    throw new RoleRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  return headers;
}

export function buildRolesQueryString(query: RolesListQuery) {
  const params = new URLSearchParams();
  params.set("page", String(query.page || 1));
  params.set("pageSize", String(query.pageSize || 10));
  params.set("limit", String(query.pageSize || 10));

  if (query.search.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.name.trim()) {
    params.set("name", query.name.trim());
  }

  return params.toString();
}

function normalizeRolesResponse(raw: unknown, query: RolesListQuery): RolesListResponse {
  const record = asRecord(raw);
  const nested = asRecord(record?.data);
  const meta = asRecord(record?.meta) ?? asRecord(nested?.meta);
  const rows = Array.isArray(record?.data)
    ? record.data
    : Array.isArray(nested?.data)
      ? nested.data
      : Array.isArray(record?.roles)
        ? record.roles
        : [];

  const data = rows
    .map((row) => normalizeRole(row))
    .filter((row): row is RoleRecord => Boolean(row));

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

async function parseJson(response: Response) {
  return response.json().catch(() => null);
}

export async function fetchRolesList(query: RolesListQuery): Promise<RolesListResponse> {
  let response: Response;
  try {
    response = await fetch(`${ROLES_URL}?${buildRolesQueryString(query)}`, {
      method: "GET",
      headers: authHeaders(true),
    });
  } catch {
    throw new RoleRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await parseJson(response);

  if (response.status === 400) {
    throw new RoleRequestError(readApiMessage(raw, "Invalid role filters."), 400, undefined, "VALIDATION");
  }
  if (response.status === 401) {
    throw new RoleRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  if (response.status >= 500) {
    throw new RoleRequestError(
      readApiMessage(raw, "The server could not load roles."),
      response.status
    );
  }
  if (!response.ok) {
    throw new RoleRequestError(
      readApiMessage(raw, `Unable to load roles. Server returned ${response.status}.`),
      response.status
    );
  }

  return normalizeRolesResponse(raw, query);
}

export async function fetchRole(id: number): Promise<RoleRecord> {
  if (asRoleId(id) === undefined) {
    throw new RoleRequestError(ROLE_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }

  let response: Response;
  try {
    response = await fetch(roleDetailUrl(id), {
      method: "GET",
      headers: authHeaders(true),
    });
  } catch {
    throw new RoleRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await parseJson(response);

  if (response.status === 401) {
    throw new RoleRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  if (response.status === 404) {
    throw new RoleRequestError(ROLE_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }
  if (!response.ok) {
    throw new RoleRequestError(
      readApiMessage(raw, "The server could not load this role."),
      response.status
    );
  }

  const role = roleFromResponse(raw);
  if (!role) {
    throw new RoleRequestError("The server returned an incomplete role.", 500);
  }
  return role;
}

export async function fetchPermissionsCatalog(): Promise<{
  permissions: RolePermission[];
  source: "api" | "fallback";
}> {
  try {
    const payload = await fetchPermissionsList({ page: 1, pageSize: 200, search: "" });
    const permissions = payload.data.map((item) => ({
      ...item,
      group: permissionGroup(item.name),
    }));
    return {
      permissions: permissions.length > 0 ? permissions : FALLBACK_PERMISSIONS,
      source: permissions.length > 0 ? "api" : "fallback",
    };
  } catch (cause) {
    if (cause instanceof PermissionRequestError && cause.status === 401) {
      throw new RoleRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
    }
    if (cause instanceof PermissionRequestError && cause.status === 404) {
      return { permissions: FALLBACK_PERMISSIONS, source: "fallback" };
    }
    throw new RoleRequestError(
      cause instanceof Error ? cause.message : "The server could not load permissions.",
      cause instanceof PermissionRequestError ? cause.status : 500
    );
  }
}

export async function createRole(payload: CreateRolePayload): Promise<CreateRoleResult> {
  const token = requireToken();

  let response: Response;
  try {
    response = await fetch(ROLES_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new RoleRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await parseJson(response);

  if (response.status === 400) {
    throw new RoleRequestError(
      readApiMessage(raw, "Unable to create this role. Check the highlighted fields."),
      400,
      parseFieldErrors(raw),
      "VALIDATION"
    );
  }
  if (response.status === 401) {
    throw new RoleRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  if (response.status === 409) {
    throw new RoleRequestError(ROLE_NAME_EXISTS_MESSAGE, 409, {
      name: ROLE_NAME_TAKEN_MESSAGE,
    }, "NAME_CONFLICT");
  }
  if (response.status !== 200 && response.status !== 201) {
    throw new RoleRequestError(
      readApiMessage(raw, "Server error occurred. Could not create this role."),
      response.status
    );
  }

  const created = roleFromResponse(raw);
  if (!created) {
    throw new RoleRequestError("The server returned an incomplete role.", 500);
  }

  invalidateRolesCache();
  return {
    record: created,
    message: readApiMessage(raw, CREATE_ROLE_SUCCESS_MESSAGE),
  };
}

export async function patchRole(id: number, payload: UpdateRolePayload): Promise<RoleRecord> {
  const token = requireToken();
  if (asRoleId(id) === undefined) {
    throw new RoleRequestError(ROLE_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }

  let response: Response;
  try {
    response = await fetch(roleDetailUrl(id), {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new RoleRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await parseJson(response);

  if (response.status === 400) {
    throw new RoleRequestError(
      readApiMessage(raw, "Unable to save this role. Check the highlighted fields."),
      400,
      parseFieldErrors(raw),
      "VALIDATION"
    );
  }
  if (response.status === 401) {
    throw new RoleRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  if (response.status === 404) {
    throw new RoleRequestError(ROLE_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }
  if (response.status === 409) {
    throw new RoleRequestError(ROLE_NAME_CONFLICT_MESSAGE, 409, {
      name: ROLE_NAME_TAKEN_MESSAGE,
    }, "NAME_CONFLICT");
  }
  if (!response.ok) {
    throw new RoleRequestError(
      readApiMessage(raw, "Server error occurred. Could not update this role."),
      response.status
    );
  }

  const updated = roleFromResponse(raw);
  if (!updated) {
    throw new RoleRequestError("The server returned an incomplete role.", 500);
  }

  invalidateRolesCache();
  return updated;
}
