import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { SupportsListQuery, SupportsListResponse } from "./types";
import { DEFAULT_SUPPORTS_QUERY } from "./types";
import {
  SUPPORTS_INVALIDATE_EVENT,
  TICKETS_INVALIDATE_EVENT,
  TicketsRequestError,
  fetchSupportsList,
  isPreviewAccessToken,
} from "./ticketsService";

const EMPTY_RESPONSE: SupportsListResponse = {
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

export function useSupportsList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SupportsListQuery>(DEFAULT_SUPPORTS_QUERY);
  const [response, setResponse] = useState<SupportsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const search = useDebouncedValue(filters.search, 400);
  const orderReference = useDebouncedValue(filters.orderReference, 400);

  const query = useMemo<SupportsListQuery>(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      search,
      orderReference,
      issuesType: filters.issuesType,
      resolutionToRequest: filters.resolutionToRequest,
      urgency: filters.urgency,
      status: filters.status,
    }),
    [
      filters.issuesType,
      filters.page,
      filters.pageSize,
      filters.resolutionToRequest,
      filters.status,
      filters.urgency,
      orderReference,
      search,
    ]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setServerError(null);

    try {
      const payload = await fetchSupportsList(query);
      setResponse(payload);
    } catch (cause) {
      if (cause instanceof TicketsRequestError && cause.status === 401) {
        setResponse(null);

        if (isPreviewAccessToken(getAccessToken())) {
          setServerError("Sign in with a live account to load support tickets.");
          return;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return;
      }

      setServerError(
        cause instanceof Error ? cause.message : "The server could not load support tickets."
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
    const events = Array.from(
      new Set([TICKETS_INVALIDATE_EVENT, SUPPORTS_INVALIDATE_EVENT])
    );
    for (const eventName of events) {
      window.addEventListener(eventName, refresh);
    }
    return () => {
      for (const eventName of events) {
        window.removeEventListener(eventName, refresh);
      }
    };
  }, []);

  const setFilter = <K extends keyof SupportsListQuery>(
    key: K,
    value: SupportsListQuery[K]
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
    tickets: response?.data ?? [],
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
