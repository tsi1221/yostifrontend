import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { ServicesListQuery, ServicesListResponse } from "./types";
import { DEFAULT_SERVICES_QUERY } from "./types";
import {
  SERVICES_INVALIDATE_EVENT,
  ServiceRequestError,
  fetchServicesList,
  isPreviewAccessToken,
} from "./servicesService";

const EMPTY_RESPONSE: ServicesListResponse = {
  data: [],
  meta: {
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  },
};

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useServicesList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ServicesListQuery>(DEFAULT_SERVICES_QUERY);
  const [response, setResponse] = useState<ServicesListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const search = useDebouncedValue(filters.search, 400);
  const title = useDebouncedValue(filters.title, 400);

  const query = useMemo<ServicesListQuery>(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      search,
      title,
    }),
    [filters.page, filters.pageSize, search, title]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setServerError(null);

    try {
      const payload = await fetchServicesList(query);
      setResponse(payload);
    } catch (cause) {
      if (cause instanceof ServiceRequestError && cause.status === 401) {
        setResponse(null);

        if (isPreviewAccessToken(getAccessToken())) {
          setServerError("Sign in with a live account to load services.");
          return;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return;
      }

      setServerError(
        cause instanceof Error ? cause.message : "The server could not load services."
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
    window.addEventListener(SERVICES_INVALIDATE_EVENT, refresh);
    return () => window.removeEventListener(SERVICES_INVALIDATE_EVENT, refresh);
  }, []);

  const setFilter = <K extends keyof ServicesListQuery>(
    key: K,
    value: ServicesListQuery[K]
  ) => {
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
    services: response?.data ?? [],
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
