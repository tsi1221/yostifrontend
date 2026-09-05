import type { UserRole } from "../types";
import type { AuthUser } from "../types/auth";
import { ROLE_SLUG } from "../roles";

/**
 * Live `roleId` matrix from the auth payload.
 * roleId 2 is Admin Dagi → System Admin / staff workspace.
 */
export function roleFromRoleId(roleId: number): UserRole {
  switch (roleId) {
    case 2:
      return "SUPER_ADMIN";
    case 1:
      return "BUYER";
    case 3:
      return "SUPPLIER";
    case 4:
      return "LOGISTICS_PARTNER";
    case 5:
      return "STAFF";
    default:
      return "BUYER";
  }
}

export function roleFromAuthUser(user: AuthUser): UserRole {
  return roleFromRoleId(user.roleId);
}

export function getRoleDashboardPath(role: UserRole) {
  return `/${ROLE_SLUG[role]}/dashboard`;
}

export function getAuthUserDashboardPath(user: AuthUser) {
  return getRoleDashboardPath(roleFromAuthUser(user));
}

export function isAdminRoleId(roleId: number) {
  return roleId === 2;
}
