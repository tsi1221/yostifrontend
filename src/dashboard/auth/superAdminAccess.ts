import { message } from "antd";

import { ROLES_URL } from "./endpoints";
import {
  PermissionRequestError,
  fetchPermissionsList,
} from "../permissions/api";
import {
  RoleRequestError,
  fetchRole,
  fetchRolesList,
} from "../rbac/api";
import type { RoleRecord } from "../rbac/types";
import { isPermissionDeniedMessage } from "../apiMessage";
import { roleFromAuthUser, roleFromRoleName } from "./roleRouting";
import { getAccessToken, getStoredAuthUser, isPreviewAccessToken } from "./session";

export const SUPER_ADMIN_ROLE_ID = 5;

export class SuperAdminAccessError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "SuperAdminAccessError";
    this.status = status;
  }
}

export function isSuperAdminSession() {
  const user = getStoredAuthUser();
  return Boolean(user && roleFromAuthUser(user) === "SUPER_ADMIN");
}

export function isSuperAdminRoleRecord(role: Pick<RoleRecord, "id" | "name">) {
  return superAdminRoleScore(role) > 0;
}

function superAdminRoleScore(role: Pick<RoleRecord, "id" | "name">) {
  const key = role.name.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (role.id === SUPER_ADMIN_ROLE_ID) {
    return 4;
  }
  if (key === "super_admin" || key === "superadmin") {
    return 3;
  }
  if (key === "system_admin") {
    return 2;
  }
  if (key === "admin" || roleFromRoleName(role.name) === "SUPER_ADMIN") {
    return 1;
  }
  return 0;
}

function isYostiApi(input: RequestInfo | URL) {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  return /\/api\//.test(url) && !/\/api\/auth\//.test(url);
}

function withQuietForbiddenMessage(response: Response) {
  return new Response(JSON.stringify({ message: "" }), {
    status: 403,
    statusText: response.statusText,
    headers: { "Content-Type": "application/json" },
  });
}

let nativeFetch: typeof fetch | null = null;
let grantDepth = 0;
let fetchPatched = false;
let toastsPatched = false;

function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  return (nativeFetch ?? window.fetch.bind(window))(input, init);
}

function patchFetch() {
  if (fetchPatched || typeof window === "undefined") {
    return;
  }
  fetchPatched = true;
  nativeFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await apiFetch(input, init);
    if (grantDepth > 0 || response.status !== 403) {
      return response;
    }
    if (!isSuperAdminSession() || !isYostiApi(input)) {
      return response;
    }
    if (isPreviewAccessToken(getAccessToken())) {
      return withQuietForbiddenMessage(response);
    }

    const recovered = await recoverSuperAdminAccess();
    if (recovered) {
      const retry = await apiFetch(input, init);
      return retry.status === 403 ? withQuietForbiddenMessage(retry) : retry;
    }
    return withQuietForbiddenMessage(response);
  };
}

function patchPermissionToasts() {
  if (toastsPatched) {
    return;
  }
  toastsPatched = true;

  const original = message.error.bind(message);
  message.error = ((content: unknown, ...args: unknown[]) => {
    const text =
      typeof content === "string"
        ? content
        : content instanceof Error
          ? content.message
          : "";
    if (isSuperAdminSession() && isPermissionDeniedMessage(text)) {
      void recoverSuperAdminAccess();
      return;
    }
    return original(content as Parameters<typeof original>[0], ...(args as []));
  }) as typeof message.error;
}

export function installSuperAdminAccessFixes() {
  patchFetch();
  patchPermissionToasts();
}

async function fetchAllPermissions() {
  const byId = new Map<number, string>();
  let page = 1;
  let totalPages = 1;

  do {
    try {
      const payload = await fetchPermissionsList({
        page,
        pageSize: page === 1 ? 1000 : 200,
        search: "",
      });
      for (const permission of payload.data) {
        byId.set(permission.id, permission.name);
      }
      totalPages = Math.max(1, payload.meta.totalPages);
      page += 1;
    } catch (cause) {
      if (cause instanceof PermissionRequestError) {
        throw new SuperAdminAccessError(
          cause.status === 403
            ? "Super Admin cannot load permissions."
            : cause.message,
          cause.status
        );
      }
      throw cause;
    }
  } while (page <= totalPages && page <= 20);

  if (byId.size === 0) {
    throw new SuperAdminAccessError(
      "No permissions were returned by the server, so Super Admin access could not be granted.",
      404
    );
  }

  return [...byId.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([id, name]) => ({ id, name }));
}

async function findSuperAdminRole(): Promise<RoleRecord> {
  try {
    return await fetchRole(SUPER_ADMIN_ROLE_ID);
  } catch (cause) {
    if (cause instanceof RoleRequestError && cause.status === 401) {
      throw new SuperAdminAccessError(cause.message, 401);
    }
  }

  let page = 1;
  let totalPages = 1;
  let best: RoleRecord | null = null;
  let bestScore = 0;

  try {
    do {
      const payload = await fetchRolesList({
        page,
        pageSize: 50,
        search: "",
        name: "",
      });
      for (const role of payload.data) {
        const score = superAdminRoleScore(role);
        if (score > bestScore) {
          best = role;
          bestScore = score;
        }
      }
      totalPages = Math.max(1, payload.meta.totalPages);
      page += 1;
    } while (page <= totalPages && page <= 20 && bestScore < 4);
  } catch (cause) {
    if (cause instanceof RoleRequestError) {
      throw new SuperAdminAccessError(
        cause.status === 403 ? "Super Admin cannot load roles." : cause.message,
        cause.status
      );
    }
    throw cause;
  }

  if (!best || bestScore === 0) {
    throw new SuperAdminAccessError(
      "Could not find the Super Admin role (usually id 5).",
      404
    );
  }

  if (best.permissionIds.length === 0) {
    try {
      return await fetchRole(best.id);
    } catch {
      return best;
    }
  }

  return best;
}

function authJsonHeaders() {
  const token = getAccessToken();
  if (!token) {
    throw new SuperAdminAccessError("Unauthorized", 401);
  }
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function assignAllPermissions(role: RoleRecord, permissionIds: number[], permissionNames: string[]) {
  const bodies: Record<string, unknown>[] = [
    {
      ...(role.name.trim() ? { name: role.name.trim() } : {}),
      ...(role.description.trim() ? { description: role.description.trim() } : {}),
      permissionIds,
      permission_ids: permissionIds,
      permissions: permissionIds,
    },
    {
      permissionIds,
      permission_ids: permissionIds,
      permissions: permissionNames,
    },
    { permissionIds },
    { permission_ids: permissionIds },
    { permissions: permissionIds },
  ];

  const attempts: Array<{ method: string; url: string }> = [
    { method: "PATCH", url: `${ROLES_URL}/${role.id}` },
    { method: "PUT", url: `${ROLES_URL}/${role.id}` },
    { method: "PATCH", url: `${ROLES_URL}/${role.id}/permissions` },
    { method: "PUT", url: `${ROLES_URL}/${role.id}/permissions` },
    { method: "POST", url: `${ROLES_URL}/${role.id}/permissions` },
  ];

  let lastStatus = 0;
  let lastMessage = "Could not assign Super Admin permissions.";

  for (const attempt of attempts) {
    for (const body of bodies) {
      try {
        const response = await apiFetch(attempt.url, {
          method: attempt.method,
          headers: authJsonHeaders(),
          body: JSON.stringify(body),
        });
        if (response.ok) {
          return;
        }
        lastStatus = response.status;
        const raw: unknown = await response.json().catch(() => null);
        const record = raw && typeof raw === "object" ? (raw as { message?: unknown }) : null;
        if (typeof record?.message === "string" && record.message.trim()) {
          lastMessage = record.message.trim();
        }
        if (response.status === 404 || response.status === 405) {
          break;
        }
      } catch {
        lastStatus = 0;
      }
    }
  }

  throw new SuperAdminAccessError(lastMessage, lastStatus);
}

export async function grantSuperAdminAllPermissions() {
  if (!isSuperAdminSession()) {
    throw new SuperAdminAccessError("Only Super Admin can grant full access.", 403);
  }

  if (isPreviewAccessToken(getAccessToken())) {
    throw new SuperAdminAccessError(
      "Sign in with a live Super Admin account to grant permissions.",
      401
    );
  }

  grantDepth += 1;
  try {
    const [permissions, role] = await Promise.all([
      fetchAllPermissions(),
      findSuperAdminRole(),
    ]);
    const permissionIds = permissions.map((item) => item.id);
    const alreadyHasAll =
      permissionIds.length > 0 &&
      permissionIds.every((id) => role.permissionIds.includes(id));
    if (alreadyHasAll) {
      return {
        roleId: role.id,
        roleName: role.name,
        permissionCount: role.permissionIds.length,
      };
    }

    await assignAllPermissions(
      role,
      permissionIds,
      permissions.map((item) => item.name)
    );

    return {
      roleId: role.id,
      roleName: role.name,
      permissionCount: permissionIds.length,
    };
  } finally {
    grantDepth -= 1;
  }
}

let recoverPromise: Promise<boolean> | null = null;

export async function recoverSuperAdminAccess() {
  if (!isSuperAdminSession() || isPreviewAccessToken(getAccessToken())) {
    return false;
  }

  if (!recoverPromise) {
    recoverPromise = grantSuperAdminAllPermissions()
      .then(() => true)
      .catch(() => {
        recoverPromise = null;
        return false;
      });
  }

  return recoverPromise;
}

if (typeof window !== "undefined") {
  installSuperAdminAccessFixes();
}
