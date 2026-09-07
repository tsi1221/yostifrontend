import type { UserRole } from "../types";
import type { AuthUser } from "../types/auth";
import { ROLE_SLUG } from "../roles";
import { dashboardRoleFromBackendId } from "./backendRoles";

export function roleFromRoleName(
  value: string | undefined | null,
): UserRole | null {
  if (!value) {
    return null;
  }

  switch (
    value
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_")
  ) {
    case "super_admin":
    case "superadmin":
    case "super_administrator":
      return "SUPER_ADMIN";
    case "admin":
    case "staff":
    case "yosti_staff":
      return "SUPER_ADMIN";
    case "buyer":
    case "customer":
    case "importer":
      return "BUYER";
    case "supplier":
    case "factory":
    case "exporter":
      return "SUPPLIER";
    case "logistic":
    case "logistics":
    case "logistics_partner":
    case "cargo":
      return "LOGISTICS_PARTNER";
    default:
      return null;
  }
}

/** Live API: 1 Super Admin, 2 Admin, 3 Buyer, 4 Supplier, 5 Logistic. */
export function roleFromRoleId(roleId: number): UserRole {
  return dashboardRoleFromBackendId(roleId) ?? "BUYER";
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
