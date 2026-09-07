import type { UserRole } from "../types";

/**
 * Role catalog from the live Yosti API (`GET /users` nested `role`).
 * Super Admin=1, Admin=2, Buyer=3, Supplier=4, Logistic=5.
 *
 * Admin (id 2) is mapped to the system-admin workspace because that is the
 * role the live API actually grants operational permissions to. Super Admin
 * (id 1) is described as full access but is only assigned user-directory
 * permissions; accounts on that role are aligned onto Admin after sign-in.
 */
export const BACKEND_ROLES = [
  {
    id: 1,
    name: "Super Admin",
    dashboard: "SUPER_ADMIN" as const,
  },
  {
    id: 2,
    name: "Admin",
    dashboard: "SUPER_ADMIN" as const,
  },
  {
    id: 3,
    name: "Buyer",
    dashboard: "BUYER" as const,
  },
  {
    id: 4,
    name: "Supplier",
    dashboard: "SUPPLIER" as const,
  },
  {
    id: 5,
    name: "Logistic",
    dashboard: "LOGISTICS_PARTNER" as const,
  },
] as const;

export const SUPER_ADMIN_ROLE_ID = 1;
export const ADMIN_ROLE_ID = 2;

const DASHBOARD_BY_ID: Record<number, UserRole> = Object.fromEntries(
  BACKEND_ROLES.map((role) => [role.id, role.dashboard]),
);

export function dashboardRoleFromBackendId(roleId: number): UserRole | null {
  return DASHBOARD_BY_ID[roleId] ?? null;
}

export function backendRoleNameFromId(roleId: number): string | undefined {
  return BACKEND_ROLES.find((role) => role.id === roleId)?.name;
}
