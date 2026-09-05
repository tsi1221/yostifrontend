import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { RequestsListQuery, RequestsListResponse } from "./types";
import { DEFAULT_REQUESTS_QUERY } from "./types";
import {
  REQUESTS_INVALIDATE_EVENT,
  RequestsRequestError,
  fetchRequestsList,
  isPreviewAccessToken,
} from "./requestsService";

const EMPTY_RESPONSE: RequestsListResponse = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
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

export function useRequestsList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<RequestsListQuery>(DEFAULT_REQUESTS_QUERY);
  const [response, setResponse] = useState<RequestsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const search = useDebouncedValue(filters.search, 500);
  const supplierRegion = useDebouncedValue(filters.supplierRegion, 500);
  const deadline = useDebouncedValue(filters.deadline, 500);

  const query = useMemo<RequestsListQuery>(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      search,
      supplierRegion,
      deadline,
    }),
    [deadline, filters.page, filters.pageSize, search, supplierRegion]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setForbidden(false);
    setServerError(null);

    try {
      const payload = await fetchRequestsList(query);
      setResponse(payload);
    } catch (cause) {
      if (cause instanceof RequestsRequestError && cause.status === 400) {
        message.error(cause.message);
        return;
      }

      setResponse(null);

      if (cause instanceof RequestsRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          setServerError("Sign in with a live Super Admin account to load requests.");
          return;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return;
      }

      if (cause instanceof RequestsRequestError && cause.status === 403) {
        setForbidden(true);
        return;
      }

      setServerError(
        cause instanceof Error
          ? cause.message
          : "The server could not load sourcing requests."
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
    window.addEventListener(REQUESTS_INVALIDATE_EVENT, refresh);
    return () => window.removeEventListener(REQUESTS_INVALIDATE_EVENT, refresh);
  }, []);

  const setFilter = <K extends keyof RequestsListQuery>(
    key: K,
    value: RequestsListQuery[K]
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

  const meta = response ?? {
    ...EMPTY_RESPONSE,
    page: filters.page,
    limit: filters.pageSize,
  };

  return {
    filters,
    setFilter,
    setPage,
    setPageSize,
    requests: response?.data ?? [],
    meta,
    loading,
    forbidden,
    serverError,
    retry: () => setReloadToken((value) => value + 1),
  };
}
