import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { isQuietListFailure } from "../apiMessage";
import { isSuperAdminSession, recoverSuperAdminAccess } from "../auth/superAdminAccess";
import { clearAuthSession, getAccessToken } from "../auth/session";
import type { UsersListMeta, UsersListQuery, UsersListResponse } from "./types";
import { DEFAULT_USERS_QUERY } from "./types";
import {
  UsersRequestError,
  fetchUsersList,
  isPreviewAccessToken,
} from "./usersService";

const EMPTY_META: UsersListMeta = {
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useUsersList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<UsersListQuery>(DEFAULT_USERS_QUERY);
  const [response, setResponse] = useState<UsersListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [restricted, setRestricted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const search = useDebouncedValue(filters.search, 500);
  const fullname = useDebouncedValue(filters.fullname, 500);
  const email = useDebouncedValue(filters.email, 500);
  const phoneWhatsapp = useDebouncedValue(filters.phoneWhatsapp, 500);
  const companyName = useDebouncedValue(filters.companyName, 500);
  const roleId = useDebouncedValue(filters.roleId, 500);

  const query = useMemo<UsersListQuery>(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      search,
      fullname,
      email,
      phoneWhatsapp,
      companyName,
      roleId,
    }),
    [
      companyName,
      email,
      filters.page,
      filters.pageSize,
      fullname,
      phoneWhatsapp,
      roleId,
      search,
    ]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setForbidden(false);
    setRestricted(false);

    try {
      const payload = await fetchUsersList(query);
      setResponse(payload);
    } catch (cause) {
      setResponse(null);

      if (cause instanceof UsersRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          setError("Sign in with a live account to load the user directory.");
          return;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return;
      }

      if (cause instanceof UsersRequestError && cause.status === 403) {
        if (isSuperAdminSession()) {
          const recovered = await recoverSuperAdminAccess();
          if (recovered) {
            try {
              const payload = await fetchUsersList(query);
              setResponse(payload);
              return;
            } catch {
              // Super Admin still cannot read users after the grant.
            }
          }
          setResponse({ data: [], meta: EMPTY_META });
          setRestricted(true);
          return;
        }
        setForbidden(true);
        return;
      }

      if (isQuietListFailure(cause)) {
        setResponse({ data: [], meta: EMPTY_META });
        return;
      }

      setResponse({ data: [], meta: EMPTY_META });
    } finally {
      setLoading(false);
    }
  }, [navigate, query]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  const setFilter = <K extends keyof UsersListQuery>(key: K, value: UsersListQuery[K]) => {
    setFilters((current) => ({
      ...current,
      page: key === "page" ? Number(value) : 1,
      [key]: value,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const setPageSize = (pageSize: number) => {
    setFilters((current) => ({ ...current, page: 1, pageSize }));
  };

  return {
    filters,
    setFilter,
    setPage,
    setPageSize,
    users: response?.data ?? [],
    meta: response?.meta ?? {
      ...EMPTY_META,
      page: filters.page,
      pageSize: filters.pageSize,
    },
    loading,
    forbidden,
    restricted,
    error,
    retry: () => setReloadToken((value) => value + 1),
  };
}
