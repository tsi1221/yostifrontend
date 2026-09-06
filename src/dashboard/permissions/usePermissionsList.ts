import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { PermissionsListQuery, PermissionsListResponse } from "./types";
import { DEFAULT_PERMISSIONS_QUERY, LOOKUP_PERMISSIONS_QUERY } from "./types";
import {
  PERMISSIONS_INVALIDATE_EVENT,
  PermissionRequestError,
  fetchPermissionsList,
  isPreviewAccessToken,
  toPermissionOptions,
} from "./api";

const EMPTY_RESPONSE: PermissionsListResponse = {
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

export function usePermissionsList(options?: { lookup?: boolean; pageSize?: number }) {
  const navigate = useNavigate();
  const lookup = options?.lookup === true;
  const [filters, setFilters] = useState<PermissionsListQuery>(() => ({
    ...(lookup ? LOOKUP_PERMISSIONS_QUERY : DEFAULT_PERMISSIONS_QUERY),
    pageSize: options?.pageSize ?? (lookup ? LOOKUP_PERMISSIONS_QUERY.pageSize : 10),
  }));
  const [response, setResponse] = useState<PermissionsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const search = useDebouncedValue(filters.search, 400);

  const query = useMemo<PermissionsListQuery>(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      search,
    }),
    [filters.page, filters.pageSize, search]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setServerError(null);

    try {
      const payload = await fetchPermissionsList(query);
      setResponse(payload);
    } catch (cause) {
      if (cause instanceof PermissionRequestError && cause.status === 401) {
        setResponse(null);
        if (isPreviewAccessToken(getAccessToken())) {
          setServerError("Sign in with a live account to load permissions.");
          return;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return;
      }

      setServerError(
        cause instanceof Error ? cause.message : "The server could not load permissions."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate, query]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  useEffect(() => {
    const refresh = () => setReloadToken((value) => value + 1);
    window.addEventListener(PERMISSIONS_INVALIDATE_EVENT, refresh);
    return () => window.removeEventListener(PERMISSIONS_INVALIDATE_EVENT, refresh);
  }, []);

  const permissions = useMemo(() => response?.data ?? [], [response]);
  const optionsList = useMemo(() => toPermissionOptions(permissions), [permissions]);
  const byId = useMemo(
    () => new Map(permissions.map((permission) => [permission.id, permission])),
    [permissions]
  );

  return {
    filters,
    setSearch: (value: string) => setFilters((current) => ({ ...current, page: 1, search: value })),
    setPage: (page: number) => setFilters((current) => ({ ...current, page })),
    setPageSize: (pageSize: number) =>
      setFilters((current) => ({ ...current, page: 1, pageSize })),
    permissions,
    options: optionsList,
    byId,
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
