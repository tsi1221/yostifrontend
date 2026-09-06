import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { RoleRecord } from "./types";
import {
  ROLES_INVALIDATE_EVENT,
  RoleRequestError,
  asRoleId,
  fetchRole,
  isPreviewAccessToken,
} from "./api";

export function useRoleDetail(id: string | undefined) {
  const navigate = useNavigate();
  const [role, setRole] = useState<RoleRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(async () => {
    const roleId = asRoleId(id);
    if (roleId === undefined) {
      setRole(null);
      setLoading(false);
      setNotFound(true);
      setServerError(null);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setServerError(null);

    try {
      const payload = await fetchRole(roleId);
      setRole(payload);
    } catch (cause) {
      setRole(null);

      if (cause instanceof RoleRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          setServerError("Sign in with a live account to load this role.");
          return;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return;
      }

      if (cause instanceof RoleRequestError && cause.status === 404) {
        setNotFound(true);
        return;
      }

      const text = cause instanceof Error ? cause.message : "The server could not load this role.";
      message.error(text);
      setServerError(text);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  useEffect(() => {
    const refresh = () => setReloadToken((value) => value + 1);
    window.addEventListener(ROLES_INVALIDATE_EVENT, refresh);
    return () => window.removeEventListener(ROLES_INVALIDATE_EVENT, refresh);
  }, []);

  return {
    role,
    loading,
    notFound,
    serverError,
    retry: () => setReloadToken((value) => value + 1),
  };
}
