import {
  PermissionRequestError,
  fetchPermissionsList,
} from "../permissions/api";
import {
  RoleRequestError,
  fetchRole,
  fetchRolesList,
  patchRole,
} from "../rbac/api";
import type { RoleRecord } from "../rbac/types";
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

async function fetchAllPermissionIds() {
  const ids = new Set<number>();
  let page = 1;
  let totalPages = 1;

  do {
    try {
      const payload = await fetchPermissionsList({
        page,
        pageSize: 200,
        search: "",
      });
      for (const permission of payload.data) {
        ids.add(permission.id);
      }
      totalPages = Math.max(1, payload.meta.totalPages);
      page += 1;
    } catch (cause) {
      if (cause instanceof PermissionRequestError) {
        throw new SuperAdminAccessError(
          cause.status === 403
            ? "Super Admin cannot load permissions. The backend must allow GET /api/permissions for this account."
            : cause.message,
          cause.status
        );
      }
      throw cause;
    }
  } while (page <= totalPages && page <= 20);

  if (ids.size === 0) {
    throw new SuperAdminAccessError(
      "No permissions were returned by the server, so Super Admin access could not be granted.",
      404
    );
  }

  return [...ids].sort((a, b) => a - b);
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
        cause.status === 403
          ? "Super Admin cannot load roles. The backend must allow GET /api/roles for this account."
          : cause.message,
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

  const [permissionIds, role] = await Promise.all([
    fetchAllPermissionIds(),
    findSuperAdminRole(),
  ]);

  try {
    const updated = await patchRole(role.id, {
      ...(role.name.trim() ? { name: role.name.trim() } : {}),
      ...(role.description.trim() ? { description: role.description.trim() } : {}),
      permissionIds,
    });

    return {
      roleId: updated.id,
      roleName: updated.name || role.name,
      permissionCount: updated.permissionIds.length || permissionIds.length,
    };
  } catch (cause) {
    if (cause instanceof RoleRequestError) {
      throw new SuperAdminAccessError(
        cause.status === 403
          ? "Super Admin cannot update roles. The backend must allow PATCH /api/roles/:id for this account."
          : cause.message,
        cause.status
      );
    }
    throw cause;
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
