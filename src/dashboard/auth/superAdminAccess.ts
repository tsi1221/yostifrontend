import { roleFromAuthUser } from "./roleRouting";
import { getAccessToken, getStoredAuthUser } from "./session";

export const SUPER_ADMIN_ROLE_ID = 5;

export function isSuperAdminSession() {
  const user = getStoredAuthUser();
  return Boolean(
    user && roleFromAuthUser(user) === "SUPER_ADMIN" && getAccessToken(),
  );
}
