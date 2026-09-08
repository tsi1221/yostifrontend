import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { SessionLoading } from "../components/AccessState";
import type { UserRole } from "../types";
import { useAuth } from "./AuthProvider";
import { getRoleDashboardPath } from "./roleRouting";

interface RequireAuthProps {
  allow: UserRole | UserRole[];
  children: ReactNode;
}

export default function RequireAuth({ allow, children }: RequireAuthProps) {
  const { ready, access, isAuthenticated, role } = useAuth();

  if (!ready || (isAuthenticated && !access)) {
    return <SessionLoading />;
  }

  if (!isAuthenticated || !role) {
    return <Navigate to="/login" replace />;
  }

  const allowed = Array.isArray(allow) ? allow : [allow];

  if (role === "SUPER_ADMIN") {
    return children;
  }

  if (!allowed.includes(role)) {
    return <Navigate to={getRoleDashboardPath(role)} replace />;
  }

  return children;
}
