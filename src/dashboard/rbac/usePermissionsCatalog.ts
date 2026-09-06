import { useCallback, useEffect, useMemo, useState } from "react";

import { getAccessToken } from "../auth/session";
import type { RolePermission } from "./types";
import {
  FALLBACK_PERMISSIONS,
  RoleRequestError,
  fetchPermissionsCatalog,
  isPreviewAccessToken,
  mergePermissionCatalog,
} from "./api";

export function usePermissionsCatalog(
  extras: RolePermission[] = [],
  selectedIds: number[] = []
) {
  const [catalog, setCatalog] = useState<RolePermission[]>(FALLBACK_PERMISSIONS);
  const [source, setSource] = useState<"api" | "fallback">("fallback");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetchPermissionsCatalog();
      setCatalog(payload.permissions);
      setSource(payload.source);
    } catch (cause) {
      if (cause instanceof RoleRequestError && cause.status === 401 && isPreviewAccessToken(getAccessToken())) {
        setCatalog(FALLBACK_PERMISSIONS);
        setSource("fallback");
        return;
      }
      setCatalog(FALLBACK_PERMISSIONS);
      setSource("fallback");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const permissions = useMemo(
    () => mergePermissionCatalog(catalog, extras, selectedIds),
    [catalog, extras, selectedIds]
  );

  return { permissions, source, loading, retry: load };
}
