import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

import type { DashboardPageKey } from "../roles";
import type { AuthUser } from "../types/auth";
import type { UserRole } from "../types";
import { refreshStoredAuthProfile } from "../profile/api";
import {
  canOpenPage,
  probeAccessSnapshot,
  type AccessSnapshot,
} from "./access";
import { alignAdministratorRole } from "./alignAdministratorRole";
import { expireSession } from "./sessionExpiry";
import { roleFromAuthUser } from "./roleRouting";
import {
  AUTH_PROFILE_UPDATED_EVENT,
  clearAuthSession,
  getAccessToken,
  getStoredAuthUser,
  hasValidAccessToken,
} from "./session";

interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole | null;
  ready: boolean;
  isAuthenticated: boolean;
  access: AccessSnapshot | null;
  canAccessPage: (page: DashboardPageKey) => boolean;
  refreshAccess: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(() =>
    hasValidAccessToken() ? getStoredAuthUser() : null,
  );
  const [access, setAccess] = useState<AccessSnapshot | null>(null);
  const [ready, setReady] = useState(false);
  const hydrating = useRef(false);
  const hydratedUserId = useRef<number | null>(null);

  const hydrateSession = useCallback(async () => {
    if (hydrating.current) {
      return;
    }
    hydrating.current = true;

    const token = getAccessToken();
    if (token && !hasValidAccessToken()) {
      clearAuthSession();
      hydratedUserId.current = null;
      setUser(null);
      setAccess(null);
      setReady(true);
      hydrating.current = false;
      return;
    }

    if (!hasValidAccessToken()) {
      hydratedUserId.current = null;
      setUser(null);
      setAccess(null);
      setReady(true);
      hydrating.current = false;
      return;
    }

    try {
      let next = (await refreshStoredAuthProfile()) ?? getStoredAuthUser();
      if (next) {
        next = await alignAdministratorRole(next);
      }
      setUser(next);
      hydratedUserId.current = next?.id ?? null;

      if (next && hasValidAccessToken()) {
        const snapshot = await probeAccessSnapshot();
        setAccess(snapshot);
      } else {
        setAccess(null);
      }
    } catch {
      expireSession(navigate);
      hydratedUserId.current = null;
      setUser(null);
      setAccess(null);
    } finally {
      setReady(true);
      hydrating.current = false;
    }
  }, [navigate]);

  useEffect(() => {
    void hydrateSession();

    const syncFromStorage = () => {
      if (!hasValidAccessToken()) {
        hydratedUserId.current = null;
        setUser(null);
        setAccess(null);
        setReady(true);
        return;
      }
      const stored = getStoredAuthUser();
      setUser(stored);
      if (stored && stored.id !== hydratedUserId.current) {
        void hydrateSession();
      }
    };

    window.addEventListener(AUTH_PROFILE_UPDATED_EVENT, syncFromStorage);
    return () => {
      window.removeEventListener(AUTH_PROFILE_UPDATED_EVENT, syncFromStorage);
    };
  }, [hydrateSession]);

  const refreshAccess = useCallback(async () => {
    if (!hasValidAccessToken()) {
      setAccess(null);
      return;
    }
    try {
      setAccess(await probeAccessSnapshot());
    } catch {
      expireSession(navigate);
      setUser(null);
      setAccess(null);
    }
  }, [navigate]);

  const value = useMemo<AuthContextValue>(() => {
    const role = user ? roleFromAuthUser(user) : null;
    return {
      user,
      role,
      ready,
      isAuthenticated: Boolean(user && hasValidAccessToken()),
      access,
      canAccessPage: (page) => Boolean(access && canOpenPage(page, access)),
      refreshAccess,
    };
  }, [access, ready, refreshAccess, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
