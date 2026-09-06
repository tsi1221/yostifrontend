import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { isQuietListFailure } from "../apiMessage";
import { isSuperAdminSession, recoverSuperAdminAccess } from "../auth/superAdminAccess";
import { clearAuthSession, getAccessToken } from "../auth/session";
import type { RolesListQuery, RolesListResponse } from "./types";
import { DEFAULT_ROLES_QUERY } from "./types";
import {
  ROLES_INVALIDATE_EVENT,
  RoleRequestError,
  fetchRolesList,
  isPreviewAccessToken,
} from "./api";

const EMPTY_RESPONSE: RolesListResponse = {
  data: [],
  meta: { total: 0, page: 1, pageSize: 10, totalPages: 1 },
};

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useRolesList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<RolesListQuery>(DEFAULT_ROLES_QUERY);
  const [response, setResponse] = useState<RolesListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const search = useDebouncedValue(filters.search, 400);
  const name = useDebouncedValue(filters.name, 400);

  const query = useMemo<RolesListQuery>(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      search,
      name,
    }),
    [filters.page, filters.pageSize, search, name]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setServerError(null);

    try {
      const payload = await fetchRolesList(query);
      setResponse(payload);
    } catch (cause) {
      if (cause instanceof RoleRequestError && cause.status === 403 && isSuperAdminSession()) {
        const recovered = await recoverSuperAdminAccess();
        if (recovered) {
          try {
            const payload = await fetchRolesList(query);
            setResponse(payload);
            return;
          } catch {
            // Super Admin still cannot read roles after the grant.
          }
        }
        setResponse(EMPTY_RESPONSE);
        return;
      }

      if (cause instanceof RoleRequestError && cause.status === 401) {
        setResponse(null);
        if (isPreviewAccessToken(getAccessToken())) {
          setServerError("Sign in with a live account to load roles.");
          return;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return;
      }

      if (isQuietListFailure(cause)) {
        setResponse(EMPTY_RESPONSE);
        return;
      }

      setResponse(EMPTY_RESPONSE);
    } finally {
      setLoading(false);
    }
  }, [navigate, query]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  useEffect(() => {
    const refresh = () => setReloadToken((value) => value + 1);
    window.addEventListener(ROLES_INVALIDATE_EVENT, refresh);
    return () => window.removeEventListener(ROLES_INVALIDATE_EVENT, refresh);
  }, []);

  const setFilter = <K extends keyof RolesListQuery>(key: K, value: RolesListQuery[K]) => {
    setFilters((current) => ({
      ...current,
      page: key === "page" ? Number(value) : 1,
      [key]: value,
    }));
  };

  return {
    filters,
    setFilter,
    setPage: (page: number) => setFilters((current) => ({ ...current, page })),
    setPageSize: (pageSize: number) =>
      setFilters((current) => ({ ...current, page: 1, pageSize })),
    roles: response?.data ?? [],
    meta: response?.meta ?? {
      ...EMPTY_RESPONSE.meta,
      page: filters.page,
      pageSize: filters.pageSize,
    },
    loading,
    serverError,
    retry: () => setReloadToken((value) => value + 1),
  };
}
