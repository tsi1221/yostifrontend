import type { UserRole } from "../types";
import type { AuthUser } from "../types/auth";
import { ROLE_SLUG } from "../roles";

export function roleFromRoleName(value: string | undefined | null): UserRole | null {
  if (!value) {
    return null;
  }

  switch (value.trim().toLowerCase().replace(/[\s-]+/g, "_")) {
    case "super_admin":
    case "superadmin":
    case "admin":
    case "system_admin":
      return "SUPER_ADMIN";
    case "staff":
    case "yosti_staff":
      return "STAFF";
    case "buyer":
    case "customer":
    case "importer":
      return "BUYER";
    case "supplier":
    case "factory":
    case "exporter":
      return "SUPPLIER";
    case "logistics":
    case "logistics_partner":
    case "cargo":
      return "LOGISTICS_PARTNER";
    default:
      return null;
  }
}

/**
 * Prefer the API / register role name. Fall back to roleId.
 * Public register IDs: 1 Buyer, 2 Supplier, 3 Logistics Partner.
 * Named roles win, so Admin Dagi (`role: admin`, roleId 2) still opens Super Admin.
 */
export function roleFromRoleId(roleId: number): UserRole {
  switch (roleId) {
    case 1:
      return "BUYER";
    case 2:
      return "SUPPLIER";
    case 3:
      return "LOGISTICS_PARTNER";
    case 4:
      return "STAFF";
    case 5:
      return "SUPER_ADMIN";
    default:
      return "BUYER";
  }
}

export function roleFromAuthUser(user: AuthUser): UserRole {
  return roleFromRoleName(user.role) ?? roleFromRoleId(user.roleId);
}

export function getRoleDashboardPath(role: UserRole) {
  return `/${ROLE_SLUG[role]}/dashboard`;
}

export function getAuthUserDashboardPath(user: AuthUser) {
  return getRoleDashboardPath(roleFromAuthUser(user));
}

export function isAdminRole(role: UserRole) {
  return role === "SUPER_ADMIN" || role === "STAFF";
}
