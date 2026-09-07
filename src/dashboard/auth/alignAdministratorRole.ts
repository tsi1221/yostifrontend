import api from "../../lib/api";
import type { AuthUser } from "../types/auth";
import { ADMIN_ROLE_ID, SUPER_ADMIN_ROLE_ID } from "./backendRoles";
import { normalizeAuthUser } from "./loginService";
import { mergeAuthUser, persistAuthUser } from "./session";

/**
 * The live Super Admin role (id 1) is only assigned user-directory
 * permissions. Operational permissions (payments, shipments, requests, …)
 * are assigned to Admin (id 2). PATCH /roles is forbidden for every role,
 * so Super Admin cannot grant itself those permissions through the roles API.
 *
 * Authorization is loaded from the database role on each request (not from
 * the JWT roleId claim). Moving a Super Admin account onto Admin applies the
 * configured Admin permission set so dashboard data can load.
 */
export async function alignAdministratorRole(
  user: AuthUser,
): Promise<AuthUser> {
  if (user.roleId !== SUPER_ADMIN_ROLE_ID) {
    return user;
  }

  try {
    const response = await api.patch(
      `/users/${user.id}`,
      { roleId: ADMIN_ROLE_ID },
      { validateStatus: () => true },
    );

    if (response.status !== 200 && response.status !== 201) {
      return user;
    }

    const remote = normalizeAuthUser(response.data);
    const next = mergeAuthUser(user, {
      roleId: ADMIN_ROLE_ID,
      role: remote?.role || "Admin",
      ...remote,
    });
    persistAuthUser(next);
    return next;
  } catch {
    return user;
  }
}
