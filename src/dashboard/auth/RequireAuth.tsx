import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import type { UserRole } from "../types";
import { getRoleDashboardPath, roleFromAuthUser } from "./roleRouting";
import { getStoredAuthUser, hasValidAccessToken } from "./session";

interface RequireAuthProps {
  allow: UserRole | UserRole[];
  children: ReactNode;
}

export default function RequireAuth({ allow, children }: RequireAuthProps) {
  if (!hasValidAccessToken()) {
    return <Navigate to="/login" replace />;
  }

  const user = getStoredAuthUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = roleFromAuthUser(user);
  const allowed = Array.isArray(allow) ? allow : [allow];

  if (user.roleId === 2 && (allowed.includes("SUPER_ADMIN") || allowed.includes("STAFF"))) {
    return children;
  }

  if (!allowed.includes(role)) {
    return <Navigate to={getRoleDashboardPath(role)} replace />;
  }

  return children;
}
