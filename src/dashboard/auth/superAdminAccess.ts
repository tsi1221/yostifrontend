import { roleFromAuthUser } from "./roleRouting";
import { getAccessToken, getStoredAuthUser } from "./session";
import { SUPER_ADMIN_ROLE_ID } from "./backendRoles";

export { SUPER_ADMIN_ROLE_ID };

export function isSuperAdminSession() {
  const user = getStoredAuthUser();
  return Boolean(
    user && roleFromAuthUser(user) === "SUPER_ADMIN" && getAccessToken(),
  );
}
