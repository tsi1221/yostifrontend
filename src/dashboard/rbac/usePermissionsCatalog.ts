import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { expireSession, FORBIDDEN_MESSAGE } from "../auth/sessionExpiry";
import type { RolePermission } from "./types";
import {
  RoleRequestError,
  fetchPermissionsCatalog,
  mergePermissionCatalog,
} from "./api";

export function usePermissionsCatalog(
  extras: RolePermission[] = [],
  selectedIds: number[] = [],
) {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchPermissionsCatalog();
      setCatalog(payload.permissions);
    } catch (cause) {
      setCatalog([]);
      if (cause instanceof RoleRequestError && cause.status === 401) {
        expireSession(navigate);
        return;
      }
      if (cause instanceof RoleRequestError && cause.status === 403) {
        setError(FORBIDDEN_MESSAGE);
        return;
      }
      setError(
        cause instanceof Error
          ? cause.message
          : "We couldn't load permissions.",
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  const permissions = useMemo(
    () => mergePermissionCatalog(catalog, extras, selectedIds),
    [catalog, extras, selectedIds],
  );

  return { permissions, source: "api" as const, loading, error, retry: load };
}
