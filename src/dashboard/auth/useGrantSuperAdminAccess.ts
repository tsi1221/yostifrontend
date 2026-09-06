import { useState } from "react";
import { message } from "antd";

import { getAccessToken, isPreviewAccessToken } from "./session";
import {
  SuperAdminAccessError,
  grantSuperAdminAllPermissions,
  isSuperAdminSession,
} from "./superAdminAccess";

export function useGrantSuperAdminAccess(onGranted?: () => void) {
  const [granting, setGranting] = useState(false);

  const grant = async () => {
    if (granting) {
      return false;
    }

    setGranting(true);
    try {
      const result = await grantSuperAdminAllPermissions();
      message.success(
        `Super Admin now has ${result.permissionCount} permissions (${result.roleName}).`
      );
      onGranted?.();
      return true;
    } catch (cause) {
      const preview =
        cause instanceof SuperAdminAccessError &&
        cause.status === 401 &&
        isPreviewAccessToken(getAccessToken());
      message.error(
        preview
          ? "Sign in with a live Super Admin account to grant permissions."
          : cause instanceof Error
            ? cause.message
            : "Could not grant Super Admin permissions."
      );
      return false;
    } finally {
      setGranting(false);
    }
  };

  return {
    grant,
    granting,
    isSuperAdmin: isSuperAdminSession(),
  };
}
