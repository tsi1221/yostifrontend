import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

import { expireSession } from "./sessionExpiry";
import { refreshStoredAuthProfile } from "../profile/api";
import type { AuthUser } from "../types/auth";
import type { UserRole } from "../types";
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
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(() =>
    hasValidAccessToken() ? getStoredAuthUser() : null,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const syncFromStorage = () => {
      if (!hasValidAccessToken()) {
        setUser(null);
        return;
      }
      setUser(getStoredAuthUser());
    };

    async function restoreSession() {
      const token = getAccessToken();
      if (token && !hasValidAccessToken()) {
        clearAuthSession();
        if (!cancelled) {
          setUser(null);
          setReady(true);
        }
        return;
      }

      if (!hasValidAccessToken()) {
        if (!cancelled) {
          setUser(null);
          setReady(true);
        }
        return;
      }

      try {
        const next = await refreshStoredAuthProfile();
        if (!cancelled) {
          setUser(next ?? getStoredAuthUser());
        }
      } catch {
        expireSession(navigate);
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    }

    void restoreSession();
    window.addEventListener(AUTH_PROFILE_UPDATED_EVENT, syncFromStorage);
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_PROFILE_UPDATED_EVENT, syncFromStorage);
    };
  }, [navigate]);

  const value = useMemo<AuthContextValue>(() => {
    const role = user ? roleFromAuthUser(user) : null;
    return {
      user,
      role,
      ready,
      isAuthenticated: Boolean(user && hasValidAccessToken()),
    };
  }, [ready, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
